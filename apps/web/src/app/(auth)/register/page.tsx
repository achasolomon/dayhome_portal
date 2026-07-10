'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button, Input } from '@spiced-dayhome/ui-kit';
import { authApi } from '@/lib/api/auth';

const registerSchema = z
  .object({
    email: z.string().email('validation.email'),
    password: z.string().min(8, { message: 'validation.password' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.confirmPassword',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await authApi.register({ email: data.email, password: data.password });
      router.push('/login');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || t('error.generic')
          : t('error.generic');
      setError('root', { message });
    }
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-primary">{t('auth.createAccount')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          type="email"
          label={t('auth.email')}
          placeholder="user@spiced.ca"
          error={errors.email && t(errors.email.message as string)}
          {...register('email')}
        />
        <Input
          id="password"
          type="password"
          label={t('auth.password')}
          placeholder="••••••••"
          error={errors.password && t(errors.password.message as string)}
          {...register('password')}
        />
        <Input
          id="confirmPassword"
          type="password"
          label={t('auth.confirmPassword')}
          placeholder="••••••••"
          error={errors.confirmPassword && t(errors.confirmPassword.message as string)}
          {...register('confirmPassword')}
        />
        {errors.root && <p className="text-sm text-error">{errors.root.message}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t('auth.creatingAccount') : t('auth.createAccount')}
        </Button>
      </form>
    </div>
  );
}
