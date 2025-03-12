import { combineReducers } from '@reduxjs/toolkit';

import authSlice from '@/state/auth/auth.slice.ts';
import personSlice from '@/state/person/person.slice.ts';
import roleSlice from '@/state/role/role.slice.ts';
import themeSlice from '@/state/theme/theme.slice.ts';

const reducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
  person: personSlice,
  role: roleSlice,
});

export default { reducer };
