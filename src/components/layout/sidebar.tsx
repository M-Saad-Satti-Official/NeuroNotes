'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  FileText,
  Tag,
  Pin,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  Check,
  Shield,
  Layers,
  Plus,
  LogOut,
  User as UserIcon,
  BarChart3,
  Settings,
  Search,
  X,
  UserCircle,
  Globe,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotesStore } from '@/store/notes-store';
import { useTagsStore } from '@/store/tags-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Role } from '@/types';

const roleColors: Record<Role, string> = {
  admin: 'bg-red-500/10 text-red-500',
  editor: 'bg-amber-500/10 text-amber-500',
  viewer: 'bg-blue-500/10 text-blue-500',
};

function SidebarTooltip({ children, label, side = 'right' }: { children: React.ReactNode; label: string; side?: 'right' | 'left' }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={8} className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  count,
  collapsed,
  onClick,
  badgeColor,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  count?: number;
  collapsed: boolean;
  onClick: () => void;
  badgeColor?: string;
}) {
  if (collapsed) {
    return (
      <SidebarTooltip label={`${label}${count !== undefined ? ` (${count})` : ''}`}>
        <Button
          variant={active ? 'secondary' : 'ghost'}
          size="icon"
          className="h-10 w-10 relative"
          onClick={onClick}
        >
          <Icon className="w-4 h-4" />
          {count !== undefined && count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-foreground">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </SidebarTooltip>
    );
  }

  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className="w-full justify-start gap-2.5 h-9 text-sm"
      onClick={onClick}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
      {count !== undefined && (
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
          {count}
        </Badge>
      )}
    </Button>
  );
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, openCreateModal, openAdminPanel, openOverview, openSettings, openProfile, currentView, setView } = useUIStore();
  const { notes, filterTag, setFilterTag } = useNotesStore();
  const { tags, isLoading: tagsLoading, fetchTags } = useTagsStore();
  const { spaces, currentSpaceId, setCurrentSpace, createSpace, fetchSpaces } = useSpacesStore();
  const { user, logout, permissions } = useAuthStore();

  const [tagsPopoverOpen, setTagsPopoverOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceIcon, setNewSpaceIcon] = useState('Folder');
  const [newSpaceColor, setNewSpaceColor] = useState('#6366f1');

  const pinnedCount = notes.filter(n => n.isPinned).length;
  const totalCount = notes.length;
  const totalTags = tags.length;

  // Filtered tags based on search
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags;
    const lower = tagSearch.toLowerCase();
    return tags.filter(t => t.name.toLowerCase().includes(lower));
  }, [tags, tagSearch]);

  // Search is handled by the Header component to avoid double-search conflicts

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleTagClick = (tagName: string) => {
    if (filterTag === tagName) {
      setFilterTag(null);
    } else {
      setFilterTag(tagName);
    }
    setTagsPopoverOpen(false);
  };

  const handleTagsPopoverChange = useCallback((open: boolean) => {
    setTagsPopoverOpen(open);
    if (open) {
      fetchTags();
      setTagSearch('');
    }
  }, [fetchTags]);

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    const name = newSpaceName.trim();
    // Check for duplicate names (case-insensitive)
    if (spaces.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`A space named "${name}" already exists`);
      return;
    }
    const space = await createSpace({
      name: newSpaceName.trim(),
      icon: newSpaceIcon,
      color: newSpaceColor,
      description: '',
    });
    if (space) {
      toast.success(`Space "${space.name}" created`);
      setShowCreateSpaceDialog(false);
      setNewSpaceName('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  const collapsed = !sidebarOpen;
  const isTagFilterActive = filterTag !== null && !filterTag.startsWith('__');

  const accessibleSpaces = permissions.accessibleSpaceIds.length === 0
    ? spaces
    : spaces.filter(s => permissions.accessibleSpaceIds.includes(s.id));

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen bg-card border-r border-border flex-shrink-0"
      >
        {/* Top section: Logo + collapse toggle */}
        <div className="flex items-center justify-between p-3 min-h-[56px] flex-shrink-0">
          <SidebarTooltip label="NeuroNote" side="right">
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'default'}
              className={cn(
                'gap-2.5 h-9',
                collapsed ? 'w-10 px-0' : 'px-2'
              )}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                <Brain className="w-3.5 h-3.5" />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold tracking-tight text-sm overflow-hidden whitespace-nowrap"
                >
                  NeuroNote
                </motion.span>
              )}
            </Button>
          </SidebarTooltip>

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="px-2 mb-1">
            <SidebarTooltip label="Expand sidebar" side="right">
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-9"
                onClick={toggleSidebar}
              >
                <PanelLeftOpen className="w-4 h-4" />
              </Button>
            </SidebarTooltip>
          </div>
        )}

        {!collapsed && <Separator />}

        {/* Scrollable middle section */}
        <ScrollArea className="flex-1 min-h-0">
          {/* Navigation items */}
          <div className={cn('flex flex-col gap-0.5', collapsed ? 'px-2 pt-1' : 'px-2 py-2')}>
          <NavItem
            icon={FileText}
            label="All Notes"
            active={filterTag === null}
            count={totalCount}
            collapsed={collapsed}
            onClick={() => { setView('notes'); setFilterTag(null); }}
          />
          <NavItem
            icon={Pin}
            label="Pinned"
            active={filterTag === '__pinned__'}
            count={pinnedCount}
            collapsed={collapsed}
            onClick={() => { setView('notes'); setFilterTag('__pinned__'); }}
          />
          <NavItem
            icon={Clock}
            label="Recent"
            active={filterTag === '__recent__'}
            collapsed={collapsed}
            onClick={() => { setView('notes'); setFilterTag('__recent__'); }}
          />

          {permissions.canViewOverview && (
            <NavItem
              icon={BarChart3}
              label="Overview"
              active={currentView === 'overview'}
              collapsed={collapsed}
              onClick={openOverview}
            />
          )}

          {permissions.canViewAdminPanel && (
            <NavItem
              icon={Shield}
              label="Admin"
              active={currentView === 'admin'}
              collapsed={collapsed}
              onClick={openAdminPanel}
            />
          )}

          {/* Tags nav item — opens popover to the right */}
          <Popover open={tagsPopoverOpen} onOpenChange={handleTagsPopoverChange}>
            <PopoverTrigger asChild>
              {collapsed ? (
                <SidebarTooltip label={`Tags${totalTags > 0 ? ` (${totalTags})` : ''}`} side="right">
                  <Button
                    variant={isTagFilterActive ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-10 w-10 relative"
                  >
                    <Tag className="w-4 h-4" />
                    {isTagFilterActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                    {totalTags > 0 && !isTagFilterActive && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-foreground">
                        {totalTags > 99 ? '99+' : totalTags}
                      </span>
                    )}
                  </Button>
                </SidebarTooltip>
              ) : (
                <Button
                  variant={isTagFilterActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2.5 h-9 text-sm"
                >
                  <Tag className="w-4 h-4 flex-shrink-0" />
                  Tags
                  <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
                    {totalTags}
                  </Badge>
                  {isTagFilterActive && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Button>
              )}
            </PopoverTrigger>
            <PopoverContent
              side="right"
              sideOffset={8}
              align="start"
              className="p-0 w-auto"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="w-56 p-0">
                {/* Header */}
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tags
                    </span>
                    {filterTag && !filterTag.startsWith('__') && (
                      <button
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setFilterTag(null)}
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Tag search */}
                <div className="px-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      className="pl-7 h-7 text-xs"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Tag list */}
                <ScrollArea className="max-h-[340px]">
                  {tagsLoading ? (
                    <div className="p-2 space-y-1">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 flex-1 rounded" />
                          <Skeleton className="h-4 w-6 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : filteredTags.length === 0 ? (
                    <div className="p-4 text-center">
                      <Tag className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {tagSearch ? 'No tags match' : 'No tags yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-1">
                      {filteredTags.map(tag => {
                        const isActive = filterTag === tag.name;
                        return (
                          <button
                            key={tag.id}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors group',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-accent text-foreground'
                            )}
                            onClick={() => handleTagClick(tag.name)}
                          >
                            <div className={cn(
                              'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border group-hover:border-muted-foreground/40'
                            )}>
                              {isActive && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span className={cn(
                              'text-sm flex-1 truncate',
                              isActive ? 'font-medium' : 'font-normal'
                            )}>
                              {tag.name}
                            </span>
                            <span className={cn(
                              'text-[10px] tabular-nums flex-shrink-0',
                              isActive ? 'text-primary/70' : 'text-muted-foreground'
                            )}>
                              {tag.usageCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Spaces section */}
        {!collapsed && (
          <>
            <Separator />
            <div className="px-2 py-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Spaces
                  </span>
                </div>
                {permissions.canCreateSpaces && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowCreateSpaceDialog(true)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                )}
              </div>
              <div className="space-y-0.5">
                {/* All Spaces option */}
                <Button
                  variant={currentSpaceId === null ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2.5 h-8 text-xs"
                  onClick={() => setCurrentSpace(null)}
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-muted/50 flex-shrink-0">
                    <Layers className="w-3 h-3 text-muted-foreground" />
                  </div>
                  All Spaces
                </Button>
                {accessibleSpaces.map(space => {
                  const spaceNoteCount = notes.filter(n => n.spaceId === space.id).length;
                  return (
                    <Button
                      key={space.id}
                      variant={currentSpaceId === space.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2.5 h-8 text-xs"
                      onClick={() => setCurrentSpace(space.id)}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: space.color + '20', color: space.color }}
                      >
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: space.color }} />
                      </div>
                      {space.name}
                      <span className="ml-auto flex items-center gap-1.5">
                        {space.visibility === 'public' ? (
                          <Globe className="w-3 h-3 text-muted-foreground/50" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground/50" />
                        )}
                        <span className="text-[10px] text-muted-foreground">{spaceNoteCount}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Collapsed: Spaces as tooltip popover */}
        {collapsed && (
          <>
            <Separator />
            <div className="px-2 py-1">
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarTooltip label="Spaces" side="right">
                    <Button
                      variant={currentSpaceId !== null ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-10 w-10 relative"
                    >
                      <Layers className="w-4 h-4" />
                      {currentSpaceId && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </Button>
                  </SidebarTooltip>
                </PopoverTrigger>
                <PopoverContent side="right" sideOffset={8} align="start" className="p-0 w-48">
                  <div className="p-2">
                    <div className="px-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spaces</span>
                    </div>
                    <div className="space-y-0.5">
                      <button
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                          currentSpaceId === null ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                        )}
                        onClick={() => { setCurrentSpace(null); }}
                      >
                        <Layers className="w-3 h-3" />
                        All Spaces
                      </button>
                      {accessibleSpaces.map(space => (
                        <button
                          key={space.id}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                            currentSpaceId === space.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                          )}
                          onClick={() => setCurrentSpace(space.id)}
                        >
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: space.color }} />
                          {space.name}
                          {space.visibility === 'public' ? (
                            <Globe className="w-2.5 h-2.5 ml-auto text-muted-foreground/50" />
                          ) : (
                            <Lock className="w-2.5 h-2.5 ml-auto text-muted-foreground/50" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}

        </ScrollArea>

        {/* Bottom: User info + AI badge */}
        <div className="mt-auto">
          {!collapsed && <Separator />}
          {user && (
            <div className={cn('flex items-center', collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2')}>
              {collapsed ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="right" sideOffset={8} className="w-48 p-2">
                    <div className="px-2 py-1 mb-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className={cn('text-[10px] mt-1', roleColors[user.role])}>
                        {user.role}
                      </Badge>
                    </div>
                    <Separator className="my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors"
                      onClick={() => { openProfile(); }}
                    >
                      <UserCircle className="w-3 h-3" />
                      Profile
                    </button>
                    {permissions.canManageAppSettings && (
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors"
                      onClick={() => { openSettings(); }}
                    >
                      <Settings className="w-3 h-3" />
                      Settings
                    </button>
                    )}
                    <Separator className="my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent text-destructive transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-3 h-3" />
                      Log Out
                    </button>
                  </PopoverContent>
                </Popover>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 flex-1 min-w-0 text-left hover:bg-accent rounded-lg p-1.5 -mx-1.5 transition-colors">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{user.name}</p>
                        <Badge variant="outline" className={cn('text-[9px] px-1 py-0', roleColors[user.role])}>
                          {user.role}
                        </Badge>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="right" sideOffset={8} className="w-52 p-2">
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className={cn('text-[10px] mt-1', roleColors[user.role])}>
                        {user.role}
                      </Badge>
                    </div>
                    <Separator className="my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors"
                      onClick={() => { openProfile(); }}
                    >
                      <UserCircle className="w-3 h-3" />
                      Profile
                    </button>
                    {permissions.canManageAppSettings && (
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors"
                      onClick={() => { openSettings(); }}
                    >
                      <Settings className="w-3 h-3" />
                      Settings
                    </button>
                    )}
                    <Separator className="my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent text-destructive transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-3 h-3" />
                      Log Out
                    </button>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}

        </div>
      </motion.aside>

      {/* Create Space Dialog */}
      <Dialog open={showCreateSpaceDialog} onOpenChange={setShowCreateSpaceDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., Research, Side Project"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                  <button
                    key={c}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-colors',
                      newSpaceColor === c ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewSpaceColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSpaceDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSpace} disabled={!newSpaceName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
