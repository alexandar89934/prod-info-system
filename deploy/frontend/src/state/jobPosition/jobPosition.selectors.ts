import { RootState } from '../store';

import { JobPosition } from '@/state/jobPosition/jobPosition.types.ts';

export const selectJobPositions = (state: RootState): JobPosition[] =>
  state.reducer.jobPosition.jobPositions;

export const selectJobPositionError = (state: RootState) =>
  state.reducer.jobPosition.error;

export const selectCurrentJobPosition = (state: RootState) =>
  state.reducer.jobPosition.currentJobPosition;

export const selectJobPositionSuccess = (state: RootState) =>
  state.reducer.jobPosition.success;

export const selectJobPositionLoading = (state: RootState) =>
  state.reducer.jobPosition.loading;

export const selectJobPositionTotal = (state: RootState) =>
  state.reducer.jobPosition.total;