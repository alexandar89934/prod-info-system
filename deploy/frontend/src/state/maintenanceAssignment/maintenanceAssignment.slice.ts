import { createSlice } from '@reduxjs/toolkit';

import {
  createMaintenanceAssignments,
  deleteMaintenanceAssignment,
  fetchAvailableTargets,
  fetchMaintenanceAssignments,
} from './maintenanceAssignment.actions';
import { MaintenanceAssignmentState } from './maintenanceAssignment.types';

const initialState: MaintenanceAssignmentState = {
  items:            [],
  availableTargets: [],
  loading:          false,
  targetsLoading:   false,
  error:            null,
  success:          null,
  total:            0,
};

const maintenanceAssignmentSlice = createSlice({
  name: 'maintenanceAssignment',
  initialState,
  reducers: {
    clearSuccess:          (state) => { state.success          = null; },
    clearError:            (state) => { state.error            = null; },
    clearAvailableTargets: (state) => { state.availableTargets = []; },
    resetState:            ()      => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceAssignments.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMaintenanceAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload.content.items;
        state.total   = action.payload.content.pagination.total;
      })
      .addCase(fetchMaintenanceAssignments.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; })

      .addCase(fetchAvailableTargets.pending,   (state) => { state.targetsLoading = true;  state.availableTargets = []; })
      .addCase(fetchAvailableTargets.fulfilled, (state, action) => {
        state.targetsLoading   = false;
        state.availableTargets = action.payload.content.targets;
      })
      .addCase(fetchAvailableTargets.rejected,  (state, action) => { state.targetsLoading = false; state.error = action.payload ?? null; })

      .addCase(createMaintenanceAssignments.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(createMaintenanceAssignments.fulfilled, (state) => { state.loading = false; state.success = 'Assignments created successfully!'; })
      .addCase(createMaintenanceAssignments.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; })

      .addCase(deleteMaintenanceAssignment.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(deleteMaintenanceAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Assignment removed.';
        state.items   = state.items.filter((a) => a.id !== action.meta.arg);
        state.total   = Math.max(0, state.total - 1);
      })
      .addCase(deleteMaintenanceAssignment.rejected,  (state, action) => { state.loading = false; state.error = action.payload ?? null; });
  },
});

export const { clearSuccess, clearError, clearAvailableTargets, resetState } = maintenanceAssignmentSlice.actions;
export default maintenanceAssignmentSlice.reducer;