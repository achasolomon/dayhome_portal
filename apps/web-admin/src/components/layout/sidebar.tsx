'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
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

function NavItemLink({ item, isActive, collapsed, t }: { item: NavItem; isActive: boolean; collapsed: boolean; t: (key: string) => string }) {
  const label = item.i18nKey ? t(item.i18nKey) : item.label;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-white/15 text-white shadow-sm'
          : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
      )}
      title={collapsed ? label : undefined}
    >
      {item.icon && iconMap[item.icon]}
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && item.badge != null && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-golden/80 px-1.5 text-[10px] font-medium text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavItemWrapper({ item, pathname, collapsed, t, depth = 0 }: { item: NavItem; pathname: string; collapsed: boolean; t: (key: string) => string; depth?: number }) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const [expanded, setExpanded] = useState(isActive);
  const label = item.i18nKey ? t(item.i18nKey) : item.label;

  if (!hasChildren || collapsed) {
    return <NavItemLink item={item} isActive={isActive} collapsed={collapsed} t={t} />;
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
          isActive
            ? 'bg-white/15 text-white shadow-sm'
            : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
        )}
      >
        {item.icon && iconMap[item.icon]}
        <span className="flex-1 text-left">{label}</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {expanded && item.children && (
        <div className="ml-8 mt-1 space-y-1 border-l border-sidebar-border/50 pl-3">
          {item.children.map((child) => (
            <NavItemWrapper key={child.href} item={child} pathname={pathname} collapsed={collapsed} t={t} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

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
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar-background transition-all duration-200 lg:static lg:translate-x-0',
          collapsed ? 'w-16' : 'w-60',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo area */}
        <div className={cn('flex h-14 items-center border-b border-sidebar-border', collapsed ? 'justify-center' : 'gap-3 px-4')}>
          <img src="/assets/logo.png" alt="SPICE'd" className="h-8 w-8 object-contain" />
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-white">SPICE&apos;d</span>
          )}
        </div>

        {/* Navigation groups */}
        <nav className="scrollbar-hidden flex-1 space-y-5 overflow-y-auto p-2">
          {navGroups.map((group) => {
            const groupLabel = group.i18nKey ? t(group.i18nKey) : group.label;
            return (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
                  {groupLabel}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemWrapper key={item.href} item={item} pathname={pathname} collapsed={collapsed} t={t} />
                ))}
              </div>
            </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-sidebar-border p-2">
          <div className="space-y-0.5">
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-white/5 hover:text-white"
              title={collapsed ? t('nav.notifications') : undefined}
            >
              <Bell className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{t('nav.notifications')}</span>}
            </button>
            <Link
              href="/audit-log"
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-white/5 hover:text-white',
                collapsed ? 'justify-center' : '',
              )}
              title={collapsed ? t('nav.auditLog') : undefined}
            >
              <ClipboardList className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1">{t('nav.auditLog')}</span>}
            </Link>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-white/5 hover:text-white"
              title={collapsed ? t('nav.logout') : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{t('nav.logout')}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
