'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@spiced-dayhome/ui-kit';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { toast } from '@/components/ui/toaster';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast({ title: t('auth.invalidLink'), description: t('auth.missingToken'), variant: 'error' });
      return;
    }
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
    } catch {
      toast({ title: t('common.error'), description: t('auth.invalidOrExpired'), variant: 'error' });
    }
  };

  if (!token) {
    return (
      <div className="px-6 py-8 text-center sm:px-8 sm:py-10">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">{t('auth.invalidLink')}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('auth.missingToken')}
        </p>
        <Link
          href="/forgot-password"
          className="rounded text-sm font-medium text-golden transition-colors hover:text-golden/80"
        >
          {t('auth.requestNewReset')}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="px-6 py-8 text-center sm:px-8 sm:py-10">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">{t('auth.resetSuccess')}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('auth.passwordUpdated')}
        </p>
        <Link
          href="/login"
          className="rounded text-sm font-medium text-golden transition-colors hover:text-golden/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          {t('auth.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-center">
          {t('auth.setNewPassword')}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t('auth.enterNewPassword')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label={t('auth.newPassword')}
              placeholder={t('auth.min6Chars')}
              {...register('password')}
              error={errors.password?.message}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              tabIndex={-1}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <Input
            id="confirmPassword"
            type="password"
            label={t('auth.confirmPassword')}
            placeholder={t('auth.reEnterPassword')}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-primary text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('auth.resetting')}
            </span>
          ) : (
            t('auth.resetPassword')
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="rounded font-medium text-golden transition-colors hover:text-golden/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <ResetForm />
    </Suspense>
  );
}
