import { createSlice } from '@reduxjs/toolkit';

import {
  addMaintenanceTemplate,
  deleteMaintenanceTemplate,
  fetchMaintenanceTemplateById,
  fetchMaintenanceTemplates,
  updateMaintenanceTemplate,
} from './maintenanceTemplate.actions';
import { MaintenanceTemplateState } from './maintenanceTemplate.types';

const initialState: MaintenanceTemplateState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const maintenanceTemplateSlice = createSlice({
  name: 'maintenanceTemplate',
  initialState,
  reducers: {
    clearSuccess(state) { state.success = null; },
    clearError(state) { state.error = null; },
    resetState() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceTemplates.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMaintenanceTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content.items;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchMaintenanceTemplates.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(fetchMaintenanceTemplateById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMaintenanceTemplateById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchMaintenanceTemplateById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(addMaintenanceTemplate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addMaintenanceTemplate.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Created'; })
      .addCase(addMaintenanceTemplate.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create'; })

      .addCase(updateMaintenanceTemplate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateMaintenanceTemplate.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Updated'; })
      .addCase(updateMaintenanceTemplate.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update'; })

      .addCase(deleteMaintenanceTemplate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteMaintenanceTemplate.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Deleted'; })
      .addCase(deleteMaintenanceTemplate.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete'; });
  },
});

export const { clearSuccess, clearError, resetState } = maintenanceTemplateSlice.actions;
export default maintenanceTemplateSlice.reducer;