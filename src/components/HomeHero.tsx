import React from 'react';
import { ShieldCheck, ShoppingBag, Palette, Sparkles, Gift } from 'lucide-react';
import { MainCategory } from '../types';

interface HomeHeroProps {
  onVerifyPWA: () => void;
  onSelectCategory: (cat: MainCategory) => void;
  totalProductsCount: number;
  selectedCategory: MainCategory;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onVerifyPWA,
  onSelectCategory,
  totalProductsCount,
  selectedCategory,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2545]/5 via-white to-slate-50 py-8 sm:py-12 px-3 sm:px-6 border-b border-slate-100">
      {/* Subtle Caribbean decorative backdrop glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#1BA7D9]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#FF6B35]/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Brand Title and Subtitle */}
        <h1 className="text-4xl sm:text-6xl font-black text-[#0B2545] tracking-tight">
          Coralink
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#0B2545] via-[#1BA7D9] to-[#FF6B35] bg-clip-text text-transparent mt-2">
          Arte &amp; Personalización Caribeña
        </h2>

        <p className="mt-3 max-w-xl text-xs sm:text-sm text-slate-600 leading-relaxed">
          Catálogo interactivo oficial de regalos únicos, fotoregalos, papelería creativa y detalles en resina epóxica en Nicaragua.
        </p>

        {/* Action Buttons: 'Verificar PWA' and 'Explorar Productos' */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          {/* USER SPECIFIED BUTTON: 'Verificar PWA' */}
          <button
            onClick={onVerifyPWA}
            className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0B2545] hover:bg-[#144272] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0B2545]/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#1BA7D9]" />
            <span>Verificar PWA</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('catalog-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#e85a26] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#FF6B35]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo ({totalProductsCount})</span>
          </button>
        </div>

        {/* 3 CATEGORIES PANELS - HORIZONTALLY ALIGNED & VISIBLE SIMULTANEOUSLY */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center sm:text-left">
            Selecciona una categoría principal:
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
            {/* Panel 1: Personalizados */}
            <button
              onClick={() => {
                onSelectCategory('Personalizados');
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group p-2.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 cursor-pointer ${
                selectedCategory === 'Personalizados'
                  ? 'bg-[#1BA7D9]/10 border-[#1BA7D9] shadow-md ring-2 ring-[#1BA7D9]/20'
                  : 'bg-white border-slate-200/80 hover:border-[#1BA7D9] hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#1BA7D9]/15 text-[#1BA7D9] flex items-center justify-center shrink-0 group-hover:bg-[#1BA7D9] group-hover:text-white transition-colors">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] leading-tight">
                  1. Personalizados
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  Tazas, textil, llaveros, rocas y fotoregalos
                </p>
                <span className="inline-block mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] font-bold text-[#1BA7D9] uppercase tracking-wider">
                  Ver productos &rarr;
                </span>
              </div>
            </button>

            {/* Panel 2: Papelería Creativa */}
            <button
              onClick={() => {
                onSelectCategory('Papelería creativa');
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group p-2.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 cursor-pointer ${
                selectedCategory === 'Papelería creativa'
                  ? 'bg-[#FF6B35]/10 border-[#FF6B35] shadow-md ring-2 ring-[#FF6B35]/20'
                  : 'bg-white border-slate-200/80 hover:border-[#FF6B35] hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center shrink-0 group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] leading-tight">
                  2. Papelería Creativa
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  Cake toppers 3D, agendas, stickers y fiestas
                </p>
                <span className="inline-block mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">
                  Ver productos &rarr;
                </span>
              </div>
            </button>

            {/* Panel 3: Detalles en Resina */}
            <button
              onClick={() => {
                onSelectCategory('Detalles en resina');
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group p-2.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 cursor-pointer ${
                selectedCategory === 'Detalles en resina'
                  ? 'bg-[#0B2545]/10 border-[#0B2545] shadow-md ring-2 ring-[#0B2545]/20'
                  : 'bg-white border-slate-200/80 hover:border-[#0B2545] hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0B2545]/15 text-[#0B2545] flex items-center justify-center shrink-0 group-hover:bg-[#0B2545] group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-xs sm:text-sm font-extrabold text-[#0B2545] leading-tight">
                  3. Detalles en Resina
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  Llaveros inicial, portavasos geoda y dijes
                </p>
                <span className="inline-block mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] font-bold text-[#0B2545] uppercase tracking-wider">
                  Ver productos &rarr;
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
