// ============================================================
// Note Types
// ============================================================

export type NoteType = 'text' | 'image' | 'video' | 'link' | 'document' | 'quick';
export type NoteVisibility = 'public' | 'private';

export interface Note {
  id: string;
  title: string;
  content: string;
  noteType: NoteType;
  manualTags: string[];
  aiTags: string[];
  spaceId: string | null;
  visibility: NoteVisibility;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

export interface Tag {
  id: string;
  name: string;
  usageCount: number;
  createdAt: Date;
}

export interface NoteFile {
  id: string;
  noteId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export type SortOption = 'latest' | 'oldest' | 'alphabetical';
export type ViewMode = 'grid' | 'list';

// ============================================================
// Space (Workspace) Types
// ============================================================

export interface Space {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  visibility: 'public' | 'private';
  createdAt: Date;
}

export interface SpaceAssignment {
  userId: string;
  spaceId: string;
  role: 'editor' | 'viewer';
  assignedAt: Date;
}

// ============================================================
// Auth & User Types
// ============================================================

export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

// ============================================================
// App Settings (Admin-configurable)
// ============================================================

/** Granular permission keys that admins can toggle per role */
export type PermissionKey =
  | 'canCreateNote'
  | 'canEditNote'
  | 'canDeleteOwnNote'
  | 'canDeleteAnyNote'
  | 'canPinNotes'
  | 'canToggleNoteVisibility'
  | 'canViewOverview'
  | 'canCreateSpaces'
  | 'canEditSpaces'
  | 'canDeleteSpaces'
  | 'canManageTags'
  | 'canManageUsers'
  | 'canViewAdminPanel'
  | 'canManageAppSettings';

/** Maps each role to a set of permission overrides */
export type RolePermissionOverrides = Record<Role, Partial<Record<PermissionKey, boolean>>>;

export interface AppSettings {
  publicSignupEnabled: boolean;
  defaultUserRole: Role;
  maxNotesPerUser: number;
  rolePermissionOverrides: RolePermissionOverrides;
}

// ============================================================
// Permission Types
// ============================================================

export interface Permissions {
  canCreateNote: boolean;
  canEditNote: boolean;
  canDeleteOwnNote: boolean;
  canDeleteAnyNote: boolean;
  canPinNotes: boolean;
  canManageUsers: boolean;
  canManageSpaces: boolean;
  canCreateSpaces: boolean;
  canEditSpaces: boolean;
  canDeleteSpaces: boolean;
  canManageTags: boolean;
  canManageAppSettings: boolean;
  canViewAdminPanel: boolean;
  canAssignRoles: boolean;
  canViewOverview: boolean;
  canToggleNoteVisibility: boolean;
  canAccessSpace: (spaceId: string) => boolean;
  accessibleSpaceIds: string[];
}

/** Human-readable labels for permission keys */
export const permissionLabels: Record<PermissionKey, string> = {
  canCreateNote: 'Create Notes',
  canEditNote: 'Edit Notes',
  canDeleteOwnNote: 'Delete Own Notes',
  canDeleteAnyNote: 'Delete Any Note',
  canPinNotes: 'Pin Notes',
  canToggleNoteVisibility: 'Toggle Visibility',
  canViewOverview: 'View Overview',
  canCreateSpaces: 'Create Spaces',
  canEditSpaces: 'Edit Spaces',
  canDeleteSpaces: 'Delete Spaces',
  canManageTags: 'Manage Tags',
  canManageUsers: 'Manage Users',
  canViewAdminPanel: 'View Admin Panel',
  canManageAppSettings: 'Manage Settings',
};

/** Permission keys grouped by category for the settings UI */
export const permissionCategories: { label: string; keys: PermissionKey[] }[] = [
  {
    label: 'Notes',
    keys: ['canCreateNote', 'canEditNote', 'canDeleteOwnNote', 'canDeleteAnyNote', 'canPinNotes', 'canToggleNoteVisibility'],
  },
  {
    label: 'Spaces',
    keys: ['canCreateSpaces', 'canEditSpaces', 'canDeleteSpaces'],
  },
  {
    label: 'General',
    keys: ['canViewOverview', 'canManageTags', 'canManageUsers', 'canViewAdminPanel', 'canManageAppSettings'],
  },
];

/** Default permissions for each role (before overrides are applied) */
const defaultPermissionsForRole: Record<Role, Omit<Permissions, 'canAccessSpace' | 'accessibleSpaceIds'>> = {
  admin: {
    canCreateNote: true,
    canEditNote: true,
    canDeleteOwnNote: true,
    canDeleteAnyNote: true,
    canPinNotes: true,
    canManageUsers: true,
    canManageSpaces: true,
    canCreateSpaces: true,
    canEditSpaces: true,
    canDeleteSpaces: true,
    canManageTags: true,
    canManageAppSettings: true,
    canViewAdminPanel: true,
    canAssignRoles: true,
    canViewOverview: true,
    canToggleNoteVisibility: true,
  },
  editor: {
    canCreateNote: true,
    canEditNote: true,
    canDeleteOwnNote: true,
    canDeleteAnyNote: false,
    canPinNotes: true,
    canManageUsers: false,
    canManageSpaces: false,
    canCreateSpaces: true,
    canEditSpaces: false,
    canDeleteSpaces: false,
    canManageTags: true,
    canManageAppSettings: false,
    canViewAdminPanel: false,
    canAssignRoles: false,
    canViewOverview: true,
    canToggleNoteVisibility: false,
  },
  viewer: {
    canCreateNote: true,
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
    canViewOverview: true,
    canToggleNoteVisibility: false,
  },
};

export function getPermissionsForRole(
  role: Role,
  spaceAssignments: SpaceAssignment[] = [],
  overrides?: RolePermissionOverrides,
): Permissions {
  const accessibleSpaceIds = role === 'admin'
    ? [] // admin has access to all spaces (empty = wildcard)
    : spaceAssignments.map(sa => sa.spaceId);

  // Start with defaults
  const base = { ...defaultPermissionsForRole[role] };

  // Apply overrides if provided
  if (overrides && overrides[role]) {
    for (const [key, value] of Object.entries(overrides[role])) {
      if (typeof value === 'boolean' && key in base) {
        (base as any)[key] = value;
      }
    }
  }

  return {
    ...base,
    canAccessSpace: (spaceId: string) => role === 'admin' ? true : accessibleSpaceIds.includes(spaceId),
    accessibleSpaceIds,
  };
}

// ============================================================
// Overview / Analytics Types
// ============================================================

export interface OverviewStats {
  totalNotes: number;
  notesByType: Record<NoteType, number>;
  notesBySpace: { spaceId: string; spaceName: string; count: number }[];
  publicNotes: number;
  privateNotes: number;
  totalTags: number;
  activeUsersCount: number;
  pinnedNotes: number;
  recentNotesCount: number;
}
