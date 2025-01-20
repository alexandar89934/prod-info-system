import { createSlice } from '@reduxjs/toolkit';

import { getFromLocalStorage } from '@/services/local.storage.ts';

const authInitialState = {
  isLoggedIn: !!getFromLocalStorage('token'),
  name: '',
  id: getFromLocalStorage('id'),
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
  },
});

export const { login, logoutState, setName } = authSlice.actions;
export default authSlice.reducer;
