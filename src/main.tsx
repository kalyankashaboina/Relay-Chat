import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initDebugUtils } from '@/shared/services/debugUtils';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});

if (import.meta.env.DEV) {
  initDebugUtils();
}

createRoot(document.getElementById('root')!).render(<App />);
