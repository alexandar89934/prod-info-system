import { createSlice } from '@reduxjs/toolkit';

import { DocumentData, PersonState } from './person.types';

import profileImage from '@/assets/profile.jpeg';
import { getName } from '@/state/auth/auth.selectors.ts';
import {
  addPerson,
  deleteFile,
  deleteFileNewPerson,
  deletePerson,
  fetchPersonByEmployeeNumber,
  fetchPersonById,
  fetchPersons,
  updatePassword,
  updatePerson,
  updatePersonsImagePath,
  uploadFile,
  uploadFileForNewPerson,
  uploadImage,
} from '@/state/person/person.actions.ts';

const initialPerson: PersonState['person'] = {
  profileImage,
  employeeNumber: 0,
  name: '',
  address: '',
  mail: '',
  picture: '',
  additionalInfo: '',
  startDate: '',
  endDate: '',
  roles: [],
  workplaces: [],
  createdAt: null,
  updatedAt: null,
  createdBy: getName(),
  updatedBy: getName(),
  documents: [],
};

const initialState: PersonState = {
  persons: [],
  person: initialPerson,
  total: 0,
  loading: false,
  error: null,
  success: null,
};

const personSlice = createSlice({
  name: 'person',
  initialState,
  reducers: {
    clearPerson(state) {
      state.person = initialPerson;
    },
    clearNotifications(state) {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    clearPersons: (state) => {
      state.persons = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = action.payload.content?.persons;
        state.total = action.payload.content?.pagination?.total;
      })
      .addCase(fetchPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPersonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonById.fulfilled, (state, action) => {
        state.loading = false;
        state.person = action.payload;
      })
      .addCase(fetchPersonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPersonByEmployeeNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonByEmployeeNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.person = action.payload;
      })
      .addCase(fetchPersonByEmployeeNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(addPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const localStorageEmployeeNumber =
          localStorage.getItem('employeeNumber');
        if (
          Number(localStorageEmployeeNumber) ===
          action.payload.content.person.employeeNumber
        ) {
          localStorage.setItem('name', action.payload.content.person.name);
        }
      })
      .addCase(updatePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(deletePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePersonsImagePath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonsImagePath.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.person.picture = action.payload;
      })
      .addCase(updatePersonsImagePath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.person.documents = action.payload;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadFileForNewPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFileForNewPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.person.documents = [...state.person.documents, action.payload];
      })
      .addCase(uploadFileForNewPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false;
        state.person.documents = action.payload;
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFileNewPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFileNewPerson.fulfilled, (state, action) => {
        state.loading = false;

        const docs = state.person.documents;

        if (
          Array.isArray(docs) &&
          docs.length > 0 &&
          typeof docs[0] === 'object' &&
          docs[0] !== null &&
          'path' in docs[0]
        ) {
          state.person.documents = (docs as DocumentData[]).filter(
            (doc) => doc.path !== action.payload
          );
        }
      })
      .addCase(deleteFileNewPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotifications, clearPerson, clearPersons } =
  personSlice.actions;

export default personSlice.reducer;
