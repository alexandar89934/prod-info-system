import { createSlice } from '@reduxjs/toolkit';

import {
  fetchWorkplaces,
  addWorkplace,
  updateWorkplace,
  deleteWorkplace,
  fetchWorkplaceById,
} from './workplace.actions';
import { EditWorkplaceFormData, WorkplaceState } from './workplace.types';

const initialState: WorkplaceState = {
  currentWorkplace: null as EditWorkplaceFormData | null,
  workplaces: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const workplaceSlice = createSlice({
  name: 'workplace',
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
      .addCase(fetchWorkplaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkplaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workplaces = action.payload.content.workplaces;
        state.total = action.payload.content?.pagination?.total;
      })
      .addCase(fetchWorkplaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWorkplaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkplaceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkplace = action.payload;
      })
      .addCase(fetchWorkplaceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch workplace';
      })
      .addCase(addWorkplace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkplace.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message ?? 'Workplace added successfully';
      })
      .addCase(addWorkplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWorkplace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkplace.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message ?? 'Workplace updated successfully';
      })
      .addCase(updateWorkplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWorkplace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkplace.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message ?? 'Workplace deleted successfully';
      })
      .addCase(deleteWorkplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSuccess, clearError, resetState } = workplaceSlice.actions;
export default workplaceSlice.reducer;
