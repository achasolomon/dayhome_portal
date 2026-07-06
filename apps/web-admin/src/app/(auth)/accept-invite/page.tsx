'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@spiced-dayhome/ui-kit';
import { staffApi } from '@/lib/api/staff';
import { authApi } from '@/lib/api/auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setError('No invitation token provided. Please check the link you received.');
      return;
    }
    staffApi.checkInvitation(token).then((result) => {
      if (result.valid) {
        setValid(true);
        setInviteEmail(result.email ?? '');
        setInviteRole(result.role ?? '');
        setFirstName(result.firstName ?? '');
        setLastName(result.lastName ?? '');
        setPhone(result.phone ?? '');
      } else {
        setError(result.message ?? 'Invitation is invalid or has expired.');
      }
    }).catch(() => {
      setError('Unable to validate invitation. Please try again.');
    }).finally(() => {
      setValidating(false);
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await staffApi.acceptInvite({
        token: token!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      setSuccess(true);
      await authApi.login(inviteEmail, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || 'Failed to accept invitation'
          : 'Failed to accept invitation';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Validating your invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold">Account Created!</h2>
        <p className="text-sm text-muted-foreground">Welcome to Spiced Dayhome. Redirecting to dashboard...</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <XCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Invalid Invitation</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Complete Registration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ve been invited as <span className="font-medium text-foreground">{inviteRole.replace(/_/g, ' ')}</span>
          {inviteEmail && <> &mdash; {inviteEmail}</>}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="firstName"
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />
          <Input
            id="lastName"
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>

        <Input
          id="phone"
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1-555-0123"
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
}
