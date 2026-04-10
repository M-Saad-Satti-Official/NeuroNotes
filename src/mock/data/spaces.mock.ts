import type { Space } from '@/types';

export const mockSpaces: Space[] = [
  {
    id: 'space-001',
    name: 'Personal',
    description: 'Personal notes, ideas, and reflections',
    icon: 'User',
    color: '#6366f1',
    visibility: 'private',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'space-002',
    name: 'Work',
    description: 'Work-related notes, meeting summaries, project docs',
    icon: 'Briefcase',
    color: '#f59e0b',
    visibility: 'private',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'space-003',
    name: 'Ideas',
    description: 'Creative ideas, brainstorms, side projects',
    icon: 'Lightbulb',
    color: '#10b981',
    visibility: 'public',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'space-004',
    name: 'Learning',
    description: 'Study notes, tutorials, courses, bookmarks',
    icon: 'GraduationCap',
    color: '#ef4444',
    visibility: 'public',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];
