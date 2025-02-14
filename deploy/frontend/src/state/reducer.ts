import { combineReducers } from '@reduxjs/toolkit';

import authSlice from '@/state/auth/auth.slice.ts';
import personSlice from '@/state/person/person.slice.ts';
import themeSlice from '@/state/theme/theme.slice.ts';

const reducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
  person: personSlice,
});

export default { reducer };
