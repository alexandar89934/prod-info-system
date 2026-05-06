import { createSlice } from '@reduxjs/toolkit';

import {
  addPackagingUnit,
  deletePackagingUnit,
  fetchPackagingUnitById,
  fetchPackagingUnits,
  updatePackagingUnit,
} from './packagingUnit.actions';
import { PackagingUnitState } from './packagingUnit.types';

const initialState: PackagingUnitState = {
  packagingUnits: [],
  currentPackagingUnit: null,
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const packagingUnitSlice = createSlice({
  name: 'packagingUnit',
  initialState,
  reducers: {
    clearSuccess(state) { state.success = null; },
    clearError(state) { state.error = null; },
    resetState() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackagingUnits.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPackagingUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.packagingUnits = action.payload.content.packagingUnits;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchPackagingUnits.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(fetchPackagingUnitById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPackagingUnitById.fulfilled, (state, action) => { state.loading = false; state.currentPackagingUnit = action.payload; })
      .addCase(fetchPackagingUnitById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(addPackagingUnit.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addPackagingUnit.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Created'; })
      .addCase(addPackagingUnit.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create'; })

      .addCase(updatePackagingUnit.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updatePackagingUnit.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Updated'; })
      .addCase(updatePackagingUnit.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update'; })

      .addCase(deletePackagingUnit.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deletePackagingUnit.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Deleted'; })
      .addCase(deletePackagingUnit.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete'; });
  },
});

export const { clearSuccess, clearError, resetState } = packagingUnitSlice.actions;
export default packagingUnitSlice.reducer;