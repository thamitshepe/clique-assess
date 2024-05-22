import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import image from '@rollup/plugin-image';

// https://vitejs.dev/config/
export default defineConfig({
  // Other Vite config options...

  plugins: [
    react(), // Make sure to add the React plugin here
    image()  // Then add the image plugin here
  ],

  build: {
    rollupOptions: {
      external: [
        // Add any other external dependencies here
      ]
    }
  }
});
