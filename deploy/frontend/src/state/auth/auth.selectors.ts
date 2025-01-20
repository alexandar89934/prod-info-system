import { RootState } from '../store.ts';

import { getFromLocalStorage } from '@/services/local.storage.ts';

export const getIsLoggedIn = (state: RootState) =>
  state.reducer.auth.isLoggedIn;

export const getName = () => getFromLocalStorage('name');
