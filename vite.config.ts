import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Vite dev server handles SPA fallback (history API) automatically
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'icon.png'],
      manifest: {
        name: 'TurboConverter',
        short_name: 'TurboConv',
        description: 'Free online file conversion tools',
        theme_color: '#0284c7',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  // NOTE: For production deployment with BrowserRouter (history-based routing),
  // the hosting server must be configured to serve index.html for all route paths.
  // Examples:
  //   - Netlify: add a _redirects file with "/* /index.html 200"
  //   - Vercel: add a vercel.json with rewrites to /index.html
  //   - Nginx: use try_files $uri $uri/ /index.html;
  //   - Apache: use FallbackResource /index.html
});
