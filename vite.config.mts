import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  root: 'app',
  build: {
    emptyOutDir: true,
    outDir: '../dist/public',
  },
});
