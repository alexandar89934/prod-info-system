import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  uploadSingleFile,
  deleteFileMachineEquipment,
} from '@/state/fileUploads/files.actions.ts';
import { FileItem } from '@/state/fileUploads/files.types.ts';

const initialFile: FileItem = {
  dateAdded: '',
  path: '',
  name: '',
};

interface FileState {
  file: FileItem;
  files: FileItem[];
  total: number;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: FileState = {
  file: initialFile,
  files: [],
  total: 0,
  loading: false,
  error: null,
  success: null,
};

const filesSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    clearFile(state) {
      state.file = initialFile;
    },
    clearNotifications(state) {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    clearFiles(state) {
      state.files = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSingleFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        uploadSingleFile.fulfilled,
        (
          state,
          action: PayloadAction<{ name: string; path: string; dateAdded: string }>
        ) => {
          state.loading = false;
          state.success = 'File uploaded successfully';
          state.files.push(action.payload);
          state.file = action.payload;
        }
      )
      .addCase(uploadSingleFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFileMachineEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFileMachineEquipment.fulfilled, (state) => {
        state.loading = false;
        state.success = 'File deleted successfully';
      })
      .addCase(deleteFileMachineEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotifications, clearFile, clearFiles } = filesSlice.actions;

export default filesSlice.reducer;