import { RootState } from '@/state/store';

export const selectCompatibilities = (state: RootState) =>
  state.reducer.moldMachineCompatibility.compatibilities;

export const selectCompatibilityLoading = (state: RootState) =>
  state.reducer.moldMachineCompatibility.loading;

export const selectCompatibilityError = (state: RootState) =>
  state.reducer.moldMachineCompatibility.error;

export const selectCompatibilitySuccess = (state: RootState) =>
  state.reducer.moldMachineCompatibility.success;