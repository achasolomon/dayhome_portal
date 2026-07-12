import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, Op } from 'sequelize';
import { DayhomeRepository } from './dayhome.repository';
import { IntakeDayhomeDto } from './dto/intake-dayhome.dto';
import { IntakeResponseDto } from './dto/intake-response.dto';
import { CallbackStatusDto } from './dto/callback-status.dto';
import { CallbackComplianceDto } from './dto/callback-compliance.dto';
import { CallbackEducatorProfileDto } from './dto/callback-educator-profile.dto';
import { CallbackDocumentsDto } from './dto/callback-documents.dto';
import { Dayhome } from './entities/dayhome.entity';
import { IntakeLog } from './entities/intake-log.entity';
import { Document } from './entities/document.entity';
import { UsersService } from '../../users/users.service';
import { StorageService } from '../../storage/storage.service';
import { CallbacksService } from '../callbacks/callbacks.service';
import { ERROR_CODES, PaginatedResponse } from '@spiced-dayhome/shared-types';
import { DayhomeQueryDto } from './dto/dayhome-query.dto';
import { DayhomeListItemDto } from './dto/dayhome-list-item.dto';
import { DayhomeDetailDto } from './dto/dayhome-detail.dto';

const CATEGORY_TO_DOCUMENT_TYPE: Record<string, string> = {
  home_insurance: 'INSURANCE',
  license_certificate: 'LICENSE',
  fire_inspection: 'FIRE_INSPECTION',
  health_inspection: 'HEALTH_INSPECTION',
  first_aid: 'FIRST_AID_CERT',
  police_check: 'POLICE_CHECK',
  training_certificate: 'TRAINING_CERT',
  qualification: 'TRAINING_CERT',
};

const PORTAL_STATUS_TO_DOCUMENT_STATUS: Record<string, string> = {
  approved: 'ACTIVE',
  pending: 'ACTIVE',
  expired: 'EXPIRED',
};

const PORTAL_TO_INTERNAL_STATUS: Record<string, string> = {
  active: 'ACTIVE',
  suspended: 'SUSPENDED',
  terminated: 'CLOSED',
  compliance_inspection_due: 'ACTIVE',
};

@Injectable()
export class DayhomeService {
  private readonly logger = new Logger(DayhomeService.name);

  constructor(
    private readonly repository: DayhomeRepository,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private readonly callbacksService: CallbacksService,
    @InjectModel(IntakeLog)
    private readonly intakeLogModel: typeof IntakeLog,
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
  ) {}

