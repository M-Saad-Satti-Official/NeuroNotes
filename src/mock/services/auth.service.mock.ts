import { mockUsers } from '@/mock/data/users.mock';
import { mockSpaceAssignments } from '@/mock/data/space-assignments.mock';
import { mockAppSettings } from '@/mock/data/app-settings.mock';
import type { User, Role, LoginCredentials, SignupCredentials, AppSettings, SpaceAssignment, RolePermissionOverrides } from '@/types';

let users: User[] = JSON.parse(JSON.stringify(mockUsers, (key, value) => {
  if (key === 'createdAt' || key === 'lastLogin') return value ? new Date(value).toISOString() : null;
  return value;
}));
users = users.map(u => ({
  ...u,
  createdAt: new Date(u.createdAt),
  lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined,
}));

let spaceAssignments: SpaceAssignment[] = JSON.parse(JSON.stringify(mockSpaceAssignments, (key, value) => {
  if (key === 'assignedAt') return new Date(value).toISOString();
  return value;
}));
spaceAssignments = spaceAssignments.map(sa => ({
  ...sa,
  assignedAt: new Date(sa.assignedAt),
}));

let appSettings: AppSettings = { ...mockAppSettings };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentUser: User | null = null;

export async function login(credentials: LoginCredentials): Promise<User | null> {
  await delay(500);
  const user = users.find(u => u.email === credentials.email);
  if (!user) return null;
  if (user.status === 'suspended') return null;
  user.lastLogin = new Date();
  currentUser = { ...user };
  return { ...currentUser };
}

export async function signup(credentials: SignupCredentials): Promise<User> {
  await delay(600);
  if (!appSettings.publicSignupEnabled) {
    throw new Error('Public signup is disabled. Please contact an administrator.');
  }
  const existing = users.find(u => u.email === credentials.email);
  if (existing) throw new Error('Email already in use');

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: credentials.name,
    email: credentials.email,
    role: appSettings.defaultUserRole,
    status: 'active',
    createdAt: new Date(),
    lastLogin: new Date(),
  };
  users.push(newUser);
  currentUser = { ...newUser };
  return { ...currentUser };
}

export async function logout(): Promise<void> {
  await delay(200);
  currentUser = null;
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(150);
  return currentUser ? { ...currentUser } : null;
}

export async function getAllUsers(): Promise<User[]> {
  await delay(300);
  return [...users];
}

export async function getUserById(id: string): Promise<User | null> {
  await delay(200);
  const user = users.find(u => u.id === id);
  return user ? { ...user } : null;
}

export async function updateUserRole(id: string, role: Role): Promise<User | null> {
  await delay(300);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], role };
  if (currentUser?.id === id) {
    currentUser = { ...users[index] };
  }
  return { ...users[index] };
}

export async function suspendUser(id: string): Promise<User | null> {
  await delay(300);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], status: 'suspended' };
  return { ...users[index] };
}

export async function activateUser(id: string): Promise<User | null> {
  await delay(300);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], status: 'active' };
  return { ...users[index] };
}

export async function deleteUser(id: string): Promise<boolean> {
  await delay(300);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  spaceAssignments = spaceAssignments.filter(sa => sa.userId !== id);
  return true;
}

// App Settings
export async function getAppSettings(): Promise<AppSettings> {
  await delay(200);
  return JSON.parse(JSON.stringify(appSettings));
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  await delay(300);
  appSettings = { ...appSettings, ...settings };
  return { ...appSettings };
}

// Role Permission Overrides
export async function getRolePermissionOverrides(): Promise<RolePermissionOverrides> {
  await delay(200);
  return JSON.parse(JSON.stringify(appSettings.rolePermissionOverrides));
}

export async function updateRolePermissionOverrides(overrides: RolePermissionOverrides): Promise<RolePermissionOverrides> {
  await delay(300);
  appSettings = { ...appSettings, rolePermissionOverrides: JSON.parse(JSON.stringify(overrides)) };
  return JSON.parse(JSON.stringify(appSettings.rolePermissionOverrides));
}

// Space Assignments
export async function getSpaceAssignments(): Promise<SpaceAssignment[]> {
  await delay(200);
  return [...spaceAssignments];
}

export async function assignUserToSpace(userId: string, spaceId: string, role: 'editor' | 'viewer' = 'editor'): Promise<SpaceAssignment> {
  await delay(300);
  const existing = spaceAssignments.find(sa => sa.userId === userId && sa.spaceId === spaceId);
  if (existing) {
    existing.role = role;
    existing.assignedAt = new Date();
    return { ...existing };
  }
  const assignment: SpaceAssignment = {
    userId,
    spaceId,
    role,
    assignedAt: new Date(),
  };
  spaceAssignments.push(assignment);
  return { ...assignment };
}

export async function removeUserFromSpace(userId: string, spaceId: string): Promise<boolean> {
  await delay(300);
  const index = spaceAssignments.findIndex(sa => sa.userId === userId && sa.spaceId === spaceId);
  if (index === -1) return false;
  spaceAssignments.splice(index, 1);
  return true;
}

export async function getUserSpaceAssignments(userId: string): Promise<SpaceAssignment[]> {
  await delay(200);
  return spaceAssignments.filter(sa => sa.userId === userId).map(sa => ({ ...sa }));
}
