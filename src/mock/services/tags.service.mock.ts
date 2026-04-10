import { v4 as uuidv4 } from 'uuid';
import type { Note, Tag } from '@/types';

// Re-export the notes reference so we can derive tags from live data
import { getNotesFromStore } from './notes.service.mock';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ID cache for consistent tag IDs across calls
const tagIdCache = new Map<string, string>();

function getTagId(name: string): string {
  const key = name.toLowerCase();
  if (tagIdCache.has(key)) return tagIdCache.get(key)!;
  const id = `tag-${uuidv4().slice(0, 8)}`;
  tagIdCache.set(key, id);
  return id;
}

/**
 * Derives tags in real-time from all notes (both manualTags and aiTags).
 * This means every time a note is created/updated/deleted,
 * the tag list automatically reflects the current state.
 */
export async function getTags(): Promise<Tag[]> {
  await delay(100);
  const notes = getNotesFromStore();
  const tagMap = new Map<string, { count: number; oldestDate: Date }>();

  for (const note of notes) {
    const allTags = [...note.manualTags, ...note.aiTags];
    for (const tagName of allTags) {
      const key = tagName.toLowerCase();
      const existing = tagMap.get(key);
      if (existing) {
        existing.count++;
        if (note.createdAt < existing.oldestDate) {
          existing.oldestDate = note.createdAt;
        }
      } else {
        tagMap.set(key, {
          count: 1,
          oldestDate: new Date(note.createdAt),
        });
      }
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, { count, oldestDate }]) => ({
      id: getTagId(name),
      name,
      usageCount: count,
      createdAt: oldestDate,
    }))
    .sort((a, b) => b.usageCount - a.usageCount);
}

export async function createTag(name: string): Promise<Tag> {
  await delay(100);
  // In a real backend, this would create a tag record.
  // For mock, we just ensure the ID cache has it.
  const id = getTagId(name);
  return {
    id,
    name,
    usageCount: 0,
    createdAt: new Date(),
  };
}

export async function deleteTag(id: string): Promise<boolean> {
  await delay(100);
  // In a real backend, this would delete from DB.
  // For mock, remove from cache.
  for (const [key, cachedId] of tagIdCache.entries()) {
    if (cachedId === id) {
      tagIdCache.delete(key);
      return true;
    }
  }
  return false;
}
