import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './styles/index.css';
import './services/install'; // side effect: capture beforeinstallprompt before it fires
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';

// No-op when VITE_SENTRY_DSN unset so dev errors stay out of the prod project.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // 1.0 here traced every background poll from every open tab, which is
    // what consumed 80% of the span quota in two weeks against 2 errors.
    // A tenth is plenty for spotting a slow page; errors are not sampled by
    // this and still arrive in full.
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div style={{ padding: 32, color: '#FF3366', textAlign: 'center' }}>Something went wrong. Please refresh the page.</div>}>
      <LanguageProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </LanguageProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);