import { RootState } from '../store';

export const selectMachineEquipments = (state: RootState) =>
  state.reducer.machineEquipment.equipments;

export const selectCurrentMachineEquipment = (state: RootState) =>
  state.reducer.machineEquipment.currentEquipment;

export const selectMachineEquipmentError = (state: RootState) =>
  state.reducer.machineEquipment.error;

export const selectMachineEquipmentSuccess = (state: RootState) =>
  state.reducer.machineEquipment.success;

export const selectMachineEquipmentLoading = (state: RootState) =>
  state.reducer.machineEquipment.loading;

export const selectMachineEquipmentTotal = (state: RootState) =>
  state.reducer.machineEquipment.total;
