import { createSlice } from '@reduxjs/toolkit';

import { ThemeState } from './theme.types';

import { getFromLocalStorage } from '@/services/local.storage.ts';

const theme = getFromLocalStorage('themeMode');
const themeInitialState: ThemeState = {
  mode: theme || 'light',
};

export const themeSlice = createSlice({
  name: 'themeSlice',
  initialState: themeInitialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      const themeMode = state.mode;
      localStorage.setItem('themeMode', themeMode);
    },
  },
});

export const { setMode } = themeSlice.actions;

export default themeSlice.reducer;
