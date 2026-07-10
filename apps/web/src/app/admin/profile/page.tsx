'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input } from '@spiced-dayhome/ui-kit';
import { User, Loader2, Eye, EyeOff, Save } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authApi } from '@/lib/api/auth';
import { toast } from '@/components/ui/toaster';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Please fill in all fields', variant: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'New password must be at least 6 characters', variant: 'error' });
      return;
    }
    try {
      setSaving(true);
      await authApi.changePassword(oldPassword, newPassword);
      toast({ title: 'Password changed successfully', variant: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({ title: 'Failed to change password', description: 'Check your current password and try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Account info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.email ?? 'Unknown'}</p>
              {user?.role && (
                <p className="mt-1 text-xs text-muted-foreground">Role: {user.role.replace(/_/g, ' ')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-5 text-lg font-semibold">Change Password</h2>
          <form onSubmit={handleSubmit} className="max-w-md space-y-5">
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOld ? 'text' : 'password'}
                label="Current Password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-9 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                tabIndex={-1}
                aria-label={showOld ? 'Hide password' : 'Show password'}
              >
                {showOld ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                label="New Password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                tabIndex={-1}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div>
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-1.5 h-4 w-4" /> Change Password</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
