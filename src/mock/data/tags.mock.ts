import type { Tag } from '@/types';
import { mockNotes } from './notes.mock';

function extractTags(): Tag[] {
  const tagMap = new Map<string, number>();

  for (const note of mockNotes) {
    for (const tag of [...note.manualTags, ...note.aiTags]) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagMap.entries()).map(([name, usageCount], index) => ({
    id: `tag-${String(index + 1).padStart(3, '0')}`,
    name,
    usageCount,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + index * 24 * 60 * 60 * 1000),
  })).sort((a, b) => b.usageCount - a.usageCount);
}

export const mockTags: Tag[] = extractTags();
