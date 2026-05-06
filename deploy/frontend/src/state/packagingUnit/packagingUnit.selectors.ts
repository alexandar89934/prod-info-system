import { RootState } from '@/state/store';

export const selectPackagingUnits = (state: RootState) => state.reducer.packagingUnit.packagingUnits;
export const selectCurrentPackagingUnit = (state: RootState) => state.reducer.packagingUnit.currentPackagingUnit;
export const selectPackagingUnitLoading = (state: RootState) => state.reducer.packagingUnit.loading;
export const selectPackagingUnitError = (state: RootState) => state.reducer.packagingUnit.error;
export const selectPackagingUnitSuccess = (state: RootState) => state.reducer.packagingUnit.success;
export const selectPackagingUnitTotal = (state: RootState) => state.reducer.packagingUnit.total;