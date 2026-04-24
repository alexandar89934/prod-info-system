import { setupListeners } from '@reduxjs/toolkit/query';
import ReactDOM from 'react-dom/client';
import './main.css';
import './i18n';
import { Provider } from 'react-redux';

import App from './App';
import store from './state/store';

setupListeners(store.dispatch);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
