import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => {
  // Upload source maps to Sentry so production stack traces are readable
  // (F9-04) — but ONLY when the three Sentry env vars are set (Vercel prod).
  // Without them (local, CI, tokenless), the build is byte-for-byte what it was
  // before: no source maps generated, no plugin, no upload.
  const sentryUpload =
    command === 'build' &&
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT;

  // Beta builds get their own PWA identity ("TORA Beta" + BETA-badged icon)
  // so testers can keep beta and prod installed side by side without
  // confusing them. Detection: the beta Vercel project's API URL points at
  // the -2424 Railway service — no extra env var to maintain.
  const isBeta = (process.env.VITE_API_URL || '').includes('-2424');
  const appName = isBeta ? 'TORA Beta' : 'TORA';
  const iconBase = isBeta ? '/pwa-beta' : '/pwa';

  return ({
  plugins: [
    // Tell the React plugin to handle JSX inside .js files (dev server)
    react({
      include: '**/*.{js,jsx,ts,tsx}',
    }),
    tailwindcss(),
    // Beta identity in the static HTML: iOS reads the A2HS name from
    // apple-mobile-web-app-title and the icon from apple-touch-icon.
    isBeta && {
      name: 'tora-beta-identity',
      transformIndexHtml(html) {
        return html
          .replace('<meta name="apple-mobile-web-app-title" content="TORA" />',
                   '<meta name="apple-mobile-web-app-title" content="TORA Beta" />')
          .replace('<link rel="apple-touch-icon" href="/pwa-192.png" />',
                   '<link rel="apple-touch-icon" href="/pwa-beta-192.png" />')
          .replace('<title>TORA - Music Booking</title>', '<title>TORA Beta</title>');
      },
    },
    // PWA: installable app-shell. The service worker precaches the built
    // shell and updates itself on each deploy (autoUpdate). API calls are
    // deliberately NEVER cached — stale bookings/messages are worse than a
    // spinner — and Supabase Realtime/storage bypass the worker entirely.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['tora_logo_square.png', 'fonts/**/*'],
      manifest: {
        name: appName,
        short_name: appName,
        description: 'Where music meets — the club music industry network',
        theme_color: '#000000',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: `${iconBase}-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${iconBase}-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${iconBase}-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // SPA fallback for deep links; never intercept API or non-GET.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Backend API: always network. NetworkOnly keeps auth flows,
            // payments and realtime-adjacent reads honest offline = error.
            urlPattern: /^https:\/\/tora-backend-[^/]+\.railway\.app\/.*/,
            handler: 'NetworkOnly',
          },
          {
            // Avatars/post images from Supabase storage: cache-first with a
            // bounded box — they're immutable objects at unique URLs.
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tora-media',
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 },
            },
          },
        ],
      },
    }),
    // Must come after other plugins. Uploads maps then deletes them from the
    // deployed output so nothing ships to users.
    sentryUpload && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.js.map'] },
      telemetry: false,
    }),
  ].filter(Boolean),
  build: { sourcemap: sentryUpload ? true : false },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
    // Strip debug logging from production builds (console.error/warn kept).
    ...(command === 'build' ? { pure: ['console.log', 'console.info', 'console.debug'] } : {}),
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
    // Accept any *.local hostname (mDNS) so phones can hit alessandro.local:3002
    allowedHosts: ['localhost', '.local'],
  },
  });
});
