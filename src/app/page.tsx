'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/ui-store';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { useNotesStore } from '@/store/notes-store';
import { useSpacesStore } from '@/store/spaces-store';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NotesGrid } from '@/features/notes/components/notes-grid';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { NoteViewer } from '@/features/notes/components/note-viewer';
import { CreateOptionsModal } from '@/features/notes/components/create-options-modal';
import { QuickAddButton } from '@/features/notes/components/quick-add-button';
import { QuickNoteInput } from '@/features/notes/components/quick-note-input';
import { AdminPage } from '@/features/admin/components/admin-page';
import { OverviewPage } from '@/features/overview/components/overview-page';
import { ProfilePage } from '@/features/profile/components/profile-page';
import { SettingsPage } from '@/features/settings/components/settings-page';
import { AuthPage } from '@/features/auth/components/auth-page';
import { PageLoader } from '@/components/page-loader';

function NotesContent() {
  const { filterTag } = useNotesStore();
  const { currentSpaceId, spaces, setCurrentSpace } = useSpacesStore();

  const currentSpace = currentSpaceId ? spaces.find(s => s.id === currentSpaceId) : null;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Space indicator */}
      {currentSpace && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setCurrentSpace(null)}
            >
              All Spaces
            </button>
            <span className="text-xs text-muted-foreground">/</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentSpace.color }} />
              <span className="text-xs font-medium">{currentSpace.name}</span>
            </div>
          </div>
          {currentSpace.description && (
            <p className="text-xs text-muted-foreground mt-1">{currentSpace.description}</p>
          )}
        </div>
      )}

      {filterTag === '__pinned__' && (
        <div className="mb-6">
          <h1 className="text-xl font-bold">Pinned Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your important notes, always within reach.
          </p>
        </div>
      )}

      {filterTag === '__recent__' && (
        <div className="mb-6">
          <h1 className="text-xl font-bold">Recent Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your latest notes, sorted by creation time.
          </p>
        </div>
      )}

      {typeof filterTag === 'string' && !filterTag.startsWith('__') && (
        <div className="mb-6">
          <h1 className="text-xl font-bold">
            <span className="text-muted-foreground font-normal mr-2">Filtered by</span>
            {filterTag}
          </h1>
        </div>
      )}

      {!filterTag && !currentSpace && (
        <div className="mb-6">
          <h1 className="text-xl font-bold">All Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personal knowledge base, powered by AI.
          </p>
        </div>
      )}

      {!filterTag && currentSpace && (
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: currentSpace.color }} />
            {currentSpace.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Notes in this space.
          </p>
        </div>
      )}

      <QuickNoteInput />
      <NotesGrid />
    </div>
  );
}

function NotesApp() {
  const { refreshAll } = useNotes();
  const { currentView, isEditorOpen, editorMode, editingNoteId, editingNoteType } = useUIStore();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileNav />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto">
          {currentView === 'admin' ? <AdminPage /> : currentView === 'settings' ? <SettingsPage /> : currentView === 'profile' ? <ProfilePage /> : currentView === 'overview' ? <OverviewPage /> : <NotesContent />}
        </div>
      </main>

      {/* Modals & Overlays */}
      <NoteViewer />
      <NoteEditor key={`${editorMode}-${editingNoteId ?? 'new'}-${editingNoteType}`} />
      <CreateOptionsModal />
      <QuickAddButton />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <NotesApp />;
}
