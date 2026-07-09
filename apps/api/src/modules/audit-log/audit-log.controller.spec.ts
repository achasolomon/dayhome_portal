/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: jest.Mocked<AuditLogService>;

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
      controllers: [AuditLogController],
      providers: [
        {
          provide: AuditLogService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    service = module.get(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
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
      service.findAll.mockResolvedValue(paginatedResult as never);

      const query: AuditLogQueryDto = {};
      const result = await controller.findAll(query);

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should pass query params to service', async () => {
      const query: AuditLogQueryDto = {
        userId: 'user-1',
        action: 'staff.invite',
        page: 2,
        limit: 10,
      };
      service.findAll.mockResolvedValue({
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

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return audit log when found', async () => {
      service.findById.mockResolvedValue(mockLog as never);

      const result = await controller.findOne('log-1');

      expect(result).toHaveProperty('id', 'log-1');
      expect(result).toHaveProperty('action', 'staff.invite');
      expect(service.findById).toHaveBeenCalledWith('log-1');
    });

    it('should throw when audit log is not found', async () => {
      service.findById.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        'Not found',
      );
    });
  });
});
