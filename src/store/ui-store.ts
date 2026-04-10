import { create } from 'zustand';
import type { NoteType } from '@/types';

export type AppView = 'notes' | 'overview' | 'settings' | 'admin' | 'profile';

interface UIState {
  // Current view
  currentView: AppView;
  // Editor
  isEditorOpen: boolean;
  editorMode: 'create' | 'edit';
  editingNoteId: string | null;
  editingNoteType: NoteType;
  isViewingNote: boolean;
  viewingNoteId: string | null;
  // Create modal
  isCreateModalOpen: boolean;
  // Quick note inline trigger (set by create-options-modal, consumed by QuickNoteInput)
 isQuickNoteTriggered: boolean;
  triggerQuickNote: () => void;
  consumeQuickNoteTrigger: () => void;
  // Admin panel
  isAdminPanelOpen: boolean;
  // Sidebar
  sidebarOpen: boolean;
  isMobileSidebarOpen: boolean;

  openEditor: (mode?: 'create' | 'edit', noteId?: string, noteType?: NoteType) => void;
  closeEditor: () => void;
  openViewer: (noteId: string) => void;
  closeViewer: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openAdminPanel: () => void;
  closeAdminPanel: () => void;
  openOverview: () => void;
  closeOverview: () => void;
  openSettings: () => void;
  openProfile: () => void;
  setView: (view: AppView) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'notes',
  isEditorOpen: false,
  editorMode: 'create',
  editingNoteId: null,
  editingNoteType: 'text',
  isViewingNote: false,
  viewingNoteId: null,
  isCreateModalOpen: false,
  isQuickNoteTriggered: false,
  isAdminPanelOpen: false,
  sidebarOpen: true,
  isMobileSidebarOpen: false,

  openEditor: (mode = 'create', noteId = null, noteType = 'text') => {
    set({
      currentView: 'notes',
      isEditorOpen: true,
      editorMode: mode,
      editingNoteId: noteId,
      editingNoteType: noteType,
      isViewingNote: false,
      viewingNoteId: null,
    });
  },

  closeEditor: () => {
    set({
      isEditorOpen: false,
      editorMode: 'create',
      editingNoteId: null,
      editingNoteType: 'text',
    });
  },

  openViewer: (noteId) => {
    set({
      currentView: 'notes',
      isViewingNote: true,
      viewingNoteId: noteId,
      isEditorOpen: false,
      editingNoteId: null,
    });
  },

  closeViewer: () => {
    set({
      isViewingNote: false,
      viewingNoteId: null,
    });
  },

  openCreateModal: () => {
    set({ isCreateModalOpen: true });
  },

  closeCreateModal: () => {
    set({ isCreateModalOpen: false });
  },

  triggerQuickNote: () => {
    set({ isQuickNoteTriggered: true, isCreateModalOpen: false });
  },

  consumeQuickNoteTrigger: () => {
    set({ isQuickNoteTriggered: false });
  },

  openAdminPanel: () => {
    set({ currentView: 'admin' });
  },

  closeAdminPanel: () => {
    set({ currentView: 'notes' });
  },

  openOverview: () => {
    set({ currentView: 'overview' });
  },

  closeOverview: () => {
    set({ currentView: 'notes' });
  },

  openSettings: () => {
    set({ currentView: 'settings' });
  },

  openProfile: () => {
    set({ currentView: 'profile' });
  },

  setView: (view) => {
    set({ currentView: view });
  },

  toggleSidebar: () => {
    set(state => ({ sidebarOpen: !state.sidebarOpen }));
  },

  toggleMobileSidebar: () => {
    set(state => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen }));
  },
}));
