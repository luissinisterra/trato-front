import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Set up environment configuration
const isProduction = window.location.hostname !== 'localhost';
const apiUrl = isProduction 
  ? 'https://gateway-service-kudv.onrender.com'
  : 'http://localhost:3000/api';

(window as any).__env__ = {
  API_URL: apiUrl
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
