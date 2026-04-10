import * as mockService from '@/mock/services/auth.service.mock';

export const authService = {
  login: mockService.login,
  signup: mockService.signup,
  logout: mockService.logout,
  getCurrentUser: mockService.getCurrentUser,
  getAllUsers: mockService.getAllUsers,
  getUserById: mockService.getUserById,
  updateUserRole: mockService.updateUserRole,
  suspendUser: mockService.suspendUser,
  activateUser: mockService.activateUser,
  deleteUser: mockService.deleteUser,
  getAppSettings: mockService.getAppSettings,
  updateAppSettings: mockService.updateAppSettings,
  getRolePermissionOverrides: mockService.getRolePermissionOverrides,
  updateRolePermissionOverrides: mockService.updateRolePermissionOverrides,
  getSpaceAssignments: mockService.getSpaceAssignments,
  assignUserToSpace: mockService.assignUserToSpace,
  removeUserFromSpace: mockService.removeUserFromSpace,
  getUserSpaceAssignments: mockService.getUserSpaceAssignments,
};
