import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PersonState, AddPersonFormData, DocumentData } from './person.types';

import profileImage from '@/assets/profile.jpeg';
import { getName } from '@/state/auth/auth.selectors.ts';

const initialState: PersonState = {
  persons: [],
  person: null,
  total: 0,
  loading: false,
  error: null,
  documents: [],
};

const personSlice = createSlice({
  name: 'person',
  initialState,
  reducers: {
    setPerson(state, action: PayloadAction<AddPersonFormData>) {
      if (action.payload) {
        state.person = action.payload;
      }
    },
    clearPerson(state) {
      state.person = null;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updatePersonPicture(state, action: PayloadAction<string>) {
      if (state.person) {
        state.person.picture = action.payload; // Assuming `picture` is the correct field
      }
    },
    setDocuments(state, action: PayloadAction<DocumentData | DocumentData[]>) {
      if (state.person) {
        state.person = {
          ...state.person,
          documents: Array.isArray(action.payload)
            ? [...action.payload]
            : [...state.person.documents, action.payload],
        };
      } else {
        state.person = {
          profileImage,
          employeeNumber: 0,
          name: '',
          address: '',
          mail: '',
          picture: '',
          additionalInfo: '',
          createdAt: null,
          updatedAt: null,
          createdBy: getName(),
          updatedBy: getName(),
          documents: Array.isArray(action.payload)
            ? action.payload
            : [action.payload],
        };
      }
    },
  },
});

export const {
  setPerson,
  clearPerson,
  setError,
  setDocuments,
  updatePersonPicture,
} = personSlice.actions;

export default personSlice.reducer;
