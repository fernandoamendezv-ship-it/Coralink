import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Check, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'menu';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // Detect Android/Mobile user agent
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  if (isInstalled) {
    if (variant === 'menu') {
      return (
        <div className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aplicación Instalada en este dispositivo</span>
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
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] active:scale-95 text-white text-xs font-black shadow-sm shadow-[#FF6B35]/30 transition-all cursor-pointer"
          title="Descargar e instalar la app de Coralink en tu dispositivo"
        >
          <Download className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden xs:inline">Instalar App</span>
          <span className="xs:hidden">Instalar</span>
        </button>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] text-white text-[11px] sm:text-xs font-black shadow-sm shadow-[#FF6B35]/25 transition-all cursor-pointer active:scale-95"
          title="Descargar e instalar la app de Coralink en tu pantalla de inicio"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>Descargar e Instalar App</span>
        </button>
      )}

      {variant === 'menu' && (
        <button
          onClick={handleClick}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35]/15 to-orange-500/10 hover:bg-[#FF6B35]/25 dark:hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-left transition-colors cursor-pointer group"
          title="Instalar aplicación en tu pantalla de inicio"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
                <span>Descargar e Instalar App</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF6B35] text-white font-black">
                  PWA
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Abrir como app nativa en tu teléfono o PC
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Installation Guide Modal (Universal for iOS, Android, and Desktop) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#1BA7D9] flex items-center justify-center text-white mb-4 shadow-md">
              <Download className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-base font-black text-[#0B2545] dark:text-white">
              {isIOS
                ? 'Instalar Coralink en iPhone / iPad'
                : isAndroid
                ? 'Instalar Coralink en tu Teléfono'
                : 'Instalar Coralink en tu Dispositivo'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-4 leading-relaxed">
              Disfruta de la tienda con acceso directo en tu pantalla de inicio, mayor velocidad y funcionamiento sin navegador:
            </p>

            {/* iOS Instructions */}
            {isIOS && (
              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    Pulsa el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-[#1BA7D9] mx-0.5" /> en la barra inferior de Safari.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    Baja en las opciones y presiona <strong>Añadir a pantalla de inicio</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#FF6B35] mx-0.5" />.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <div>
                    Toca <strong>Añadir</strong> en la esquina superior derecha y ¡listo!
                  </div>
                </li>
              </ol>
            )}

            {/* Android Instructions */}
            {isAndroid && !isIOS && (
              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    Toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de tu navegador Chrome.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    Selecciona <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <div>
                    Confirma <strong>Instalar</strong>. El ícono de Coralink aparecerá entre tus apps.
                  </div>
                </li>
              </ol>
            )}

            {/* Desktop / Other Instructions */}
            {!isIOS && !isAndroid && (
              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    En Chrome o Edge, busca el ícono de <strong>Instalar</strong> <Download className="w-3.5 h-3.5 inline text-[#1BA7D9] mx-0.5" /> en la barra de direcciones (a la derecha).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    O abre el menú del navegador (⋮) y haz clic en <strong>«Instalar Coralink»</strong>.
                  </div>
                </li>
              </ol>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-bold text-xs hover:bg-[#144272] dark:hover:bg-[#158db8] transition-colors cursor-pointer shadow-md"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
