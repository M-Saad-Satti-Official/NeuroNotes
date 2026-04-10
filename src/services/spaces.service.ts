import * as mockService from '@/mock/services/spaces.service.mock';

export const spacesService = {
  getSpaces: mockService.getSpaces,
  getSpaceById: mockService.getSpaceById,
  createSpace: mockService.createSpace,
  updateSpace: mockService.updateSpace,
  deleteSpace: mockService.deleteSpace,
  toggleVisibility: mockService.toggleSpaceVisibility,
};
