import { RootState } from '../store';

import { Responsibility } from './responsibility.types.ts';

export const selectResponsibilities = (state: RootState): Responsibility[] =>
  state.reducer.responsibility.responsibilities;

export const selectCurrentResponsibility = (state: RootState): Responsibility | null =>
  state.reducer.responsibility.currentResponsibility;

export const selectResponsibilityLoading = (state: RootState): boolean =>
  state.reducer.responsibility.loading;

export const selectResponsibilityError = (state: RootState): string | null =>
  state.reducer.responsibility.error;

export const selectResponsibilitySuccess = (state: RootState): string | null =>
  state.reducer.responsibility.success;