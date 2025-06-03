import { RootState } from '../store';

export const selectWorkplaceCategories = (state: RootState) =>
  state.reducer.workplaceCategory.categories;

export const selectCurrentWorkplaceCategory = (state: RootState) =>
  state.reducer.workplaceCategory.currentCategory;

export const selectWorkplaceCategoryError = (state: RootState) =>
  state.reducer.workplaceCategory.error;

export const selectWorkplaceCategorySuccess = (state: RootState) =>
  state.reducer.workplaceCategory.success;

export const selectWorkplaceCategoryLoading = (state: RootState) =>
  state.reducer.workplaceCategory.loading;

export const selectWorkplaceCategoryTotal = (state: RootState) =>
  state.reducer.workplaceCategory.total;
