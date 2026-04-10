'use client';

import { motion } from 'framer-motion';
import { FileText, SearchSlash, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';

interface EmptyStateProps {
  isSearch?: boolean;
  filterTag?: string | null;
}

export function EmptyState({ isSearch, filterTag }: EmptyStateProps) {
  const { openCreateModal } = useUIStore();

  const getIcon = () => {
    if (isSearch) return <SearchSlash className="w-12 h-12 text-muted-foreground/50" />;
    if (filterTag && filterTag !== '__pinned__' && filterTag !== '__recent__')
      return <Tag className="w-12 h-12 text-muted-foreground/50" />;
    return <Sparkles className="w-12 h-12 text-muted-foreground/50" />;
  };

  const getTitle = () => {
    if (isSearch) return 'No notes found';
    if (filterTag === '__pinned__') return 'No pinned notes';
    if (filterTag === '__recent__') return 'No recent notes';
    if (filterTag) return `No notes with "${filterTag}"`;
    return 'No notes yet';
  };

  const getDescription = () => {
    if (isSearch) return 'Try a different search term or clear your search.';
    if (filterTag) return 'Try selecting a different tag or create a new note.';
    return 'Create your first note to get started. Your ideas, organized with AI.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      {getIcon()}

      <h3 className="text-lg font-semibold mt-4">{getTitle()}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {getDescription()}
      </p>

      {!isSearch && (
        <Button
          className="mt-6 gap-2"
          onClick={() => openCreateModal()}
        >
          <FileText className="w-4 h-4" />
          Create your first note
        </Button>
      )}
    </motion.div>
  );
}
