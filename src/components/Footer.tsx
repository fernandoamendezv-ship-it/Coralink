import React from 'react';
import { CoralinkLogo } from './CoralinkLogo';
import { MapPin, Heart, Sparkles, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, logoUrl }) => {
  return (
    <footer className="bg-[#0B2545] text-white border-t border-slate-800 pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-5">
        {/* Brand Logo */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 p-2.5 rounded-3xl bg-white shadow-xl flex items-center justify-center">
          <CoralinkLogo src={logoUrl} size="fill" />
        </div>

        {/* Brand Title & Slogan */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Coralink
          </h2>
          <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#1BA7D9] to-[#FF6B35] bg-clip-text text-transparent mt-1">
            Arte &amp; Personalización Caribeña
          </p>
        </div>

        {/* Brand Description (Updated as requested) */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
          Tienda y catálogo de regalos únicos en Corn Island. Personalizamos fotoregalos en cerámica y piedra roca, tazas térmicas y mágicas, textiles, papelería creativa para tus celebraciones y detalles encapsulados en resina epóxica.
        </p>

        {/* Guarantees & Badges */}
        <div className="flex items-center justify-center gap-3 pt-1 text-xs text-slate-300">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#1BA7D9]" />
            <span>100% Personalizado</span>
          </div>
        </div>

        {/* Contact WhatsApp, Location & Admin */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs pt-2">
          <a
            href="https://wa.me/50582045433"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold transition-all shadow-2xs"
            title="Escribir por WhatsApp a Coralink"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp: +505 8204 5433</span>
          </a>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#1BA7D9]" /> Corn Island, Costa Caribe Sur
          </span>
          <span className="text-slate-600">•</span>
          <button
            onClick={onOpenAdmin}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Panel de Administrador
          </button>
        </div>

        {/* Copyright & "Hecho con ❤️ para el isleño" as requested */}
        <div className="pt-4 border-t border-slate-800/80 w-full text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Coralink. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-[#FF6B35] fill-[#FF6B35]" /> para el isleño
          </span>
        </div>
      </div>
    </footer>
  );
};
