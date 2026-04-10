'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AITagGeneratorProps {
  content: string;
  onTagsGenerated: (tags: string[]) => void;
  existingTags: string[];
}

export function AITagGenerator({ content, onTagsGenerated, existingTags }: AITagGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [selectedAITags, setSelectedAITags] = useState<string[]>([]);

  const handleGenerate = useCallback(async () => {
    if (!content.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const tags = await aiService.generateTags(content);
      const newTags = tags.filter(t => !existingTags.includes(t));
      setGeneratedTags(newTags);
      setSelectedAITags([]);
    } catch {
      // silently fail
    } finally {
      setIsGenerating(false);
    }
  }, [content, isGenerating, existingTags]);

  const toggleTag = (tag: string) => {
    setSelectedAITags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const applyTags = () => {
    onTagsGenerated(selectedAITags);
    setGeneratedTags([]);
    setSelectedAITags([]);
  };

  useEffect(() => {
    setGeneratedTags([]);
    setSelectedAITags([]);
  }, [content]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleGenerate}
          disabled={!content.trim() || isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isGenerating ? 'Generating...' : 'AI Suggest Tags'}
        </Button>
      </div>

      <AnimatePresence>
        {generatedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-muted/50 border border-border">
              {generatedTags.map(tag => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant={selectedAITags.includes(tag) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer text-xs transition-all',
                      selectedAITags.includes(tag) && 'shadow-sm'
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {selectedAITags.includes(tag) && <Plus className="w-2.5 h-2.5 mr-0.5" />}
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {selectedAITags.length > 0 && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-6 text-xs ml-1"
                  onClick={applyTags}
                >
                  Apply ({selectedAITags.length})
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
