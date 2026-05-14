import { RootState } from '@/state/store';

export const selectProductionPlans = (state: RootState) => state.reducer.productionPlan.plans;
export const selectCurrentProductionPlan = (state: RootState) => state.reducer.productionPlan.currentPlan;
export const selectProductionPlanLoading = (state: RootState) => state.reducer.productionPlan.loading;
export const selectProductionPlanError = (state: RootState) => state.reducer.productionPlan.error;
export const selectProductionPlanSuccess = (state: RootState) => state.reducer.productionPlan.success;
export const selectProductionPlanTotal = (state: RootState) => state.reducer.productionPlan.total;
export const selectProductionPlansByMachine = (state: RootState) => state.reducer.productionPlan.plansByMachine;
export const selectProductionPlansByOrder = (state: RootState) => state.reducer.productionPlan.plansByOrder;