import { RootState } from '@/state/store';

export const selectMolds = (state: RootState) => state.reducer.mold.molds;
export const selectCurrentMold = (state: RootState) => state.reducer.mold.currentMold;
export const selectMoldLoading = (state: RootState) => state.reducer.mold.loading;
export const selectMoldError = (state: RootState) => state.reducer.mold.error;
export const selectMoldSuccess = (state: RootState) => state.reducer.mold.success;
export const selectMoldTotal = (state: RootState) => state.reducer.mold.total;