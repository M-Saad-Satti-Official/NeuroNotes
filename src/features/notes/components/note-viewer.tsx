'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Pin,
  Trash2,
  Edit3,
  Clock,
  Link2,
  Video,
  File,
  Image,
  Zap,
  Sparkles,
  ExternalLink,
  Globe,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotesStore } from '@/store/notes-store';
import { useUIStore } from '@/store/ui-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { ConfirmDialog } from './confirm-dialog';
import { CodeBlockEditor } from './code-block-editor';
import type { NoteType } from '@/types';

const noteTypeIcon: Record<NoteType, React.ElementType> = {
  text: Pin,
  image: Image,
  video: Video,
  link: Link2,
  document: File,
  quick: Zap,
};

const noteTypeLabel: Record<NoteType, string> = {
  text: 'Text Note',
  image: 'Image',
  video: 'Video',
  link: 'Link',
  document: 'Document',
  quick: 'Quick Note',
};

export function NoteViewer() {
  const { isViewingNote, viewingNoteId, closeViewer, openEditor } = useUIStore();
  const { notes } = useNotesStore();
  const { spaces } = useSpacesStore();
  const { deleteNote, togglePin } = useNotes();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const note = viewingNoteId ? notes.find(n => n.id === viewingNoteId) ?? null : null;
  const space = note?.spaceId ? spaces.find(s => s.id === note.spaceId) : null;
  const allTags = note ? [...new Set([...note.manualTags, ...note.aiTags])] : [];
  const timeAgo = note ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) : '';
  const TypeIcon = note ? noteTypeIcon[note.noteType] : Pin;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleEdit = useCallback(() => {
    if (note) {
      closeViewer();
      openEditor('edit', note.id, note.noteType);
    }
  }, [note, closeViewer, openEditor]);

  const handleDelete = useCallback(async () => {
    if (viewingNoteId) {
      await deleteNote(viewingNoteId);
      setShowDeleteDialog(false);
      closeViewer();
    }
  }, [viewingNoteId, deleteNote, closeViewer]);

  const handlePin = useCallback(async () => {
    if (viewingNoteId) {
      await togglePin(viewingNoteId);
    }
  }, [viewingNoteId, togglePin]);

  const handleClose = useCallback(() => {
    closeViewer();
  }, [closeViewer]);

  const hasCodeBlocks = note ? /```/.test(note.content) : false;

  if (!note) return null;

  const viewerContent = (
    <div className="flex flex-col">
      <div>
        {/* Header metadata */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className="text-xs gap-1">
            <TypeIcon className="w-3 h-3" />
            {noteTypeLabel[note.noteType]}
          </Badge>
          {space && (
            <Badge variant="outline" className="text-xs">
              {space.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1">
            {note.visibility === 'public' ? (
              <>
                <Globe className="w-3 h-3 text-emerald-500" />
                Public
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-amber-500" />
                Private
              </>
            )}
          </Badge>
          {note.isPinned && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
              Pinned
            </Badge>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold leading-tight mb-3">{note.title}</h1>

        {/* Content — type-specific rendering */}
        {note.noteType === 'image' && note.content.startsWith('data:') ? (
          <div className="mt-2 rounded-lg overflow-hidden border bg-black/5">
            <img
              src={note.content}
              alt={note.title}
              className="w-full max-h-[400px] object-contain"
            />
          </div>
        ) : note.noteType === 'image' && note.content.startsWith('http') ? (
          <div className="mt-2 rounded-lg overflow-hidden border bg-black/5">
            <img
              src={note.content}
              alt={note.title}
              className="w-full max-h-[400px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : note.noteType === 'document' ? (() => {
          try {
            const docData = JSON.parse(note.content);
            return (
              <div className="mt-2 flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
                <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <File className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{docData.name || 'Document'}</p>
                  {docData.size && (
                    <p className="text-xs text-muted-foreground">
                      {(docData.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
            );
          } catch {
            return (
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2">
                {note.content}
              </div>
            );
          }
        })() : note.noteType === 'video' ? (() => {
          const ytMatch = note.content.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          const vimeoMatch = note.content.match(/vimeo\.com\/(?:\d+|video\/\d+)/);
          if (ytMatch) {
            return (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <iframe
                  src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                  className="w-full aspect-video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="Video"
                />
              </div>
            );
          }
          if (vimeoMatch) {
            return (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <iframe
                  src={note.content.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  className="w-full aspect-video"
                  allowFullScreen
                  title="Video"
                />
              </div>
            );
          }
          return (
            <a
              href={note.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
            >
              <Video className="w-3.5 h-3.5" />
              Open video
            </a>
          );
        })() : note.noteType === 'link' && note.content.startsWith('http') ? (
          <a
            href={note.content}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors mt-2"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {note.content.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Click to open in new tab
              </p>
            </div>
          </a>
        ) : hasCodeBlocks ? (
          <div className="mt-2">
            <CodeBlockEditor content={note.content} onChange={() => {}} readOnly />
          </div>
        ) : (
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {note.content}
          </div>
        )}

        <Separator className="my-4" />

        {/* Tags */}
        <div className="space-y-2">
          {note.manualTags.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {note.manualTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {note.aiTags.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                AI Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {note.aiTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs gap-1">
                    <Sparkles className="w-3 h-3 text-muted-foreground" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-4 text-[11px] text-muted-foreground space-y-1">
          <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(note.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <Separator className="mt-4" />
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handlePin}
          >
            <Pin className={note.isPinned ? 'w-3.5 h-3.5 text-amber-500 fill-amber-500' : 'w-3.5 h-3.5'} />
            {note.isPinned ? 'Unpin' : 'Pin'}
          </Button>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={handleEdit}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Note
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={isViewingNote} onOpenChange={(open) => !open && handleClose()}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl p-6">
            {viewerContent}
          </SheetContent>
        </Sheet>
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Note"
          description="Are you sure you want to delete this note? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={isViewingNote} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 flex flex-col" showCloseButton={false}>
          <DialogTitle className="sr-only">View Note</DialogTitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-shrink-0 px-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Viewing</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
              {viewerContent}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
