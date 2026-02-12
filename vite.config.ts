import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/', // For custom domain deployment
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Expose only non-secret environment variables to the client
      'process.env.REACT_APP_AWS_REGION': JSON.stringify(env.REACT_APP_AWS_REGION),
      'process.env.REACT_APP_S3_BUCKET_NAME': JSON.stringify(env.REACT_APP_S3_BUCKET_NAME),
      'process.env.REACT_APP_DYNAMODB_TABLE_NAME': JSON.stringify(env.REACT_APP_DYNAMODB_TABLE_NAME),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(env.REACT_APP_API_BASE_URL)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
