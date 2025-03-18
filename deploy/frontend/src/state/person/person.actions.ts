import { createAsyncThunk } from '@reduxjs/toolkit';

import { EditPersonFormData, AddPersonFormData } from './person.types';
import { mimeTypes } from './person.types';

import axiosServer from '@/services/axios.service.ts';

export const fetchPersons = createAsyncThunk<
  { content: { persons: EditPersonFormData[]; pagination: { total: number } } },
  {
    page: number;
    limit: number;
    search: string;
    sortField?: string;
    sortOrder?: string;
  },
  { rejectValue: string }
>(
  'person/fetchPersons',
  async (
    { page = 1, limit = 10, search = '', sortField = '', sortOrder = '' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get(`/person/`, {
        params: { page, limit, search, sortField, sortOrder },
      });
      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? ''} ${response.statusText ?? ''} ${response.data?.error?.message || 'An error occurred while fetching persons.'}`
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const fetchPersonById = createAsyncThunk(
  'person/fetchPersonById',
  async (personId: string, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(`/person/${personId}`);
      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.error?.message || 'An error occurred while fetching person.'}`
        );
      }
      return response.data.content?.person;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const fetchPersonByEmployeeNumber = createAsyncThunk(
  'person/getPersonByEmployeeNumber',
  async (employeeNumber: string, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(
        `/person/profile/${employeeNumber}`
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.error?.message || 'An error occurred while fetching person.'}`
        );
      }
      return response.data.content?.person;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const addPerson = createAsyncThunk(
  'person/addPerson',
  async (person: AddPersonFormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(`/person/create`, person);
      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.error?.message || 'An error occurred while adding persons.'}`
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const updatePerson = createAsyncThunk(
  'person/updatePerson',
  async (person: EditPersonFormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(
        `/person/update/${person.id}`,
        person
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.error?.message || 'An error occurred while updating person.'}`
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const deletePerson = createAsyncThunk(
  'person/deletePerson',
  async (personId: string, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(`/person/delete/${personId}`);
      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.status ?? 'Unknown Status'} - ${response.data?.error?.message || response.data?.message || 'An error occurred.'}`
        );
      }
      if (response.data.error) {
        return rejectWithValue(`${response.data.error.message}`);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error || 'Failed to delete person.');
    }
  }
);

export const uploadImage = createAsyncThunk(
  'person/uploadImage',
  async (file: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/person/upload-image', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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

export const updatePersonsImagePath = createAsyncThunk(
  'person/updatePersonsImagePath',
  async (
    { personId, newImagePath }: { personId: string; newImagePath: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.put(
        `/person/update-image/${personId}`,
        {
          newImagePath,
        }
      );
      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.data.error.code} - ${response.data.error.message}`
        );
      }

      return response.data.content;
    } catch (error) {
      return rejectWithValue(error || 'Failed to upload persons image path.');
    }
  }
);

export const uploadFile = createAsyncThunk(
  'person/uploadFile',
  async (file: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/person/upload-file', file, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.data.error.code} - ${response.data.error.message}`
        );
      }
      return response.data.content.documents;
    } catch (error) {
      return rejectWithValue(error || 'Failed to upload persons document.');
    }
  }
);

export const uploadFileForNewPerson = createAsyncThunk(
  'person/uploadFileForNewPerson',
  async (file: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        '/person/upload-file-new-person',
        file,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.data.error.code} - ${response.data.error.message}`
        );
      }

      return response.data.content;
    } catch (error) {
      return rejectWithValue(error || 'Failed to upload document.');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'person/deleteFile',
  async (
    { personId, documentName }: { personId: string; documentName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.delete(
        `/person/delete-file/${personId}`,
        {
          data: { documentName },
        }
      );

      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.data.error.code} - ${response.data.error.message}`
        );
      }
      return response.data.content.documents;
    } catch (error) {
      return rejectWithValue(error || 'Failed to delete document.');
    }
  }
);

export const deleteFileNewPerson = createAsyncThunk(
  'person/deleteFileNewPerson',
  async ({ documentPath }: { documentPath: string }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        `/person/delete-file-new-person`,
        { documentPath }
      );

      if (response.status >= 400 && response.status < 500) {
        return rejectWithValue(
          `Client error: ${response.data.error.code} - ${response.data.error.message}`
        );
      }
      return response.data.content;
    } catch (error) {
      return rejectWithValue(error || 'Failed to delete document.');
    }
  }
);

export const downloadFile = createAsyncThunk(
  'person/downloadFile',
  async (fileName: string) => {
    const response = await axiosServer.get(
      `/person/download-file/${fileName}`,
      {
        responseType: 'blob',
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
  }
);

export const viewFile = createAsyncThunk(
  'person/viewFile',
  async (fileName: string) => {
    const response = await axiosServer.get(`/person/view-file/${fileName}`, {
      responseType: 'blob',
    });

    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    const mimeType =
      mimeTypes[fileExtension || ''] || 'application/octet-stream'; // Default if unknown

    const blob = new Blob([response.data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank');

    return fileName;
  }
);
