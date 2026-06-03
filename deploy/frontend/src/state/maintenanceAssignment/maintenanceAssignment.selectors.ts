import { RootState } from '../store';

export const selectMaintenanceAssignments       = (state: RootState) => state.reducer.maintenanceAssignment.items;
export const selectAvailableTargets             = (state: RootState) => state.reducer.maintenanceAssignment.availableTargets;
export const selectMaintenanceAssignmentLoading = (state: RootState) => state.reducer.maintenanceAssignment.loading;
export const selectTargetsLoading               = (state: RootState) => state.reducer.maintenanceAssignment.targetsLoading;
export const selectMaintenanceAssignmentError   = (state: RootState) => state.reducer.maintenanceAssignment.error;
export const selectMaintenanceAssignmentSuccess = (state: RootState) => state.reducer.maintenanceAssignment.success;
export const selectMaintenanceAssignmentTotal   = (state: RootState) => state.reducer.maintenanceAssignment.total;