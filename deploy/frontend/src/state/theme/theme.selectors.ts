import { RootState } from '../store.ts';

export const selectThemeMode = (state: RootState) => state.reducer.theme.mode;
