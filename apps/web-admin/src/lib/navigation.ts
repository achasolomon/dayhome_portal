export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Staff', href: '/staff', icon: 'Users' },
      { label: 'Dayhomes', href: '/dayhomes', icon: 'Home' },
      { label: 'Educators', href: '/educators', icon: 'GraduationCap' },
      { label: 'Families', href: '/families', icon: 'Heart' },
      { label: 'Children', href: '/children', icon: 'Baby' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Attendance', href: '/attendance', icon: 'ClipboardCheck' },
      { label: 'Invoices', href: '/invoices', icon: 'FileText' },
      { label: 'Documents', href: '/documents', icon: 'FolderOpen' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Users & Roles', href: '/users', icon: 'Shield' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
];
