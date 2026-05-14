import { RootState } from '@/state/store';

export const selectCustomerOrders = (state: RootState) => state.reducer.customerOrder.orders;
export const selectCurrentCustomerOrder = (state: RootState) => state.reducer.customerOrder.currentOrder;
export const selectCustomerOrderLoading = (state: RootState) => state.reducer.customerOrder.loading;
export const selectCustomerOrderError = (state: RootState) => state.reducer.customerOrder.error;
export const selectCustomerOrderSuccess = (state: RootState) => state.reducer.customerOrder.success;
export const selectCustomerOrderTotal = (state: RootState) => state.reducer.customerOrder.total;