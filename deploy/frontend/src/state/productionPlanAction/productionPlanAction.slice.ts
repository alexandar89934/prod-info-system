import { createSlice } from '@reduxjs/toolkit';

import { fetchActionsByPlan, createPlanAction } from './productionPlanAction.actions';
import { ProductionPlanActionState } from './productionPlanAction.types';

const initialState: ProductionPlanActionState = {
  actionsByPlan: {},
  loading: false,
  error: null,
  success: null,
};

const productionPlanActionSlice = createSlice({
  name: 'productionPlanAction',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = null; },
    clearError: (state) => { state.error = null; },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActionsByPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActionsByPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.actionsByPlan[action.payload.planId] = action.payload.actions;
      })
      .addCase(fetchActionsByPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch actions';
      })
      .addCase(createPlanAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlanAction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Action logged successfully!';
        const { planId, action: newAction } = action.payload;
        const existing = state.actionsByPlan[planId] ?? [];
        state.actionsByPlan[planId] = [...existing, newAction];
      })
      .addCase(createPlanAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to log action';
      });
  },
});

export const { clearSuccess, clearError, resetState } = productionPlanActionSlice.actions;
export default productionPlanActionSlice.reducer;