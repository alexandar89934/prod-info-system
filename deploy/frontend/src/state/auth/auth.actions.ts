import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { LoginFormData } from '@/scenes/login';
import { ResetPasswordFormData } from '@/scenes/personManagement/ResetPasswordPage.tsx';
import axiosServer from '@/services/axios.service.ts';
import { DefaultResponse } from '@/state/auth/auth.types.ts';

export const userLogin = createAsyncThunk<DefaultResponse, LoginFormData>(
  'auth/userLogin',
  async (reqData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/auth/user', reqData);

      if (!response.data.success) {
        return rejectWithValue(response.data.error.message || 'Login failed');
      }

      const { token } = response.headers;
      const { name, employeeNumber, picture } = response.data.content;

      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('employeeNumber', employeeNumber);
      localStorage.setItem('profilePicture', picture);

      return response.data;
    } catch (err: any) {
      Sentry.captureException(err);
      return rejectWithValue(
        err?.response?.data?.error?.message || 'An error occurred during login.'
      );
    }
  }
);

export const resetPassword = createAsyncThunk<
  DefaultResponse,
  ResetPasswordFormData,
  { rejectValue: string }
>('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/auth/user/reset-password', data);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.data?.message || ''}, ${response.data?.error?.message || 'Failed to reset password'}`
      );
    }
    const { token } = response.headers;
    localStorage.setItem('token', token);
    return response.data;
  } catch (err: any) {
    Sentry.captureException(err);
    return rejectWithValue(
      err?.response?.data?.message || 'An unexpected error occurred.'
    );
  }
});

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/auth/user/logout', {});
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''}, ${response.data?.error?.message || 'Logout Failed'}`
        );
      }

      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('employeeNumber');
      localStorage.removeItem('profilePicture');

      return response.data;
    } catch (err: any) {
      Sentry.captureException(err);
      return rejectWithValue('An error occurred during logout.');
    }
  }
);
