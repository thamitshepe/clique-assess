import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import './css/montserrat.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import { ClerkProvider } from '@clerk/clerk-react'

// Import your publishable key using import.meta.env with type assertion
const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <App />
      </Router>
    </ClerkProvider>
);