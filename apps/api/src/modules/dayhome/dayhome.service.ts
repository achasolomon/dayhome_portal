import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { DayhomeRepository } from './dayhome.repository';
import { IntakeDayhomeDto } from './dto/intake-dayhome.dto';
import { IntakeResponseDto } from './dto/intake-response.dto';
import { Dayhome } from './entities/dayhome.entity';
import { IntakeLog } from './entities/intake-log.entity';
import { UsersService } from '../../users/users.service';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';

@Injectable()
export class DayhomeService {
  constructor(
    private readonly repository: DayhomeRepository,
    private readonly usersService: UsersService,
    @InjectModel(IntakeLog)
    private readonly intakeLogModel: typeof IntakeLog,
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
      organizationId: '00000000-0000-0000-0000-000000000000',
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

    await this.recordIntakeLog('success', rawBody, {
      dayhomeId: dayhome.id,
      externalId: dto.externalId,
      idempotencyKey,
    });

    return IntakeResponseDto.from(dayhome);
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
