import { RootState } from '@/state/store';

export const selectCompanies = (state: RootState) => state.reducer.company.companies;
export const selectCurrentCompany = (state: RootState) => state.reducer.company.currentCompany;
export const selectCompaniesList = (state: RootState) => state.reducer.company.companiesList;
export const selectCompanyLoading = (state: RootState) => state.reducer.company.loading;
export const selectCompanyError = (state: RootState) => state.reducer.company.error;
export const selectCompanySuccess = (state: RootState) => state.reducer.company.success;
export const selectCompanyTotal = (state: RootState) => state.reducer.company.total;