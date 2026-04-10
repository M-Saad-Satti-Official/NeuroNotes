import * as mockService from '@/mock/services/notes.service.mock';

export const notesService = {
  getNotes: mockService.getNotes,
  getNoteById: mockService.getNoteById,
  createNote: mockService.createNote,
  updateNote: mockService.updateNote,
  deleteNote: mockService.deleteNote,
  togglePin: mockService.togglePin,
  toggleVisibility: mockService.toggleVisibility,
  getOverviewStats: mockService.getOverviewStats,
  searchNotes: mockService.searchNotes,
};
