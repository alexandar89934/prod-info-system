import { createSlice } from '@reduxjs/toolkit';

import profileImage from '../../assets/profile.jpeg';

import { getFromLocalStorage } from '@/services/local.storage.ts';
import { logout, resetPassword, userLogin } from '@/state/auth/auth.actions.ts';

const authInitialState = {
  isLoggedIn: !!getFromLocalStorage('token'),
  name: '',
  employeeNumber: '',
  id: getFromLocalStorage('id'),
  profilePicture: profileImage,
  loading: false,
  error: null as string | null,
  success: null as string | null,
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState: authInitialState,
  reducers: {
    clearNotifications: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        const { name, employeeNumber, picture } = action.payload.content;
        state.loading = false;
        state.isLoggedIn = true;
        state.name = name;
        state.employeeNumber = employeeNumber;
        state.profilePicture = picture;
        state.success = 'Logged in successfully';
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.name = '';
        state.employeeNumber = '';
        state.profilePicture = profileImage;
        state.success = 'Logged out successfully';
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotifications } = authSlice.actions;
export default authSlice.reducer;
