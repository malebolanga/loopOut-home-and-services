// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { persistor, store } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

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
