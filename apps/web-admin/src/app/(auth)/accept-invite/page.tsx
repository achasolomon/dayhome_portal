'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button, Input } from '@spiced-dayhome/ui-kit';
import { staffApi } from '@/lib/api/staff';
import { authApi } from '@/lib/api/auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const acceptInviteSchema = z
  .object({
    firstName: z.string().min(1, 'auth.firstNameRequired'),
    lastName: z.string().min(1, 'auth.lastNameRequired'),
    phone: z.string().optional(),
    password: z.string().min(8, 'auth.passwordMinLength'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

type AcceptInviteForm = z.infer<typeof acceptInviteSchema>;

export default function AcceptInvitePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteForm>({
    resolver: zodResolver(acceptInviteSchema),
  });

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setError(t('auth.noInvitationToken'));
      return;
    }
    staffApi
      .checkInvitation(token)
      .then((result) => {
        if (result.valid) {
          setValid(true);
          setInviteEmail(result.email ?? '');
          setInviteRole(result.role ?? '');
          if (result.firstName) setValue('firstName', result.firstName);
          if (result.lastName) setValue('lastName', result.lastName);
          if (result.phone) setValue('phone', result.phone);
        } else {
          setError(result.message ?? t('auth.invalidInvitation'));
        }
      })
      .catch(() => {
        setError(t('auth.validationFailed'));
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token, t, setValue]);

  async function onSubmit(data: AcceptInviteForm) {
    try {
      await staffApi.acceptInvite({
        token: token!,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
      });
      setSuccess(true);
      await authApi.login(inviteEmail, data.password);
      router.push('/dashboard');
    } catch {
      setError(t('auth.invitationFailed'));
    }
  }

  if (validating) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('auth.validatingInvitation')}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold">{t('auth.accountCreated')}</h2>
        <p className="text-sm text-muted-foreground">{t('auth.accountCreatedDescription')}</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <XCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">{t('auth.invalidInvitation')}</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">{t('auth.acceptInvite')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.invitedAs', { role: inviteRole.replace(/_/g, ' '), email: inviteEmail })}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="firstName"
            label={t('auth.firstName')}
            placeholder="John"
            error={errors.firstName && t(errors.firstName.message as string)}
            {...register('firstName')}
          />
          <Input
            id="lastName"
            label={t('auth.lastName')}
            placeholder="Doe"
            error={errors.lastName && t(errors.lastName.message as string)}
            {...register('lastName')}
          />
        </div>

        <Input
          id="phone"
          label={t('auth.phoneNumber')}
          type="tel"
          placeholder="+1-555-0123"
          {...register('phone')}
        />

        <Input
          id="password"
          type="password"
          label={t('auth.password')}
          placeholder={t('auth.atLeast8Chars')}
          error={errors.password && t(errors.password.message as string)}
          {...register('password')}
        />

        <Input
          id="confirmPassword"
          type="password"
          label={t('auth.confirmPassword')}
          placeholder={t('auth.repeatPassword')}
          error={errors.confirmPassword && t(errors.confirmPassword.message as string)}
          {...register('confirmPassword')}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.creatingAccount')}</>
          ) : (
            t('auth.createAccount')
          )}
        </Button>
      </form>
    </div>
  );
}
