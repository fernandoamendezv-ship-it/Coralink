import React from 'react';
import { CoralinkLogo } from './CoralinkLogo';
import { MapPin, Sparkles, MessageCircle, Facebook, Heart, ChevronsUp } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  logoUrl?: string;
  onOpenPrivacyPolicy?: () => void;
  facebookUrl?: string;
  googleMapsUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  logoUrl,
  onOpenPrivacyPolicy,
  facebookUrl = 'https://facebook.com/coralinkcornisland',
  googleMapsUrl = 'https://maps.google.com/?q=Corn+Island,+Costa+Caribe+Sur,+Nicaragua',
}) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

        {/* Brand Description */}
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

        {/* Botones de Facebook y WhatsApp alineados a la par, solo iconos sin texto */}
        <div className="flex items-center justify-center gap-3.5 pt-2">
          {/* Botón WhatsApp */}
          <a
            href="https://wa.me/50582045433"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md group cursor-pointer"
            title="Escribir por WhatsApp a Coralink (+505 8204 5433)"
            aria-label="WhatsApp Coralink"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </a>

          {/* Botón Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-[#1877F2]/25 hover:bg-[#1877F2]/40 text-blue-400 border border-[#1877F2]/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md group cursor-pointer"
            title="Página de Facebook de Coralink"
            aria-label="Facebook Coralink"
          >
            <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </a>
        </div>

        {/* Ubicación Google Maps, Panel de Administrador y Política de Privacidad */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs pt-1">
          {/* Link de ubicación a Google Maps con icono MapPin */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-colors cursor-pointer group"
            title="Abrir ubicación en Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-[#1BA7D9] group-hover:scale-110 transition-transform" />
            <span>Corn Island, Costa Caribe Sur</span>
          </a>

          <span className="text-slate-600">•</span>

          <button
            onClick={onOpenAdmin}
            className="text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white cursor-pointer transition-colors"
          >
            Panel de Administrador
          </button>

          {onOpenPrivacyPolicy && (
            <>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white cursor-pointer transition-colors"
              >
                Política de Privacidad
              </button>
            </>
          )}
        </div>

        {/* Botón con doble flecha para regresar al inicio de la página */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/15 transition-all shadow-md cursor-pointer group"
            title="Regresar al inicio de la página"
            aria-label="Regresar al inicio de la página"
          >
            <ChevronsUp className="w-4 h-4 text-[#1BA7D9] group-hover:-translate-y-0.5 transition-transform" />
            <span>Volver al inicio</span>
            <ChevronsUp className="w-4 h-4 text-[#FF6B35] group-hover:-translate-y-0.5 transition-transform" />
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
