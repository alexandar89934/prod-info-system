import { RootState } from '@/state/store';

export const selectItems = (state: RootState) => state.reducer.item.items;
export const selectCurrentItem = (state: RootState) => state.reducer.item.currentItem;
export const selectItemLoading = (state: RootState) => state.reducer.item.loading;
export const selectItemError = (state: RootState) => state.reducer.item.error;
export const selectItemSuccess = (state: RootState) => state.reducer.item.success;
export const selectItemTotal = (state: RootState) => state.reducer.item.total;
export const selectBomLines = (state: RootState) => state.reducer.item.bomLines;