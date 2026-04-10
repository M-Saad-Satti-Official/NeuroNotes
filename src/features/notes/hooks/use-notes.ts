import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNotesStore } from '@/store/notes-store';
import { useTagsStore } from '@/store/tags-store';
import { useUIStore } from '@/store/ui-store';
import type { Note } from '@/types';

export function useNotes() {
  const {
    fetchNotes,
    createNote: storeCreate,
    updateNote: storeUpdate,
    deleteNote: storeDelete,
    togglePin: storeTogglePin,
    toggleVisibility: storeToggleVisibility,
    searchNotes: storeSearch,
  } = useNotesStore();

  const { fetchTags } = useTagsStore();
  const { openEditor, closeEditor } = useUIStore();

  /** Refresh both notes and tags from the data source */
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchNotes(), fetchTags()]);
  }, [fetchNotes, fetchTags]);

  const handleCreate = useCallback(async (data: Partial<Note>) => {
    const note = await storeCreate(data);
    if (note) {
      toast.success('Note created successfully');
      await fetchTags();
      closeEditor();
    } else {
      toast.error('Failed to create note');
    }
    return note;
  }, [storeCreate, fetchTags, closeEditor]);

  const handleUpdate = useCallback(async (id: string, data: Partial<Note>) => {
    const note = await storeUpdate(id, data);
    if (note) {
      toast.success('Note updated successfully');
      await fetchTags();
      closeEditor();
    } else {
      toast.error('Failed to update note');
    }
    return note;
  }, [storeUpdate, fetchTags, closeEditor]);

  const handleDelete = useCallback(async (id: string) => {
    const success = await storeDelete(id);
    if (success) {
      toast.success('Note deleted');
      await fetchTags();
      closeEditor();
    } else {
      toast.error('Failed to delete note');
    }
    return success;
  }, [storeDelete, fetchTags, closeEditor]);

  const handleTogglePin = useCallback(async (id: string) => {
    const note = await storeTogglePin(id);
    if (note) {
      toast.success(note.isPinned ? 'Note pinned' : 'Note unpinned');
    }
    return note;
  }, [storeTogglePin]);

  const handleToggleVisibility = useCallback(async (id: string) => {
    const note = await storeToggleVisibility(id);
    if (note) {
      toast.success(note.visibility === 'public' ? 'Note made public' : 'Note made private');
    }
    return note;
  }, [storeToggleVisibility]);

  const handleSearch = useCallback(async (query: string) => {
    await storeSearch(query);
  }, [storeSearch]);

  return {
    fetchNotes,
    refreshAll,
    createNote: handleCreate,
    updateNote: handleUpdate,
    deleteNote: handleDelete,
    togglePin: handleTogglePin,
    toggleVisibility: handleToggleVisibility,
    searchNotes: handleSearch,
    openEditor,
  };
}
