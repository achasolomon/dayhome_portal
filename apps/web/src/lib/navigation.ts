export interface NavItem {
  label: string;
  href: string;
  icon: string;
  i18nKey?: string;
  badge?: number;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  i18nKey?: string;
  items: NavItem[];
}

export const adminNavGroups: NavGroup[] = [
  {
    label: 'Main',
    i18nKey: 'nav.groups.main',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: 'LayoutDashboard',
        i18nKey: 'nav.dashboard',
      },
    ],
  },
  {
    label: 'Management',
    i18nKey: 'nav.groups.management',
    items: [
      { label: 'Staff', href: '/admin/staff', icon: 'Users', i18nKey: 'nav.staff' },
      { label: 'Dayhomes', href: '/admin/dayhomes', icon: 'Home', i18nKey: 'nav.dayhomes' },
      {
        label: 'Educators',
        href: '/admin/educators',
        icon: 'GraduationCap',
        i18nKey: 'nav.educators',
      },
      { label: 'Families', href: '/admin/families', icon: 'Heart', i18nKey: 'nav.families' },
      { label: 'Children', href: '/admin/children', icon: 'Baby', i18nKey: 'nav.children' },
    ],
  },
  {
    label: 'Operations',
    i18nKey: 'nav.groups.operations',
    items: [
      {
        label: 'Attendance',
        href: '/admin/attendance',
        icon: 'ClipboardCheck',
        i18nKey: 'nav.attendance',
      },
      { label: 'Invoices', href: '/admin/invoices', icon: 'FileText', i18nKey: 'nav.invoices' },
      {
        label: 'Documents',
        href: '/admin/documents',
        icon: 'FolderOpen',
        i18nKey: 'nav.documents',
      },
    ],
  },
  {
    label: 'Settings',
    i18nKey: 'nav.groups.settings',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: 'Shield', i18nKey: 'nav.usersRoles' },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings', i18nKey: 'nav.settings' },
    ],
  },
];
