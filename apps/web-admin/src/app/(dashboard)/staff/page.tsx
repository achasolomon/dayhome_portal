'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from '@spiced-dayhome/ui-kit';
import {
  Users,
  UserPlus,
  Clock,
  Loader2,
  Check,
  Search,
  X,
} from 'lucide-react';
import { staffApi, StaffMember, StaffInvitation } from '@/lib/api/staff';
import { toast } from '@/components/ui/toaster';

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('ORG_MANAGER');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

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
      await staffApi.invite({ email: inviteEmail.trim(), role: inviteRole });
      toast({ title: 'Invitation sent', description: `Invitation sent to ${inviteEmail}`, variant: 'success' });
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('ORG_MANAGER');
      await loadStaff();
    } catch {
      toast({ title: 'Failed to send invite', description: 'Please try again.', variant: 'error' });
    } finally {
      setInviteSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="mt-1 text-muted-foreground">Manage agency staff and their roles</p>
        </div>
        <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
          <Button onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Staff
          </Button>
          <SheetContent size="sm" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <SheetTitle>Invite Staff Member</SheetTitle>
                  <SheetDescription>Send an invitation to join the agency</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <SheetBody className="space-y-5">
              <Input
                id="invite-email"
                label="Email Address"
                type="email"
                placeholder="colleague@spiced.ca"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                autoFocus
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORG_ADMIN">Admin</SelectItem>
                    <SelectItem value="ORG_MANAGER">Manager</SelectItem>
                    <SelectItem value="BILLING_ONLY">Billing Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SheetBody>
            <SheetFooter>
              <Button variant="outline" disabled={inviteSubmitting} onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviteSubmitting}>
                {inviteSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Send Invite</>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Staff</p>
              <p className="text-3xl font-bold">{loading ? '—' : staff.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending Invitations</p>
              <p className="text-3xl font-bold text-amber-600">
                {loading ? '—' : pendingInvitations.length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-amber-500/40" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff by name or email..."
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

      {/* Staff list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : staff.length === 0 && pendingInvitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">No staff yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Invite your first team member to get started
              </p>
            </div>
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {staff.length > 0 && (
            <div className="space-y-2">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-lg border bg-white px-5 py-3 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-bold text-white">
                    {(member.firstName?.[0] || member.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge
                    className={
                      member.role === 'ORG_ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : member.role === 'ORG_MANAGER'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {member.role.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {pendingInvitations.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Invitations
              </h3>
              <div className="space-y-2">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 rounded-lg border border-dashed bg-white/50 px-5 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
