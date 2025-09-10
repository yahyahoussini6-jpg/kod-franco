import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'

// Capacitor
import { Capacitor } from '@capacitor/core';

// Initialize the app
const app = () => {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
};

// Wait for device ready
if (Capacitor.isNativePlatform()) {
  document.addEventListener('deviceready', app, false);
} else {
  app();
}
