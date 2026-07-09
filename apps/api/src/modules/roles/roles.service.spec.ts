/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { User } from '../../users/entities/user.model';

describe('RolesService', () => {
  let service: RolesService;
  let repository: jest.Mocked<RolesRepository>;

  const mockRole = {
    role: 'CUSTOM_ROLE',
    label: 'Custom Role',
    isSystem: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: {
            getAllRoles: jest.fn(),
            getRole: jest.fn(),
            createRole: jest.fn(),
            deleteRole: jest.fn(),
            getPermissionsForRole: jest.fn(),
            setPermissionsForRole: jest.fn(),
            getAllMappings: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get(RolesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('should create a new custom role', async () => {
      repository.getRole.mockResolvedValue(null);
      repository.createRole.mockResolvedValue(mockRole as never);

      const result = await service.createRole('CUSTOM_ROLE', 'Custom Role');

      expect(result.role).toBe('CUSTOM_ROLE');
      expect(result.label).toBe('Custom Role');
      expect(result.permissions).toEqual([]);
      expect(repository.createRole).toHaveBeenCalledWith(
        'CUSTOM_ROLE',
        'Custom Role',
      );
    });

    it('should throw when role already exists', async () => {
      repository.getRole.mockResolvedValue(mockRole as never);

      await expect(
        service.createRole('CUSTOM_ROLE', 'Custom Role'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid role key format', async () => {
      repository.getRole.mockResolvedValue(null);

      await expect(
        service.createRole('invalid-key', 'Invalid'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRolePermissions', () => {
    it('should update permissions for a role', async () => {
      repository.getRole.mockResolvedValue(mockRole as never);
      repository.getPermissionsForRole.mockResolvedValue([]);

      const result = await service.updateRolePermissions('CUSTOM_ROLE', [
        'staff.view',
        'staff.invite',
      ]);

      expect(result.permissions).toEqual(['staff.view', 'staff.invite']);
      expect(repository.setPermissionsForRole).toHaveBeenCalledWith(
        'CUSTOM_ROLE',
        ['staff.view', 'staff.invite'],
      );
    });

    it('should throw when role not found', async () => {
      repository.getRole.mockResolvedValue(null);

      await expect(
        service.updateRolePermissions('NONEXISTENT', []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRole', () => {
    it('should delete a custom role', async () => {
      repository.getRole.mockResolvedValue(mockRole as never);

      await service.deleteRole('CUSTOM_ROLE');

      expect(repository.deleteRole).toHaveBeenCalledWith('CUSTOM_ROLE');
    });

    it('should throw when deleting system role', async () => {
      repository.getRole.mockResolvedValue({
        ...mockRole,
        isSystem: true,
      } as never);

      await expect(service.deleteRole('ORG_ADMIN')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when role not found', async () => {
      repository.getRole.mockResolvedValue(null);

      await expect(service.deleteRole('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
