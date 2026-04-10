'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2 } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { Button } from '@/components/ui/button';

interface AITitleGeneratorProps {
  content: string;
  currentTitle: string;
  onTitleGenerated: (title: string) => void;
}

export function AITitleGenerator({ content, currentTitle, onTitleGenerated }: AITitleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!content.trim() || isGenerating) return;
    setIsGenerating(true);
    setSuggestedTitle('');
    try {
      const title = await aiService.generateTitle(content);
      setSuggestedTitle(title);
    } catch {
      // silent
    } finally {
      setIsGenerating(false);
    }
  }, [content, isGenerating]);

  const handleApply = () => {
    if (suggestedTitle) {
      onTitleGenerated(suggestedTitle);
      setSuggestedTitle('');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={handleGenerate}
        disabled={!content.trim() || isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Wand2 className="w-3.5 h-3.5" />
        )}
        AI Title
      </Button>
      {suggestedTitle && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1.5"
        >
          <span
            className="text-xs text-primary cursor-pointer hover:underline"
            onClick={handleApply}
          >
            {suggestedTitle}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10"
            onClick={handleApply}
          >
            Apply
          </Button>
        </motion.div>
      )}
    </div>
  );
}
