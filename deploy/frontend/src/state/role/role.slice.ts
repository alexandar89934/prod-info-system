import { createSlice } from '@reduxjs/toolkit';

import { RoleState } from '@/state/person/person.types.ts';
import { fetchRoles } from '@/state/role/role.actions.ts';

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
  success: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.content;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default roleSlice.reducer;
