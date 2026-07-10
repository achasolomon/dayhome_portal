'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Menu, ArrowLeftFromLine, ArrowRightFromLine, User, Settings, LogOut } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@spiced-dayhome/ui-kit';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authApi } from '@/lib/api/auth';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/toaster';

const pageTitleKeys: Record<string, string> = {
  '/admin/dashboard': 'nav.dashboard',
  '/admin/staff': 'nav.staff',
  '/admin/dayhomes': 'nav.dayhomes',
  '/admin/educators': 'nav.educators',
  '/admin/families': 'nav.families',
  '/admin/children': 'nav.children',
  '/admin/attendance': 'nav.attendance',
  '/admin/invoices': 'nav.invoices',
  '/admin/documents': 'nav.documents',
  '/admin/users': 'nav.usersRoles',
  '/admin/profile': 'header.profile',
  '/admin/settings': 'nav.settings',
};

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Header({ onMenuClick, collapsed, onToggleCollapse }: HeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loggingOut, setLoggingOut] = useState(false);
  const pageTitle = pageTitleKeys[pathname] ? t(pageTitleKeys[pathname]) : '';

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?';

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await authApi.logout();
    } catch {
      // still clear local state even if server call fails
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      {/* Sidebar collapse toggle (desktop) */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden shrink-0 text-muted-foreground lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? t('header.expandSidebar') : t('header.collapseSidebar')}
        title={collapsed ? t('header.expandSidebar') : t('header.collapseSidebar')}
      >
        {collapsed
          ? <ArrowRightFromLine className="h-4 w-4" />
          : <ArrowLeftFromLine className="h-4 w-4" />}
      </Button>

      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label={t('header.toggleNav')}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      {pageTitle && (
        <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
      )}

      <div className="flex-1" />

      {/* User menu */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-sm">
                {initials}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              {t('header.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? t('header.loggingOut') : t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
