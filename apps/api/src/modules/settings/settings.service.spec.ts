/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { UpdateSettingsDto } from './dto/update-settings.dto';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: jest.Mocked<SettingsRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsRepository,
          useValue: {
            findByOrganizationId: jest.fn(),
            upsert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    repository = module.get(SettingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByOrganizationId', () => {
    it('should return settings when found', async () => {
      repository.findByOrganizationId.mockResolvedValue(mockSettings as never);

      const result = await service.getByOrganizationId('org-1');

      expect(result).toBe(mockSettings);
      expect(repository.findByOrganizationId).toHaveBeenCalledWith('org-1');
    });

    it('should throw when settings not found', async () => {
      repository.findByOrganizationId.mockResolvedValue(null);

      await expect(service.getByOrganizationId('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsert', () => {
    it('should create settings when none exist', async () => {
      const dto: UpdateSettingsDto = {
        operatingHours: { monday: { open: '07:00', close: '18:00' } },
        ratios: { AB: { infant: 3 } },
      };

      repository.upsert.mockResolvedValue(mockSettings as never);

      const result = await service.upsert('org-1', dto);

      expect(result).toBe(mockSettings);
      expect(repository.upsert).toHaveBeenCalledWith('org-1', {
        operatingHours: dto.operatingHours,
        ratios: dto.ratios,
      });
    });

    it('should update settings partially', async () => {
      const dto: UpdateSettingsDto = {
        ratioBreachBehavior: 'BLOCK',
      };

      repository.upsert.mockResolvedValue({
        ...mockSettings,
        ratioBreachBehavior: 'BLOCK',
      } as never);

      const result = await service.upsert('org-1', dto);

      expect(result.ratioBreachBehavior).toBe('BLOCK');
      expect(repository.upsert).toHaveBeenCalledWith('org-1', {
        ratioBreachBehavior: 'BLOCK',
      });
    });

    it('should ignore undefined fields', async () => {
      const dto: UpdateSettingsDto = {};

      repository.upsert.mockResolvedValue(mockSettings as never);

      const result = await service.upsert('org-1', dto);

      expect(result).toBe(mockSettings);
      expect(repository.upsert).toHaveBeenCalledWith('org-1', {});
    });
  });
});
