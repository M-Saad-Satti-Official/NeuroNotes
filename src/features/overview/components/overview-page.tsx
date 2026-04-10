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
  Pin,
  Clock,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useNotesStore } from '@/store/notes-store';
import { useTagsStore } from '@/store/tags-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

export function OverviewPage() {
  const { notes } = useNotesStore();
  const { tags } = useTagsStore();
  const { spaces } = useSpacesStore();
  const { user } = useAuthStore();
  const { getOverviewStats } = useNotesStore();

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Compute activity data from notes
  const activityData = useMemo(() => {
    const days: { date: Date; label: string; count: number }[] = [];
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
    loadStats();
  }, [loadStats]);

  const maxTypeCount = stats ? Math.max(...Object.values(stats.notesByType), 1) : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 max-w-6xl mx-auto w-full"
    >
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">
              Analytics and insights from your knowledge base
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Activity — Last 7 Days
              </h2>
              {mostProductiveDay && (
                <span className="text-xs text-muted-foreground">
                  Most active: {mostProductiveDay}
                </span>
              )}
            </div>
            <div className="flex items-end gap-3 h-40">
              {activityData.map((day, i) => {
                const height = day.count > 0 ? Math.max((day.count / maxActivity) * 100, 8) : 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                        className={cn(
                          'w-full max-w-[40px] rounded-lg transition-colors',
                          day.count > 0
                            ? i === activityData.length - 1
                              ? 'bg-blue-500'
                              : 'bg-blue-500/60'
                            : 'bg-muted'
                        )}
                        style={{ minHeight: 6 }}
                      />
                      {day.count > 0 && (
                        <span className="absolute -top-6 text-xs font-medium text-muted-foreground tabular-nums">
                          {day.count}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      'text-[11px] text-center leading-tight',
                      i === activityData.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {activityData.every(d => d.count === 0) && (
              <p className="text-sm text-muted-foreground text-center mt-3">No notes created in the last 7 days</p>
            )}
          </div>

          {/* Two-column section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Notes by Type */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Notes by Type
              </h2>
              <div className="space-y-3">
                {(Object.entries(stats.notesByType) as [NoteType, number][])
                  .filter(([, count]) => count > 0)
                  .map(([type, count]) => {
                    const Icon = typeIcons[type];
                    const width = (count / maxTypeCount) * 100;
                    return (
                      <div key={type} className="space-y-1.5">
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
                {(Object.entries(stats.notesByType) as [NoteType, number][]).every(([, count]) => count === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </div>
            </div>

            {/* Notes by Space */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Notes by Space
              </h2>
              <div className="space-y-2">
                {stats.notesBySpace.map(space => {
                  const sp = spaces.find(s => s.id === space.spaceId);
                  const maxSpaceCount = Math.max(...stats.notesBySpace.map(s => s.count), 1);
                  const width = (space.count / maxSpaceCount) * 100;
                  return (
                    <div key={space.spaceId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: sp?.color || '#888' }}
                          />
                          <span className="truncate">{space.spaceName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{space.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: sp?.color || '#888' }}
                        />
                      </div>
                    </div>
                  );
                })}
                {stats.notesBySpace.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No spaces</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Pin className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pinned</h3>
              </div>
              <p className="text-3xl font-bold">{stats.pinnedNotes}</p>
              <p className="text-xs text-muted-foreground mt-1">Important notes</p>
            </div>
            <div className="p-5 rounded-xl border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created (7d)</h3>
              </div>
              <p className="text-3xl font-bold">{stats.recentNotesCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </div>
            <div className="p-5 rounded-xl border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spaces</h3>
              </div>
              <p className="text-3xl font-bold">{spaces.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Active spaces</p>
            </div>
            <div className="p-5 rounded-xl border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Tags</h3>
              </div>
              <p className="text-3xl font-bold">
                {stats.totalNotes > 0 ? (stats.totalTags / stats.totalNotes).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per note</p>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-xl border bg-card"
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <p className="text-3xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
