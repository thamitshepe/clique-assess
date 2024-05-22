import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    image(),
    resolve() // Add the resolve plugin here
  ],
  build: {
    rollupOptions: {
      external: [
        // Add any other external dependencies here
      ]
    }
  }
});
