import { RootState } from '../store';

export const selectMachineAvailabilityStatuses = (state: RootState) =>
  state.reducer.machineAvailabilityStatus.statuses;

export const selectCurrentMachineAvailabilityStatus = (state: RootState) =>
  state.reducer.machineAvailabilityStatus.currentStatus;

export const selectMachineAvailabilityStatusError = (state: RootState) =>
  state.reducer.machineAvailabilityStatus.error;

export const selectMachineAvailabilityStatusSuccess = (state: RootState) =>
  state.reducer.machineAvailabilityStatus.success;

export const selectMachineAvailabilityStatusLoading = (state: RootState) =>
  state.reducer.machineAvailabilityStatus.loading;

export const selectMachineAvailabilityStatusTotal = (state: RootState) =>
  state.reducer.machineAvailabilityStatus.total;
