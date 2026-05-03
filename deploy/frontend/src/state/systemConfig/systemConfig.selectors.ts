import { RootState } from '@/state/store.ts';

export const selectSystemConfigs = (state: RootState) =>
  state.reducer.systemConfig.configs;
export const selectSystemConfigLoading = (state: RootState) =>
  state.reducer.systemConfig.loading;
export const selectSystemConfigUpdateLoading = (state: RootState) =>
  state.reducer.systemConfig.updateLoading;
export const selectSystemConfigError = (state: RootState) =>
  state.reducer.systemConfig.error;
export const selectSystemConfigSuccess = (state: RootState) =>
  state.reducer.systemConfig.success;
