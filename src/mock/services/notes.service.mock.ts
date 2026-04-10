import { v4 as uuidv4 } from 'uuid';
import { mockNotes } from '@/mock/data/notes.mock';
import type { Note, OverviewStats, NoteType } from '@/types';

// In-memory copy of notes
let notes: Note[] = JSON.parse(JSON.stringify(mockNotes, (key, value) => {
  if (key === 'createdAt' || key === 'updatedAt' || key === 'assignedAt') {
    return new Date(value).toISOString();
  }
  return value;
}));

// Restore Date objects after parsing
notes = notes.map(note => ({
  ...note,
  createdAt: new Date(note.createdAt),
  updatedAt: new Date(note.updatedAt),
}));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getNotes(): Promise<Note[]> {
  await delay(300);
  return [...notes];
}

export async function getNoteById(id: string): Promise<Note | null> {
  await delay(200);
  const note = notes.find(n => n.id === id);
  return note ? { ...note } : null;
}

export async function createNote(data: Partial<Note>): Promise<Note> {
  await delay(300);
  const now = new Date();
  const newNote: Note = {
    id: `note-${uuidv4().slice(0, 8)}`,
    title: data.title || 'Untitled Note',
    content: data.content || '',
    noteType: data.noteType || 'text',
    manualTags: data.manualTags || [],
    aiTags: data.aiTags || [],
    spaceId: data.spaceId || null,
    visibility: data.visibility || 'private',
    createdBy: data.createdBy || null,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };
  notes.unshift(newNote);
  return { ...newNote };
}

export async function updateNote(id: string, data: Partial<Note>): Promise<Note | null> {
  await delay(300);
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...data,
    id: notes[index].id, // prevent id override
    createdAt: notes[index].createdAt, // prevent createdAt override
    updatedAt: new Date(),
  };

  return { ...notes[index] };
}

export async function deleteNote(id: string): Promise<boolean> {
  await delay(300);
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
}

export async function togglePin(id: string): Promise<Note | null> {
  await delay(200);
  const note = notes.find(n => n.id === id);
  if (!note) return null;
  note.isPinned = !note.isPinned;
  note.updatedAt = new Date();
  return { ...note };
}

export async function toggleVisibility(id: string): Promise<Note | null> {
  await delay(200);
  const note = notes.find(n => n.id === id);
  if (!note) return null;
  note.visibility = note.visibility === 'public' ? 'private' : 'public';
  note.updatedAt = new Date();
  return { ...note };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  await delay(300);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const notesByType: Record<NoteType, number> = {
    text: 0,
    image: 0,
    video: 0,
    link: 0,
    document: 0,
    quick: 0,
  };

  const spaceMap = new Map<string, { spaceName: string; count: number }>();

  let publicNotes = 0;
  let privateNotes = 0;
  let pinnedNotes = 0;
  let recentNotesCount = 0;

  for (const note of notes) {
    notesByType[note.noteType] = (notesByType[note.noteType] || 0) + 1;

    if (note.visibility === 'public') publicNotes++;
    else privateNotes++;

    if (note.isPinned) pinnedNotes++;
    if (note.createdAt >= sevenDaysAgo) recentNotesCount++;

    // We'll resolve space names separately since we don't import spaces here
  }

  // Collect all unique tags
  const allTags = new Set<string>();
  for (const note of notes) {
    for (const tag of note.manualTags) allTags.add(tag);
    for (const tag of note.aiTags) allTags.add(tag);
  }

  return {
    totalNotes: notes.length,
    notesByType,
    notesBySpace: [], // Populated by the store using spaces data
    publicNotes,
    privateNotes,
    totalTags: allTags.size,
    activeUsersCount: 0, // Populated by the store using auth data
    pinnedNotes,
    recentNotesCount,
  };
}

// Export the in-memory notes array so tags service can derive tags from it
export function getNotesFromStore(): Note[] {
  return [...notes];
}

export async function searchNotes(query: string): Promise<Note[]> {
  await delay(250);
  if (!query.trim()) return [...notes];

  const lowerQuery = query.toLowerCase();
  return notes.filter(note => {
    const matchesTitle = note.title.toLowerCase().includes(lowerQuery);
    const matchesContent = note.content.toLowerCase().includes(lowerQuery);
    const matchesManualTags = note.manualTags.some(t => t.toLowerCase().includes(lowerQuery));
    const matchesAiTags = note.aiTags.some(t => t.toLowerCase().includes(lowerQuery));
    return matchesTitle || matchesContent || matchesManualTags || matchesAiTags;
  });
}
