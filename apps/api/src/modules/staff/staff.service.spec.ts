/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { QueuesService } from '../../queues/queues.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { User } from '../../users/entities/user.model';

describe('StaffService', () => {
  let service: StaffService;
  let repository: jest.Mocked<StaffRepository>;
  let queuesService: jest.Mocked<QueuesService>;

  const mockInvitation = {
    id: 'inv-1',
    email: 'newstaff@spiced.ca',
    role: 'ORG_MANAGER',
    organizationId: 'org-1',
    token: 'abc123',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: StaffRepository,
          useValue: {
            findPendingInvitationByEmail: jest.fn(),
            createInvitation: jest.fn(),
            findInvitationById: jest.fn(),
            findInvitationByToken: jest.fn(),
            markInvitationCancelled: jest.fn(),
            markInvitationAccepted: jest.fn(),
            findStaffByOrganization: jest.fn(),
            findPendingInvitationsByOrganization: jest.fn(),
            markExpiredInvitations: jest.fn(),
          },
        },
        {
          provide: QueuesService,
          useValue: {
            queueInviteEmail: jest.fn(),
            queueResetPasswordEmail: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    repository = module.get(StaffRepository);
    queuesService = module.get(QueuesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invite', () => {
    const dto: InviteStaffDto = {
      email: 'newstaff@spiced.ca',
      role: 'ORG_MANAGER',
    };

    it('should create invitation and queue email', async () => {
      repository.findPendingInvitationByEmail.mockResolvedValue(null);
      repository.createInvitation.mockResolvedValue(mockInvitation as never);

      const result = await service.invite(dto, 'org-1');

      expect(result).toBe(mockInvitation);
      expect(repository.createInvitation).toHaveBeenCalled();
      expect(queuesService.queueInviteEmail).toHaveBeenCalledWith({
        email: 'newstaff@spiced.ca',
        token: expect.any(String) as string,
        organizationId: 'org-1',
      });
    });

    it('should throw when pending invitation exists', async () => {
      repository.findPendingInvitationByEmail.mockResolvedValue(
        mockInvitation as never,
      );

      await expect(service.invite(dto, 'org-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel a pending invitation', async () => {
      repository.findInvitationById.mockResolvedValue(mockInvitation as never);

      await service.cancelInvitation('inv-1', 'org-1');

      expect(repository.markInvitationCancelled).toHaveBeenCalledWith('inv-1');
    });

    it('should throw when invitation not found', async () => {
      repository.findInvitationById.mockResolvedValue(null);

      await expect(
        service.cancelInvitation('nonexistent', 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when invitation is not pending', async () => {
      repository.findInvitationById.mockResolvedValue({
        ...mockInvitation,
        status: 'ACCEPTED',
      } as never);

      await expect(service.cancelInvitation('inv-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendInvitation', () => {
    it('should resend and return invitation', async () => {
      repository.findInvitationById.mockResolvedValue(mockInvitation as never);

      const result = await service.resendInvitation('inv-1', 'org-1');

      expect(result).toBe(mockInvitation);
      expect(queuesService.queueInviteEmail).toHaveBeenCalled();
    });

    it('should throw when invitation is expired', async () => {
      const expired = {
        ...mockInvitation,
        expiresAt: new Date(Date.now() - 1000),
      };
      repository.findInvitationById.mockResolvedValue(expired as never);

      await expect(service.resendInvitation('inv-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
