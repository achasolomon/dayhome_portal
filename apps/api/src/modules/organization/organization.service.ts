import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';
import { OrganizationRepository } from './organization.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.DUPLICATE_EMAIL,
        message: 'An organization with this email already exists.',
      });
    }
    return this.repository.create({
      name: dto.name,
      email: dto.email,
      status: dto.status ?? 'ACTIVE',
    });
  }

  async findAll(query: OrganizationQueryDto) {
    return this.repository.findAll({
      search: query.search,
      status: query.status,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      includeDeleted: query.includeDeleted,
    });
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.repository.findById(id);
    if (!org) {
      throw new NotFoundException({
        code: ERROR_CODES.ORGANIZATION_NOT_FOUND,
        message: `Organization not found with id ${id}`,
      });
    }
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.repository.findByEmail(dto.email, {
        excludeId: id,
      });
      if (existing) {
        throw new ConflictException({
          code: ERROR_CODES.DUPLICATE_EMAIL,
          message: 'An organization with this email already exists.',
        });
      }
    }

    const updated = await this.repository.update(id, {
      name: dto.name,
      email: dto.email,
      status: dto.status,
    });
    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.ORGANIZATION_NOT_FOUND,
        message: `Organization not found with id ${id}`,
      });
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.remove(id);
  }
}
