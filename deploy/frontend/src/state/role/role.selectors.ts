import { RootState } from '../store';

export const selectRoles = (state: RootState) => state.reducer.role.roles;
export const selectError = (state: RootState) => state.reducer.role.error;
export const selectSuccess = (state: RootState) => state.reducer.role.success;
export const selectLoading = (state: RootState) => state.reducer.role.loading;
