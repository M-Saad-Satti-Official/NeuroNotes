'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Image,
  Video,
  File,
  Link2,
  Zap,
  X,
  ShieldOff,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NoteType } from '@/types';

const noteTypeOptions: {
  type: NoteType;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}[] = [
  {
    type: 'text',
    label: 'Text Note',
    description: 'Write rich text content with AI-powered tagging',
    icon: FileText,
    gradient: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10',
  },
  {
    type: 'image',
    label: 'Image Upload',
    description: 'Attach and annotate images or screenshots',
    icon: Image,
    gradient: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10',
  },
  {
    type: 'video',
    label: 'Video Link',
    description: 'Embed or link video content with timestamps',
    icon: Video,
    gradient: 'from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10',
  },
  {
    type: 'document',
    label: 'Document',
    description: 'Attach PDFs, markdown, or other documents',
    icon: File,
    gradient: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10',
  },
  {
    type: 'link',
    label: 'External Link',
    description: 'Save bookmarks with auto-extracted metadata',
    icon: Link2,
    gradient: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10',
  },
  {
    type: 'quick',
    label: 'Quick Note',
    description: 'Capture a fast thought — minimal, distraction-free',
    icon: Zap,
    gradient: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10',
  },
];

export function CreateOptionsModal() {
  const { isCreateModalOpen, closeCreateModal, openEditor } = useUIStore();
  const { permissions } = useAuthStore();

  const handleSelect = (type: NoteType) => {
    closeCreateModal();
    if (type === 'quick') {
      // Quick Note → expand the inline QuickNoteInput, not the full editor
      useUIStore.getState().triggerQuickNote();
    } else {
      openEditor('create', undefined, type);
    }
  };

  return (
    <AnimatePresence>
      {isCreateModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCreateModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">What do you want to create?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a note type to get started
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={closeCreateModal}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content: permission check */}
              {!permissions.canCreateNote ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                    <ShieldOff className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-sm font-medium">Permission Denied</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You don&apos;t have permission to create notes. Contact your administrator.
                  </p>
                </div>
              ) : (
                /* Options grid */
                <div className="grid grid-cols-2 gap-3">
                  {noteTypeOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(option.type)}
                        className={cn(
                          'group flex flex-col items-start gap-2 p-4 rounded-xl border bg-gradient-to-br transition-all duration-200 text-left',
                          option.gradient
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center bg-background/80 border border-border/50',
                          'group-hover:border-border transition-colors'
                        )}>
                          <Icon className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{option.label}</span>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
