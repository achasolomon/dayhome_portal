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

export const navGroups: NavGroup[] = [
  {
    label: 'Main',
    i18nKey: 'nav.groups.main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', i18nKey: 'nav.dashboard' },
    ],
  },
  {
    label: 'Management',
    i18nKey: 'nav.groups.management',
    items: [
      { label: 'Staff', href: '/staff', icon: 'Users', i18nKey: 'nav.staff' },
      { label: 'Dayhomes', href: '/dayhomes', icon: 'Home', i18nKey: 'nav.dayhomes' },
      { label: 'Educators', href: '/educators', icon: 'GraduationCap', i18nKey: 'nav.educators' },
      { label: 'Families', href: '/families', icon: 'Heart', i18nKey: 'nav.families' },
      { label: 'Children', href: '/children', icon: 'Baby', i18nKey: 'nav.children' },
    ],
  },
  {
    label: 'Operations',
    i18nKey: 'nav.groups.operations',
    items: [
      {
        label: 'Attendance',
        href: '/attendance',
        icon: 'ClipboardCheck',
        i18nKey: 'nav.attendance',
      },
      { label: 'Invoices', href: '/invoices', icon: 'FileText', i18nKey: 'nav.invoices' },
      { label: 'Documents', href: '/documents', icon: 'FolderOpen', i18nKey: 'nav.documents' },
    ],
  },
  {
    label: 'Settings',
    i18nKey: 'nav.groups.settings',
    items: [
      { label: 'Users & Roles', href: '/users', icon: 'Shield', i18nKey: 'nav.usersRoles' },
      { label: 'Settings', href: '/settings', icon: 'Settings', i18nKey: 'nav.settings' },
    ],
  },
];
