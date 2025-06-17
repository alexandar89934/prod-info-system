import { createSlice } from '@reduxjs/toolkit';

import {
  fetchMachineEquipmentTypes,
  addMachineEquipmentType,
  updateMachineEquipmentType,
  deleteMachineEquipmentType,
  fetchMachineEquipmentTypeById,
} from './machineEquipmentTypes.actions';
import { MachineEquipmentTypeState } from './machineEquipmentTypes.types';

const initialState: MachineEquipmentTypeState = {
  currentType: null,
  equipmentTypes: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const machineEquipmentTypeSlice = createSlice({
  name: 'machineEquipmentType',
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
      .addCase(fetchMachineEquipmentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachineEquipmentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.equipmentTypes = action.payload.content.equipmentTypes;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchMachineEquipmentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch equipment types';
      })

      .addCase(addMachineEquipmentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMachineEquipmentType.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Equipment type added successfully';
      })
      .addCase(addMachineEquipmentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add equipment type';
      })

      .addCase(fetchMachineEquipmentTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachineEquipmentTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentType = action.payload;
      })
      .addCase(fetchMachineEquipmentTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch equipment type';
      })

      .addCase(updateMachineEquipmentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMachineEquipmentType.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Equipment type updated successfully';
      })
      .addCase(updateMachineEquipmentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update equipment type';
      })

      .addCase(deleteMachineEquipmentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMachineEquipmentType.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Equipment type deleted successfully';
      })
      .addCase(deleteMachineEquipmentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete equipment type';
      });
  },
});

export const { clearSuccess, clearError, resetState } =
  machineEquipmentTypeSlice.actions;

export default machineEquipmentTypeSlice.reducer;
