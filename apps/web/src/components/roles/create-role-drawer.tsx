'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@spiced-dayhome/ui-kit';
import { Loader2, Plus } from 'lucide-react';
import { rolesApi } from '@/lib/api/roles';
import { toast } from '@/components/ui/toaster';

interface CreateRoleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const createRoleSchema = z.object({
  roleKey: z.string().min(1).max(50).regex(/^[A-Z][A-Z0-9_]*$/, 'roles.roleKeyHint'),
  roleLabel: z.string().min(1).max(100),
});

type CreateRoleForm = z.infer<typeof createRoleSchema>;

export function CreateRoleDrawer({ open, onOpenChange, onCreated }: CreateRoleDrawerProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
  });

  async function onSubmit(data: CreateRoleForm) {
    try {
      await rolesApi.createRole(data.roleKey.toUpperCase(), data.roleLabel.trim());
      toast({ title: t('roles.roleCreated'), variant: 'success' });
      reset();
      onOpenChange(false);
      onCreated();
    } catch {
      toast({ title: t('roles.failedToCreateRole'), description: t('staff.tryAgain'), variant: 'error' });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="sm" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <div>
            <SheetTitle>{t('roles.createCustomRole')}</SheetTitle>
            <SheetDescription>
              {t('roles.defineNewRole')}
            </SheetDescription>
          </div>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetBody className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('roles.roleKey')}</label>
              <Input
                placeholder={t('roles.roleKeyPlaceholder')}
                error={errors.roleKey && t(errors.roleKey.message as string)}
                {...register('roleKey', { setValueAs: (v: string) => v.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground">{t('roles.roleKeyHint')}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('roles.displayLabel')}</label>
              <Input
                placeholder={t('roles.displayLabelPlaceholder')}
                error={errors.roleLabel && t(errors.roleLabel.message as string)}
                {...register('roleLabel')}
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t('roles.creating')}</>
              ) : (
                <><Plus className="mr-1.5 h-4 w-4" /> {t('roles.createRole')}</>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
