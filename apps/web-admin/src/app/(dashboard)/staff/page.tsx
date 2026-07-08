'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@spiced-dayhome/ui-kit';
import {
  Users,
  UserPlus,
  Clock,
  Loader2,
  Check,
  Search,
  X,
  MoreHorizontal,
  Mail,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { staffApi, StaffMember, StaffInvitation, RoleOption } from '@/lib/api/staff';
import { toast } from '@/components/ui/toaster';

const badgePalette = [
  'bg-purple/10 text-purple border-purple/20',
  'bg-blue/10 text-blue border-blue/20',
  'bg-amber/10 text-amber border-amber/20',
  'bg-teal/10 text-teal border-teal/20',
  'bg-orange/10 text-orange border-orange/20',
  'bg-pink/10 text-pink border-pink/20',
];

export default function StaffPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<StaffInvitation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const roleMap = new Map(roles.map((r, i) => [r.value, { label: r.label, colorIndex: i }]));

  useEffect(() => {
    staffApi.getRoles().then((r) => {
      setRoles(r);
      if (r.length > 0) setInviteRole(r[0].value);
    });
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const result = await staffApi.list({ search: search || undefined });
      setStaff(result.staff);
      setPendingInvitations(result.pendingInvitations);
    } catch {
      setStaff([]);
      setPendingInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadStaff(), 300);
    return () => clearTimeout(timer);
  }, [loadStaff]);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    try {
      setInviteSubmitting(true);
      await staffApi.invite({ email: inviteEmail.trim(), role: inviteRole, phone: invitePhone.trim() || undefined });
      toast({ title: t('staff.invitationSent'), description: t('staff.invitationSentTo', { email: inviteEmail }), variant: 'success' });
      setInviteOpen(false);
      setInviteEmail('');
      setInvitePhone('');
      await loadStaff();
    } catch {
      toast({ title: t('staff.failedToSend'), description: t('staff.tryAgain'), variant: 'error' });
    } finally {
      setInviteSubmitting(false);
    }
  }

  const filteredStaff = roleFilter === 'all'
    ? staff
    : staff.filter((m) => m.role === roleFilter);

  async function handleCancelInvitation(id: string, email: string) {
    try {
      await staffApi.cancelInvitation(id);
      toast({ title: t('staff.invitationCancelled'), description: t('staff.invitationCancelledFor', { email }), variant: 'success' });
      await loadStaff();
    } catch {
      toast({ title: t('staff.failedToCancel'), description: t('staff.tryAgain'), variant: 'error' });
    }
  }

  async function handleResendInvite(inv: StaffInvitation) {
    try {
      await staffApi.resendInvitation(inv.id);
      toast({ title: t('staff.invitationResent'), description: t('staff.invitationResentTo', { email: inv.email }), variant: 'success' });
      await loadStaff();
    } catch {
      toast({ title: t('staff.failedToResend'), description: t('staff.tryAgain'), variant: 'error' });
    }
  }

  const initials = (member: StaffMember) =>
    (member.firstName?.[0] || member.email[0]).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('staff.pageTitle')}</h1>
          <p className="mt-1 text-muted-foreground">{t('staff.pageDescription')}</p>
        </div>
        <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
          <Button onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="h-5 w-5" />
            {t('staff.invite')}
          </Button>
          <SheetContent size="sm" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <SheetTitle>{t('staff.inviteTitle')}</SheetTitle>
                  <SheetDescription>{t('staff.inviteDescription')}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <SheetBody className="space-y-5">
              <Input
                id="invite-email"
                label={t('staff.inviteEmail')}
                type="email"
                placeholder="colleague@spiced.ca"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                autoFocus
              />
              <Input
                id="invite-phone"
                label={t('staff.invitePhone')}
                type="tel"
                placeholder="+1-403-555-0123"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t('staff.role')}</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SheetBody>
            <SheetFooter>
              <Button variant="outline" disabled={inviteSubmitting} onClick={() => setInviteOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleInvite} disabled={inviteSubmitting}>
                {inviteSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {t('staff.sending')}</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> {t('staff.sendInvite')}</>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '—' : staff.length}</p>
              <p className="text-xs text-muted-foreground">{t('staff.activeStaffCount')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '—' : pendingInvitations.length}</p>
              <p className="text-xs text-muted-foreground">{t('staff.pendingCount')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('staff.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10 pr-10 text-base"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('staff.allRoles')}</SelectItem>
            {roles.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('staff.activeStaff')}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('staff.pendingInvitations')}
          {pendingInvitations.length > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber/15 px-1.5 text-[11px] font-semibold text-amber">
              {pendingInvitations.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : activeTab === 'active' ? (
        filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">
                  {search || roleFilter !== 'all' ? t('staff.noStaffFilter') : t('staff.noStaff')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || roleFilter !== 'all'
                    ? t('staff.noStaffFilterHint')
                    : t('staff.noStaffHint')}
                </p>
              </div>
              {!search && roleFilter === 'all' && (
                <Button onClick={() => setInviteOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('staff.invite')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredStaff.map((member) => {
              const info = roleMap.get(member.role);
              return (
                <div
                  key={member.id}
                  className="group flex items-center gap-4 rounded-lg border bg-card px-5 py-3 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-bold text-white shadow-sm">
                    {initials(member)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.email}
                      </p>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400/75 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`border text-xs font-medium ${badgePalette[(info?.colorIndex ?? 0) % badgePalette.length]}`}
                  >
                    {info?.label ?? member.role.replace(/_/g, ' ')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus:opacity-100">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="gap-2">
                        <Mail className="h-4 w-4" />
                        {t('staff.sendMessage')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {t('staff.changeRole')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        {t('staff.remove')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )
      ) : (
        pendingInvitations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">{t('staff.allClear')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('staff.noPending')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="group flex items-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 px-5 py-3 transition-all hover:border-muted-foreground/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/10">
                  <Clock className="h-5 w-5 text-amber" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('staff.expires', { date: new Date(inv.expiresAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    }) })}
                  </p>
                </div>
                <Badge variant="outline" className="border-amber/30 bg-amber/5 text-amber">
                  {t('common.pending')}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2" onClick={() => handleResendInvite(inv)}>
                      <RefreshCw className="h-4 w-4" />
                      {t('staff.resendInvite')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={() => handleCancelInvitation(inv.id, inv.email)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('staff.cancelInvitation')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
