import { createSlice } from '@reduxjs/toolkit';

import { addMold, deleteMold, fetchMoldById, fetchMolds, fetchMoldsByCompany, updateMold } from './mold.actions';
import { MoldState } from './mold.types';

const initialState: MoldState = {
  currentMold: null,
  molds: [],
  moldsByCompany: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const moldSlice = createSlice({
  name: 'mold',
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
      .addCase(fetchMolds.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMolds.fulfilled, (state, action) => {
        state.loading = false;
        state.molds = action.payload.content.molds;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchMolds.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch molds'; })

      .addCase(fetchMoldById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMoldById.fulfilled, (state, action) => { state.loading = false; state.currentMold = action.payload; })
      .addCase(fetchMoldById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch mold'; })

      .addCase(addMold.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addMold.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Mold added successfully'; })
      .addCase(addMold.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add mold'; })

      .addCase(updateMold.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateMold.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Mold updated successfully'; })
      .addCase(updateMold.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update mold'; })

      .addCase(fetchMoldsByCompany.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMoldsByCompany.fulfilled, (state, action) => { state.loading = false; state.moldsByCompany = action.payload; })
      .addCase(fetchMoldsByCompany.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch molds'; })

      .addCase(deleteMold.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteMold.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Mold deleted successfully'; })
      .addCase(deleteMold.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete mold'; });
  },
});

export const { clearSuccess, clearError, resetState } = moldSlice.actions;
export default moldSlice.reducer;