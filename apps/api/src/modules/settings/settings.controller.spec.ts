/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: jest.Mocked<SettingsService>;

  const mockSettings = {
    id: 'settings-1',
    organizationId: 'org-1',
    operatingHours: { monday: { open: '07:00', close: '18:00' } },
    holidays: [],
    ratios: { AB: { infant: 3, toddler: 5, preschool: 8 } },
    ratioBreachBehavior: 'WARN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = { organizationId: 'org-1', role: 'ORG_ADMIN' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getByOrganizationId: jest.fn(),
            upsert: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return settings for the current org', async () => {
      service.getByOrganizationId.mockResolvedValue(mockSettings as never);

      const result = await controller.get(mockUser);

      expect(result).toHaveProperty('organizationId', 'org-1');
      expect(result).toHaveProperty('operatingHours');
      expect(service.getByOrganizationId).toHaveBeenCalledWith('org-1');
    });

    it('should throw when settings not found', async () => {
      service.getByOrganizationId.mockRejectedValue(new Error('Not found'));

      await expect(controller.get(mockUser)).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update and return settings', async () => {
      const dto: UpdateSettingsDto = {
        ratioBreachBehavior: 'BLOCK',
      };

      service.upsert.mockResolvedValue({
        ...mockSettings,
        ratioBreachBehavior: 'BLOCK',
      } as never);

      const result = await controller.update(dto, mockUser);

      expect(result.ratioBreachBehavior).toBe('BLOCK');
      expect(service.upsert).toHaveBeenCalledWith('org-1', dto);
    });

    it('should create settings on first update', async () => {
      const dto: UpdateSettingsDto = {
        operatingHours: { monday: { open: '08:00', close: '17:00' } },
      };

      service.upsert.mockResolvedValue(mockSettings as never);

      const result = await controller.update(dto, mockUser);

      expect(result).toHaveProperty('organizationId', 'org-1');
      expect(service.upsert).toHaveBeenCalledWith('org-1', dto);
    });
  });
});
