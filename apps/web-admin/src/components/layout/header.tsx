'use client';

import { Menu, ArrowLeftFromLine, ArrowRightFromLine } from 'lucide-react';
import { Button } from '@spiced-dayhome/ui-kit';
import { useAuthStore } from '@/lib/stores/auth.store';

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Header({ onMenuClick, collapsed, onToggleCollapse }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ArrowRightFromLine className="h-4 w-4" />
          : <ArrowLeftFromLine className="h-4 w-4" />}
      </Button>

      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {initials}
        </div>
      </div>
    </header>
  );
}
