/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationAccessGuard } from './guards/organization-access.guard';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: jest.Mocked<OrganizationService>;

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
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: OrganizationRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(OrganizationAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<OrganizationController>(OrganizationController);
    service = module.get(OrganizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return organization by id', async () => {
      service.findById.mockResolvedValue(mockOrg as never);

      const result = await controller.findOne('org-1');

      expect(result).toHaveProperty('id', 'org-1');
      expect(result).toHaveProperty('name', 'Spiced Childcare');
      expect(service.findById).toHaveBeenCalledWith('org-1');
    });

    it('should throw when not found', async () => {
      service.findById.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return organization', async () => {
      const dto: UpdateOrganizationDto = { name: 'Updated Name' };
      service.update.mockResolvedValue({
        ...mockOrg,
        name: 'Updated Name',
      } as never);

      const result = await controller.update('org-1', dto);

      expect(result.name).toBe('Updated Name');
      expect(service.update).toHaveBeenCalledWith('org-1', dto);
    });

    it('should throw on duplicate email', async () => {
      const dto: UpdateOrganizationDto = { email: 'taken@spiced.ca' };
      service.update.mockRejectedValue(new Error('Duplicate email'));

      await expect(controller.update('org-1', dto)).rejects.toThrow(
        'Duplicate email',
      );
    });
  });
});
