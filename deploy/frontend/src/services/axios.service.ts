import axios from 'axios';

import { config } from '../config/config.ts';

import { getFromLocalStorage } from '@/services/local.storage.ts';

const removeUser = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('employeeNumber');
  localStorage.removeItem('profilePicture');
};
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
  await removeUser();
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
      await removeUser();
      return {
        data: {
          success: false,
          message: error.response.data.message,
        },
      };
    } catch (refreshError) {
      await removeUser();
      return {
        data: {
          success: false,
          message: error.response.data.message,
        },
      };
    }
  }
  await removeUser();
  return {
    data: {
      success: false,
      message: error.response.data.message,
    },
  };
};

const handleUnauthorizedResponse = async (error: any) => {
  if (error.response.data.tokenExpired) {
    return handleTokenExpiredResponse(error);
  }
  if (error.response.data.tokenNotValid) {
    await removeUser();
    return {
      data: {
        success: false,
        message: error.response.data.message,
      },
    };
  }
  return {
    data: {
      success: false,
      message: error.response.data.message,
    },
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
