import { useEffect, useState, useCallback } from 'react';

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
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [swStatus, setSwStatus] = useState<SWStatus>({
    supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    registered: false,
    state: 'none',
    hasController: false,
  });

  const checkSW = useCallback(async (): Promise<SWStatus> => {
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

      // Check if an update is waiting
      if (reg?.waiting) {
        setHasUpdate(true);
      }

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
  }, []);

  // Force clean update: unregisters old caches, reloads with latest assets
  const updateApp = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setIsUpdating(true);
    try {
      // Clear product version caches so fresh code products load
      localStorage.removeItem('coralink_custom_products');
      localStorage.removeItem('coralink_catalog_version');

      // Clear Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Update Service Worker
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        if (reg) {
          await reg.update();
        }
      }
    } catch (e) {
      console.error('Error during app update:', e);
    } finally {
      // Force reload ignoring cache
      window.location.reload();
    }
  }, []);

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

      // Listen for registration updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (!reg) return;

          if (reg.waiting) {
            setHasUpdate(true);
          }

          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  setHasUpdate(true);
                }
              });
            }
          });
        });

        // Whenever the user switches back to the app on their phone, check for updates
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            navigator.serviceWorker.getRegistration().then((reg) => {
              reg?.update().catch(() => {});
            });
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Controller change listener
        let refreshed = false;
        const handleControllerChange = () => {
          if (!refreshed && hasUpdate) {
            refreshed = true;
            window.location.reload();
          }
          checkSW();
        };
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        };
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [checkSW, hasUpdate]);

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
    hasUpdate,
    isUpdating,
    updateApp,
    install,
    swStatus,
    checkSW,
  };
}
