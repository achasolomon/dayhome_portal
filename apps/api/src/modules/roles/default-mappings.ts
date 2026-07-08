import { ALL_PERMISSIONS } from './permissions';

const ALL = ALL_PERMISSIONS;

const NO_STAFF_MGMT = ALL.filter(
  (p) =>
    ![
      'staff.invite',
      'staff.remove',
      'staff.update',
      'roles.manage',
      'settings.update',
      'dayhomes.close',
      'dayhomes.suspend',
    ].includes(p),
);

const BILLING_ONLY = ALL.filter(
  (p) =>
    p.startsWith('invoices.') ||
    p.startsWith('children.') ||
    p.startsWith('families.') ||
    p === 'attendance.view' ||
    p === 'attendance.report' ||
    p === 'dayhomes.list' ||
    p === 'dayhomes.view' ||
    p === 'settings.view' ||
    p === 'audit.view',
);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  ORG_ADMIN: ALL,
  ORG_MANAGER: NO_STAFF_MGMT,
  BILLING_ONLY,
};
