// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { persistor, store } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Apply the user's saved theme immediately on load, before React renders.
// Without this, dark mode only applied while the Settings page itself was
// mounted, so it silently reset on every refresh or fresh page visit.
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

// Defensive patch for IntersectionObserver failures in high-density listing environments
// This prevents "parameter 1 is not of type 'Element'" errors from crashing the app
if (typeof window !== 'undefined' && window.IntersectionObserver) {
  const originalObserve = IntersectionObserver.prototype.observe;
  IntersectionObserver.prototype.observe = function (target) {
    if (target instanceof Element) {
      return originalObserve.call(this, target);
    }
  };

  const originalUnobserve = IntersectionObserver.prototype.unobserve;
  IntersectionObserver.prototype.unobserve = function (target) {
    if (target instanceof Element) {
      return originalUnobserve.call(this, target);
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
