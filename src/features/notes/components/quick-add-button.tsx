'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function QuickAddButton() {
  const { openCreateModal } = useUIStore();
  const { permissions } = useAuthStore();

  if (!permissions.canCreateNote) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5, type: 'spring', stiffness: 200 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg shadow-black/20',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'group relative overflow-hidden'
        )}
        onClick={openCreateModal}
      >
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full animate-fab-pulse bg-primary/30" />

        <Plus className="w-6 h-6 relative z-10 transition-transform group-hover:rotate-90 duration-200" />
      </Button>
    </motion.div>
  );
}
