import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { LoginFormData } from '@/scenes/login';
import axiosServer from '@/services/axios.service.ts';
import {
  login,
  logoutState,
  setEmployeeNumber,
  setName,
  setProfilePicture,
} from '@/state/auth/auth.slice.ts';
import { DefaultResponse } from '@/state/auth/auth.types.ts';

const userLogin = createAsyncThunk<DefaultResponse, LoginFormData>(
  'user/login',
  async (reqData, { dispatch }) => {
    try {
      const axiosResponse = await axiosServer.post('/auth/user', reqData);
      if (!axiosResponse.data.success) {
        return axiosResponse.data;
      }

      const { token } = axiosResponse.headers;
      localStorage.setItem('token', token);
      localStorage.setItem('name', axiosResponse.data.content.name);
      localStorage.setItem(
        'employeeNumber',
        axiosResponse.data.content.employeeNumber
      );
      localStorage.setItem(
        'profilePicture',
        axiosResponse.data.content.picture
      );
      dispatch(login());
      dispatch(
        setName({
          name: axiosResponse.data.content.name,
        })
      );
      dispatch(
        setEmployeeNumber({
          employeeNumber: axiosResponse.data.content.employeeNumber,
        })
      );
      dispatch(
        setProfilePicture({
          profilePicture: axiosResponse.data.content.picture,
        })
      );
      return axiosResponse.data;
    } catch (error) {
      Sentry.captureException(error);
      return error;
    }
  }
);

const logout = async ({ dispatch }) => {
  const axiosResponse = await axiosServer.post('/auth/user/logout', {});
  if (!axiosResponse.data.success) {
    return axiosResponse.data;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('employeeNumber');
  localStorage.removeItem('profilePicture');
  dispatch(logoutState());
  dispatch(setName(''));
  return axiosResponse.data;
};

export { userLogin, logout };
