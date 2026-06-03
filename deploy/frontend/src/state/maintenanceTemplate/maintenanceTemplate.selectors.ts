import { RootState } from '@/state/store';

export const selectMaintenanceTemplates = (state: RootState) => state.reducer.maintenanceTemplate.items;
export const selectCurrentMaintenanceTemplate = (state: RootState) => state.reducer.maintenanceTemplate.current;
export const selectMaintenanceTemplateLoading = (state: RootState) => state.reducer.maintenanceTemplate.loading;
export const selectMaintenanceTemplateError = (state: RootState) => state.reducer.maintenanceTemplate.error;
export const selectMaintenanceTemplateSuccess = (state: RootState) => state.reducer.maintenanceTemplate.success;
export const selectMaintenanceTemplateTotal = (state: RootState) => state.reducer.maintenanceTemplate.total;