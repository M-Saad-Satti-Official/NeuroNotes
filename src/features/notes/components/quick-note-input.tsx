'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  CornerDownLeft,
  X,
  Tag,
  Loader2,
  Globe,
  Lock,
  Code,
} from 'lucide-react';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { VoiceInput } from './voice-input';
import { CodeBlockInsertDialog } from './code-block-insert-dialog';
import { CodeBlockEditor } from './code-block-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function QuickNoteInput() {
  const { isQuickNoteTriggered, consumeQuickNoteTrigger } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCodeBlockDialog, setShowCodeBlockDialog] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { currentSpaceId, spaces } = useSpacesStore();
  const { permissions, user } = useAuthStore();
  const { createNote } = useNotes();

  const currentSpace = currentSpaceId ? spaces.find(s => s.id === currentSpaceId) : null;

  // Expand when triggered from CreateOptionsModal
  useEffect(() => {
    if (isQuickNoteTriggered) {
      setIsExpanded(true);
      consumeQuickNoteTrigger();
    }
  }, [isQuickNoteTriggered, consumeQuickNoteTrigger]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (!text.trim() && !title.trim()) {
          setIsExpanded(false);
          setShowTitle(false);
        }
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, text, title]);

  // Keyboard shortcut: Ctrl+N or Cmd+N to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSave = useCallback(async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    const noteData = {
      title: title.trim() || generateQuickTitle(text.trim()),
      content: text.trim(),
      noteType: 'quick' as const,
      manualTags: [],
      aiTags: [],
      spaceId: currentSpaceId,
      visibility,
      createdBy: user?.id ?? null,
    };

    const note = await createNote(noteData);
    if (note) {
      setJustSaved(true);
      setText('');
      setTitle('');
      setVisibility('private');
      setShowTitle(false);
      setTimeout(() => {
        setJustSaved(false);
        if (!text.trim()) {
          setIsExpanded(false);
        }
      }, 1500);
    }
    setIsSaving(false);
  }, [text, title, currentSpaceId, user, createNote]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (text.trim() || title.trim()) {
        setText('');
        setTitle('');
        setShowTitle(false);
      } else {
        setIsExpanded(false);
      }
    }
  }, [handleSave, text, title]);

  const handleVoiceTranscript = useCallback((finalTranscript: string) => {
    setText(prev => {
      const separator = prev.trim() ? ' ' : '';
      return prev + separator + finalTranscript;
    });
  }, []);

  const handleCodeBlockInsert = useCallback((lang: string, code: string) => {
    const block = '\n```' + lang + '\n' + code.trimEnd() + '\n```\n';
    setText(prev => {
      const separator = prev.trim() ? '\n' : '';
      return prev + separator + block;
    });
  }, []);

  if (!permissions.canCreateNote) return null;

  return (
    <div ref={containerRef} className="mb-6">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(true)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
              'border border-dashed border-border/60 bg-card/50',
              'text-muted-foreground hover:text-foreground hover:border-border',
              'hover:bg-card hover:shadow-sm transition-all duration-200',
              'group cursor-pointer'
            )}
          >
            <Zap className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
            <span className="text-sm">Quick note...</span>
            <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">
              {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl+'}N
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
            className={cn(
              'rounded-xl border bg-card shadow-lg overflow-hidden',
              justSaved
                ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                : 'border-border'
            )}
          >
            {/* Success banner */}
            <AnimatePresence>
              {justSaved && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-500/10 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Quick note saved!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Space indicator */}
            {currentSpace && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentSpace.color }} />
                <span className="text-[11px] text-muted-foreground">{currentSpace.name}</span>
              </div>
            )}

            {/* Title input (optional) */}
            <AnimatePresence>
              {showTitle && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title (optional)..."
                    className="w-full px-4 pt-3 pb-1 text-sm font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        inputRef.current?.focus();
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main text area */}
            <div className="px-4 py-2">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Capture a quick thought..."
                rows={3}
                className={cn(
                  'w-full text-sm bg-transparent border-none outline-none resize-none',
                  'placeholder:text-muted-foreground/50 leading-relaxed',
                  'min-h-[60px]'
                )}
              />
              {/* Live code block preview */}
              {/```/.test(text) && (
                <div className="mt-3 rounded-lg border border-border/50 overflow-hidden">
                  <CodeBlockEditor content={text} onChange={setText} />
                </div>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/30">
              <div className="flex items-center gap-1">
                {/* Title toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 px-2 text-xs gap-1',
                    showTitle && 'bg-muted text-foreground'
                  )}
                  onClick={() => setShowTitle(prev => !prev)}
                >
                  <Tag className="w-3 h-3" />
                  Title
                </Button>

                {/* Voice input */}
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  isRecording={isRecording}
                  onRecordingChange={setIsRecording}
                  size="sm"
                />

                {/* Code block insert */}
                <CodeBlockInsertDialog
                  open={showCodeBlockDialog}
                  onOpenChange={setShowCodeBlockDialog}
                  onInsert={handleCodeBlockInsert}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCodeBlockDialog(true)}
                >
                  <Code className="w-3 h-3" />
                  Code
                </Button>

                {/* Visibility toggle */}
                <button
                  type="button"
                  className={cn(
                    'h-7 px-2 text-xs gap-1 rounded-md inline-flex items-center',
                    'hover:bg-muted transition-colors',
                    visibility === 'public'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => setVisibility(v => v === 'public' ? 'private' : 'public')}
                >
                  {visibility === 'public' ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {visibility === 'public' ? 'Public' : 'Private'}
                </button>

                {/* Space indicator badge */}
                <Badge variant="secondary" className="text-[10px] gap-1 ml-1">
                  <Zap className="w-2.5 h-2.5" />
                  Quick
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                {/* Save button */}
                <Button
                  size="sm"
                  className={cn(
                    'h-7 px-3 text-xs gap-1.5',
                    'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                  onClick={handleSave}
                  disabled={!text.trim() || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CornerDownLeft className="w-3 h-3" />
                  )}
                  Save
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setText('');
                    setTitle('');
                    setShowTitle(false);
                    setIsExpanded(false);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="px-4 pb-2">
              <p className="text-[10px] text-muted-foreground/40">
                {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl+'}+Enter to save &middot; Esc to clear
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function generateQuickTitle(text: string): string {
  // Take first ~40 chars and add ellipsis if needed
  const cleaned = text.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 40) return cleaned;
  return cleaned.slice(0, 40).trim() + '…';
}
