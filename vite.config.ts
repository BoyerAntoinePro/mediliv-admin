import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssMantine from 'postcss-preset-mantine';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [postcssMantine()],
    },
  },
});
