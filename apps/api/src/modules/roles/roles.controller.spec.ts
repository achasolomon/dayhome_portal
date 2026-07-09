/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            getRolePermissions: jest.fn(),
            updateRolePermissions: jest.fn(),
            createRole: jest.fn(),
            deleteRole: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRolePermissions', () => {
    it('should return roles with permissions', async () => {
      const expected = {
        roles: [{ role: 'ORG_ADMIN', label: 'Admin', permissions: ['*'] }],
        permissionGroups: [],
      };
      service.getRolePermissions.mockResolvedValue(expected);

      const result = await controller.getRolePermissions();

      expect(result).toEqual(expected);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const dto: CreateRoleDto = { role: 'CUSTOM_ROLE', label: 'Custom' };
      service.createRole.mockResolvedValue({
        role: 'CUSTOM_ROLE',
        label: 'Custom',
        permissions: [],
      });

      const result = await controller.createRole(dto);

      expect(result.role).toBe('CUSTOM_ROLE');
      expect(service.createRole).toHaveBeenCalledWith('CUSTOM_ROLE', 'Custom');
    });
  });

  describe('updateRolePermissions', () => {
    it('should update role permissions', async () => {
      const dto: UpdatePermissionsDto = { permissions: ['staff.view'] };
      service.updateRolePermissions.mockResolvedValue({
        role: 'ORG_MANAGER',
        label: 'Manager',
        permissions: ['staff.view'],
      });

      const result = await controller.updateRolePermissions('ORG_MANAGER', dto);

      expect(result.permissions).toEqual(['staff.view']);
      expect(service.updateRolePermissions).toHaveBeenCalledWith(
        'ORG_MANAGER',
        ['staff.view'],
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete a custom role', async () => {
      service.deleteRole.mockResolvedValue(undefined);

      await controller.deleteRole('CUSTOM_ROLE');

      expect(service.deleteRole).toHaveBeenCalledWith('CUSTOM_ROLE');
    });
  });
});
