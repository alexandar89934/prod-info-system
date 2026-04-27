import { RootState } from '@/state/store';

export const selectMachines = (state: RootState) => state.reducer.machine.machines;
export const selectCurrentMachine = (state: RootState) => state.reducer.machine.currentMachine;
export const selectMachineLoading = (state: RootState) => state.reducer.machine.loading;
export const selectMachineError = (state: RootState) => state.reducer.machine.error;
export const selectMachineSuccess = (state: RootState) => state.reducer.machine.success;
export const selectMachineTotal = (state: RootState) => state.reducer.machine.total;