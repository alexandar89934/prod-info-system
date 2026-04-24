import { createAsyncThunk } from '@reduxjs/toolkit';

import axiosServer from '@/services/axios.service.ts';

export const uploadSingleFile = createAsyncThunk(
  'file-upload/singleFile',
  async (file: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        '/file-upload/upload-single-file',
        file,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.status} - ${response.statusText}`
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error || 'Failed to upload image.');
    }
  }
);

export const deleteFileMachineEquipment = createAsyncThunk(
  'file-upload/deleteFile',
  async ({ documentPath }: { documentPath: string }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete('/file-upload/delete-file', {
        data: { filePath: documentPath },
      });
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to delete file'
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(String(error));
    }
  }
);