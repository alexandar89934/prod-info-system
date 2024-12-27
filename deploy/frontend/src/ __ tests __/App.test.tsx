import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import App from '../App';
import store from '../redux/store';

test('demo', () => {
  expect(true).toBe(true);
});

test('Renders the main page', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(true).toBeTruthy();
});
