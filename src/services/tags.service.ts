import * as mockService from '@/mock/services/tags.service.mock';

export const tagsService = {
  getTags: mockService.getTags,
  createTag: mockService.createTag,
  deleteTag: mockService.deleteTag,
};
