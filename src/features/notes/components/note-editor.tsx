'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Loader2,
  Trash2,
  Sparkles,
  Save,
  Globe,
  Lock,
  FileText,
  Link2,
  Image,
  Video,
  File,
  Zap,
  Code,
} from 'lucide-react';
import { useNotesStore } from '@/store/notes-store';
import { useUIStore } from '@/store/ui-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TagInput } from './tag-input';
import { AITagGenerator } from './ai-tag-generator';
import { AITitleGenerator } from './ai-title-generator';
import { CodeBlockEditor } from './code-block-editor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from './confirm-dialog';
import { VoiceInput } from './voice-input';
import { CodeBlockInsertDialog } from './code-block-insert-dialog';
import { ImageUploader, DocumentUploader, VideoURLEditor, LinkURLEditor } from './type-editors';

export function NoteEditor() {
  const { isEditorOpen, editorMode, editingNoteId, editingNoteType, closeEditor } = useUIStore();
  const { notes, isSaving } = useNotesStore();
  const { currentSpaceId, spaces } = useSpacesStore();
  const { permissions, user } = useAuthStore();
  const { createNote, updateNote, deleteNote, toggleVisibility } = useNotes();

  const editingNote = editingNoteId ? notes.find(n => n.id === editingNoteId) ?? null : null;

  // Initialize state from the note — this component re-mounts via key prop
  const [title, setTitle] = useState(() =>
    editorMode === 'edit' && editingNote ? editingNote.title : ''
  );
  const [content, setContent] = useState(() =>
    editorMode === 'edit' && editingNote ? editingNote.content : ''
  );
  const [manualTags, setManualTags] = useState<string[]>(() =>
    editorMode === 'edit' && editingNote ? [...editingNote.manualTags] : []
  );
  const [aiTags, setAiTags] = useState<string[]>(() =>
    editorMode === 'edit' && editingNote ? [...editingNote.aiTags] : []
  );
  const [noteSpaceId, setNoteSpaceId] = useState<string | null>(() => {
    if (editorMode === 'edit' && editingNote) return editingNote.spaceId;
    return currentSpaceId;
  });
  const [visibility, setVisibility] = useState<'public' | 'private'>(() =>
    editorMode === 'edit' && editingNote ? editingNote.visibility : 'private'
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCodeBlockDialog, setShowCodeBlockDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSpace = spaces.find(s => s.id === noteSpaceId);
  const hasCodeBlocks = useMemo(() => /```/.test(content), [content]);

  const placeholderText = useMemo(() => {
    switch (editingNoteType) {
      case 'text': return 'Start writing your note...';
      case 'quick': return 'Quick thought...';
      case 'link': return 'Paste a URL and add some notes...';
      case 'image': return 'Describe or annotate this image...';
      case 'video': return 'Add notes about this video...';
      case 'document': return 'Document content or notes...';
      default: return 'Start writing...';
    }
  }, [editingNoteType]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    const noteData = {
      title,
      content,
      manualTags,
      aiTags,
      spaceId: noteSpaceId,
      noteType: editingNoteType,
      visibility,
      createdBy: editorMode === 'edit' && editingNote ? editingNote.createdBy : (useAuthStore.getState().user?.id ?? null),
    };

    if (editorMode === 'create') {
      await createNote(noteData);
    } else if (editingNoteId) {
      await updateNote(editingNoteId, noteData);
    }
  }, [title, content, manualTags, aiTags, noteSpaceId, editingNoteType, editorMode, editingNoteId, createNote, updateNote, visibility]);

  const handleDelete = useCallback(async () => {
    if (editingNoteId) {
      await deleteNote(editingNoteId);
      setShowDeleteDialog(false);
    }
  }, [editingNoteId, deleteNote]);

  const handleAITagsGenerated = useCallback((tags: string[]) => {
    setAiTags(prev => [...new Set([...prev, ...tags])]);
  }, []);

  const handleAITitleGenerated = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleVisibilityToggle = useCallback(async () => {
    const newVis = visibility === 'public' ? 'private' : 'public';
    setVisibility(newVis);
    // In edit mode, also persist the change via the API
    if (editingNoteId) {
      const updated = await toggleVisibility(editingNoteId);
      if (updated) {
        setVisibility(updated.visibility);
      }
    }
  }, [editingNoteId, visibility, toggleVisibility]);

  const handleClose = useCallback(() => {
    closeEditor();
  }, [closeEditor]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setContent(prev => {
      const separator = prev.trim() ? ' ' : '';
      return prev + separator + transcript;
    });
  }, []);

  const handleCodeBlockInsert = useCallback((lang: string, code: string) => {
    const block = '\n```' + lang + '\n' + code.trimEnd() + '\n```\n';
    setContent(prev => {
      const separator = prev.trim() ? '\n' : '';
      return prev + separator + block;
    });
    toast.success('Code block inserted');
  }, []);

  const editorContent = (
    <div className="flex flex-col">
      <div>
        {/* Space indicator */}
        {currentSpace && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: currentSpace.color }} />
            <span className="text-xs text-muted-foreground">{currentSpace.name}</span>
          </div>
        )}

        {/* Note type indicator */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs gap-1">
            {editingNoteType === 'text' && <FileText className="w-3 h-3" />}
            {editingNoteType === 'quick' && <Zap className="w-3 h-3" />}
            {editingNoteType === 'link' && <Link2 className="w-3 h-3" />}
            {editingNoteType === 'image' && <Image className="w-3 h-3" />}
            {editingNoteType === 'video' && <Video className="w-3 h-3" />}
            {editingNoteType === 'document' && <File className="w-3 h-3" />}
            {editingNoteType === 'text' ? 'Text Note' : editingNoteType === 'quick' ? 'Quick Note' : editingNoteType === 'link' ? 'External Link' : editingNoteType === 'image' ? 'Image' : editingNoteType === 'video' ? 'Video' : 'Document'}
          </Badge>
        </div>

        {/* Title row */}
        <div className="flex items-start gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-xl font-bold border-none bg-transparent px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
          </div>
          {!isMobile && (
            <AITitleGenerator
              content={content}
              currentTitle={title}
              onTitleGenerated={handleAITitleGenerated}
            />
          )}
        </div>

        {/* Visibility toggle — always available, persists in edit mode */}
        <div className="flex items-center gap-2 mb-3 py-1.5">
          <Switch
            checked={visibility === 'public'}
            onCheckedChange={handleVisibilityToggle}
          />
          <div className="flex items-center gap-1.5">
            {visibility === 'public' ? (
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {visibility === 'public' ? 'Public — visible to all' : 'Private — only you'}
            </span>
          </div>
        </div>

        {/* Content — type-specific editors */}
        {(editingNoteType === 'image') ? (
          <div className="mt-2">
            <ImageUploader value={content} onChange={handleContentChange} />
          </div>
        ) : (editingNoteType === 'document') ? (
          <div className="mt-2">
            <DocumentUploader value={content} onChange={handleContentChange} />
          </div>
        ) : (editingNoteType === 'video') ? (
          <div className="mt-2">
            <VideoURLEditor value={content} onChange={handleContentChange} />
          </div>
        ) : (editingNoteType === 'link') ? (
          <div className="mt-2">
            <LinkURLEditor value={content} onChange={handleContentChange} />
          </div>
        ) : (
          <div className="relative mt-2">
            {/* Text editor */}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholderText}
              className={cn(
                'min-h-[200px] md:min-h-[300px] border-none bg-transparent px-0 shadow-none',
                'focus-visible:ring-0 resize-none placeholder:text-muted-foreground/50 text-sm leading-relaxed'
              )}
            />
            {/* Live code block preview — always visible when content has code blocks */}
            {hasCodeBlocks && (
              <div className="mt-4 rounded-lg border border-border/50 overflow-hidden">
                <CodeBlockEditor
                  content={content}
                  onChange={handleContentChange}
                />
              </div>
            )}

            {/* Floating toolbar — bottom-right of content area */}
            <div className="absolute bottom-3 right-1 z-10 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 px-1 py-0.5 shadow-sm">
              <CodeBlockInsertDialog
                open={showCodeBlockDialog}
                onOpenChange={setShowCodeBlockDialog}
                onInsert={handleCodeBlockInsert}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setShowCodeBlockDialog(true)}
                title="Insert code block"
              >
                <Code className="w-3.5 h-3.5" />
              </Button>
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                isRecording={isRecording}
                onRecordingChange={setIsRecording}
                size="icon"
                variant="ghost"
              />
            </div>
            {isRecording && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse rounded-full" />
            )}
          </div>
        )}

        <Separator className="my-4" />

        {/* Tags section */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Manual Tags
            </label>
            <TagInput
              tags={manualTags}
              onChange={setManualTags}
              placeholder="Add tags..."
            />
          </div>

          <AITagGenerator
            content={content}
            onTagsGenerated={handleAITagsGenerated}
            existingTags={[...manualTags, ...aiTags]}
          />

          {aiTags.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                AI Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {aiTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                    onClick={() => setAiTags(prev => prev.filter(t => t !== tag))}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {tag}
                    <X className="w-2.5 h-2.5 ml-0.5" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <Separator className="mt-4" />
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          {editorMode === 'edit' && editingNoteId &&
            (permissions.canDeleteAnyNote || (permissions.canDeleteOwnNote && editingNote?.createdBy === user?.id)) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive gap-1.5"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleSave}
            disabled={
              !title.trim() ||
              isSaving ||
              (editorMode === 'create' && !permissions.canCreateNote) ||
              (editorMode === 'edit' && !permissions.canEditNote)
            }
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {editorMode === 'create' && !permissions.canCreateNote
              ? 'Permission Denied'
              : editorMode === 'edit' && !permissions.canEditNote
                ? 'Permission Denied'
                : editorMode === 'create' ? 'Create Note' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile: Sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={isEditorOpen} onOpenChange={(open) => !open && handleClose()}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader className="px-1">
              <SheetTitle className="text-left">
                {editorMode === 'create' ? 'New Note' : 'Edit Note'}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-1 overflow-y-auto h-[calc(90vh-80px)]">
              {editorContent}
            </div>
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

  // Desktop: Dialog
  return (
    <>
      <Dialog open={isEditorOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 flex flex-col" showCloseButton={false}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-shrink-0 px-6 pt-6">
              <DialogHeader>
                <DialogTitle className="sr-only">
                  {editorMode === 'create' ? 'New Note' : 'Edit Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {editorMode === 'create' ? 'New Note' : 'Editing'}
                </Badge>
                {editingNote && (
                  <span className="text-xs text-muted-foreground">
                    Last edited {new Date(editingNote.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
              {editorContent}
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
