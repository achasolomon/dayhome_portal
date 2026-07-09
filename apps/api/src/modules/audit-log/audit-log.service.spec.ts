/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: jest.Mocked<AuditLogRepository>;

  const mockLog = {
    id: 'log-1',
    userId: 'user-1',
    action: 'staff.invite',
    entity: 'Invitation',
    entityId: 'inv-1',
    before: null,
    after: { email: 'test@example.com' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: AuditLogRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    repository = module.get(AuditLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      const dto: CreateAuditLogDto = {
        userId: 'user-1',
        action: 'staff.invite',
        entity: 'Invitation',
        entityId: 'inv-1',
        after: { email: 'test@example.com' },
      };

      repository.create.mockResolvedValue(mockLog as never);

      const result = await service.create(dto);

      expect(result).toBe(mockLog);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'staff.invite',
        entity: 'Invitation',
        entityId: 'inv-1',
        after: { email: 'test@example.com' },
      });
    });

    it('should create log without before/after when not provided', async () => {
      const dto: CreateAuditLogDto = {
        userId: 'user-1',
        action: 'organization.update',
        entity: 'Organization',
        entityId: 'org-1',
      };

      repository.create.mockResolvedValue({
        ...mockLog,
        before: null,
        after: null,
      } as never);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'organization.update',
        entity: 'Organization',
        entityId: 'org-1',
      });
    });
  });

  describe('findById', () => {
    it('should return audit log when found', async () => {
      repository.findById.mockResolvedValue(mockLog as never);

      const result = await service.findById('log-1');

      expect(result).toBe(mockLog);
      expect(repository.findById).toHaveBeenCalledWith('log-1');
    });

    it('should throw when audit log is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    const paginatedResult = {
      data: [mockLog],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    it('should return paginated audit logs without filters', async () => {
      const query: AuditLogQueryDto = {};
      repository.findAll.mockResolvedValue(paginatedResult as never);

      const result = await service.findAll(query);

      expect(result).toEqual(paginatedResult);
      expect(repository.findAll).toHaveBeenCalledWith({
        userId: undefined,
        action: undefined,
        entity: undefined,
        entityId: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('should apply filters when provided', async () => {
      const query: AuditLogQueryDto = {
        userId: 'user-1',
        action: 'staff.invite',
        entity: 'Invitation',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        page: 2,
        limit: 10,
      };
      repository.findAll.mockResolvedValue({
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
      });

      const result = await service.findAll(query);

      expect(result.data).toHaveLength(0);
      expect(repository.findAll).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'staff.invite',
        entity: 'Invitation',
        entityId: undefined,
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        page: 2,
        limit: 10,
      });
    });
  });
});
