import { createSlice } from '@reduxjs/toolkit';

import profileImage from '../../assets/profile.jpeg';

import { getFromLocalStorage } from '@/services/local.storage.ts';

const authInitialState = {
  isLoggedIn: !!getFromLocalStorage('token'),
  name: '',
  employeeNumber: '',
  id: getFromLocalStorage('id'),
  profilePicture: profileImage,
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState: authInitialState,
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },
    logoutState: (state) => {
      state.isLoggedIn = false;
    },
    setName: (state, action) => {
      state.name = action.payload.name;
    },
    setEmployeeNumber: (state, action) => {
      state.employeeNumber = action.payload.employeeNumber;
    },
    setProfilePicture: (state, action) => {
      state.profilePicture = action.payload.profilePicture;
    },
  },
});

export const {
  login,
  logoutState,
  setName,
  setEmployeeNumber,
  setProfilePicture,
} = authSlice.actions;
export default authSlice.reducer;
