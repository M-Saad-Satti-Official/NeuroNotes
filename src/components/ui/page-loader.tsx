'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-primary/30 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-primary/60" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </motion.div>
    </div>
  );
}
