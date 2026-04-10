import type { AppSettings } from '@/types';

export const mockAppSettings: AppSettings = {
  publicSignupEnabled: true,
  defaultUserRole: 'viewer',
  maxNotesPerUser: 1000,
  rolePermissionOverrides: {
    admin: {},
    editor: {},
    viewer: {},
  },
};
