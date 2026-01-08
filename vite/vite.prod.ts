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
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['axios', 'socket.io-client'],
          },
        },
      },
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'placeholder.svg'],
        manifest: {
          name: 'Chat App',
          short_name: 'Chat',
          description: 'Real-time chat application with AI assistant',
          theme_color: '#1a1a2e',
          background_color: '#1a1a2e',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/placeholder.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: '/placeholder.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
        },
      }),
    ],
  }),
);
