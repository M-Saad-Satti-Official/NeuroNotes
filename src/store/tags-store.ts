import { create } from 'zustand';
import { tagsService } from '@/services/tags.service';
import type { Tag } from '@/types';

interface TagsState {
  tags: Tag[];
  isLoading: boolean;
  fetchTags: () => Promise<void>;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  isLoading: false,

  fetchTags: async () => {
    set({ isLoading: true });
    try {
      const tags = await tagsService.getTags();
      set({ tags, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
