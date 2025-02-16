import { createAsyncThunk } from '@reduxjs/toolkit';

import { EditPersonFormData, AddPersonFormData } from './person.types';

import axiosServer from '@/services/axios.service.ts';
import {
  setDocuments,
  setError,
  setPerson,
} from '@/state/person/person.slice.ts';

export const fetchPersons = createAsyncThunk(
  'person/',
  async (
    {
      page = 1,
      limit = 10,
      search = '',
      sortField = '',
      sortOrder = '',
    }: {
      page: number;
      limit: number;
      search: string;
      sortField?: string;
      sortOrder?: string;
    },
    { dispatch }
  ) => {
    try {
      const response = await axiosServer.get(`/person/`, {
        params: { page, limit, search, sortField, sortOrder },
      });
      return response.data;
    } catch (error) {
      dispatch(setError(error.message));
      return error;
    }
  }
);

export const fetchPersonById = createAsyncThunk(
  'person/getPersonById',
  async (personId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosServer.get(`/person/${personId}`);
      dispatch(setPerson(response.data.content.person));
      return response.data;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addPerson = createAsyncThunk(
  'person/add',
  async (person: AddPersonFormData, { dispatch }) => {
    try {
      const response = await axiosServer.post(`/person/create`, person);
      return response.data;
    } catch (error) {
      dispatch(setError(error.message));
      return error;
    }
  }
);

export const updatePerson = createAsyncThunk(
  'person/update',
  async (person: EditPersonFormData, { dispatch }) => {
    try {
      const response = await axiosServer.put(
        `/person/update/${person.id}`,
        person
      );
      return response.data;
    } catch (error) {
      dispatch(setError(error.message));
      return error;
    }
  }
);

export const deletePerson = createAsyncThunk(
  'person/delete',
  async (personId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(`/person/delete/${personId}`);
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          `Client error: ${response.status} - ${response.data.message}`
        );
      }
      return response.data;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error || 'Failed to delete person.');
    }
  }
);

export const uploadImage = createAsyncThunk(
  'person/uploadImage',
  async (file: FormData, { dispatch }) => {
    try {
      const response = await axiosServer.post('/person/upload-image', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(setError(error.message));
      return error;
    }
  }
);
export const uploadFile = createAsyncThunk(
  'person/uploadImage',
  async (file: FormData, { dispatch }) => {
    try {
      const response = await axiosServer.post('/person/upload-file', file, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.data || !response.data.content.documents) {
        throw new Error('Updated document list not returned from API');
      }

      const updatedDocuments = response.data.content.documents;

      dispatch(setDocuments(updatedDocuments));

      return updatedDocuments;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const uploadFileForNewPerson = createAsyncThunk(
  'person/uploadImage',
  async (file: FormData, { dispatch }) => {
    try {
      const response = await axiosServer.post(
        '/person/upload-file-new-person',
        file,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (!response.data || !response.data.content) {
        throw new Error('Updated document list not returned from API');
      }
      return response.data.content;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const updatePersonsImagePath = createAsyncThunk(
  'person/update-image-path',
  async (
    { personId, newImagePath }: { personId: string; newImagePath: string },
    { dispatch }
  ) => {
    try {
      const response = await axiosServer.put(
        `/person/update-image/${personId}`,
        {
          newImagePath,
        }
      );

      if (!response.data || !response.data.content) {
        throw new Error('Updated image path not returned from API');
      }

      return response.data.content;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const deleteFile = createAsyncThunk(
  'person/delete-file',
  async (
    { personId, documentName }: { personId: string; documentName: string },
    { dispatch }
  ) => {
    try {
      const response = await axiosServer.delete(
        `/person/delete-file/${personId}`,
        {
          data: { documentName },
        }
      );

      if (!response.data || !response.data.content.documents) {
        throw new Error('Updated document list not returned from API');
      }

      const updatedDocuments = response.data.content.documents;

      dispatch(setDocuments(updatedDocuments));

      return updatedDocuments;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const deleteFileNewPerson = createAsyncThunk(
  'person/delete-file-new-person',
  async ({ documentPath }: { documentPath: string }, { dispatch }) => {
    try {
      const response = await axiosServer.post(
        `/person/delete-file-new-person`,
        { documentPath }
      );

      if (!response.data || !response.data.content) {
        throw new Error('Updated document list not returned from API');
      }
      return response.data.content;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const downloadFile = createAsyncThunk(
  'person/downloadFile',
  async (fileName: string) => {
    try {
      const response = await axiosServer.get(
        `/person/download-file/${fileName}`,
        {
          responseType: 'blob', // Important for file download
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Set file name for download
      document.body.appendChild(link);
      link.click();
      link.remove();

      return fileName;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
);

export const viewFile = createAsyncThunk(
  'person/viewFile',
  async (fileName: string) => {
    try {
      const response = await axiosServer.get(`/person/view-file/${fileName}`, {
        responseType: 'blob',
      });

      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',
        txt: 'text/plain',
        csv: 'text/csv',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
      };

      const mimeType =
        mimeTypes[fileExtension || ''] || 'application/octet-stream'; // Default if unknown

      const blob = new Blob([response.data], { type: mimeType });
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank');

      return fileName;
    } catch (error) {
      console.error('Error viewing file:', error);
      throw error;
    }
  }
);
