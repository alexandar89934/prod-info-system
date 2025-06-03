import { RootState } from '../store';

import { Workplace } from '@/state/workplace/workplace.types.ts';

export const selectWorkplaces = (state: RootState): Workplace[] =>
  state.reducer.workplace.workplaces;

export const selectWorkplaceError = (state: RootState) =>
  state.reducer.workplace.error;

export const selectCurrentWorkplace = (state: RootState) =>
  state.reducer.workplace.currentWorkplace;

export const selectWorkplaceSuccess = (state: RootState) =>
  state.reducer.workplace.success;

export const selectWorkplaceLoading = (state: RootState) =>
  state.reducer.workplace.loading;

export const selectWorkplaceTotal = (state: RootState) =>
  state.reducer.workplace.total;
