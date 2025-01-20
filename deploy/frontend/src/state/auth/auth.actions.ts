import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { LoginFormData } from '@/scenes/login';
import axiosServer from '@/services/axios.service.ts';
import { login, logoutState, setName } from '@/state/auth/auth.slice.ts';
import { DefaultResponse } from '@/state/auth/auth.types.ts';

const adminLogin = createAsyncThunk<DefaultResponse, LoginFormData>(
  'admin/login',
  async (reqData, { dispatch }) => {
    try {
      const axiosResponse = await axiosServer.post('/auth/admin', reqData);
      if (!axiosResponse.data.success) {
        return axiosResponse.data;
      }

      const { token } = axiosResponse.headers;
      localStorage.setItem('token', token);
      localStorage.setItem('name', axiosResponse.data.content.name);
      dispatch(login());
      dispatch(
        setName({
          name: axiosResponse.data.content.name,
        })
      );
      return axiosResponse.data;
    } catch (error) {
      Sentry.captureException(error);
      return error;
    }
  }
);

const logout = ({ dispatch }) => {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  dispatch(logoutState());
  dispatch(setName(''));
};

export { adminLogin, logout };
