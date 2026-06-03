import { createSlice } from '@reduxjs/toolkit';

import { addVehicle, deleteVehicle, fetchVehicleById, fetchVehicles, updateVehicle } from './vehicle.actions';
import { VehicleState } from './vehicle.types';

const initialState: VehicleState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = null; },
    clearError:   (state) => { state.error   = null; },
    resetState:   ()      => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload.content.items;
        state.total   = action.payload.content.pagination.total;
      })
      .addCase(fetchVehicles.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; })

      .addCase(fetchVehicleById.pending,   (state) => { state.loading = true;  state.error = null; state.current = null; })
      .addCase(fetchVehicleById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchVehicleById.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; })

      .addCase(addVehicle.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(addVehicle.fulfilled, (state) => { state.loading = false; state.success = 'Vehicle created successfully!'; })
      .addCase(addVehicle.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; })

      .addCase(updateVehicle.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(updateVehicle.fulfilled, (state) => { state.loading = false; state.success = 'Vehicle updated successfully!'; })
      .addCase(updateVehicle.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; })

      .addCase(deleteVehicle.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(deleteVehicle.fulfilled, (state) => { state.loading = false; state.success = 'Vehicle deleted successfully!'; })
      .addCase(deleteVehicle.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; });
  },
});

export const { clearSuccess, clearError, resetState } = vehicleSlice.actions;
export default vehicleSlice.reducer;