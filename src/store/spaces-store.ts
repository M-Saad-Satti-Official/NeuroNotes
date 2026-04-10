import { create } from 'zustand';
import { spacesService } from '@/services/spaces.service';
import type { Space } from '@/types';

interface SpacesState {
  spaces: Space[];
  currentSpaceId: string | null;
  isLoading: boolean;
  fetchSpaces: () => Promise<void>;
  createSpace: (data: Partial<Space>) => Promise<Space | null>;
  updateSpace: (id: string, data: Partial<Space>) => Promise<Space | null>;
  deleteSpace: (id: string) => Promise<boolean>;
  toggleVisibility: (id: string) => Promise<Space | null>;
  setCurrentSpace: (id: string | null) => void;
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
  spaces: [],
  currentSpaceId: null,
  isLoading: false,

  fetchSpaces: async () => {
    set({ isLoading: true });
    try {
      const spaces = await spacesService.getSpaces();
      set({ spaces, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createSpace: async (data) => {
    set({ isLoading: true });
    try {
      const newSpace = await spacesService.createSpace(data);
      set(state => ({
        spaces: [...state.spaces, newSpace],
        isLoading: false,
      }));
      return newSpace;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  updateSpace: async (id, data) => {
    set({ isLoading: true });
    try {
      const updated = await spacesService.updateSpace(id, data);
      if (updated) {
        set(state => ({
          spaces: state.spaces.map(s => s.id === id ? updated : s),
          isLoading: false,
        }));
      }
      return updated;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  deleteSpace: async (id) => {
    set({ isLoading: true });
    try {
      const success = await spacesService.deleteSpace(id);
      if (success) {
        set(state => ({
          spaces: state.spaces.filter(s => s.id !== id),
          currentSpaceId: state.currentSpaceId === id ? null : state.currentSpaceId,
          isLoading: false,
        }));
      }
      return success;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  setCurrentSpace: (id) => {
    set({ currentSpaceId: id });
  },

  toggleVisibility: async (id) => {
    try {
      const updated = await spacesService.toggleVisibility(id);
      if (updated) {
        set(state => ({
          spaces: state.spaces.map(s => s.id === id ? updated : s),
        }));
      }
      return updated;
    } catch {
      return null;
    }
  },
}));
