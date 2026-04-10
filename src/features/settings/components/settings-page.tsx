'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  Lock,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  FolderOpen,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useNotesStore } from '@/store/notes-store';
import { spacesService } from '@/services/spaces.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/features/notes/components/confirm-dialog';
import { toast } from 'sonner';
import type { Role, PermissionKey, RolePermissionOverrides, Space } from '@/types';
import { permissionLabels, permissionCategories, getPermissionsForRole } from '@/types';

// ── Color palette for spaces ──────────────────────────────────
const SPACE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const roles: ('editor' | 'viewer')[] = ['editor', 'viewer'];

// ── Animations ────────────────────────────────────────────────
const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function SettingsPage() {
  const {
    appSettings,
    fetchAppSettings,
    updateAppSettings,
    updateRolePermissionOverrides,
    rolePermissionOverrides,
  } = useAuthStore();
  const { spaces, fetchSpaces, createSpace, deleteSpace, updateSpace, toggleVisibility } = useSpacesStore();
  const { notes } = useNotesStore();

  // ── App Settings state ──
  const [settingsDraft, setSettingsDraft] = useState({
    publicSignupEnabled: true,
    defaultUserRole: 'viewer' as Role,
    maxNotesPerUser: 1000,
  });
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  // ── Permission overrides state (local draft) ──
  const [permissionDraft, setPermissionDraft] = useState<RolePermissionOverrides>({
    admin: {},
    editor: {},
    viewer: {},
  });
  const [isPermissionsSaving, setIsPermissionsSaving] = useState(false);

  // ── Space Management state ──
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState('#6366f1');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [newSpaceVisibility, setNewSpaceVisibility] = useState<'public' | 'private'>('private');
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [editSpaceName, setEditSpaceName] = useState('');
  const [editSpaceColor, setEditSpaceColor] = useState('#6366f1');
  const [editSpaceDescription, setEditSpaceDescription] = useState('');
  const [editSpaceVisibility, setEditSpaceVisibility] = useState<'public' | 'private'>('private');
  const [deleteSpaceTarget, setDeleteSpaceTarget] = useState<Space | null>(null);
  const [isSpacesLoading, setIsSpacesLoading] = useState(false);

  // ── Data loading ──
  const loadAll = useCallback(async () => {
    setIsSettingsLoading(true);
    setIsSpacesLoading(true);
    const [settings] = await Promise.all([
      fetchAppSettings(),
      fetchSpaces(),
    ]);
    setSettingsDraft({
      publicSignupEnabled: settings.publicSignupEnabled,
      defaultUserRole: settings.defaultUserRole,
      maxNotesPerUser: settings.maxNotesPerUser,
    });
    setPermissionDraft(JSON.parse(JSON.stringify(settings.rolePermissionOverrides)));
    setIsSettingsLoading(false);
    setIsSpacesLoading(false);
  }, [fetchAppSettings, fetchSpaces]);

  useEffect(() => {
    // Defer loading to a microtask so setState calls don't run
    // synchronously inside the effect body (React compiler rule).
    queueMicrotask(() => {
      loadAll();
    });
  }, [loadAll]);

  // ── App Settings handlers ──
  const handleSaveSettings = async () => {
    setIsSettingsSaving(true);
    const updated = await updateAppSettings(settingsDraft);
    if (updated) {
      toast.success('App settings updated');
    } else {
      toast.error('Failed to update settings');
    }
    setIsSettingsSaving(false);
  };

  // ── Permission Matrix handlers ──
  const handleTogglePermission = async (role: 'editor' | 'viewer', key: PermissionKey, value: boolean) => {
    const updated = {
      ...permissionDraft,
      [role]: {
        ...permissionDraft[role],
        [key]: value,
      },
    };
    setPermissionDraft(updated);
    setIsPermissionsSaving(true);
    await updateRolePermissionOverrides(updated);
    setIsPermissionsSaving(false);
  };

  const handleResetRole = async (role: 'editor' | 'viewer') => {
    const updated = {
      ...permissionDraft,
      [role]: {},
    };
    setPermissionDraft(updated);
    setIsPermissionsSaving(true);
    await updateRolePermissionOverrides(updated);
    toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} permissions reset to defaults`);
    setIsPermissionsSaving(false);
  };

  // Helper: get effective permission value for a role+key
  const getEffectivePermission = (role: 'editor' | 'viewer', key: PermissionKey): boolean => {
    const base = getPermissionsForRole(role, [], undefined);
    const override = permissionDraft[role]?.[key];
    return override !== undefined ? override : (base as any)[key] ?? false;
  };

  // ── Space Management handlers ──
  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    const space = await createSpace({
      name: newSpaceName.trim(),
      icon: 'Folder',
      color: newSpaceColor,
      description: newSpaceDescription.trim(),
      visibility: newSpaceVisibility,
    });
    if (space) {
      toast.success(`Space "${space.name}" created`);
      setCreateSpaceOpen(false);
      setNewSpaceName('');
      setNewSpaceDescription('');
      setNewSpaceVisibility('private');
    }
  };

  const handleOpenEditSpace = (space: Space) => {
    setEditingSpace(space);
    setEditSpaceName(space.name);
    setEditSpaceColor(space.color);
    setEditSpaceDescription(space.description);
    setEditSpaceVisibility(space.visibility);
  };

  const handleSaveEditSpace = async () => {
    if (!editingSpace || !editSpaceName.trim()) return;
    const updated = await updateSpace(editingSpace.id, {
      name: editSpaceName.trim(),
      color: editSpaceColor,
      description: editSpaceDescription.trim(),
      visibility: editSpaceVisibility,
    });
    if (updated) {
      toast.success(`Space "${updated.name}" updated`);
      setEditingSpace(null);
    } else {
      toast.error('Failed to update space');
    }
  };

  const handleDeleteSpace = async () => {
    if (!deleteSpaceTarget) return;
    const success = await deleteSpace(deleteSpaceTarget.id);
    if (success) {
      toast.success(`Space "${deleteSpaceTarget.name}" deleted`);
      setDeleteSpaceTarget(null);
    } else {
      toast.error('Failed to delete space');
    }
  };

  const getNoteCountForSpace = (spaceId: string) =>
    notes.filter(n => n.spaceId === spaceId).length;

  // ── Render ──
  if (isSettingsLoading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 space-y-4">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="h-3 w-64 bg-muted/60 rounded animate-pulse" />
            <div className="space-y-3 mt-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-10 bg-muted/40 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure application settings, permissions, and spaces
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {/* ── SECTION 1: App Settings ──────────────────────── */}
        <motion.div key="app-settings" {...fadeIn} transition={{ duration: 0.2, delay: 0.05 }}>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">App Settings</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Configure global application behavior
            </p>

            <div className="space-y-5">
              {/* Public Signup Toggle */}
              <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {settingsDraft.publicSignupEnabled ? (
                      <Globe className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-500" />
                    )}
                    <Label className="text-sm font-medium">Public Signup</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Allow new users to create accounts without an invitation
                  </p>
                </div>
                <Switch
                  checked={settingsDraft.publicSignupEnabled}
                  onCheckedChange={(checked) =>
                    setSettingsDraft(prev => ({ ...prev, publicSignupEnabled: checked }))
                  }
                />
              </div>

              {/* Default User Role */}
              <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Default User Role</Label>
                  <p className="text-xs text-muted-foreground">
                    Role assigned to newly registered users
                  </p>
                </div>
                <Select
                  value={settingsDraft.defaultUserRole}
                  onValueChange={(v) =>
                    setSettingsDraft(prev => ({ ...prev, defaultUserRole: v as Role }))
                  }
                >
                  <SelectTrigger className="w-32 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Notes Per User */}
              <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Max Notes Per User</Label>
                  <p className="text-xs text-muted-foreground">
                    Maximum number of notes each user can create
                  </p>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={100000}
                  value={settingsDraft.maxNotesPerUser}
                  onChange={(e) =>
                    setSettingsDraft(prev => ({
                      ...prev,
                      maxNotesPerUser: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-28 h-9 text-sm text-right"
                />
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSettingsSaving}
                  className="min-w-32"
                >
                  {isSettingsSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 2: Role Permissions Matrix ──────────── */}
        <motion.div key="role-permissions" {...fadeIn} transition={{ duration: 0.2, delay: 0.1 }}>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Role Permissions</h2>
              {isPermissionsSaving && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Customize what each role can do. Admin always has full access.
            </p>

            {/* Matrix table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground w-48">
                      Permission
                    </th>
                    {roles.map(role => (
                      <th key={role} className="text-center py-3 px-4 min-w-[100px]">
                        <div className="flex items-center justify-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              role === 'editor'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionCategories.map((category, ci) => (
                    <Fragment key={ci}>
                      {ci > 0 && (
                        <tr key={`sep-${ci}`}>
                          <td colSpan={3} className="py-2">
                            <Separator />
                          </td>
                        </tr>
                      )}
                      <tr key={`cat-${ci}`}>
                        <td
                          colSpan={3}
                          className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {category.label}
                        </td>
                      </tr>
                      {category.keys.map((key) => (
                        <tr key={key} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 pr-4">
                            <span className="text-sm">{permissionLabels[key]}</span>
                          </td>
                          {roles.map(role => {
                            const value = getEffectivePermission(role, key);
                            return (
                              <td key={role} className="text-center py-2.5 px-4">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={value}
                                    onCheckedChange={(checked) =>
                                      handleTogglePermission(role, key, checked)
                                    }
                                    disabled={isPermissionsSaving}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reset buttons */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t">
              <span className="text-xs text-muted-foreground">Reset overrides:</span>
              {roles.map(role => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleResetRole(role)}
                  disabled={
                    isPermissionsSaving ||
                    Object.keys(permissionDraft[role] ?? {}).length === 0
                  }
                >
                  <RotateCcw className="w-3 h-3" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 3: Space Management ────────────────── */}
        <motion.div key="space-management" {...fadeIn} transition={{ duration: 0.2, delay: 0.15 }}>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Space Management</h2>
                <Badge variant="secondary" className="text-xs">
                  {spaces.length}
                </Badge>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => {
                  setNewSpaceName('');
                  setNewSpaceDescription('');
                  setNewSpaceColor('#6366f1');
                  setNewSpaceVisibility('private');
                  setCreateSpaceOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Space
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Create and manage workspaces for organizing notes
            </p>

            {isSpacesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No spaces created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {spaces.map((space) => {
                    const noteCount = getNoteCountForSpace(space.id);
                    return (
                      <motion.div
                        key={space.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors group"
                      >
                        {/* Color dot */}
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: space.color }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{space.name}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-1.5 py-0 shrink-0 gap-1',
                                space.visibility === 'public'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              )}
                            >
                              {space.visibility === 'public' ? (
                                <><Globe className="w-2.5 h-2.5" />Public</>
                              ) : (
                                <><Lock className="w-2.5 h-2.5" />Private</>
                              )}
                            </Badge>
                            {space.description && (
                              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                                &mdash; {space.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Note count badge */}
                        <Badge variant="outline" className="text-xs shrink-0">
                          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                        </Badge>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-7 w-7',
                              space.visibility === 'public'
                                ? 'text-emerald-500 hover:text-emerald-600'
                                : 'text-muted-foreground hover:text-amber-500'
                            )}
                            onClick={() => {
                              toggleVisibility(space.id);
                              toast.success(
                                space.visibility === 'public'
                                  ? `"${space.name}" is now private`
                                  : `"${space.name}" is now public`
                              );
                            }}
                          >
                            {space.visibility === 'public' ? (
                              <Globe className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenEditSpace(space)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteSpaceTarget(space)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Create Space Dialog ──────────────────────────── */}
      <Dialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
            <DialogDescription>Add a new workspace for organizing your notes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Name</Label>
              <Input
                placeholder="e.g., Research, Side Project"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSpace()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Input
                placeholder="Optional description..."
                value={newSpaceDescription}
                onChange={(e) => setNewSpaceDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Color</Label>
              <div className="flex gap-2">
                {SPACE_COLORS.map(c => (
                  <button
                    key={c}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-colors',
                      newSpaceColor === c ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewSpaceColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2">
                {newSpaceVisibility === 'public' ? (
                  <Globe className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <Label className="text-sm font-medium">Public Space</Label>
                  <p className="text-[11px] text-muted-foreground">
                    {newSpaceVisibility === 'public'
                      ? 'Visible to all workspace members'
                      : 'Only visible to you'}
                  </p>
                </div>
              </div>
              <Switch
                checked={newSpaceVisibility === 'public'}
                onCheckedChange={(checked) =>
                  setNewSpaceVisibility(checked ? 'public' : 'private')
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSpaceOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSpace} disabled={!newSpaceName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Space Dialog ────────────────────────────── */}
      <Dialog open={!!editingSpace} onOpenChange={(open) => !open && setEditingSpace(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
            <DialogDescription>Update space details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Name</Label>
              <Input
                value={editSpaceName}
                onChange={(e) => setEditSpaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEditSpace()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Input
                value={editSpaceDescription}
                onChange={(e) => setEditSpaceDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Color</Label>
              <div className="flex gap-2">
                {SPACE_COLORS.map(c => (
                  <button
                    key={c}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-colors',
                      editSpaceColor === c ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setEditSpaceColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2">
                {editSpaceVisibility === 'public' ? (
                  <Globe className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <Label className="text-sm font-medium">Public Space</Label>
                  <p className="text-[11px] text-muted-foreground">
                    {editSpaceVisibility === 'public'
                      ? 'Visible to all workspace members'
                      : 'Only visible to you'}
                  </p>
                </div>
              </div>
              <Switch
                checked={editSpaceVisibility === 'public'}
                onCheckedChange={(checked) =>
                  setEditSpaceVisibility(checked ? 'public' : 'private')
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSpace(null)}>Cancel</Button>
            <Button onClick={handleSaveEditSpace} disabled={!editSpaceName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Space Confirmation ─────────────────────── */}
      <ConfirmDialog
        open={!!deleteSpaceTarget}
        onOpenChange={(open) => !open && setDeleteSpaceTarget(null)}
        title="Delete Space"
        description={`Are you sure you want to delete "${deleteSpaceTarget?.name ?? ''}"? Notes in this space will become unorganized.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteSpace}
      />
    </div>
  );
}
