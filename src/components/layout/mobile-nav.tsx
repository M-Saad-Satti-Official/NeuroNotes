'use client';

import { useState, useEffect } from 'react';
import { Brain, FileText, Tag, Pin, Clock, Search, Layers, Shield, LogOut, BarChart3, Settings, UserCircle, Globe, Lock } from 'lucide-react';
import { useNotesStore } from '@/store/notes-store';
import { useTagsStore } from '@/store/tags-store';
import { useUIStore } from '@/store/ui-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { useDebounce } from '@/features/notes/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

export function MobileNav() {
  const { isMobileSidebarOpen, toggleMobileSidebar, openCreateModal, openAdminPanel, openOverview, openSettings, openProfile, currentView } = useUIStore();
  const { notes, searchQuery, filterTag, setFilterTag, searchNotes } = useNotesStore();
  const { tags } = useTagsStore();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpacesStore();
  const { user, logout, permissions } = useAuthStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  const pinnedCount = notes.filter(n => n.isPinned).length;
  const totalCount = notes.length;

  const accessibleSpaces = permissions.accessibleSpaceIds.length === 0
    ? spaces
    : spaces.filter(s => permissions.accessibleSpaceIds.includes(s.id));

  // Sync debounced value to store
  useEffect(() => {
    searchNotes(debouncedSearch);
  }, [debouncedSearch, searchNotes]);

  const handleTagClick = (tagName: string) => {
    if (filterTag === tagName) {
      setFilterTag(null);
    } else {
      setFilterTag(tagName);
    }
    toggleMobileSidebar();
  };

  const handleNavClick = (tag: string | null) => {
    setFilterTag(tag);
    toggleMobileSidebar();
  };

  const handleSpaceClick = (spaceId: string | null) => {
    setCurrentSpace(spaceId);
    toggleMobileSidebar();
  };

  const handleLogout = async () => {
    await logout();
    toggleMobileSidebar();
    toast.success('Logged out');
  };

  return (
    <Sheet open={isMobileSidebarOpen} onOpenChange={toggleMobileSidebar}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Brain className="w-4 h-4" />
            </div>
            <SheetTitle className="text-lg font-bold tracking-tight">
              NeuroNote
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* User info */}
        {user && (
          <>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    {user.role}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLogout}>
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8 h-9 text-sm"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="px-3 py-2 space-y-1">
            <Button
              variant={filterTag === null ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2.5 h-10 text-sm"
              onClick={() => handleNavClick(null)}
            >
              <FileText className="w-4 h-4" />
              All Notes
              <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
                {totalCount}
              </Badge>
            </Button>

            <Button
              variant={filterTag === '__pinned__' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2.5 h-10 text-sm"
              onClick={() => handleNavClick('__pinned__')}
            >
              <Pin className="w-4 h-4" />
              Pinned
              <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
                {pinnedCount}
              </Badge>
            </Button>

            <Button
              variant={filterTag === '__recent__' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2.5 h-10 text-sm"
              onClick={() => handleNavClick('__recent__')}
            >
              <Clock className="w-4 h-4" />
              Recent
            </Button>
          </div>

          <Separator className="mx-4" />

          {/* Spaces */}
          <div className="px-3 py-2 space-y-1">
            <div className="flex items-center gap-2 px-2 mb-1">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Spaces
              </span>
            </div>
            <Button
              variant={currentSpaceId === null ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2.5 h-9 text-xs"
              onClick={() => handleSpaceClick(null)}
            >
              All Spaces
            </Button>
            {accessibleSpaces.map(space => (
              <Button
                key={space.id}
                variant={currentSpaceId === space.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2.5 h-9 text-xs"
                onClick={() => handleSpaceClick(space.id)}
              >
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: space.color }} />
                {space.name}
                {space.visibility === 'public' ? (
                  <Globe className="w-3 h-3 ml-auto text-muted-foreground/50" />
                ) : (
                  <Lock className="w-3 h-3 ml-auto text-muted-foreground/50" />
                )}
              </Button>
            ))}
          </div>

          <Separator className="mx-4" />

          {/* Tags */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </span>
            </div>
            <ScrollArea className="max-h-[40vh]">
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={filterTag === tag.name ? 'default' : 'outline'}
                    className="cursor-pointer text-xs hover:bg-accent transition-colors"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name}
                    <span className="ml-1 text-muted-foreground">
                      {tag.usageCount}
                    </span>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Profile & Settings (under user section) */}
          <div className="px-3 py-1">
            <Button
              variant={currentView === 'profile' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2.5 h-9 text-sm"
              onClick={() => { openProfile(); toggleMobileSidebar(); }}
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </Button>
            {permissions.canManageAppSettings && (
              <Button
                variant={currentView === 'settings' ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2.5 h-9 text-sm"
                onClick={() => { openSettings(); toggleMobileSidebar(); }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            )}
          </div>

          {/* Overview */}
          {permissions.canViewOverview && (
            <>
              <Separator className="mx-4" />
              <div className="px-3 py-2">
                <Button
                  variant={currentView === 'overview' ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2.5 h-10 text-sm"
                  onClick={() => { openOverview(); toggleMobileSidebar(); }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </Button>
              </div>
            </>
          )}

          {/* Admin */}
          {permissions.canViewAdminPanel && (
            <>
              <Separator className="mx-4" />
              <div className="px-3 py-2">
                <Button
                  variant={currentView === 'admin' ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2.5 h-10 text-sm"
                  onClick={() => { openAdminPanel(); toggleMobileSidebar(); }}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </div>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
