'use client';

import { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, ChevronDown, PanelLeft, Sun, Moon, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNotesStore } from '@/store/notes-store';
import { useUIStore } from '@/store/ui-store';
import { useDebounce } from '@/features/notes/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { sortBy, setSortBy, viewMode, setViewMode, searchQuery, searchNotes, notes } = useNotesStore();
  const { toggleMobileSidebar } = useUIStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced value to store
  useEffect(() => {
    searchNotes(debouncedSearch);
  }, [debouncedSearch, searchNotes]);

  const noteCount = notes.length;


  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'A to Z' },
  ];

  const handleClearSearch = () => {
    setLocalSearch('');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border md:px-6">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9"
        onClick={toggleMobileSidebar}
        aria-label="Open menu"
      >
        <PanelLeft className="w-5 h-5" />
      </Button>

      {/* Search bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          className="pl-8 pr-8 h-9 text-sm bg-muted/50 border-transparent focus:border-border"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClearSearch}
          >
            <span className="text-xs">✕</span>
          </button>
        )}
      </div>

      {/* Note count indicator */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
        <FileText className="w-3.5 h-3.5" />
        <span className="tabular-nums">{noteCount}</span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-1.5 text-sm text-muted-foreground">
              <span className="hidden sm:inline">
                {sortOptions.find(s => s.value === sortBy)?.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(sortBy === option.value && 'bg-accent')}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle */}
        <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('list')}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
