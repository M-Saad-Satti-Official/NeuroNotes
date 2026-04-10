'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  MoreHorizontal,
  UserCog,
  Ban,
  CheckCircle2,
  Trash2,
  RefreshCw,
  X,
  FolderOpen,
  UserPlus,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConfirmDialog } from '@/features/notes/components/confirm-dialog';
import { SpaceIcon } from '@/components/shared/space-icon';
import { toast } from 'sonner';
import type { User, Role } from '@/types';

// ── Helpers ────────────────────────────────────────────────────

const roleColors: Record<Role, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  editor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  viewer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const fadeVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

function UserTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SpaceAccessSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function AdminPage() {
  const { closeAdminPanel } = useUIStore();
  const {
    user: currentUser,
    getAllUsers,
    updateUserRole,
    suspendUser,
    activateUser,
    deleteUser,
    spaceAssignments,
    assignUserToSpace,
    removeUserFromSpace,
    fetchSpaceAssignments,
  } = useAuthStore();
  const { spaces, fetchSpaces, deleteSpace } = useSpacesStore();

  const [activeTab, setActiveTab] = useState('users');

  // Users tab
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Space Access tab
  const [isSpacesLoading, setIsSpacesLoading] = useState(false);
  const [allUsersList, setAllUsersList] = useState<User[]>([]);
  const [assignDialogSpaceId, setAssignDialogSpaceId] = useState<string | null>(null);
  const [assignDialogUserId, setAssignDialogUserId] = useState<string>('');
  const [assignDialogRole, setAssignDialogRole] = useState<'editor' | 'viewer'>('editor');
  const [removeTarget, setRemoveTarget] = useState<{ userId: string; spaceId: string; userName: string } | null>(null);
  const [spaceSearchQuery, setSpaceSearchQuery] = useState('');
  const [deleteSpaceTarget, setDeleteSpaceTarget] = useState<{ id: string; name: string } | null>(null);

  const loadedRef = useRef<string | null>(null);

  const loadUsers = useCallback(async (showLoading = true) => {
    if (showLoading) setIsUsersLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setAllUsersList(data);
    setIsUsersLoading(false);
  }, [getAllUsers]);

  const loadSpaces = useCallback(async (showLoading = true) => {
    if (showLoading) setIsSpacesLoading(true);
    await Promise.all([fetchSpaceAssignments(), fetchSpaces()]);
    setIsSpacesLoading(false);
  }, [fetchSpaceAssignments, fetchSpaces]);

  useEffect(() => {
    const id = crypto.randomUUID();
    loadedRef.current = id;
    queueMicrotask(() => {
      if (loadedRef.current !== id) return;
      loadUsers(true);
      loadSpaces(true);
    });
    return () => {
      if (loadedRef.current === id) loadedRef.current = null;
    };
  }, [loadUsers, loadSpaces]);

  // Users tab
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    editor: users.filter((u) => u.role === 'editor').length,
    viewer: users.filter((u) => u.role === 'viewer').length,
  };

  const handleRoleChange = async () => {
    if (!roleDialogUser || !newRole) return;
    const updated = await updateUserRole(roleDialogUser.id, newRole as Role);
    if (updated) {
      toast.success(`${roleDialogUser.name} is now ${newRole}`);
      loadUsers();
      setRoleDialogUser(null);
      setNewRole('');
    }
  };

  const handleSuspend = async (userId: string) => {
    const updated = await suspendUser(userId);
    if (updated) {
      toast.success(`${updated.name} has been suspended`);
      loadUsers();
    }
  };

  const handleActivate = async (userId: string) => {
    const updated = await activateUser(userId);
    if (updated) {
      toast.success(`${updated.name} has been activated`);
      loadUsers();
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const success = await deleteUser(deleteTargetId);
    if (success) {
      toast.success('User deleted');
      loadUsers();
      setDeleteTargetId(null);
    }
  };

  // Space Access tab
  const getAssignmentsForSpace = (spaceId: string) =>
    spaceAssignments.filter((a) => a.spaceId === spaceId);

  const getUsersForSpace = (spaceId: string) => {
    const assignments = getAssignmentsForSpace(spaceId);
    return assignments
      .map((a) => {
        const u = allUsersList.find((u) => u.id === a.userId);
        return u ? { ...u, spaceRole: a.role } : null;
      })
      .filter(Boolean) as (User & { spaceRole: 'editor' | 'viewer' })[];
  };

  const handleAssignUser = async () => {
    if (!assignDialogSpaceId || !assignDialogUserId) return;
    const space = spaces.find((s) => s.id === assignDialogSpaceId);
    try {
      await assignUserToSpace(assignDialogUserId, assignDialogSpaceId, assignDialogRole);
      toast.success(`User assigned to "${space?.name ?? 'space'}"`);
      setAssignDialogSpaceId(null);
      setAssignDialogUserId('');
      setAssignDialogRole('editor');
    } catch {
      toast.error('Failed to assign user');
    }
  };

  const handleRemoveUserFromSpace = async () => {
    if (!removeTarget) return;
    const space = spaces.find((s) => s.id === removeTarget.spaceId);
    const success = await removeUserFromSpace(removeTarget.userId, removeTarget.spaceId);
    if (success) {
      toast.success(`${removeTarget.userName} removed from "${space?.name ?? 'space'}"`);
    } else {
      toast.error('Failed to remove user');
    }
    setRemoveTarget(null);
  };

  const handleChangeSpaceRole = async (userId: string, spaceId: string, newSpaceRole: 'editor' | 'viewer') => {
    const space = spaces.find((s) => s.id === spaceId);
    const user = allUsersList.find((u) => u.id === userId);
    await assignUserToSpace(userId, spaceId, newSpaceRole);
    toast.success(`${user?.name ?? 'User'} is now ${newSpaceRole} in "${space?.name ?? 'space'}"`);
  };

  const getAvailableUsersForSpace = (spaceId: string) => {
    const assignedIds = new Set(getAssignmentsForSpace(spaceId).map((a) => a.userId));
    return allUsersList.filter((u) => u.status === 'active' && !assignedIds.has(u.id));
  };

  const filteredSpaces = spaces.filter(
    (s) =>
      !spaceSearchQuery ||
      s.name.toLowerCase().includes(spaceSearchQuery.toLowerCase()),
  );

  const handleDeleteSpace = async () => {
    if (!deleteSpaceTarget) return;
    const success = await deleteSpace(deleteSpaceTarget.id);
    if (success) {
      toast.success(`Space "${deleteSpaceTarget.name}" deleted`);
      setDeleteSpaceTarget(null);
      loadSpaces(false);
    } else {
      toast.error('Failed to delete space');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 max-w-6xl mx-auto w-full"
    >
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage users and control space access
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="spaces" className="gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            Space Access
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {/* USERS TAB */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {(['admin', 'editor', 'viewer'] as const).map((role) => (
                    <div key={role} className="flex items-center gap-2 p-3 rounded-xl border bg-card">
                      <Badge variant="outline" className={roleColors[role]}>
                        {role}
                      </Badge>
                      <span className="text-sm font-semibold">{roleCounts[role]}</span>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 h-9 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-36 h-9 text-sm">
                      <SelectValue placeholder="Filter role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles ({roleCounts.all})</SelectItem>
                      <SelectItem value="admin">Admin ({roleCounts.admin})</SelectItem>
                      <SelectItem value="editor">Editor ({roleCounts.editor})</SelectItem>
                      <SelectItem value="viewer">Viewer ({roleCounts.viewer})</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => loadUsers()}
                    disabled={isUsersLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isUsersLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Table */}
                {isUsersLoading ? (
                  <UserTableSkeleton />
                ) : filteredUsers.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user, i) => (
                          <motion.tr
                            key={user.id}
                            custom={i}
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium flex items-center gap-1.5">
                                    {user.name}
                                    {user.id === currentUser?.id && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                                        you
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={roleColors[user.role]}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[user.status]}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleDateString()
                                  : 'Never'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              {user.id !== currentUser?.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <MoreHorizontal className="w-3.5 h-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setRoleDialogUser(user);
                                        setNewRole(user.role);
                                      }}
                                    >
                                      <UserCog className="w-3.5 h-3.5 mr-2" />
                                      Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {user.status === 'active' ? (
                                      <DropdownMenuItem
                                        onClick={() => handleSuspend(user.id)}
                                        className="text-destructive"
                                      >
                                        <Ban className="w-3.5 h-3.5 mr-2" />
                                        Suspend
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                        Activate
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteTargetId(user.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            )}

            {/* SPACE ACCESS TAB */}
            {activeTab === 'spaces' && (
              <motion.div
                key="spaces"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {isSpacesLoading ? (
                  <SpaceAccessSkeleton />
                ) : filteredSpaces.length === 0 ? (
                  <div className="py-12 text-center">
                    <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No spaces found</p>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search spaces..."
                        className="pl-8 h-9 text-sm"
                        value={spaceSearchQuery}
                        onChange={(e) => setSpaceSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence>
                        {filteredSpaces.map((space, si) => {
                          const assignedUsers = getUsersForSpace(space.id);
                          const availableUsers = getAvailableUsersForSpace(space.id);

                          return (
                            <motion.div
                              key={space.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: si * 0.04 }}
                              className="rounded-xl border bg-card overflow-hidden"
                            >
                              {/* Space header */}
                              <div className="flex items-center justify-between p-4 pb-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${space.color}20`, color: space.color }}
                                  >
                                    <SpaceIcon name={space.icon} size={16} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{space.name}</p>
                                    {space.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {space.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {assignedUsers.length} user{assignedUsers.length !== 1 ? 's' : ''}
                                  </Badge>
                                  {availableUsers.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => {
                                        setAssignDialogSpaceId(space.id);
                                        setAssignDialogUserId('');
                                        setAssignDialogRole('editor');
                                      }}
                                    >
                                      <UserPlus className="w-3 h-3" />
                                      Assign
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      setDeleteSpaceTarget({ id: space.id, name: space.name })
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Assigned users list */}
                              <div className="px-4 pb-3">
                                {assignedUsers.length === 0 ? (
                                  <p className="text-xs text-muted-foreground/60 py-2 pl-11">
                                    No users assigned
                                  </p>
                                ) : (
                                  <div className="space-y-1">
                                    {assignedUsers.map((au) => (
                                      <motion.div
                                        key={au.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-between pl-11 pr-1 py-1.5 rounded-md hover:bg-muted/50 transition-colors group"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                            {au.name.charAt(0)}
                                          </div>
                                          <span className="text-xs font-medium truncate">
                                            {au.name}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground truncate">
                                            ({au.email})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Select
                                            value={au.spaceRole}
                                            onValueChange={(v) =>
                                              handleChangeSpaceRole(au.id, space.id, v as 'editor' | 'viewer')
                                            }
                                          >
                                            <SelectTrigger className="h-6 w-20 text-[10px] border-0 bg-transparent focus:ring-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="editor">Editor</SelectItem>
                                              <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                              setRemoveTarget({
                                                userId: au.id,
                                                spaceId: space.id,
                                                userName: au.name,
                                              })
                                            }
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      {/* ── Dialogs ────────────────────────────────────────────── */}

      {/* Role Change Dialog */}
      <Dialog open={!!roleDialogUser} onOpenChange={(open) => !open && setRoleDialogUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Update role for {roleDialogUser?.name}</DialogDescription>
          </DialogHeader>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={!newRole || newRole === roleDialogUser?.role}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />

      {/* Assign User to Space Dialog */}
      <Dialog
        open={!!assignDialogSpaceId}
        onOpenChange={(open) => !open && setAssignDialogSpaceId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign User to Space</DialogTitle>
            <DialogDescription>
              Assign a user to{' '}
              <span className="font-medium text-foreground">
                {spaces.find((s) => s.id === assignDialogSpaceId)?.name ?? 'this space'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">User</Label>
              <Select value={assignDialogUserId} onValueChange={setAssignDialogUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {assignDialogSpaceId &&
                    getAvailableUsersForSpace(assignDialogSpaceId).map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Role</Label>
              <Select value={assignDialogRole} onValueChange={(v) => setAssignDialogRole(v as 'editor' | 'viewer')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogSpaceId(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssignUser} disabled={!assignDialogUserId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove User from Space Confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove User from Space"
        description={`Are you sure you want to remove ${removeTarget?.userName ?? 'this user'} from this space?`}
        confirmLabel="Remove"
        onConfirm={handleRemoveUserFromSpace}
      />

      {/* Delete Space Confirmation */}
      <ConfirmDialog
        open={!!deleteSpaceTarget}
        onOpenChange={(open) => !open && setDeleteSpaceTarget(null)}
        title="Delete Space"
        description={`Are you sure you want to delete "${deleteSpaceTarget?.name ?? ''}"? Notes in this space will become unorganized.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteSpace}
      />
    </motion.div>
  );
}
