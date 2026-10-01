import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface SWStatus {
  supported: boolean;
  registered: boolean;
  state: ServiceWorkerState | 'unknown' | 'none';
  scope?: string;
  hasController: boolean;
  scriptUrl?: string;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [swStatus, setSwStatus] = useState<SWStatus>({
    supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    registered: false,
    state: 'none',
    hasController: false,
  });

  const checkSW = async (): Promise<SWStatus> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      const status: SWStatus = {
        supported: false,
        registered: false,
        state: 'none',
        hasController: false,
      };
      setSwStatus(status);
      return status;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const activeWorker = reg?.active || reg?.waiting || reg?.installing;
      const status: SWStatus = {
        supported: true,
        registered: !!reg,
        state: activeWorker?.state || (reg ? 'activated' : 'none'),
        scope: reg?.scope,
        hasController: !!navigator.serviceWorker.controller,
        scriptUrl: activeWorker?.scriptURL,
      };
      setSwStatus(status);
      return status;
    } catch (e) {
      console.error('Error checking Service Worker:', e);
      const status: SWStatus = {
        supported: true,
        registered: false,
        state: 'unknown',
        hasController: false,
      };
      setSwStatus(status);
      return status;
    }
  };

  useEffect(() => {
    // Detect standalone mode (already installed on homescreen)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Check initial SW state
      checkSW();

      navigator.serviceWorker?.addEventListener('controllerchange', () => {
        checkSW();
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
    swStatus,
    checkSW,
  };
}
