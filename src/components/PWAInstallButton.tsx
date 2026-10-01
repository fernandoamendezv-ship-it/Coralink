import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
        <Check className="w-3.5 h-3.5" />
        PWA Instalada
      </span>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85a26] hover:to-[#FF6B35] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B35]/20 transition-all transform active:scale-95"
          title="Instalar Coralink en tu dispositivo móvil o escritorio"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span className="hidden xs:inline">Instalar App</span>
          <span className="xs:hidden">Instalar</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1BA7D9]/15 hover:bg-[#1BA7D9]/25 text-[#0B2545] border border-[#1BA7D9]/30 text-xs font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5 text-[#1BA7D9]" />
          <span>Instalar en iOS</span>
        </button>
      )}

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#0B2545] flex items-center justify-center text-white mb-4 shadow-md">
              <Download className="w-6 h-6 text-[#1BA7D9]" />
            </div>

            <h3 className="text-lg font-bold text-[#0B2545]">Instalar Coralink en iPhone</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
              Disfruta la experiencia completa de tienda en tu pantalla de inicio como una aplicación nativa:
            </p>

            <ol className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  Pulsa el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-[#1BA7D9] mx-1" /> en la barra inferior de Safari.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  Baja en el menú y selecciona <strong>Añadir a pantalla de inicio</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#FF6B35] mx-1" />.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  Presiona <strong>Añadir</strong> en la esquina superior derecha y ¡listo!
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#0B2545] text-white font-bold text-xs hover:bg-[#144272] transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
