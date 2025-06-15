import { createSlice } from '@reduxjs/toolkit';

import {
  fetchMachineAvailabilityStatuses,
  addMachineAvailabilityStatus,
  updateMachineAvailabilityStatus,
  deleteMachineAvailabilityStatus,
  fetchMachineAvailabilityStatusById,
} from './machineAvailabilityStatus.actions';
import { MachineAvailabilityStatusState } from './machineAvailabilityStatus.types';

const initialState: MachineAvailabilityStatusState = {
  currentStatus: null,
  statuses: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const machineAvailabilityStatusSlice = createSlice({
  name: 'machineAvailabilityStatus',
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
      .addCase(fetchMachineAvailabilityStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachineAvailabilityStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = action.payload.content.statuses;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchMachineAvailabilityStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch statuses';
      })
      .addCase(addMachineAvailabilityStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMachineAvailabilityStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Status added successfully';
      })
      .addCase(addMachineAvailabilityStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add status';
      })
      .addCase(fetchMachineAvailabilityStatusById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMachineAvailabilityStatusById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.currentStatus = action.payload;
        }
      )
      .addCase(fetchMachineAvailabilityStatusById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch status';
      })
      .addCase(updateMachineAvailabilityStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMachineAvailabilityStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Status updated successfully';
      })
      .addCase(updateMachineAvailabilityStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update status';
      })
      .addCase(deleteMachineAvailabilityStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMachineAvailabilityStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Status deleted successfully';
      })
      .addCase(deleteMachineAvailabilityStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete status';
      });
  },
});

export const { clearSuccess, clearError, resetState } =
  machineAvailabilityStatusSlice.actions;

export default machineAvailabilityStatusSlice.reducer;
