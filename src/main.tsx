
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA support
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    // Check if the sw.js file exists before trying to register it
    fetch('/sw.js')
      .then(response => {
        if (response.status === 200) {
          return navigator.serviceWorker.register('/sw.js');
        }
        console.log('ServiceWorker file not found, skipping registration');
        return null;
      })
      .then(registration => {
        if (registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
