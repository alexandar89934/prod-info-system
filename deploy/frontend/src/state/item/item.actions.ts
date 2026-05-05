import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import axiosServer from '@/services/axios.service';

import {
  AddItemFormData,
  BomLine,
  BomLineListResponse,
  BomLineSingleResponse,
  EditItemFormData,
  FetchItemParams,
  ItemListResponse,
  ItemSingleResponse,
} from './item.types';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const axiosErr = error as AxiosError<ApiErrorResponse>;
  return (
    axiosErr?.response?.data?.error?.message ||
    axiosErr?.response?.data?.message ||
    axiosErr?.message ||
    fallback
  );
};

export const fetchItems = createAsyncThunk<ItemListResponse, FetchItemParams, { rejectValue: string }>(
  'item/fetchAll',
  async ({ page, limit, search, sortField, sortOrder }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get('/item', { params: { page, limit, search, sortField, sortOrder } });
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch items');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch items'));
    }
  },
);

export const fetchItemById = createAsyncThunk<EditItemFormData, string, { rejectValue: string }>(
  'item/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(`/item/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch item');
      return response.data.content.item as EditItemFormData;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch item'));
    }
  },
);

export const addItem = createAsyncThunk<ItemSingleResponse, AddItemFormData, { rejectValue: string }>(
  'item/add',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/item/create', data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to add item');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to add item'));
    }
  },
);

export const updateItem = createAsyncThunk<ItemSingleResponse, EditItemFormData, { rejectValue: string }>(
  'item/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(`/item/update/${data.id}`, data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update item');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update item'));
    }
  },
);

export const deleteItem = createAsyncThunk<ItemSingleResponse, string, { rejectValue: string }>(
  'item/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(`/item/delete/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete item');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete item'));
    }
  },
);

export const fetchBomLines = createAsyncThunk<BomLineListResponse, string, { rejectValue: string }>(
  'item/fetchBomLines',
  async (outputItemId, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(`/item/${outputItemId}/bom`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch BOM');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch BOM'));
    }
  },
);

export const addBomLine = createAsyncThunk<BomLineSingleResponse, Omit<BomLine, 'id' | 'inputItemCode' | 'inputItemName' | 'inputItemUnit'>, { rejectValue: string }>(
  'item/addBomLine',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(`/item/${data.outputItemId}/bom/create`, data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to add BOM line');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to add BOM line'));
    }
  },
);

export const updateBomLine = createAsyncThunk<BomLineSingleResponse, BomLine & { id: string }, { rejectValue: string }>(
  'item/updateBomLine',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(`/item/${data.outputItemId}/bom/update/${data.id}`, data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update BOM line');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update BOM line'));
    }
  },
);

export const deleteBomLine = createAsyncThunk<BomLineSingleResponse, { outputItemId: string; id: string }, { rejectValue: string }>(
  'item/deleteBomLine',
  async ({ outputItemId, id }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(`/item/${outputItemId}/bom/delete/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete BOM line');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete BOM line'));
    }
  },
);