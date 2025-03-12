import { RootState } from '../store';

export const selectPersons = (state: RootState) => state.reducer.person.persons;
export const selectPerson = (state: RootState) => state.reducer.person.person;
export const selectError = (state: RootState) => state.reducer.person.error;
export const selectSuccess = (state: RootState) => state.reducer.person.success;
export const selectLoading = (state: RootState) => state.reducer.person.loading;
export const selectTotal = (state: RootState) => state.reducer.person.total;
