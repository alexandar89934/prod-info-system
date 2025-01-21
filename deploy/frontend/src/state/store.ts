import { configureStore } from '@reduxjs/toolkit';

import reducer from './reducer';

export const makeStore = () =>
  configureStore({
    reducer,
  });

const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
