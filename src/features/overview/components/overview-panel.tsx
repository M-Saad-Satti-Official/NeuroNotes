'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  FileText,
  Image,
  Video,
  File,
  Link2,
  Zap,
  Globe,
  Lock,
  Tag,
  Users,
  Pin,
  Clock,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useNotesStore } from '@/store/notes-store';
import { useTagsStore } from '@/store/tags-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { NoteType, OverviewStats } from '@/types';
import { cn } from '@/lib/utils';

const typeIcons: Record<NoteType, React.ElementType> = {
  text: FileText,
  image: Image,
  video: Video,
  link: Link2,
  document: File,
  quick: Zap,
};

const typeLabels: Record<NoteType, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  link: 'Links',
  document: 'Docs',
  quick: 'Quick',
};

const typeColors: Record<NoteType, string> = {
  text: 'bg-blue-500/10 text-blue-500',
  image: 'bg-purple-500/10 text-purple-500',
  video: 'bg-red-500/10 text-red-500',
  link: 'bg-emerald-500/10 text-emerald-500',
  document: 'bg-amber-500/10 text-amber-500',
  quick: 'bg-cyan-500/10 text-cyan-500',
};

const typeBarColors: Record<NoteType, string> = {
  text: 'bg-blue-500',
  image: 'bg-purple-500',
  video: 'bg-red-500',
  link: 'bg-emerald-500',
  document: 'bg-amber-500',
  quick: 'bg-cyan-500',
};

function getDayLabel(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

export function OverviewPanel() {
  const { isOverviewOpen, closeOverview } = useUIStore();
  const { notes } = useNotesStore();
  const { tags } = useTagsStore();
  const { spaces } = useSpacesStore();
  const { user } = useAuthStore();
  const { getOverviewStats } = useNotesStore();

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Compute activity data from notes
  const activityData = useMemo(() => {
    const days: { date: Date; label: string; count: number; notes: typeof notes }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayNotes = notes.filter(n => n.createdAt >= dayStart && n.createdAt < dayEnd);
      days.push({
        date: dayStart,
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : getDayLabel(dayStart),
        count: dayNotes.length,
        notes: dayNotes,
      });
    }
    return days;
  }, [notes]);

  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  // Compute most productive day
  const mostProductiveDay = useMemo(() => {
    const max = activityData.reduce((a, b) => a.count > b.count ? a : b);
    return max.count > 0 ? max.label : null;
  }, [activityData]);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    const overviewStats = await getOverviewStats();
    // Enrich with space names and active users
    const enriched: OverviewStats = {
      ...overviewStats,
      notesBySpace: spaces.map(space => ({
        spaceId: space.id,
        spaceName: space.name,
        count: notes.filter(n => n.spaceId === space.id).length,
      })),
      activeUsersCount: user ? 1 : 0,
    };
    setStats(enriched);
    setIsLoading(false);
  }, [getOverviewStats, notes, spaces, user]);

  useEffect(() => {
    if (isOverviewOpen) {
      loadStats();
    }
  }, [isOverviewOpen, loadStats]);

  const maxTypeCount = stats ? Math.max(...Object.values(stats.notesByType), 1) : 1;

  return (
    <Dialog open={isOverviewOpen} onOpenChange={(open) => !open && closeOverview()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Overview</DialogTitle>
              <DialogDescription>
                Analytics and insights from your knowledge base
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto max-h-[65vh] px-1">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Total Notes"
                  value={stats.totalNotes}
                  icon={FileText}
                  color="text-blue-500"
                  bg="bg-blue-500/10"
                />
                <StatCard
                  label="Public"
                  value={stats.publicNotes}
                  icon={Globe}
                  color="text-emerald-500"
                  bg="bg-emerald-500/10"
                />
                <StatCard
                  label="Private"
                  value={stats.privateNotes}
                  icon={Lock}
                  color="text-amber-500"
                  bg="bg-amber-500/10"
                />
                <StatCard
                  label="Tags"
                  value={stats.totalTags}
                  icon={Tag}
                  color="text-purple-500"
                  bg="bg-purple-500/10"
                />
              </div>

              {/* Activity Chart — Last 7 Days */}
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Activity — Last 7 Days
                  </h3>
                  {mostProductiveDay && (
                    <span className="text-[10px] text-muted-foreground">
                      Most active: {mostProductiveDay}
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-2 h-32">
                  {activityData.map((day, i) => {
                    const height = day.count > 0 ? Math.max((day.count / maxActivity) * 100, 8) : 4;
                    const totalCreated = activityData.reduce((sum, d) => sum + d.count, 0);
                    const pct = totalCreated > 0 ? Math.round((day.count / totalCreated) * 100) : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="relative w-full flex justify-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                            className={cn(
                              'w-full max-w-[32px] rounded-md transition-colors',
                              day.count > 0
                                ? i === activityData.length - 1
                                  ? 'bg-blue-500'
                                  : 'bg-blue-500/60'
                                : 'bg-muted'
                            )}
                            style={{ minHeight: 4 }}
                          />
                          {day.count > 0 && (
                            <span className="absolute -top-5 text-[10px] font-medium text-muted-foreground tabular-nums">
                              {day.count}
                            </span>
                          )}
                        </div>
                        <span className={cn(
                          'text-[10px] text-center leading-tight',
                          i === activityData.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                        )}>
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {activityData.every(d => d.count === 0) && (
                  <p className="text-xs text-muted-foreground text-center mt-2">No notes created in the last 7 days</p>
                )}
              </div>

              {/* Notes by Type */}
              <div className="p-4 rounded-xl border bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  Notes by Type
                </h3>
                <div className="space-y-2.5">
                  {(Object.entries(stats.notesByType) as [NoteType, number][])
                    .filter(([, count]) => count > 0)
                    .map(([type, count]) => {
                      const Icon = typeIcons[type];
                      const width = (count / maxTypeCount) * 100;
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-6 h-6 rounded flex items-center justify-center', typeColors[type])}>
                                <Icon className="w-3 h-3" />
                              </div>
                              <span>{typeLabels[type]}</span>
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={cn('h-full rounded-full', typeBarColors[type])}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Notes by Space */}
              <div className="p-4 rounded-xl border bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  Notes by Space
                </h3>
                <div className="space-y-1.5">
                  {stats.notesBySpace.map(space => {
                    const sp = spaces.find(s => s.id === space.spaceId);
                    return (
                      <div key={space.spaceId} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: sp?.color || '#888' }}
                          />
                          <span className="text-sm">{space.spaceName}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {space.count}
                        </Badge>
                      </div>
                    );
                  })}
                  {stats.notesBySpace.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">No spaces</p>
                  )}
                </div>
              </div>

              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border bg-card">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Pin className="w-4 h-4 text-muted-foreground" />
                    Pinned Notes
                  </h3>
                  <p className="text-2xl font-bold">{stats.pinnedNotes}</p>
                  <p className="text-[11px] text-muted-foreground">Important notes</p>
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Created (7d)
                  </h3>
                  <p className="text-2xl font-bold">{stats.recentNotesCount}</p>
                  <p className="text-[11px] text-muted-foreground">Last 7 days</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-3 rounded-xl border bg-card">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
