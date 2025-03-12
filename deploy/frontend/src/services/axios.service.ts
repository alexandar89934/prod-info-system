import axios from 'axios';

import { config } from '../config/config.ts';

import { getFromLocalStorage } from '@/services/local.storage.ts';

const axiosServer = axios.create({
  baseURL: config.backend.apiUrl,
  withCredentials: true,
});

let isTokenRenewing = false;
let tokenRenewalPromise: Promise<boolean> | null = null;

export const renewTokens = async () => {
  const axiosResponse = await axiosServer.post('/auth/user/renew-token');
  if (axiosResponse.data.success) {
    const { token } = axiosResponse.headers;
    localStorage.setItem('token', token);
    return true;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('employeeNumber');
  localStorage.removeItem('profilePicture');
  return false;
};

const handleTokenExpiredResponse = async (error: any) => {
  const originalRequest = error.config;
  // eslint-disable-next-line no-underscore-dangle
  if (!originalRequest._retry) {
    // eslint-disable-next-line no-underscore-dangle
    originalRequest._retry = true;

    if (!isTokenRenewing) {
      isTokenRenewing = true;
      tokenRenewalPromise = renewTokens();
    }

    const tokenRenewed = await tokenRenewalPromise;
    isTokenRenewing = false;

    try {
      if (tokenRenewed) {
        originalRequest.headers.token = getFromLocalStorage('token');

        return await axios(originalRequest);
      }

      return {
        data: { success: false, error: { message: 'Error', removeUser: true } },
      };
    } catch (refreshError) {
      return {
        data: { success: false, error: { message: 'Error', removeUser: true } },
      };
    }
  }

  return {
    data: { success: false, error: { message: 'Error', removeUser: true } },
  };
};

const handleUnauthorizedResponse = async (error: any) => {
  if (error.response.data.error.tokenExpired) {
    return handleTokenExpiredResponse(error);
  }

  return {
    data: { success: false, error: { message: 'Error', removeUser: true } },
  };
};

axiosServer.interceptors.request.use(
  (reqConfig) => {
    // eslint-disable-next-line no-param-reassign
    reqConfig.headers.token = getFromLocalStorage('token');

    return reqConfig;
  },
  (error) => {
    return error;
  }
);

axiosServer.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status === 401) {
      return handleUnauthorizedResponse(error);
    }

    return error.response;
  }
);

export default axiosServer;
