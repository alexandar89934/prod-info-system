import { createSlice } from '@reduxjs/toolkit';

import {
  fetchSystemConfigs,
  updateSystemConfig,
} from './systemConfig.actions.ts';
import { SystemConfigState } from './systemConfig.types.ts';

const initialState: SystemConfigState = {
  configs: [],
  loading: false,
  updateLoading: false,
  error: null,
  success: null,
};

const systemConfigSlice = createSlice({
  name: 'systemConfig',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload;
      })
      .addCase(fetchSystemConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load settings.';
      })
      .addCase(updateSystemConfig.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateSystemConfig.fulfilled, (state, action) => {
        state.updateLoading = false;
        const idx = state.configs.findIndex(
          (c) => c.key === action.payload.key
        );
        if (idx !== -1) state.configs[idx] = action.payload;
        state.success = 'saved';
      })
      .addCase(updateSystemConfig.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? 'Failed to update setting.';
      });
  },
});

export const { clearError, clearSuccess } = systemConfigSlice.actions;
export default systemConfigSlice.reducer;
