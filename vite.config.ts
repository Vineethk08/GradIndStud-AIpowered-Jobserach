import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env from both .env and .env.local
    const env = loadEnv(mode, '.', '');
    
    // Get API keys from multiple possible sources
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    const rapidApiKey = env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.RAPIDAPI_KEY': JSON.stringify(rapidApiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false
      }
    };
});
