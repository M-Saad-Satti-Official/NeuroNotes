import { v4 as uuidv4 } from 'uuid';
import { mockSpaces } from '@/mock/data/spaces.mock';
import type { Space } from '@/types';

let spaces: Space[] = JSON.parse(JSON.stringify(mockSpaces, (key, value) => {
  if (key === 'createdAt') return new Date(value).toISOString();
  return value;
}));
spaces = spaces.map(s => ({ ...s, createdAt: new Date(s.createdAt) }));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getSpaces(): Promise<Space[]> {
  await delay(200);
  return [...spaces];
}

export async function getSpaceById(id: string): Promise<Space | null> {
  await delay(150);
  const space = spaces.find(s => s.id === id);
  return space ? { ...space } : null;
}

export async function createSpace(data: Partial<Space>): Promise<Space> {
  await delay(300);
  const name = (data.name || 'New Space').trim();
  // Enforce unique names (case-insensitive)
  if (spaces.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`A space named "${name}" already exists`);
  }
  const newSpace: Space = {
    id: `space-${uuidv4().slice(0, 8)}`,
    name: data.name || 'New Space',
    description: data.description || '',
    icon: data.icon || 'Folder',
    color: data.color || '#6366f1',
    visibility: data.visibility || 'private',
    createdAt: new Date(),
  };
  spaces.push(newSpace);
  return { ...newSpace };
}

export async function updateSpace(id: string, data: Partial<Space>): Promise<Space | null> {
  await delay(300);
  const index = spaces.findIndex(s => s.id === id);
  if (index === -1) return null;
  // Enforce unique name on rename (case-insensitive)
  if (data.name && data.name.trim()) {
    const name = data.name.trim();
    if (spaces.some((s, i) => i !== index && s.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`A space named "${name}" already exists`);
    }
  }
  spaces[index] = { ...spaces[index], ...data, id: spaces[index].id, createdAt: spaces[index].createdAt };
  return { ...spaces[index] };
}

export async function deleteSpace(id: string): Promise<boolean> {
  await delay(300);
  const index = spaces.findIndex(s => s.id === id);
  if (index === -1) return false;
  spaces.splice(index, 1);
  return true;
}

export async function toggleSpaceVisibility(id: string): Promise<Space | null> {
  await delay(200);
  const space = spaces.find(s => s.id === id);
  if (!space) return null;
  space.visibility = space.visibility === 'public' ? 'private' : 'public';
  return { ...space };
}
