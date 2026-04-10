import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
      // Estáticos del front (ideafront :5173): la vista previa del CMS pide /assets/… al mismo origen y Vite reenvía al sitio público en local
      '/assets': {
        target: process.env.VITE_CMS_ASSETS_PROXY || 'http://localhost:5173',
        changeOrigin: true,
      },
    },
  },
});
