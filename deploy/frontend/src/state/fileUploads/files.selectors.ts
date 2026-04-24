import { RootState } from '../store';

export const selectFiles = (state: RootState) => state.reducer.filesUpload.files;
export const selectFile = (state: RootState) => state.reducer.filesUpload.file;
export const selectLoading = (state: RootState) => state.reducer.filesUpload.loading;
export const selectError = (state: RootState) => state.reducer.filesUpload.error;