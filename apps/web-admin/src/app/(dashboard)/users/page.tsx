'use client';

import { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@spiced-dayhome/ui-kit';
import {
  Shield,
  Loader2,
  Save,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { rolesApi, RoleWithPermissions, PermissionGroup } from '@/lib/api/roles';
import { toast } from '@/components/ui/toaster';
import { CreateRoleDrawer } from '@/components/roles/create-role-drawer';

const GROUPS_PER_PAGE = 4;

export default function UsersRolesPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Map<string, Set<string>>>(new Map());
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setDirty(new Map());
      setPage(0);
      const data = await rolesApi.getPermissions();
      setRoles(data.roles);
      setGroups(data.permissionGroups);
    } catch {
      toast({ title: t('roles.failedToLoad'), description: t('staff.tryAgain'), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void load(); }, [load]);

  const systemRoles = useMemo(() => new Set(['ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY']), []);

  const totalPages = Math.ceil(groups.length / GROUPS_PER_PAGE);
  const currentGroups = groups.slice(page * GROUPS_PER_PAGE, (page + 1) * GROUPS_PER_PAGE);

  const hasPermission = (role: string, perm: string) => {
    const overrides = dirty.get(role);
    if (overrides) return overrides.has(perm);
    return roles.find((r) => r.role === role)?.permissions.includes(perm) ?? false;
  };

  function togglePermission(role: string, perm: string) {
    setDirty((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(role) ?? roles.find((r) => r.role === role)?.permissions ?? []);
      if (set.has(perm)) set.delete(perm);
      else set.add(perm);
      next.set(role, set);
      return next;
    });
  }

  const isDirty = useCallback((role: string) => {
    const overrides = dirty.get(role);
    if (!overrides) return false;
    const original = roles.find((r) => r.role === role)?.permissions ?? [];
    if (original.length !== overrides.size) return true;
    return original.some((p) => !overrides.has(p));
  }, [dirty, roles]);

  const anyDirty = roles.some((r) => isDirty(r.role));

  async function saveRole(role: string) {
    const overrides = dirty.get(role);
    if (!overrides) return;
    try {
      setSaving(role);
      const perms = Array.from(overrides);
      await rolesApi.updateRolePermissions(role, perms);
      setDirty((prev) => {
        const next = new Map(prev);
        next.delete(role);
        return next;
      });
      setRoles((prev) =>
        prev.map((r) => (r.role === role ? { ...r, permissions: perms } : r)),
      );
      toast({ title: t('roles.permissionsUpdated'), description: t('roles.changesSaved', { role }), variant: 'success' });
    } catch {
      toast({ title: t('roles.failedToSave'), description: t('staff.tryAgain'), variant: 'error' });
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteRole(role: string) {
    try {
      setDeleting(role);
      setDeleteConfirm(null);
      await rolesApi.deleteRole(role);
      toast({ title: t('roles.roleDeleted'), variant: 'success' });
      await load();
    } catch {
      toast({ title: t('roles.failedToDelete'), description: t('staff.tryAgain'), variant: 'error' });
    } finally {
      setDeleting(null);
    }
  }

  const deletingRoleName = deleteConfirm
    ? roles.find((r) => r.role === deleteConfirm)?.label ?? deleteConfirm
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('roles.pageTitle')}</h1>
          <p className="mt-1 text-muted-foreground">{t('roles.pageDescription')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> {t('roles.createRole')}
        </Button>
      </div>

      {/* Role summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.role} className="relative">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold truncate">{role.label}</p>
                  {systemRoles.has(role.role) && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t('roles.system')}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{role.permissions.length} {t('roles.permissions')}</p>
              </div>
              {!systemRoles.has(role.role) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(role.role)}
                      disabled={deleting === role.role}
                    >
                      {deleting === role.role ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      {t('roles.deleteRole')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RBAC Matrix */}
      <Card>
        {/* Save bar at top */}
        {anyDirty && (
          <div className="flex items-center justify-between rounded-t-lg border-b bg-muted/30 px-5 py-3">
            <p className="text-sm text-muted-foreground">{t('roles.unsavedChanges')}</p>
            <div className="flex gap-2">
              {roles.map(
                (role) =>
                  isDirty(role.role) && (
                    <Button
                      key={role.role}
                      onClick={() => saveRole(role.role)}
                      disabled={saving === role.role}
                      size="sm"
                    >
                      {saving === role.role ? (
                        <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> {t('roles.saving')}</>
                      ) : (
                        <><Save className="mr-1.5 h-3.5 w-3.5" /> {t('roles.saveLabel', { role: role.label })}</>
                      )}
                    </Button>
                  ),
              )}
            </div>
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-11 px-4 text-left align-middle font-medium text-muted-foreground w-56">
                    {t('roles.permission')}
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.role}
                      className="h-11 px-4 text-center align-middle font-medium text-muted-foreground min-w-32"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{role.label}</span>
                        {isDirty(role.role) && (
                          <span className="text-[10px] font-semibold text-amber">{t('roles.unsaved')}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="h-11 px-4 text-center align-middle font-medium text-muted-foreground w-20" />
                </tr>
              </thead>
              <tbody>
                {currentGroups.map((group) => (
                  <Fragment key={group.group}>
                    <tr className="border-b bg-muted/20">
                      <td
                        colSpan={roles.length + 2}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {group.groupLabel}
                      </td>
                    </tr>
                    {group.permissions.map((perm) => (
                      <tr
                        key={perm.key}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 align-middle">
                          <div>
                            <p className="text-sm font-medium">{perm.label}</p>
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          </div>
                        </td>
                        {roles.map((role) => {
                          const checked = hasPermission(role.role, perm.key);
                          const original = role.permissions.includes(perm.key);
                          const changed = checked !== original;
                          return (
                            <td
                              key={`${role.role}-${perm.key}`}
                              className="px-4 py-3 text-center align-middle"
                            >
                              <button
                                onClick={() => togglePermission(role.role, perm.key)}
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all ${
                                  checked
                                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                                    : 'border-input text-muted-foreground hover:bg-muted'
                                } ${changed ? 'ring-2 ring-amber/50' : ''}`}
                              >
                                {checked ? <Check className="h-4 w-4" /> : <X className="h-3.5 w-3.5" />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center align-middle">
                          <span className="text-[10px] text-muted-foreground">{perm.key}</span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-5 py-3">
              <p className="text-xs text-muted-foreground">
                {t('roles.showingGroups', { count: currentGroups.length, total: groups.length })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={i === page ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null); }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{t('roles.deleteConfirmTitle')}</ModalTitle>
            <ModalDescription>
              {t('roles.deleteConfirmDescription', { role: deletingRoleName })}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </ModalClose>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteRole(deleteConfirm)}
              disabled={deleting === deleteConfirm}
            >
              {deleting === deleteConfirm ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t('common.deleting')}</>
              ) : (
                <><Trash2 className="mr-1.5 h-4 w-4" /> {t('common.delete')}</>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Role Drawer */}
      <CreateRoleDrawer
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={load}
      />
    </div>
  );
}
