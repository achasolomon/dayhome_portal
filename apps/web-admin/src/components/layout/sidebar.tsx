'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@spiced-dayhome/ui-kit';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  Heart,
  Baby,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  Bell,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { navGroups, type NavItem } from '@/lib/navigation';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Home: <Home className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Baby: <Baby className="h-5 w-5" />,
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  FolderOpen: <FolderOpen className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
};

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
}

function NavItemLink({ item, isActive, collapsed }: { item: NavItem; isActive: boolean; collapsed: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
      )}
      title={collapsed ? item.label : undefined}
    >
      {item.icon && iconMap[item.icon]}
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge != null && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[10px] font-medium text-white/80">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavItemWrapper({ item, pathname, collapsed, depth = 0 }: { item: NavItem; pathname: string; collapsed: boolean; depth?: number }) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const [expanded, setExpanded] = useState(isActive);

  if (!hasChildren || collapsed) {
    return <NavItemLink item={item} isActive={isActive} collapsed={collapsed} />;
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
        )}
      >
        {item.icon && iconMap[item.icon]}
        <span className="flex-1 text-left">{item.label}</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {expanded && item.children && (
        <div className="ml-8 mt-1 space-y-1 border-l pl-3">
          {item.children.map((child) => (
            <NavItemWrapper key={child.href} item={child} pathname={pathname} collapsed={collapsed} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
          role="presentation"
          tabIndex={-1}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar-background transition-all duration-200 lg:static lg:translate-x-0',
          collapsed ? 'w-16' : 'w-60',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className={cn('flex h-14 items-center border-b border-sidebar-border', collapsed ? 'justify-center' : 'gap-2 px-4')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
            S
          </div>
          {!collapsed && <span className="text-base font-semibold text-white">Spiced</span>}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hidden p-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemWrapper key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {!collapsed && <span className="flex-1 text-left">Notifications</span>}
          </button>
          <Link
            href="/audit-log"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white',
              collapsed ? 'justify-center' : '',
            )}
            title="Audit Log"
          >
            <ClipboardList className="h-5 w-5" />
            {!collapsed && <span className="flex-1">Audit Log</span>}
          </Link>
          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="flex-1 text-left">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
