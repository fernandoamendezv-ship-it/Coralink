import React from 'react';
import { SWStatus } from '../hooks/usePWAInstall';
import { CheckCircle2, AlertTriangle, ShieldCheck, Download, RefreshCw, X, Smartphone, Globe, Sparkles } from 'lucide-react';

interface PWAStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  swStatus: SWStatus;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => void;
  onRefreshSW: () => void;
}

export const PWAStatusModal: React.FC<PWAStatusModalProps> = ({
  isOpen,
  onClose,
  swStatus,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
  onRefreshSW,
}) => {
  if (!isOpen) return null;

  const isSwActive = swStatus.registered || swStatus.hasController || swStatus.state === 'activated';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2545]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#1BA7D9]/20"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#144272] to-[#0B2545] p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-[#1BA7D9]" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Diagnóstico PWA Coralink</h3>
          <p className="text-xs text-[#A5EEFF] mt-1">Arte &amp; Personalización Caribeña • Estado del Service Worker</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Status Callout */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isSwActive 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isSwActive ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {isSwActive 
                  ? '¡Service Worker Activo y Operativo!' 
                  : 'Service Worker en Proceso de Registro'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isSwActive 
                  ? 'La aplicación Coralink cuenta con soporte sin conexión, precarga de recursos en caché y preparación para instalación nativa en tu teléfono.'
                  : 'El Service Worker está registrándose en el navegador. En la vista previa WebContainer, puede requerir recargar o abrir en pestaña completa.'}
              </p>
            </div>
          </div>

          {/* Detailed Verification Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Item 1: Service Worker */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium block mb-1">Service Worker API</span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className={`w-2.5 h-2.5 rounded-full ${swStatus.supported ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {swStatus.supported ? 'Compatible en navegador' : 'No soportado'}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block truncate">
                Estado: {swStatus.state || 'activo'}
              </span>
            </div>

            {/* Item 2: Web App Manifest */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium block mb-1">Web App Manifest</span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Configurado (VitePWA)</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block truncate">
                Iconos 192px, 512px y máscara
              </span>
            </div>

            {/* Item 3: Modo de Pantalla */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium block mb-1">Modo de Visualización</span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                {isInstalled ? (
                  <>
                    <Smartphone className="w-4 h-4 text-[#1BA7D9]" />
                    <span>App Instalada (Standalone)</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-[#0B2545]" />
                    <span>Navegador Web / Vista Previa</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {isInstalled ? 'Disfrutando como app nativa' : 'Listo para añadir a pantalla'}
              </span>
            </div>

            {/* Item 4: Moneda y Mercado */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium block mb-1">Moneda &amp; Región</span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="px-1.5 py-0.5 rounded bg-[#FF6B35]/10 text-[#FF6B35] font-extrabold text-[11px]">C$</span>
                <span>Córdoba Nicaragüense (NIO)</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Envíos a todo el país
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {!isInstalled && (
              <button
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white font-bold text-sm shadow-lg shadow-[#FF6B35]/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Instalar App en este Dispositivo
              </button>
            )}

            {isIOS && !isInstalled && (
              <div className="p-3 rounded-xl bg-[#0B2545]/5 border border-[#0B2545]/10 text-xs text-slate-700">
                <strong>¿Estás en iPhone / iPad?</strong> Pulsa el botón de <em>Compartir</em> en Safari y selecciona <em>&quot;Añadir a la pantalla de inicio&quot;</em>.
              </div>
            )}

            <button
              onClick={onRefreshSW}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-verificar Estado
            </button>
          </div>

          {/* Test Error 500 link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Prueba de error 500 del servidor:</span>
            <a
              href="/api/simulate-500?formatHtml=1"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#FF6B35] hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver Página de Error 500
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#144272] text-white text-xs font-bold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
