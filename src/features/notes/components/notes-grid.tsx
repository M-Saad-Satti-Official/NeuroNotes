'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pin, Edit3 } from 'lucide-react';
import { useNotesStore } from '@/store/notes-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useUIStore } from '@/store/ui-store';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteCard } from './note-card';
import { EmptyState } from './empty-state';
import { ConfirmDialog } from './confirm-dialog';
import { cn } from '@/lib/utils';

export function NotesGrid() {
  const { notes, isLoading, viewMode, getFilteredNotes, filterTag } = useNotesStore();
  // Subscribe to currentSpaceId so NotesGrid re-renders when space changes
  useSpacesStore(s => s.currentSpaceId);
  const { openEditor, openViewer } = useUIStore();
  const { deleteNote, togglePin } = useNotes();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Use useMemo so filtering re-computes reactively when deps change
  const filteredNotes = useMemo(() => getFilteredNotes(), [notes, filterTag, viewMode]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned), [filteredNotes]);

  const handleNoteClick = (noteId: string) => {
    openViewer(noteId);
  };

  const handleEdit = (noteId: string) => {
    openEditor('edit', noteId);
  };

  const handlePin = async (noteId: string) => {
    await togglePin(noteId);
  };

  const handleDeleteRequest = (noteId: string) => {
    setDeleteTargetId(noteId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteNote(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
      )}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              viewMode === 'grid' ? 'p-5' : 'p-4',
              'rounded-xl border border-border bg-card'
            )}
          >
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3 mb-4" />
            <div className="flex gap-1.5">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <EmptyState
        isSearch={!!useNotesStore.getState().searchQuery}
        filterTag={filterTag}
      />
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pinned section */}
        {pinnedNotes.length > 0 && filterTag !== '__pinned__' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pinned
              </span>
              <span className="text-xs text-muted-foreground">
                ({pinnedNotes.length})
              </span>
            </div>
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            )}>
              {pinnedNotes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={i}
                  viewMode={viewMode}
                  onClick={() => handleNoteClick(note.id)}
                  onEdit={() => handleEdit(note.id)}
                  onPin={() => handlePin(note.id)}
                  onDelete={() => handleDeleteRequest(note.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All notes / Unpinned */}
        {(filterTag !== '__pinned__' || pinnedNotes.length === 0) && (
          <div>
            {pinnedNotes.length > 0 && filterTag !== "__pinned__" && (
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  All Notes
                </span>
              </div>
            )}
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            )}>
              {unpinnedNotes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={i + pinnedNotes.length}
                  viewMode={viewMode}
                  onClick={() => handleNoteClick(note.id)}
                  onEdit={() => handleEdit(note.id)}
                  onPin={() => handlePin(note.id)}
                  onDelete={() => handleDeleteRequest(note.id)}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
