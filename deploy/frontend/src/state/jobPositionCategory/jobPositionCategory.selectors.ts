import { RootState } from '../store';

export const selectJobPositionCategories = (state: RootState) =>
  state.reducer.jobPositionCategory.categories;

export const selectCurrentJobPositionCategory = (state: RootState) =>
  state.reducer.jobPositionCategory.currentCategory;

export const selectJobPositionCategoryError = (state: RootState) =>
  state.reducer.jobPositionCategory.error;

export const selectJobPositionCategorySuccess = (state: RootState) =>
  state.reducer.jobPositionCategory.success;

export const selectJobPositionCategoryLoading = (state: RootState) =>
  state.reducer.jobPositionCategory.loading;

export const selectJobPositionCategoryTotal = (state: RootState) =>
  state.reducer.jobPositionCategory.total;