import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2">
      {!isOnline ? (
        <div className="flex items-center gap-2 rounded-2xl bg-[#0B2545] border border-[#1BA7D9]/40 px-3.5 py-2 text-xs font-medium text-white shadow-xl">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B35] animate-ping" />
          <WifiOff className="w-4 h-4 text-[#FF6B35]" />
          <span>Modo sin conexión — PWA activa con catálogo en caché</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white shadow-xl">
          <Wifi className="w-4 h-4 text-white" />
          <span>Conexión restaurada</span>
        </div>
      )}
    </div>
  );
};
