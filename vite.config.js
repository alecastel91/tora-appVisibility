import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

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

  return ({
  plugins: [
    // Tell the React plugin to handle JSX inside .js files (dev server)
    react({
      include: '**/*.{js,jsx,ts,tsx}',
    }),
    tailwindcss(),
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
