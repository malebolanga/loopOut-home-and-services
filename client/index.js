/* eslint-disable no-undef */
// In App.js or a dedicated component
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const App = () => {
  useEffect(() => {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Show your install UI here, for example, a custom button
    });

    // Logic to handle the install button click
    const handleInstallClick = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
        });
      }
    };

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallClick);
    };
  }, []);

  return (
    <div className="App">
      <button onClick={handleInstallClick}>Install App</button>
      {/* Your app components */}
    </div>
  );
};

serviceWorkerRegistration.register();

export default App;

