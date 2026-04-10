import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import type { User, Role, LoginCredentials, SignupCredentials, Permissions, AppSettings, SpaceAssignment, RolePermissionOverrides } from '@/types';
import { getPermissionsForRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permissions;
  appSettings: AppSettings | null;
  rolePermissionOverrides: RolePermissionOverrides;
  spaceAssignments: SpaceAssignment[];
  login: (credentials: LoginCredentials) => Promise<User | null>;
  signup: (credentials: SignupCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<User | null>;
  suspendUser: (userId: string) => Promise<User | null>;
  activateUser: (userId: string) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
  fetchAppSettings: () => Promise<AppSettings>;
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  fetchRolePermissionOverrides: () => Promise<RolePermissionOverrides>;
  updateRolePermissionOverrides: (overrides: RolePermissionOverrides) => Promise<RolePermissionOverrides>;
  refreshPermissions: () => void;
  fetchSpaceAssignments: () => Promise<SpaceAssignment[]>;
  assignUserToSpace: (userId: string, spaceId: string, role?: 'editor' | 'viewer') => Promise<SpaceAssignment>;
  removeUserFromSpace: (userId: string, spaceId: string) => Promise<boolean>;
}

const defaultPermissions: Permissions = {
  canCreateNote: false,
  canEditNote: false,
  canDeleteOwnNote: false,
  canDeleteAnyNote: false,
  canPinNotes: false,
  canManageUsers: false,
  canManageSpaces: false,
  canCreateSpaces: false,
  canEditSpaces: false,
  canDeleteSpaces: false,
  canManageTags: false,
  canManageAppSettings: false,
  canViewAdminPanel: false,
  canAssignRoles: false,
  canViewOverview: false,
  canToggleNoteVisibility: false,
  canAccessSpace: () => true,
  accessibleSpaceIds: [],
};

const defaultRoleOverrides: RolePermissionOverrides = {
  admin: {},
  editor: {},
  viewer: {},
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  permissions: defaultPermissions,
  appSettings: null,
  rolePermissionOverrides: defaultRoleOverrides,
  spaceAssignments: [],

  refreshPermissions: () => {
    const user = get().user;
    const spaceAssignments = get().spaceAssignments;
    const overrides = get().rolePermissionOverrides;
    if (user) {
      set({
        permissions: getPermissionsForRole(user.role, spaceAssignments, overrides),
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(credentials);
      if (user) {
        const [spaceAssignments, appSettings] = await Promise.all([
          authService.getUserSpaceAssignments(user.id),
          authService.getAppSettings(),
        ]);
        const overrides = appSettings.rolePermissionOverrides;
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          permissions: getPermissionsForRole(user.role, spaceAssignments, overrides),
          spaceAssignments,
          appSettings,
          rolePermissionOverrides: overrides,
        });
        return user;
      }
      set({ isLoading: false });
      return null;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  signup: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await authService.signup(credentials);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        permissions: getPermissionsForRole(user.role, []),
        spaceAssignments: [],
      });
      return user;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: defaultPermissions,
        spaceAssignments: [],
      });
    } catch {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const [spaceAssignments, appSettings] = await Promise.all([
          authService.getUserSpaceAssignments(user.id),
          authService.getAppSettings(),
        ]);
        const overrides = appSettings.rolePermissionOverrides;
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          permissions: getPermissionsForRole(user.role, spaceAssignments, overrides),
          spaceAssignments,
          appSettings,
          rolePermissionOverrides: overrides,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const user = await authService.updateUserRole(userId, role);
      if (user && get().user?.id === userId) {
        const spaceAssignments = get().spaceAssignments;
        const overrides = get().rolePermissionOverrides;
        set({
          user,
          permissions: getPermissionsForRole(role, spaceAssignments, overrides),
        });
      }
      return user;
    } catch {
      return null;
    }
  },

  suspendUser: async (userId) => {
    try { return await authService.suspendUser(userId); } catch { return null; }
  },

  activateUser: async (userId) => {
    try { return await authService.activateUser(userId); } catch { return null; }
  },

  deleteUser: async (userId) => {
    try { return await authService.deleteUser(userId); } catch { return false; }
  },

  getAllUsers: async () => {
    try { return await authService.getAllUsers(); } catch { return []; }
  },

  fetchAppSettings: async () => {
    try {
      const settings = await authService.getAppSettings();
      set({ appSettings: settings, rolePermissionOverrides: settings.rolePermissionOverrides });
      return settings;
    } catch {
      return get().appSettings ?? { publicSignupEnabled: true, defaultUserRole: 'viewer', maxNotesPerUser: 1000, rolePermissionOverrides: { admin: {}, editor: {}, viewer: {} } };
    }
  },

  updateAppSettings: async (settings) => {
    try {
      const updated = await authService.updateAppSettings(settings);
      set({ appSettings: updated, rolePermissionOverrides: updated.rolePermissionOverrides });
      // Refresh permissions since overrides may have changed
      get().refreshPermissions();
      return updated;
    } catch {
      return get().appSettings ?? { publicSignupEnabled: true, defaultUserRole: 'viewer', maxNotesPerUser: 1000, rolePermissionOverrides: { admin: {}, editor: {}, viewer: {} } };
    }
  },

  fetchRolePermissionOverrides: async () => {
    try {
      const overrides = await authService.getRolePermissionOverrides();
      set({ rolePermissionOverrides: overrides });
      return overrides;
    } catch {
      return get().rolePermissionOverrides;
    }
  },

  updateRolePermissionOverrides: async (overrides) => {
    try {
      const updated = await authService.updateRolePermissionOverrides(overrides);
      set({ rolePermissionOverrides: updated });
      // Refresh permissions for all users with new overrides
      get().refreshPermissions();
      return updated;
    } catch {
      return get().rolePermissionOverrides;
    }
  },

  fetchSpaceAssignments: async () => {
    try {
      const assignments = await authService.getSpaceAssignments();
      set({ spaceAssignments: assignments });
      const user = get().user;
      if (user) {
        const userAssignments = assignments.filter(sa => sa.userId === user.id);
        const overrides = get().rolePermissionOverrides;
        set({ permissions: getPermissionsForRole(user.role, userAssignments, overrides) });
      }
      return assignments;
    } catch {
      return get().spaceAssignments;
    }
  },

  assignUserToSpace: async (userId, spaceId, role = 'editor') => {
    try {
      const assignment = await authService.assignUserToSpace(userId, spaceId, role);
      await get().fetchSpaceAssignments();
      return assignment;
    } catch {
      return { userId, spaceId, role: 'editor' as const, assignedAt: new Date() };
    }
  },

  removeUserFromSpace: async (userId, spaceId) => {
    try {
      const success = await authService.removeUserFromSpace(userId, spaceId);
      if (success) await get().fetchSpaceAssignments();
      return success;
    } catch {
      return false;
    }
  },
}));
