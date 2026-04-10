import type { SpaceAssignment } from '@/types';

export const mockSpaceAssignments: SpaceAssignment[] = [
  {
    userId: 'user-002',
    spaceId: 'space-001',
    role: 'editor',
    assignedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 'user-002',
    spaceId: 'space-002',
    role: 'editor',
    assignedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 'user-002',
    spaceId: 'space-004',
    role: 'editor',
    assignedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 'user-003',
    spaceId: 'space-002',
    role: 'editor',
    assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 'user-003',
    spaceId: 'space-003',
    role: 'editor',
    assignedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];
