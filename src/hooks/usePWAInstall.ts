import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
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

export interface InstallResult {
  success: boolean;
  outcome?: 'accepted' | 'dismissed';
  reason?: string;
}

export function usePWAInstall() {
  // Check if early capture in index.html already caught the prompt
  const getEarlyPrompt = (): BeforeInstallPromptEvent | null => {
    if (typeof window !== 'undefined' && (window as any).__pwaInstallPrompt) {
      return (window as any).__pwaInstallPrompt;
    }
    return null;
  };

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(getEarlyPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
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

  // Force clean update: preserves user's custom products and photos, updates Service Worker and caches
  const updateApp = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setIsUpdating(true);
    try {
      const currentProducts = localStorage.getItem('coralink_custom_products');
      if (currentProducts) {
        localStorage.setItem('coralink_custom_products_backup', currentProducts);
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

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
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed on homescreen / app window)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detect if running inside an iframe (like AI Studio preview)
    const inIframe = window.self !== window.top;
    setIsIframe(inIframe);

    // Pick up early prompt if already captured
    if ((window as any).__pwaInstallPrompt) {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaInstallPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('[PWA] beforeinstallprompt event captured in hook');
    };

    const handlePromptAvailable = (e: any) => {
      const promptEvent = e.detail || (window as any).__pwaInstallPrompt;
      if (promptEvent) {
        setDeferredPrompt(promptEvent as BeforeInstallPromptEvent);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__pwaInstallPrompt = null;
      console.log('[PWA] App installation completed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial SW verification
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

      const handleControllerChange = () => {
        checkSW();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
        window.removeEventListener('appinstalled', handleAppInstalled);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkSW]);

  /**
   * Directly triggers the native browser install dialog
   */
  const install = async (): Promise<InstallResult> => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__pwaInstallPrompt : null);
    
    if (!promptToUse || typeof promptToUse.prompt !== 'function') {
      console.warn('[PWA] Cannot trigger install: No deferredPrompt available yet');
      return { success: false, reason: 'no-prompt' };
    }

    setIsInstalling(true);
    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      console.log('[PWA] User install choice outcome:', choice?.outcome);

      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          (window as any).__pwaInstallPrompt = null;
        }
        setIsInstalling(false);
        return { success: true, outcome: 'accepted' };
      }

      setIsInstalling(false);
      return { success: false, outcome: 'dismissed' };
    } catch (err: any) {
      console.error('[PWA] Error calling prompt():', err);
      setIsInstalling(false);
      return { success: false, reason: err?.message || 'prompt-error' };
    }
  };

  return {
    isInstallable: !!deferredPrompt || (typeof window !== 'undefined' && !!(window as any).__pwaInstallPrompt),
    isInstalled,
    isIOS,
    isIframe,
    isInstalling,
    hasUpdate,
    isUpdating,
    updateApp,
    install,
    swStatus,
    checkSW,
  };
}
