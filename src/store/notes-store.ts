import { create } from 'zustand';
import { notesService } from '@/services/notes.service';
import { useTagsStore } from '@/store/tags-store';
import { useSpacesStore } from '@/store/spaces-store';
import type { Note, SortOption, ViewMode, OverviewStats } from '@/types';

interface NotesState {
  notes: Note[];
  selectedNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;
  searchQuery: string;
  sortBy: SortOption;
  filterTag: string | null;
  viewMode: ViewMode;
  fetchNotes: () => Promise<void>;
  selectNote: (note: Note | null) => void;
  createNote: (data: Partial<Note>) => Promise<Note | null>;
  updateNote: (id: string, data: Partial<Note>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<Note | null>;
  searchNotes: (query: string) => Promise<void>;
  setSortBy: (sort: SortOption) => void;
  setFilterTag: (tag: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleVisibility: (id: string) => Promise<Note | null>;
  getOverviewStats: () => Promise<OverviewStats>;
  getFilteredNotes: () => Note[];
}

function sortNotes(notes: Note[], sortBy: SortOption): Note[] {
  const sorted = [...notes];
  switch (sortBy) {
    case 'latest':
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

/** Refresh tags from the live notes data */
function refreshTags() {
  // Fire-and-forget — tags update in background
  useTagsStore.getState().fetchTags();
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNote: null,
  isLoading: false,
  isSaving: false,
  searchQuery: '',
  sortBy: 'latest',
  filterTag: null,
  viewMode: 'grid',

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await notesService.getNotes();
      set({ notes, isLoading: false });
      refreshTags();
    } catch {
      set({ isLoading: false });
    }
  },

  selectNote: (note) => {
    set({ selectedNote: note });
  },

  createNote: async (data) => {
    set({ isSaving: true });
    try {
      const newNote = await notesService.createNote(data);
      set(state => ({
        notes: [newNote, ...state.notes],
        isSaving: false,
      }));
      refreshTags();
      return newNote;
    } catch {
      set({ isSaving: false });
      return null;
    }
  },

  updateNote: async (id, data) => {
    set({ isSaving: true });
    try {
      const updated = await notesService.updateNote(id, data);
      if (updated) {
        set(state => ({
          notes: state.notes.map(n => (n.id === id ? updated : n)),
          selectedNote: state.selectedNote?.id === id ? updated : state.selectedNote,
          isSaving: false,
        }));
        refreshTags();
      }
      return updated;
    } catch {
      set({ isSaving: false });
      return null;
    }
  },

  deleteNote: async (id) => {
    set({ isSaving: true });
    try {
      const success = await notesService.deleteNote(id);
      if (success) {
        set(state => ({
          notes: state.notes.filter(n => n.id !== id),
          selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
          isSaving: false,
        }));
        refreshTags();
      }
      return success;
    } catch {
      set({ isSaving: false });
      return false;
    }
  },

  togglePin: async (id) => {
    try {
      const updated = await notesService.togglePin(id);
      if (updated) {
        set(state => ({
          notes: state.notes.map(n => (n.id === id ? updated : n)),
          selectedNote: state.selectedNote?.id === id ? updated : state.selectedNote,
        }));
      }
      return updated;
    } catch {
      return null;
    }
  },

  searchNotes: async (query) => {
    const trimmed = query.trim();
    set({ searchQuery: query });
    if (!trimmed) {
      // Empty query — restore full notes list instead of replacing with search results
      const allNotes = await notesService.getNotes();
      set({ notes: allNotes, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const notes = await notesService.searchNotes(query);
      set({ notes, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
  },

  setFilterTag: (tag) => {
    set({ filterTag: tag });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  getFilteredNotes: () => {
    const { notes, filterTag, sortBy } = get();
    const currentSpaceId = useSpacesStore.getState().currentSpaceId;
    let filtered = notes;

    // Filter by space
    if (currentSpaceId) {
      filtered = filtered.filter(note => note.spaceId === currentSpaceId);
    }

    // Handle special filter tags
    if (filterTag === '__pinned__') {
      filtered = filtered.filter(note => note.isPinned);
    } else if (filterTag === '__recent__') {
      // Sort by creation date descending (handled by sortNotes below)
    } else if (filterTag) {
      filtered = filtered.filter(
        note =>
          note.manualTags.includes(filterTag) ||
          note.aiTags.includes(filterTag)
      );
    }

    // For "Recent", sort by creation date descending
    if (filterTag === '__recent__') {
      return sortNotes(filtered, 'latest');
    }

    return sortNotes(filtered, sortBy);
  },

  toggleVisibility: async (id) => {
    try {
      const updated = await notesService.toggleVisibility(id);
      if (updated) {
        set(state => ({
          notes: state.notes.map(n => (n.id === id ? updated : n)),
          selectedNote: state.selectedNote?.id === id ? updated : state.selectedNote,
        }));
      }
      return updated;
    } catch {
      return null;
    }
  },

  getOverviewStats: async () => {
    try {
      return await notesService.getOverviewStats();
    } catch {
      return {
        totalNotes: 0, notesByType: { text: 0, image: 0, video: 0, link: 0, document: 0, quick: 0 },
        notesBySpace: [], publicNotes: 0, privateNotes: 0, totalTags: 0,
        activeUsersCount: 0, pinnedNotes: 0, recentNotesCount: 0,
      };
    }
  },
}));
