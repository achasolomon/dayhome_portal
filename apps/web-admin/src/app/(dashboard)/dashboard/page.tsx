'use client';

import {
  Baby,
  Users,
  Home,
  ClipboardCheck,
  UserPlus,
  CalendarPlus,
  MessageSquare,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@spiced-dayhome/ui-kit';
import { useAuthStore } from '@/lib/stores/auth.store';
import Link from 'next/link';

const stats = [
  {
    label: 'Total Children',
    value: '—',
    icon: Baby,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Active Staff',
    value: '—',
    icon: Users,
    color: 'bg-teal/10 text-teal',
  },
  {
    label: 'Dayhomes',
    value: '—',
    icon: Home,
    color: 'bg-golden/10 text-golden',
  },
  {
    label: 'Today\'s Attendance',
    value: '—',
    icon: ClipboardCheck,
    color: 'bg-orange/10 text-orange',
  },
];

const quickActions = [
  { label: 'Add Child', href: '/children/new', icon: UserPlus, color: 'text-primary' },
  { label: 'Record Attendance', href: '/attendance', icon: CalendarPlus, color: 'text-teal' },
  { label: 'Send Message', href: '/messages', icon: MessageSquare, color: 'text-golden' },
  { label: 'New Invoice', href: '/invoices/new', icon: FileText, color: 'text-orange' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.email?.split('@')[0] ?? 'there';

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Good {getPeriod()}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{action.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Link href="/activity" className="text-xs font-medium text-primary hover:text-primary/80">
            View all
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function getPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
