'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@spiced-dayhome/ui-kit';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { toast } from '@/components/ui/toaster';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await authApi.login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response: { data: { message: string } } };
        const message = apiError.response?.data?.message || t('auth.invalidCredentials');
        toast({ title: t('auth.login'), description: message, variant: 'error' });
        if (message.toLowerCase().includes('email')) {
          setError('email', { type: 'manual', message });
        } else if (message.toLowerCase().includes('password')) {
          setError('password', { type: 'manual', message });
        }
      } else {
        toast({ title: t('common.error'), description: t('error.generic'), variant: 'error' });
      }
    }
  };

  return (
    <div className="px-6 py-8 sm:px-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-golden sm:text-3xl justify-center flex">
          {t('auth.signIn')}
        </h1>
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

        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label={t('auth.password')}
              placeholder={t('auth.password')}
              {...register('password')}
              error={errors.password?.message}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground/50 transition-colors hover:text-muted-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              tabIndex={-1}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-1.5 flex justify-end">
            <Link
              href="/forgot-password"
              className="rounded text-xs font-medium text-golden transition-colors hover:text-golden/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>

        {/* Remember Me checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary/30"
          />
          <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
            {t('auth.rememberMe')}
          </label>
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-primary text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus:ring-2 focus:ring-golden/50 focus:ring-offset-2 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('auth.signingIn')}
            </span>
          ) : (
            t('auth.signIn')
          )}
        </Button>
      </form>

      <div className="mt-8 border-t pt-6 text-center text-sm">
        <p className="text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link
            href="/register"
            className="rounded font-medium text-golden transition-colors hover:text-golden/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          >
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
