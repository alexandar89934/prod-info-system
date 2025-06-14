import { createSlice } from '@reduxjs/toolkit';

import {
  fetchWorkplaceCategories,
  addWorkplaceCategory,
  updateWorkplaceCategory,
  deleteWorkplaceCategory,
  fetchWorkplaceCategoryById,
} from './workplaceCategory.actions';
import { WorkplaceCategoryState } from './workplaceCategory.types';

const initialState: WorkplaceCategoryState = {
  currentCategory: null,
  categories: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const workplaceCategorySlice = createSlice({
  name: 'workplaceCategory',
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
      .addCase(fetchWorkplaceCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkplaceCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.content.categories;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchWorkplaceCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })
      .addCase(addWorkplaceCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkplaceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Category added successfully';
      })
      .addCase(addWorkplaceCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add category';
      })
      .addCase(fetchWorkplaceCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkplaceCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchWorkplaceCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch category';
      })
      .addCase(updateWorkplaceCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkplaceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Category updated successfully';
      })
      .addCase(updateWorkplaceCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update category';
      })
      .addCase(deleteWorkplaceCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkplaceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Category deleted successfully';
      })
      .addCase(deleteWorkplaceCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export const { clearSuccess, clearError, resetState } =
  workplaceCategorySlice.actions;

export default workplaceCategorySlice.reducer;
