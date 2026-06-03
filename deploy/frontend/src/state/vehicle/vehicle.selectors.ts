import { RootState } from '../store';

export const selectVehicles       = (state: RootState) => state.reducer.vehicle.items;
export const selectCurrentVehicle = (state: RootState) => state.reducer.vehicle.current;
export const selectVehicleLoading = (state: RootState) => state.reducer.vehicle.loading;
export const selectVehicleError   = (state: RootState) => state.reducer.vehicle.error;
export const selectVehicleSuccess = (state: RootState) => state.reducer.vehicle.success;
export const selectVehicleTotal   = (state: RootState) => state.reducer.vehicle.total;