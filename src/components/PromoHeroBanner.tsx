import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Clock, Download } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface PromoHeroBannerProps {
  onVerifyPWA: () => void;
}

export const PromoHeroBanner: React.FC<PromoHeroBannerProps> = ({ onVerifyPWA }) => {
  // Countdown timer simulation for Ofertas Flash
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 35,
    seconds: 10,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-2 space-y-2.5">
      {/* Slogan and PWA Installation / Verification Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="font-bold text-[#0B2545] dark:text-slate-100 tracking-tight transition-colors">
          Arte &amp; Personalización Caribeña
        </span>

        <div className="flex items-center gap-2">
          {/* Prominent in-app Install / Download button */}
          <PWAInstallButton />

          <button
            onClick={onVerifyPWA}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F4F8] dark:bg-slate-800 hover:bg-[#d6edf6] dark:hover:bg-slate-700 text-[#1BA7D9] border border-[#1BA7D9]/30 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
            title="Verificar estado de PWA y Service Worker"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Estado PWA</span>
          </button>
        </div>
      </div>

      {/* Main Orange Banner: Colección Caribeña - Hasta 50% OFF (Reduced to half height) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6B35] via-[#FF7540] to-[#FF8A50] text-white py-2 px-4 sm:py-2.5 sm:px-5 shadow-xs">
        {/* Subtle decorative circles (scaled down for half-height) */}
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-6 -bottom-8 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center">
          <span className="text-[10px] font-black tracking-widest uppercase text-white/90 leading-none">
            COLECCIÓN CARIBEÑA
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white mt-0.5 leading-tight">
            Hasta 50% OFF
          </h2>
          <p className="text-[11px] sm:text-xs font-medium text-white/95 leading-tight mt-0.5">
            Arte y personalización con sabor tropical
          </p>
        </div>
      </div>

      {/* Dark Navy Ofertas Flash Bar with Countdown */}
      <div className="rounded-2xl bg-[#0B2545] dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-sm transition-colors">
        {/* Left: Bolt icon, Title, Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white shadow-xs shrink-0">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-tight leading-tight">
              Ofertas Flash
            </div>
            <div className="text-[11px] text-[#1BA7D9] font-medium leading-tight">
              Termina pronto
            </div>
          </div>
        </div>

        {/* Right: Timer clock icon & 3 countdown boxes */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
          <Clock className="w-3.5 h-3.5 text-slate-300 mr-1" />
          <span className="bg-[#FF6B35] text-white px-2 py-0.5 sm:py-1 rounded-md font-mono font-black text-xs sm:text-sm">
            {format2Digits(timeLeft.hours)}
          </span>
          <span className="text-slate-400 font-bold">:</span>
          <span className="bg-[#FF6B35] text-white px-2 py-0.5 sm:py-1 rounded-md font-mono font-black text-xs sm:text-sm">
            {format2Digits(timeLeft.minutes)}
          </span>
          <span className="text-slate-400 font-bold">:</span>
          <span className="bg-[#FF6B35] text-white px-2 py-0.5 sm:py-1 rounded-md font-mono font-black text-xs sm:text-sm">
            {format2Digits(timeLeft.seconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
