import { createSlice } from '@reduxjs/toolkit';

import {
  addMachine,
  assignEquipmentToMachine,
  deleteMachine,
  fetchMachineById,
  fetchMachines,
  unassignEquipmentFromMachine,
  updateMachine,
} from './machine.actions';
import { MachineState } from './machine.types';

const initialState: MachineState = {
  currentMachine: null,
  machines: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const machineSlice = createSlice({
  name: 'machine',
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
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.machines = action.payload.content.machines;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch machines';
      })
      .addCase(fetchMachineById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachineById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMachine = action.payload;
      })
      .addCase(fetchMachineById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch machine';
      })
      .addCase(addMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMachine.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Machine added successfully';
      })
      .addCase(addMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add machine';
      })
      .addCase(updateMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Machine updated successfully';
      })
      .addCase(updateMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update machine';
      })
      .addCase(deleteMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMachine.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Machine deleted successfully';
      })
      .addCase(deleteMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete machine';
      })
      .addCase(assignEquipmentToMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignEquipmentToMachine.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignEquipmentToMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to assign equipment';
      })
      .addCase(unassignEquipmentFromMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unassignEquipmentFromMachine.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(unassignEquipmentFromMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to unassign equipment';
      });
  },
});

export const { clearSuccess, clearError, resetState } = machineSlice.actions;

export default machineSlice.reducer;