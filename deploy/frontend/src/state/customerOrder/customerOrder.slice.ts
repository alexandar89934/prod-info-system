import { createSlice } from '@reduxjs/toolkit';

import {
  addCustomerOrder,
  addOrderLine,
  deleteCustomerOrder,
  deleteOrderLine,
  fetchCustomerOrderById,
  fetchCustomerOrders,
  updateCustomerOrder,
} from './customerOrder.actions';
import { CustomerOrderState } from './customerOrder.types';

const initialState: CustomerOrderState = {
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const customerOrderSlice = createSlice({
  name: 'customerOrder',
  initialState,
  reducers: {
    clearSuccess(state) { state.success = null; },
    clearError(state) { state.error = null; },
    resetState() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content.customerOrders;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch orders'; })

      .addCase(fetchCustomerOrderById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCustomerOrderById.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(fetchCustomerOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch order'; })

      .addCase(addCustomerOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addCustomerOrder.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Order created'; })
      .addCase(addCustomerOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create order'; })

      .addCase(updateCustomerOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCustomerOrder.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Order updated'; })
      .addCase(updateCustomerOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update order'; })

      .addCase(deleteCustomerOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCustomerOrder.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Order deleted'; })
      .addCase(deleteCustomerOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete order'; })

      .addCase(addOrderLine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addOrderLine.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Line added';
        if (state.currentOrder) {
          state.currentOrder = {
            ...state.currentOrder,
            lines: [...(state.currentOrder.lines ?? []), action.payload.content.line],
          };
        }
      })
      .addCase(addOrderLine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add line'; })

      .addCase(deleteOrderLine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteOrderLine.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Line deleted';
        if (state.currentOrder) {
          state.currentOrder = {
            ...state.currentOrder,
            lines: (state.currentOrder.lines ?? []).filter((l) => l.id !== action.payload.content.line.id),
          };
        }
      })
      .addCase(deleteOrderLine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete line'; });
  },
});

export const { clearSuccess, clearError, resetState } = customerOrderSlice.actions;
export default customerOrderSlice.reducer;