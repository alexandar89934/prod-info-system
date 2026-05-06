import { createSlice } from '@reduxjs/toolkit';

import {
  addBomLine,
  addItem,
  addItemPackaging,
  deleteBomLine,
  deleteItem,
  deleteItemPackaging,
  fetchBomLines,
  fetchItemById,
  fetchItemPackagings,
  fetchItems,
  updateBomLine,
  updateItem,
  updateItemPackaging,
} from './item.actions';
import { ItemState } from './item.types';

const initialState: ItemState = {
  currentItem: null,
  items: [],
  bomLines: [],
  packagings: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {
    clearSuccess(state) { state.success = null; },
    clearError(state) { state.error = null; },
    resetState() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content.items;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchItems.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch items'; })

      .addCase(fetchItemById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchItemById.fulfilled, (state, action) => { state.loading = false; state.currentItem = action.payload; })
      .addCase(fetchItemById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch item'; })

      .addCase(addItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addItem.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Item added successfully'; })
      .addCase(addItem.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add item'; })

      .addCase(updateItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateItem.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Item updated successfully'; })
      .addCase(updateItem.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update item'; })

      .addCase(deleteItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteItem.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Item deleted successfully'; })
      .addCase(deleteItem.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete item'; })

      .addCase(fetchBomLines.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBomLines.fulfilled, (state, action) => { state.loading = false; state.bomLines = action.payload.content.bomLines; })
      .addCase(fetchBomLines.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch BOM'; })

      .addCase(addBomLine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addBomLine.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'BOM line added'; })
      .addCase(addBomLine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add BOM line'; })

      .addCase(updateBomLine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateBomLine.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'BOM line updated'; })
      .addCase(updateBomLine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update BOM line'; })

      .addCase(deleteBomLine.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteBomLine.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'BOM line deleted'; })
      .addCase(deleteBomLine.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete BOM line'; })

      .addCase(fetchItemPackagings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchItemPackagings.fulfilled, (state, action) => { state.loading = false; state.packagings = action.payload.content.packagings; })
      .addCase(fetchItemPackagings.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch packagings'; })

      .addCase(addItemPackaging.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addItemPackaging.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Packaging added'; })
      .addCase(addItemPackaging.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add packaging'; })

      .addCase(updateItemPackaging.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateItemPackaging.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Packaging updated'; })
      .addCase(updateItemPackaging.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update packaging'; })

      .addCase(deleteItemPackaging.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteItemPackaging.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Packaging deleted'; })
      .addCase(deleteItemPackaging.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete packaging'; });
  },
});

export const { clearSuccess, clearError, resetState } = itemSlice.actions;
export default itemSlice.reducer;