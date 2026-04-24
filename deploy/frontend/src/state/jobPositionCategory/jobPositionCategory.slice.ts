import { createSlice } from '@reduxjs/toolkit';

import {
  fetchJobPositionCategories,
  addJobPositionCategory,
  updateJobPositionCategory,
  deleteJobPositionCategory,
  fetchJobPositionCategoryById,
} from './jobPositionCategory.actions';
import { JobPositionCategoryState } from './jobPositionCategory.types';

const initialState: JobPositionCategoryState = {
  currentCategory: null,
  categories: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const jobPositionCategorySlice = createSlice({
  name: 'jobPositionCategory',
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
      .addCase(fetchJobPositionCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPositionCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.content.categories;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchJobPositionCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })
      .addCase(addJobPositionCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addJobPositionCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Category added successfully';
      })
      .addCase(addJobPositionCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add category';
      })
      .addCase(fetchJobPositionCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPositionCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchJobPositionCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch category';
      })
      .addCase(updateJobPositionCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobPositionCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Category updated successfully';
      })
      .addCase(updateJobPositionCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update category';
      })
      .addCase(deleteJobPositionCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJobPositionCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || 'Category deleted successfully';
      })
      .addCase(deleteJobPositionCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export const { clearSuccess, clearError, resetState } =
  jobPositionCategorySlice.actions;

export default jobPositionCategorySlice.reducer;