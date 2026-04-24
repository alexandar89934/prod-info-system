import { RootState } from '../store';

export const selectMachineEquipmentTypes = (state: RootState) =>
  state.reducer.machineEquipmentType.equipmentTypes;

export const selectCurrentMachineEquipmentType = (state: RootState) =>
  state.reducer.machineEquipmentType.currentType;

export const selectMachineEquipmentTypeError = (state: RootState) =>
  state.reducer.machineEquipmentType.error;

export const selectMachineEquipmentTypeSuccess = (state: RootState) =>
  state.reducer.machineEquipmentType.success;

export const selectMachineEquipmentTypeLoading = (state: RootState) =>
  state.reducer.machineEquipmentType.loading;

export const selectMachineEquipmentTypeTotal = (state: RootState) =>
  state.reducer.machineEquipmentType.total;
