import { RootState } from '@/state/store';
import { ProductionPlanAction } from './productionPlanAction.types';

export const selectActionsByPlan = (state: RootState): Record<string, ProductionPlanAction[]> =>
  state.reducer.productionPlanAction.actionsByPlan;

export const selectPlanActionLoading = (state: RootState): boolean =>
  state.reducer.productionPlanAction.loading;

export const selectPlanActionError = (state: RootState): string | null =>
  state.reducer.productionPlanAction.error;

export const selectPlanActionSuccess = (state: RootState): string | null =>
  state.reducer.productionPlanAction.success;