/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { StaffAccessGuard } from './guards/staff-access.guard';

describe('StaffController', () => {
  let controller: StaffController;
  let service: jest.Mocked<StaffService>;

  const mockInvitation = {
    id: 'inv-1',
    email: 'newstaff@spiced.ca',
    role: 'ORG_MANAGER',
    status: 'PENDING',
    expiresAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        {
          provide: StaffService,
          useValue: {
            invite: jest.fn(),
            listStaff: jest.fn(),
            cancelInvitation: jest.fn(),
            resendInvitation: jest.fn(),
            acceptInvite: jest.fn(),
            checkInvitation: jest.fn(),
            getRoles: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(StaffAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<StaffController>(StaffController);
    service = module.get(StaffService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invite', () => {
    it('should create invitation and return response', async () => {
      const dto: InviteStaffDto = {
        email: 'newstaff@spiced.ca',
        role: 'ORG_MANAGER',
      };
      service.invite.mockResolvedValue(mockInvitation as never);

      const result = await controller.invite(dto, 'org-1');

      expect(result).toHaveProperty('id', 'inv-1');
      expect(service.invite).toHaveBeenCalledWith(dto, 'org-1');
    });

    it('should throw when email already invited', async () => {
      const dto: InviteStaffDto = {
        email: 'existing@spiced.ca',
        role: 'ORG_MANAGER',
      };
      service.invite.mockRejectedValue(new Error('Pending invitation exists'));

      await expect(controller.invite(dto, 'org-1')).rejects.toThrow(
        'Pending invitation exists',
      );
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel a pending invitation', async () => {
      service.cancelInvitation.mockResolvedValue(undefined);

      const result = await controller.cancelInvitation('inv-1', 'org-1');

      expect(result.message).toContain('cancelled');
      expect(service.cancelInvitation).toHaveBeenCalledWith('inv-1', 'org-1');
    });
  });

  describe('acceptInvite', () => {
    it('should accept invitation and return message', async () => {
      service.acceptInvite.mockResolvedValue(undefined);

      const result = await controller.acceptInvite({
        token: 'abc123',
        firstName: 'New',
        lastName: 'User',
        password: 'Password123!',
      });

      expect(result.message).toContain('Account created');
    });
  });
});
