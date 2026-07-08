export interface PermissionGroup {
  group: string;
  groupLabel: string;
  permissions: { key: string; label: string; description: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: 'staff',
    groupLabel: 'Staff',
    permissions: [
      {
        key: 'staff.list',
        label: 'View Staff',
        description: 'View staff list and profiles',
      },
      {
        key: 'staff.invite',
        label: 'Invite Staff',
        description: 'Send staff invitations',
      },
      {
        key: 'staff.update',
        label: 'Update Staff',
        description: 'Edit staff roles and details',
      },
      {
        key: 'staff.remove',
        label: 'Remove Staff',
        description: 'Remove staff members',
      },
    ],
  },
  {
    group: 'dayhomes',
    groupLabel: 'Dayhomes',
    permissions: [
      {
        key: 'dayhomes.list',
        label: 'View Dayhomes',
        description: 'View dayhome list',
      },
      {
        key: 'dayhomes.view',
        label: 'View Details',
        description: 'View dayhome details and metrics',
      },
      {
        key: 'dayhomes.update',
        label: 'Update Dayhomes',
        description: 'Edit dayhome info and liaison',
      },
      {
        key: 'dayhomes.suspend',
        label: 'Suspend Dayhomes',
        description: 'Suspend non-compliant dayhomes',
      },
      {
        key: 'dayhomes.close',
        label: 'Close Dayhomes',
        description: 'Close dayhomes permanently',
      },
    ],
  },
  {
    group: 'rooms',
    groupLabel: 'Rooms',
    permissions: [
      {
        key: 'rooms.list',
        label: 'View Rooms',
        description: 'View room list and capacity',
      },
      {
        key: 'rooms.create',
        label: 'Create Rooms',
        description: 'Add new rooms',
      },
      {
        key: 'rooms.update',
        label: 'Update Rooms',
        description: 'Edit room name, capacity, age group',
      },
      {
        key: 'rooms.delete',
        label: 'Delete Rooms',
        description: 'Remove rooms',
      },
    ],
  },
  {
    group: 'educators',
    groupLabel: 'Educators',
    permissions: [
      {
        key: 'educators.list',
        label: 'View Educators',
        description: 'View educator list and profiles',
      },
      {
        key: 'educators.create',
        label: 'Add Educators',
        description: 'Create new educator profiles',
      },
      {
        key: 'educators.update',
        label: 'Update Educators',
        description: 'Edit educator details',
      },
      {
        key: 'educators.remove',
        label: 'Remove Educators',
        description: 'Remove educators',
      },
    ],
  },
  {
    group: 'families',
    groupLabel: 'Families',
    permissions: [
      {
        key: 'families.list',
        label: 'View Families',
        description: 'View family list',
      },
      {
        key: 'families.view',
        label: 'View Details',
        description: 'View family and child details',
      },
      {
        key: 'families.create',
        label: 'Add Families',
        description: 'Register new families',
      },
      {
        key: 'families.update',
        label: 'Update Families',
        description: 'Edit family info',
      },
      {
        key: 'families.remove',
        label: 'Remove Families',
        description: 'Remove families',
      },
    ],
  },
  {
    group: 'children',
    groupLabel: 'Children',
    permissions: [
      {
        key: 'children.list',
        label: 'View Children',
        description: 'View child list',
      },
      {
        key: 'children.view',
        label: 'View Details',
        description: 'View child profiles and medical info',
      },
      {
        key: 'children.create',
        label: 'Add Children',
        description: 'Enroll new children',
      },
      {
        key: 'children.update',
        label: 'Update Children',
        description: 'Edit child profiles',
      },
      {
        key: 'children.remove',
        label: 'Remove Children',
        description: 'Withdraw children',
      },
    ],
  },
  {
    group: 'attendance',
    groupLabel: 'Attendance',
    permissions: [
      {
        key: 'attendance.view',
        label: 'View Attendance',
        description: 'View attendance records',
      },
      {
        key: 'attendance.check_in',
        label: 'Check In',
        description: 'Perform child check-ins',
      },
      {
        key: 'attendance.check_out',
        label: 'Check Out',
        description: 'Perform child check-outs',
      },
      {
        key: 'attendance.report',
        label: 'Reports',
        description: 'Generate attendance reports',
      },
    ],
  },
  {
    group: 'invoices',
    groupLabel: 'Invoices',
    permissions: [
      {
        key: 'invoices.list',
        label: 'View Invoices',
        description: 'View invoice list',
      },
      {
        key: 'invoices.create',
        label: 'Create Invoices',
        description: 'Generate new invoices',
      },
      {
        key: 'invoices.update',
        label: 'Update Invoices',
        description: 'Edit invoice details',
      },
      {
        key: 'invoices.send',
        label: 'Send Invoices',
        description: 'Send invoices to families',
      },
      {
        key: 'invoices.collect',
        label: 'Collect Payments',
        description: 'Record payments',
      },
    ],
  },
  {
    group: 'documents',
    groupLabel: 'Documents',
    permissions: [
      {
        key: 'documents.list',
        label: 'View Documents',
        description: 'View document list',
      },
      {
        key: 'documents.upload',
        label: 'Upload Documents',
        description: 'Upload new documents',
      },
      {
        key: 'documents.update',
        label: 'Update Documents',
        description: 'Replace or update documents',
      },
      {
        key: 'documents.remove',
        label: 'Remove Documents',
        description: 'Delete documents',
      },
    ],
  },
  {
    group: 'settings',
    groupLabel: 'Settings',
    permissions: [
      {
        key: 'settings.view',
        label: 'View Settings',
        description: 'View operational settings',
      },
      {
        key: 'settings.update',
        label: 'Update Settings',
        description: 'Modify operational settings',
      },
    ],
  },
  {
    group: 'roles',
    groupLabel: 'Roles & Permissions',
    permissions: [
      {
        key: 'roles.view',
        label: 'View Roles',
        description: 'View role-permission matrix',
      },
      {
        key: 'roles.manage',
        label: 'Manage Roles',
        description: 'Update role permissions',
      },
    ],
  },
  {
    group: 'audit',
    groupLabel: 'Audit Logs',
    permissions: [
      {
        key: 'audit.view',
        label: 'View Audit Logs',
        description: 'View audit log entries',
      },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);
