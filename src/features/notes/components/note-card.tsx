'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Trash2, Clock, Edit3, Globe, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  index: number;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, index, viewMode, onClick, onEdit, onPin, onDelete }: NoteCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allTags = [...new Set([...note.manualTags, ...note.aiTags])];
  const contentPreview = note.content.slice(0, 180).trim();
  const timeAgo = formatDistanceToNow(new Date(note.createdAt), { addSuffix: true });

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        className={cn(
          'group flex items-start gap-4 p-4 rounded-xl border border-border',
          'bg-card hover:bg-accent/50 cursor-pointer transition-colors',
          'hover:border-border/80'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 fill-amber-500" />}
              {note.visibility === 'public' && <Globe className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
              <h3 className="font-semibold text-sm truncate">{note.title}</h3>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditClick}>
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePinClick}>
                <Pin className={cn('w-3.5 h-3.5', note.isPinned ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', showDeleteConfirm && 'text-destructive hover:text-destructive')}
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{contentPreview}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex flex-wrap gap-1">
              {allTags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {tag}
                </Badge>
              ))}
              {allTags.length > 4 && (
                <span className="text-[10px] text-muted-foreground">+{allTags.length - 4}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col p-5 rounded-xl border border-border',
        'bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200',
        'hover:border-border/80 hover:shadow-lg hover:shadow-black/5'
      )}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        </div>
      )}

      {/* Visibility indicator */}
      {note.visibility === 'private' && (
        <div className="absolute top-2 left-2">
          <Lock className="w-3 h-3 text-amber-500/50" />
        </div>
      )}

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditClick}>
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        {!note.isPinned && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePinClick}>
            <Pin className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7', showDeleteConfirm && 'text-destructive hover:text-destructive')}
          onClick={handleDeleteClick}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm leading-snug pr-6 line-clamp-2">
        {note.title}
      </h3>

      {/* Content preview */}
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
        {contentPreview}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {allTags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {tag}
          </Badge>
        ))}
        {allTags.length > 3 && (
          <span className="text-[10px] text-muted-foreground self-center">+{allTags.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
        <Clock className="w-3 h-3" />
        {timeAgo}
        {note.visibility === 'public' && (
          <>
            <span className="mx-1">·</span>
            <Globe className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500">Public</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
