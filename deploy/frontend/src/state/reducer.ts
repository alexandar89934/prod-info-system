import { combineReducers } from '@reduxjs/toolkit';

import authSlice from '@/state/auth/auth.slice.ts';
import themeSlice from '@/state/theme/theme.slice.ts';

const reducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
});

export default { reducer };
