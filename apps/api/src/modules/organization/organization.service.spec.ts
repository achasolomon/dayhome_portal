/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let repository: jest.Mocked<OrganizationRepository>;

  const mockOrg = {
    id: 'org-1',
    name: 'Spiced Childcare',
    email: 'admin@spiced.ca',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    repository = module.get(OrganizationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return organization when found', async () => {
      repository.findById.mockResolvedValue(mockOrg as never);

      const result = await service.findById('org-1');

      expect(result).toBe(mockOrg);
      expect(repository.findById).toHaveBeenCalledWith('org-1');
    });

    it('should throw when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update organization name', async () => {
      const dto: UpdateOrganizationDto = { name: 'Updated Name' };
      repository.findById.mockResolvedValue(mockOrg as never);
      repository.update.mockResolvedValue({
        ...mockOrg,
        name: 'Updated Name',
      } as never);

      const result = await service.update('org-1', dto);

      expect(result.name).toBe('Updated Name');
      expect(repository.update).toHaveBeenCalledWith('org-1', {
        name: 'Updated Name',
        email: undefined,
        status: undefined,
      });
    });

    it('should throw on duplicate email', async () => {
      const dto: UpdateOrganizationDto = { email: 'existing@spiced.ca' };
      repository.findById.mockResolvedValue(mockOrg as never);
      repository.findByEmail.mockResolvedValue({
        id: 'org-2',
        email: 'existing@spiced.ca',
      } as never);

      await expect(service.update('org-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw when updating non-existent org', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
