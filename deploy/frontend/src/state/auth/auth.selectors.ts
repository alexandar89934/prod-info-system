import profile from '../../assets/profile.jpeg';
import { RootState } from '../store.ts';

import { getFromLocalStorage } from '@/services/local.storage.ts';

export const getIsLoggedIn = (state: RootState) =>
  state.reducer.auth.isLoggedIn;

export const getProfilePicture = () => {
  let profilePicture = getFromLocalStorage('profilePicture');
  if (profilePicture === 'null') {
    profilePicture = profile;
  }
  return profilePicture;
};
export const getName = () => getFromLocalStorage('name');
export const getEmployeeNumber = () => getFromLocalStorage('employeeNumber');
