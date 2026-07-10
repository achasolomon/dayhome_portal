'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@spiced-dayhome/ui-kit';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { toast } from '@/components/ui/toaster';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast({ title: t('common.error'), description: t('error.generic'), variant: 'error' });
    }
  };

  if (sent) {
    return (
      <div className="px-6 py-8 text-center sm:px-8 sm:py-10">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">{t('auth.checkEmail')}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('auth.checkEmailDescription')}
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
          {t('auth.forgotPassword')}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t('auth.enterEmailForReset')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Input
            id="email"
            type="email"
            label={t('auth.email')}
            placeholder="admin@spiced.ca"
            {...register('email')}
            error={errors.email?.message}
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
              {t('auth.sending')}
            </span>
          ) : (
            t('auth.sendResetLink')
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
