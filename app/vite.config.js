import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import image from '@rollup/plugin-image';

// https://vitejs.dev/config/
export default defineConfig({
  // Other Vite config options...

  build: {
    rollupOptions: {
      plugins: [
        image(),
        [react()] // Add the image plugin here
      ],
      external: [
        // Add any other external dependencies here
      ]
    }
  }
});