  async intake(
    dto: IntakeDayhomeDto,
    rawBody: Buffer,
    idempotencyKey?: string,
  ): Promise<IntakeResponseDto> {
    if (dto.version !== '1.0') {
      throw new BadRequestException({
        code: ERROR_CODES.INTAKE_INVALID_PAYLOAD,
        message: `Unsupported payload version: ${dto.version}`,
      });
    }

    if (idempotencyKey) {
      const existing = await this.intakeLogModel.findOne({
        where: { idempotencyKey },
      });
      if (existing) {
        if (existing.status === 'success' && existing.dayhomeId) {
          const dayhome = await this.repository.findById(existing.dayhomeId);
          if (dayhome) {
            return IntakeResponseDto.from(dayhome);
          }
        }
        throw new ConflictException({
          code: ERROR_CODES.INTAKE_DUPLICATE,
          message: 'Duplicate idempotency key',
        });
      }
    }

    const existingDayhome = await this.repository.findByExternalId(
      dto.externalId,
    );
    if (existingDayhome) {
      throw new ConflictException({
        code: ERROR_CODES.INTAKE_DUPLICATE,
        message: `Dayhome with externalId ${dto.externalId} already exists`,
      });
    }

    const tempPassword = this.generateTempPassword();
    const educator = dto.educator;
    const dayhomeDetails = dto.dayhome;
    const ops = dto.operations;
    const license = dto.license;
    const timeline = dto.timeline;
    const inspection = dto.finalInspection;

    let ownerId: string;
    try {
      const owner = await this.usersService.create({
        email: educator.email,
        password: tempPassword,
        firstName: educator.firstName,
        lastName: educator.lastName,
        phone: educator.phone,
        role: 'DAYHOME_OWNER',
      });
      ownerId = owner.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await this.recordIntakeLog('failed', rawBody, {
        error: `User creation failed: ${message}`,
        externalId: dto.externalId,
      });
      throw new InternalServerErrorException({
        code: 'USER_CREATION_FAILED',
        message: `Failed to create owner: ${message}`,
      });
    }

    const dayhomeData = {
      organizationId: '11111111-1111-4111-8111-111111111111',
      ownerId,
      externalId: dto.externalId,
      name: `${educator.firstName} ${educator.lastName}'s Dayhome`,
      rawPayload: dto,
      educatorFirstName: educator.firstName,
      educatorLastName: educator.lastName,
      educatorEmail: educator.email,
      educatorPhone: educator.phone,
      addressLine1: dayhomeDetails.address.line1,
      addressCity: dayhomeDetails.address.city,
      addressProvince: dayhomeDetails.address.province,
      addressPostalCode: dayhomeDetails.address.postalCode,
      addressFull: dayhomeDetails.address.full ?? '',
      homeType: dayhomeDetails.homeType,
      homeOwnership: dayhomeDetails.homeOwnership,
      fencedBackyard: dayhomeDetails.fencedBackyard ?? false,
      smokingStatus: dayhomeDetails.smokingStatus,
      hasPets: dayhomeDetails.hasPets,
      homeResidentsCount: dayhomeDetails.homeResidentsCount ?? null,
      eveningOvernightCare: dayhomeDetails.eveningOvernightCare,
      currentCapacity: ops.currentCapacity,
      maximumCapacity: ops.maximumCapacity,
      operatingHoursStart: ops.operatingHoursStart,
      operatingHoursEnd: ops.operatingHoursEnd,
      childcareLevel: ops.childcareLevel ?? null,
      languagesSpoken: ops.languagesSpoken ?? null,
      childcareEducation: ops.childcareEducation ?? null,
      specializations: ops.specializations ?? null,
      certificateNumber: license.certificateNumber,
      licenseIssueDate: new Date(license.issueDate),
      licenseExpiryDate: new Date(license.expiryDate),
      licenseStatus: license.status,
      portalStatus: 'active',
      submittedAt: new Date(timeline.submittedAt),
      approvedAt: new Date(timeline.approvedAt),
      activatedAt: new Date(timeline.activatedAt),
      nextComplianceDue: timeline.nextComplianceDue
        ? new Date(timeline.nextComplianceDue)
        : null,
      inspectionConductedAt: inspection
        ? new Date(inspection.conductedAt)
        : null,
      inspectionResult: inspection?.result ?? null,
      inspectionScore: inspection?.score ?? null,
      inspectionItemsPassed: inspection?.itemsPassed ?? null,
      inspectionItemsFailed: inspection?.itemsFailed ?? null,
      inspectionCriticalFailures: inspection?.criticalFailures ?? null,
      inspectionSummary: inspection?.summary ?? null,
      inspectionInspectorName: inspection?.inspectorName ?? null,
      profileItems: (dto.profileItems as unknown as object[]) ?? null,
    } as CreationAttributes<Dayhome>;

    let dayhome: Dayhome;
    try {
      dayhome = await this.repository.create(dayhomeData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await this.recordIntakeLog('flagged_for_review', rawBody, {
        error: `Dayhome creation failed: ${message}`,
        externalId: dto.externalId,
      });
      throw new InternalServerErrorException({
        code: 'DAYHOME_CREATION_FAILED',
        message: `Failed to create dayhome: ${message}`,
      });
    }

    if (dto.documents && dto.documents.length > 0) {
      await this.processIntakeDocuments(dayhome.id, dto.documents);
    }

    await this.recordIntakeLog('success', rawBody, {
      dayhomeId: dayhome.id,
      externalId: dto.externalId,
      idempotencyKey,
    });

    void this.callbacksService.notifyStatusUpdate(
      dto.externalId,
      'active',
      'Dayhome created via intake',
    );

    return IntakeResponseDto.from(dayhome);
  }

  async findAll(
    query: DayhomeQueryDto,
  ): Promise<PaginatedResponse<DayhomeListItemDto>> {
    const { data, pagination } = await this.repository.findAll({
      status: query.status,
      search: query.search,
      page: query.page!,
      limit: query.limit!,
    });

    return {
      success: true,
      data: data.map((d) => DayhomeListItemDto.from(d)),
      meta: {},
      pagination,
    };
  }

  async findById(id: string): Promise<DayhomeDetailDto> {
    const dayhome = await this.repository.findById(id);
    if (!dayhome) {
      throw new NotFoundException({
        code: ERROR_CODES.DAYHOME_NOT_FOUND,
        message: `Dayhome with id ${id} not found`,
      });
    }
    return DayhomeDetailDto.from(dayhome);
  }

  async updateStatusFromPortal(dto: CallbackStatusDto): Promise<void> {
    const dayhome = await this.repository.findByExternalId(dto.externalId);
    if (!dayhome) {
      throw new NotFoundException({
        code: ERROR_CODES.DAYHOME_NOT_FOUND,
        message: `Dayhome with externalId ${dto.externalId} not found`,
      });
    }

    const internalStatus = PORTAL_TO_INTERNAL_STATUS[dto.status];
    if (!internalStatus) {
      throw new BadRequestException({
        code: ERROR_CODES.INTAKE_INVALID_PAYLOAD,
        message: `Unknown portal status: ${dto.status}`,
      });
    }

    await this.repository.update(dayhome.id, {
      portalStatus: dto.status,
      status: internalStatus,
    });
  }

  async updateComplianceFromPortal(dto: CallbackComplianceDto): Promise<void> {
    const dayhome = await this.repository.findByExternalId(dto.externalId);
    if (!dayhome) {
      throw new NotFoundException({
        code: ERROR_CODES.DAYHOME_NOT_FOUND,
        message: `Dayhome with externalId ${dto.externalId} not found`,
      });
    }

    await this.repository.update(dayhome.id, {
      inspectionConductedAt: new Date(dto.conductedAt),
      inspectionResult: dto.result,
      inspectionScore: dto.score ?? null,
      inspectionItemsPassed: dto.itemsPassed ?? null,
      inspectionItemsFailed: dto.itemsFailed ?? null,
      inspectionCriticalFailures: dto.criticalFailures ?? null,
      inspectionSummary: dto.summary ?? null,
      inspectionInspectorName: dto.inspectorName ?? null,
      nextComplianceDue: new Date(dto.nextComplianceDue),
    });
  }

  async updateEducatorProfileFromPortal(
    dto: CallbackEducatorProfileDto,
  ): Promise<void> {
    const dayhome = await this.repository.findByExternalId(dto.externalId);
    if (!dayhome) {
      throw new NotFoundException({
        code: ERROR_CODES.DAYHOME_NOT_FOUND,
        message: `Dayhome with externalId ${dto.externalId} not found`,
      });
    }

    const updates: Partial<Record<string, unknown>> = {};
    if (dto.firstName !== undefined) updates.educatorFirstName = dto.firstName;
    if (dto.lastName !== undefined) updates.educatorLastName = dto.lastName;
    if (dto.email !== undefined) updates.educatorEmail = dto.email;
    if (dto.phone !== undefined) updates.educatorPhone = dto.phone;
    if (dto.currentCapacity !== undefined)
      updates.currentCapacity = dto.currentCapacity;
    if (dto.maximumCapacity !== undefined)
      updates.maximumCapacity = dto.maximumCapacity;
    if (dto.operatingHoursStart !== undefined)
      updates.operatingHoursStart = dto.operatingHoursStart;
    if (dto.operatingHoursEnd !== undefined)
      updates.operatingHoursEnd = dto.operatingHoursEnd;
    if (dto.childcareLevel !== undefined)
      updates.childcareLevel = dto.childcareLevel;
    if (dto.languagesSpoken !== undefined)
      updates.languagesSpoken = dto.languagesSpoken;
    if (dto.childcareEducation !== undefined)
      updates.childcareEducation = dto.childcareEducation;
    if (dto.specializations !== undefined)
      updates.specializations = dto.specializations;
    if (dto.profileItems !== undefined) updates.profileItems = dto.profileItems;

    if (Object.keys(updates).length > 0) {
      await this.repository.update(dayhome.id, updates);
    }
  }

  async updateDocumentsFromPortal(dto: CallbackDocumentsDto): Promise<void> {
    const dayhome = await this.repository.findByExternalId(dto.externalId);
    if (!dayhome) {
      throw new NotFoundException({
        code: ERROR_CODES.DAYHOME_NOT_FOUND,
        message: `Dayhome with externalId ${dto.externalId} not found`,
      });
    }

    for (const doc of dto.documents) {
      try {
        if (doc.action === 'expired') {
          await this.documentModel.update(
            { status: 'EXPIRED' },
            {
              where: {
                dayhomeId: dayhome.id,
                fileUrl: { [Op.endsWith]: doc.fileName },
              },
            },
          );
        } else if (doc.action === 'renewed' || doc.action === 'replaced') {
          if (!doc.downloadUrl) {
            this.logger.warn(
              `Cannot renew/replace ${doc.fileName}: no downloadUrl provided`,
            );
            continue;
          }

          await this.documentModel.update(
            { status: 'SUPERSEDED' },
            {
              where: {
                dayhomeId: dayhome.id,
                documentType: this.mapCategoryToType(doc.category),
                status: 'ACTIVE',
              },
            },
          );

          try {
            const response = await fetch(doc.downloadUrl);
            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer());
              const contentType =
                response.headers.get('content-type') ??
                'application/octet-stream';
              const storedFileName = `${dayhome.id}/${Date.now()}-${doc.fileName}`;

              const { fileName } = await this.storageService.uploadBuffer(
                buffer,
                storedFileName,
                contentType,
              );

              const latestDoc = await this.documentModel.findOne({
                where: {
                  dayhomeId: dayhome.id,
                  documentType: this.mapCategoryToType(doc.category),
                },
                order: [['version', 'DESC']],
                attributes: ['version'],
              });

              await this.documentModel.create({
                dayhomeId: dayhome.id,
                documentType: this.mapCategoryToType(doc.category),
                fileUrl: fileName,
                expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
                status: 'ACTIVE',
                version: (latestDoc?.version ?? 0) + 1,
              } as CreationAttributes<Document>);
            }
          } catch (fetchErr: unknown) {
            const msg =
              fetchErr instanceof Error ? fetchErr.message : 'Unknown error';
            this.logger.error(
              `Failed to download renewed document ${doc.fileName}: ${msg}`,
            );
          }
        } else if (doc.action === 'updated') {
          if (doc.expiryDate) {
            await this.documentModel.update(
              { expiryDate: new Date(doc.expiryDate) },
              {
                where: {
                  dayhomeId: dayhome.id,
                  fileUrl: { [Op.endsWith]: doc.fileName },
                },
              },
            );
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to process document callback for ${doc.fileName}: ${message}`,
        );
      }
    }
  }

  private async recordIntakeLog(
    status: 'success' | 'flagged_for_review' | 'failed',
    rawBody: Buffer,
    meta: {
      dayhomeId?: string;
      externalId?: string;
      idempotencyKey?: string;
      error?: string;
    },
  ): Promise<void> {
    await this.intakeLogModel.create({
      externalId: meta.externalId ?? '',
      idempotencyKey: meta.idempotencyKey ?? '',
      status,
      signatureValid: true,
      validationErrors: meta.error ? [{ message: meta.error }] : [],
      rawRequestBody: this.safeParseBody(rawBody),
      responseStatusCode: status === 'success' ? 201 : 500,
      dayhomeId: meta.dayhomeId ?? null,
    } as CreationAttributes<IntakeLog>);
  }

  private async processIntakeDocuments(
    dayhomeId: string,
    documents: IntakeDayhomeDto['documents'],
  ): Promise<void> {
    if (!documents) return;

    for (const doc of documents) {
      if (!doc.downloadUrl) {
        this.logger.warn(
          `Document ${doc.fileName} has no downloadUrl, skipping`,
        );
        continue;
      }

      try {
        const response = await fetch(doc.downloadUrl);
        if (!response.ok) {
          this.logger.warn(
            `Failed to download ${doc.fileName}: HTTP ${response.status}`,
          );
          continue;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType =
          response.headers.get('content-type') ?? 'application/octet-stream';
        const extension = this.inferExtension(contentType, doc.fileName);
        const storedFileName = `${dayhomeId}/${Date.now()}-${doc.fileName ?? `document${extension}`}`;

        const { fileName } = await this.storageService.uploadBuffer(
          buffer,
          storedFileName,
          contentType,
        );

        await this.documentModel.create({
          dayhomeId,
          documentType: this.mapCategoryToType(doc.category),
          fileUrl: fileName,
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
          status: PORTAL_STATUS_TO_DOCUMENT_STATUS[doc.status] ?? 'ACTIVE',
          version: 1,
        } as CreationAttributes<Document>);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to process document ${doc.fileName}: ${message}`,
        );
      }
    }
  }

  private mapCategoryToType(category: string): string {
    return CATEGORY_TO_DOCUMENT_TYPE[category] ?? 'OTHER';
  }

  private inferExtension(contentType: string, fileName?: string): string {
    if (fileName && fileName.includes('.')) {
      return '';
    }
    const map: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
    };
    return map[contentType] ?? '';
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pwd = 'Temp@';
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
  }

  private safeParseBody(buf: Buffer): Record<string, unknown> {
    try {
      return JSON.parse(buf.toString('utf8')) as Record<string, unknown>;
    } catch {
      return { raw: buf.toString('utf8') };
    }
  }
}
