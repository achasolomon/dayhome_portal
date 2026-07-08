'use client';

import { useState } from 'react';
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

export function CreateRoleDrawer({ open, onOpenChange, onCreated }: CreateRoleDrawerProps) {
  const [roleKey, setRoleKey] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!roleKey.trim() || !roleLabel.trim()) return;
    try {
      setCreating(true);
      await rolesApi.createRole(roleKey.trim().toUpperCase(), roleLabel.trim());
      toast({ title: 'Role created', variant: 'success' });
      setRoleKey('');
      setRoleLabel('');
      onOpenChange(false);
      onCreated();
    } catch {
      toast({ title: 'Failed to create role', description: 'Please try again.', variant: 'error' });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="sm" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <div>
            <SheetTitle>Create Custom Role</SheetTitle>
            <SheetDescription>
              Define a new role with a unique key and display label. You can then assign permissions in the matrix.
            </SheetDescription>
          </div>
        </SheetHeader>
        <SheetBody className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Key</label>
            <Input
              placeholder="e.g. CUSTOM_MANAGER"
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value.toUpperCase())}
            />
            <p className="text-xs text-muted-foreground">
              Uppercase letters, numbers, and underscores only
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Label</label>
            <Input
              placeholder="e.g. Custom Manager"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
            />
          </div>
        </SheetBody>
        <SheetFooter>
          <Button
            onClick={handleCreate}
            disabled={!roleKey.trim() || !roleLabel.trim() || creating}
          >
            {creating ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              <><Plus className="mr-1.5 h-4 w-4" /> Create Role</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
