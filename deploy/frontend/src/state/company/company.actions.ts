import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import axiosServer from '@/services/axios.service';
import {
  Company,
  CompanyListItem,
  CompanyListResponse,
  CompanySelectListResponse,
  CompanySingleResponse,
  FetchCompanyParams,
} from './company.types';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const e = error as AxiosError<ApiErrorResponse>;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
};

export const fetchCompanies = createAsyncThunk<CompanyListResponse, FetchCompanyParams, { rejectValue: string }>(
  'company/fetchAll',
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get('/company', { params: { page, limit, search } });
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch companies');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch companies'));
    }
  },
);

export const fetchCompaniesList = createAsyncThunk<CompanyListItem[], void, { rejectValue: string }>(
  'company/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get<CompanySelectListResponse>('/company/list');
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch companies list');
      return response.data.content.companies;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch companies list'));
    }
  },
);

export const fetchCompanyById = createAsyncThunk<Company, string, { rejectValue: string }>(
  'company/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(`/company/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch company');
      return response.data.content.company as Company;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch company'));
    }
  },
);

export const addCompany = createAsyncThunk<CompanySingleResponse, Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, { rejectValue: string }>(
  'company/add',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/company/create', data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to create company');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to create company'));
    }
  },
);

export const updateCompany = createAsyncThunk<CompanySingleResponse, Company, { rejectValue: string }>(
  'company/update',
  async (data, { rejectWithValue }) => {
    try {
      const { id, ...body } = data;
      const response = await axiosServer.put(`/company/update/${id}`, body);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update company');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update company'));
    }
  },
);

export const uploadCompanyLogo = createAsyncThunk<string, File, { rejectValue: string }>(
  'company/uploadLogo',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await axiosServer.post('/company/upload-logo', formData);
      if (!response.data.success) return rejectWithValue('Upload failed');
      return response.data.path as string;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to upload logo'));
    }
  },
);

export const deleteCompany = createAsyncThunk<CompanySingleResponse, string, { rejectValue: string }>(
  'company/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(`/company/delete/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete company');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete company'));
    }
  },
);