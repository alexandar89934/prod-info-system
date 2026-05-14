import { createSlice } from '@reduxjs/toolkit';

import {
  addProductionPlan,
  deleteProductionPlan,
  fetchAllProductionPlansByMachine,
  fetchProductionPlanById,
  fetchProductionPlans,
  fetchProductionPlansByMachine,
  fetchProductionPlansByOrder,
  reorderProductionPlans,
  updateProductionPlan,
  updateProductionPlanStatus,
} from './productionPlan.actions';
import { ProductionPlanState } from './productionPlan.types';

const initialState: ProductionPlanState = {
  currentPlan: null,
  plans: [],
  plansByMachine: [],
  plansByOrder: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const productionPlanSlice = createSlice({
  name: 'productionPlan',
  initialState,
  reducers: {
    clearSuccess(state) { state.success = null; },
    clearError(state) { state.error = null; },
    resetState() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionPlans.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.content.productionPlans;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchProductionPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch plans'; })

      .addCase(fetchProductionPlansByMachine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductionPlansByMachine.fulfilled, (state, action) => { state.loading = false; state.plansByMachine = action.payload; })
      .addCase(fetchProductionPlansByMachine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch machine queue'; })

      .addCase(fetchProductionPlansByOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductionPlansByOrder.fulfilled, (state, action) => { state.loading = false; state.plansByOrder = action.payload; })
      .addCase(fetchProductionPlansByOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch plans for order'; })

      .addCase(fetchProductionPlanById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductionPlanById.fulfilled, (state, action) => { state.loading = false; state.currentPlan = action.payload; })
      .addCase(fetchProductionPlanById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch plan'; })

      .addCase(addProductionPlan.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addProductionPlan.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Plan created'; })
      .addCase(addProductionPlan.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create plan'; })

      .addCase(updateProductionPlan.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProductionPlan.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Plan updated'; })
      .addCase(updateProductionPlan.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update plan'; })

      .addCase(updateProductionPlanStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProductionPlanStatus.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Status updated'; })
      .addCase(updateProductionPlanStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update status'; })

      .addCase(deleteProductionPlan.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProductionPlan.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Plan deleted'; })
      .addCase(deleteProductionPlan.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete plan'; })

      .addCase(fetchAllProductionPlansByMachine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllProductionPlansByMachine.fulfilled, (state, action) => { state.loading = false; state.plansByMachine = action.payload; })
      .addCase(fetchAllProductionPlansByMachine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch machine plans'; })

      .addCase(reorderProductionPlans.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(reorderProductionPlans.fulfilled, (state, action) => { state.loading = false; state.success = action.payload || 'Plans reordered'; })
      .addCase(reorderProductionPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to reorder plans'; });
  },
});

export const { clearSuccess, clearError, resetState } = productionPlanSlice.actions;
export default productionPlanSlice.reducer;