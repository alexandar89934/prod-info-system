import { createSlice } from '@reduxjs/toolkit';

import {
  fetchMachineEquipments,
  addMachineEquipment,
  updateMachineEquipment,
  deleteMachineEquipment,
  fetchMachineEquipmentById,
} from './machineEquipment.actions';
import { MachineEquipmentState } from './machineEquipment.types';

const initialState: MachineEquipmentState = {
  currentEquipment: null,
  equipments: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const machineEquipmentSlice = createSlice({
  name: 'machineEquipment',
  initialState,
  reducers: {
    clearSuccess(state) {
      state.success = null;
    },
    clearError(state) {
      state.error = null;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachineEquipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachineEquipments.fulfilled, (state, action) => {
        state.loading = false;
        state.equipments = action.payload.content.equipments;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchMachineEquipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch machine equipments';
      })
      .addCase(addMachineEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMachineEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Machine equipment added successfully';
      })
      .addCase(addMachineEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add machine equipment';
      })
      .addCase(fetchMachineEquipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachineEquipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEquipment = action.payload;
      })
      .addCase(fetchMachineEquipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch machine equipment';
      })
      .addCase(updateMachineEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMachineEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Machine equipment updated successfully';
      })
      .addCase(updateMachineEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update machine equipment';
      })
      .addCase(deleteMachineEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMachineEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Machine equipment deleted successfully';
      })
      .addCase(deleteMachineEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete machine equipment';
      });
  },
});

export const { clearSuccess, clearError, resetState } =
  machineEquipmentSlice.actions;

export default machineEquipmentSlice.reducer;
