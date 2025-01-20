export const config = {
  backend: {
    apiUrl: import.meta.env.VITE_API_ENDPOINT,
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    authKey: import.meta.env.VITE_SENTRY_AUTH_KEY,
    env: import.meta.env.VITE_SENTRY_ENV,
  },
  mobileApp: {
    name: import.meta.env.VITE_MOBILE_APP_NAME,
  },
};
