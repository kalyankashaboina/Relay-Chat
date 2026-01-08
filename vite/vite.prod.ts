import { defineConfig, mergeConfig } from 'vite';
import { baseConfig } from './vite.base';
import { VitePWA } from 'vite-plugin-pwa';

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      sourcemap: false,
      minify: 'esbuild',
      cssCodeSplit: true,

      chunkSizeWarningLimit: 800,

      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            vendor: ['axios', 'socket.io-client'],
          },
        },
      },
    },

    plugins: [
      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: ['favicon.ico', 'relay-fav-icon.png', 'robots.txt'],

        manifest: {
          name: 'Relay Chat',
          short_name: 'Relay',
          description:
            'Relay Chat is a modern real-time messaging application with group chats, online presence, and AI-assisted conversations.',
          theme_color: '#1a1a2e',
          background_color: '#0a0a0a',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-icon.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-icon.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
  }),
);
