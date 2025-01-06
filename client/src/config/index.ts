interface Config {
  API_URL: string;
  APP_ENV: string;
  AUTH_TOKEN_KEY: string;
  APP_NAME: string;
  ENVIRONMENT: string;
}

export const config: Config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  AUTH_TOKEN_KEY: 'secret',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Your App Name',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
};