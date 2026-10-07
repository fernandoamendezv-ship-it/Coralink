import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Check, ExternalLink, Loader2, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'menu';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, isIframe, isInstalling, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClick = async () => {
    // If running in an iframe (e.g., AI Studio preview), native install prompt is blocked by browser security
    if (isIframe) {
      setShowModal(true);
      return;
    }

    // Direct native browser prompt trigger
    if (isInstallable) {
      setStatusMessage('Abriendo instalador del sistema...');
      const result = await install();
      if (result.success) {
        setInstallSuccess(true);
        setStatusMessage('¡Coralink se ha instalado correctamente!');
        setTimeout(() => setInstallSuccess(false), 5000);
      } else if (result.outcome === 'dismissed') {
        setStatusMessage(null);
      } else {
        // If the browser prompt was unavailable or failed, show fallback
        setShowModal(true);
      }
    } else if (isIOS) {
      // iOS WebKit does not support beforeinstallprompt programmatic API
      setShowModal(true);
    } else {
      // Try calling install anyway (in case prompt is on window.__pwaInstallPrompt)
      const result = await install();
      if (result.success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 5000);
      } else {
        setShowModal(true);
      }
    }
  };

  const handleOpenDirect = () => {
    try {
      const targetUrl = window.location.href;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.reload();
    }
  };

  // Detect Android user agent
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  // If already running as standalone app
  if (isInstalled || installSuccess) {
    if (variant === 'menu') {
      return (
        <div className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Coralink instalada como App!</span>
        </div>
      );
    }
    if (variant === 'header') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden xs:inline">App Instalada</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] active:scale-95 text-white text-xs font-black shadow-sm shadow-[#FF6B35]/30 transition-all cursor-pointer disabled:opacity-75"
          title="Instalar la app de Coralink directamente en tu dispositivo"
        >
          {isInstalling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 animate-pulse" />
          )}
          <span className="hidden xs:inline">{isInstalling ? 'Instalando...' : 'Instalar App'}</span>
          <span className="xs:hidden">{isInstalling ? '...' : 'Instalar'}</span>
        </button>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] text-white text-[11px] sm:text-xs font-black shadow-sm shadow-[#FF6B35]/25 transition-all cursor-pointer active:scale-95 disabled:opacity-75"
          title="Instalar Coralink directamente en tu pantalla de inicio"
        >
          {isInstalling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 animate-bounce" />
          )}
          <span>{isInstalling ? 'Instalando...' : 'Instalar App'}</span>
        </button>
      )}

      {variant === 'menu' && (
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35]/15 to-orange-500/10 hover:bg-[#FF6B35]/25 dark:hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-left transition-colors cursor-pointer group disabled:opacity-75"
          title="Instalar aplicación en tu pantalla de inicio"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
              {isInstalling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
                <span>{isInstalling ? 'Instalando Coralink...' : 'Instalar App'}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF6B35] text-white font-black">
                  1-CLIC
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Instalar directamente en tu pantalla de inicio
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Modal for iframe preview or unsupported iOS flow */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#1BA7D9] flex items-center justify-center text-white mb-4 shadow-md">
              <Download className="w-6 h-6 text-white" />
            </div>

            {/* IFRAME SPECIFIC CASE: Explain why the native dialog cannot trigger inside the embedded frame */}
            {isIframe ? (
              <>
                <h3 className="text-base font-black text-[#0B2545] dark:text-white">
                  Instalar Coralink en tu Dispositivo
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 mb-4 leading-relaxed">
                  Estás viendo Coralink dentro del visor integrado de desarrollo. Por seguridad, los navegadores (Chrome, Edge y Safari) solo permiten que el instalador nativo se active en una pestaña directa:
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleOpenDirect}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/25 transition-all cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir en Navegador e Instalar
                  </button>

                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res.success) {
                        setInstallSuccess(true);
                        setShowModal(false);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Reintentar instalador aquí
                  </button>
                </div>
              </>
            ) : isIOS ? (
              /* iOS SAFARI CASE */
              <>
                <h3 className="text-base font-black text-[#0B2545] dark:text-white">
                  Instalar en iPhone / iPad
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-4 leading-relaxed">
                  En iOS Safari, Apple requiere agregarlo desde el menú oficial de Safari:
                </p>

                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      Pulsa el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-[#1BA7D9] mx-0.5" /> en Safari.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      Presiona <strong>Añadir a pantalla de inicio</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#FF6B35] mx-0.5" />.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      Toca <strong>Añadir</strong> en la esquina superior derecha.
                    </div>
                  </li>
                </ol>

                <button
                  onClick={() => setShowModal(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-bold text-xs hover:bg-[#144272] dark:hover:bg-[#158db8] transition-colors cursor-pointer shadow-md"
                >
                  ¡Entendido!
                </button>
              </>
            ) : (
              /* ANDROID / CHROME DESKTOP FALLBACK */
              <>
                <h3 className="text-base font-black text-[#0B2545] dark:text-white">
                  Instalación de Coralink
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 mb-4 leading-relaxed">
                  Presiona el botón a continuación para abrir el instalador del sistema:
                </p>

                <button
                  onClick={async () => {
                    const res = await install();
                    if (res.success) {
                      setInstallSuccess(true);
                      setShowModal(false);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/25 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Instalar Ahora
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
