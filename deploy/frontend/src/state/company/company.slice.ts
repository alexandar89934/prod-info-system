import { createSlice } from '@reduxjs/toolkit';

import {
  addCompany,
  deleteCompany,
  fetchCompanies,
  fetchCompaniesList,
  fetchCompanyById,
  updateCompany,
} from './company.actions';
import { CompanyState } from './company.types';

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  companiesList: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearSuccess(state) { state.success = null; },
    clearError(state) { state.error = null; },
    resetState() { return initialState; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.content.companies;
        state.total = action.payload.content.pagination.total;
      })
      .addCase(fetchCompanies.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(fetchCompaniesList.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCompaniesList.fulfilled, (state, action) => { state.loading = false; state.companiesList = action.payload; })
      .addCase(fetchCompaniesList.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(fetchCompanyById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCompanyById.fulfilled, (state, action) => { state.loading = false; state.currentCompany = action.payload; })
      .addCase(fetchCompanyById.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch'; })

      .addCase(addCompany.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addCompany.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Created'; })
      .addCase(addCompany.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create'; })

      .addCase(updateCompany.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCompany.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Updated'; })
      .addCase(updateCompany.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update'; })

      .addCase(deleteCompany.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCompany.fulfilled, (state, action) => { state.loading = false; state.success = action.payload.message || 'Deleted'; })
      .addCase(deleteCompany.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete'; });
  },
});

export const { clearSuccess, clearError, resetState } = companySlice.actions;
export default companySlice.reducer;