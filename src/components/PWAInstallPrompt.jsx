import { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    // Handle install prompt for non-iOS devices
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowInstallPrompt(true);
    };
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) {
      setShowInstallPrompt(false);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt regardless of outcome
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    
    // Log outcome for analytics
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
  };
  
  const closePrompt = () => {
    setShowInstallPrompt(false);
    // Store in localStorage to avoid showing too frequently
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };
  
  // Don't show anything if no prompt needed
  if (!showInstallPrompt) return null;
  
  return (
    <div className="install-pwa-prompt">
      {isIOS ? (
        <div>
          <p>
            Install this app on your device by tapping 
            <strong> Share</strong> and then <strong>Add to Home Screen</strong>
          </p>
          <button className="close-prompt" onClick={closePrompt}>×</button>
        </div>
      ) : (
        <>
          <p>Get the NCAA D1 Softball App on your home screen</p>
          <div>
            <button onClick={handleInstallClick}>Install</button>
            <button className="close-prompt" onClick={closePrompt}>×</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PWAInstallPrompt;