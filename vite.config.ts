import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const pwaConfig = VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.svg", "icon-192.svg", "icon-512.svg"],

  manifest: {
    name: "Relay Chat",
    short_name: "Relay",
    description: "Real-time chat application",
    theme_color: "#1a1a2e",
    background_color: "#1a1a2e",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  },

  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    navigateFallback: "/index.html",

    // Never intercept API or socket routes — critical for realtime chat.
    navigateFallbackDenylist: [/^\/api/, /^\/socket\.io/],

    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,

    runtimeCaching: [
      {
        // Avatars / uploaded media — stable, serve from cache
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "media-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // REST API — always prefer network; fall back offline
        urlPattern: /\/api\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60,
          },
        },
      },
      {
        // Google Fonts / CDN — long-lived
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "font-cache",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main config
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === "development";

  return {
  server: {
  host: true,
  port: 5173,
  strictPort: true,
  hmr: { overlay: true },

  proxy: {
    "/api": {
      target: "http://localhost:4000", 
      changeOrigin: true,
      secure: false,
    },
    "/socket.io": {
      target: "http://localhost:4000",
      ws: true,
      changeOrigin: true,
    },
  },
},

    plugins: [
      react(),
      !isDev && pwaConfig,
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      target: "esnext",
      sourcemap: false,
      minify: "esbuild",
      cssMinify: true,
      chunkSizeWarningLimit: 700,

      rollupOptions: {
        output: {
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
        onwarn(warning, defaultHandler) {
          if (warning.code === "CIRCULAR_DEPENDENCY") return;
          defaultHandler(warning);
        },
      },
    },

    define: {
      __DEV__: isDev,
    },

    esbuild: {
      // drop: isDev ? [] : ["console", "debugger"],
      legalComments: "none",
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@reduxjs/toolkit",
        "react-redux",
        "framer-motion",
        "socket.io-client",
        "axios",
        "cmdk",
        "sonner",
        "next-themes",
        "vaul",
        "lucide-react",
        "embla-carousel-react",
        "input-otp",
        "react-resizable-panels",
      ],
    },
  };
});