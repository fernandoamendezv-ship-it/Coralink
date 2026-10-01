import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  X,
  Mic,
  Volume2,
  Moon,
  Sun,
  ShieldCheck,
  Settings,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';
import { CoralinkLogo } from './CoralinkLogo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenAdmin: () => void;
  onOpenPWAStatus?: () => void;
  isAdmin: boolean;
  onGoHome: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  logoUrl?: string;
}

// Window declaration for cross-browser Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenAdmin,
  onOpenPWAStatus,
  isAdmin,
  onGoHome,
  isDarkMode,
  onToggleTheme,
  logoUrl,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const shareToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<any>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Initialize SpeechRecognition support check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup error
        }
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const showFeedbackMessage = (msg: string, duration = 3000) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setSpeechFeedback(msg);
    feedbackTimeoutRef.current = setTimeout(() => {
      setSpeechFeedback(null);
    }, duration);
  };

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      showFeedbackMessage('Tu navegador no soporta reconocimiento de voz. Intenta escribir tu búsqueda.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.lang = 'es-NI';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showFeedbackMessage('Escuchando... Di lo que buscas (ej. "Tazas", "Llaveros", "Resina")', 6000);
      };

      recognition.onresult = (event: any) => {
        const currentResult = event.results[event.results.length - 1];
        if (currentResult && currentResult[0]) {
          const transcript = currentResult[0].transcript;
          onSearchChange(transcript);

          if (currentResult.isFinal) {
            showFeedbackMessage(`Buscando: "${transcript}"`, 2000);
            setIsListening(false);
            const catalogEl = document.getElementById('catalog-section');
            catalogEl?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          showFeedbackMessage('Permiso de micrófono denegado. Permite el acceso para buscar por voz.');
        } else if (event.error === 'no-speech') {
          showFeedbackMessage('No se detectó audio. Presiona el micrófono e inténtalo de nuevo.');
        } else if (event.error === 'network') {
          showFeedbackMessage('Error de conexión al procesar la voz.');
        } else {
          showFeedbackMessage('No pudimos reconocer la voz. Inténtalo de nuevo.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      showFeedbackMessage('No se pudo iniciar el micrófono. Revisa los permisos de tu navegador.');
    }
  };

  const handleShareApp = async () => {
    const shareTitle = 'Coralink - Arte & Personalización Caribeña';
    const shareText =
      '¡Mira la tienda y catálogo de Coralink en Corn Island! Regalos únicos, tazas mágicas, fotoregalos y detalles en resina epóxica ✨';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://coralink.app';

    if (shareToastTimeoutRef.current) {
      clearTimeout(shareToastTimeoutRef.current);
    }

    // Web Share API check
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setIsMenuOpen(false);
      } catch (err: any) {
        // If user cancelled, don't show error. If share failed for other reasons, fallback to copy
        if (err?.name !== 'AbortError') {
          copyToClipboardFallback(shareUrl);
        }
      }
    } else {
      copyToClipboardFallback(shareUrl);
    }
  };

  const copyToClipboardFallback = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setShareToast('¡Enlace copiado al portapapeles! 🔗');
          shareToastTimeoutRef.current = setTimeout(() => {
            setShareToast(null);
            setIsMenuOpen(false);
          }, 2400);
        })
        .catch(() => {
          setShareToast('Enlace: ' + url);
          shareToastTimeoutRef.current = setTimeout(() => setShareToast(null), 3000);
        });
    } else {
      try {
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = url;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        setShareToast('¡Enlace copiado al portapapeles! 🔗');
        shareToastTimeoutRef.current = setTimeout(() => {
          setShareToast(null);
          setIsMenuOpen(false);
        }, 2400);
      } catch (e) {
        setShareToast('No se pudo copiar el enlace');
        shareToastTimeoutRef.current = setTimeout(() => setShareToast(null), 2500);
      }
    }
  };

  return (
    <header className="bg-[#0B2545] dark:bg-slate-900 text-white shadow-xs transition-colors duration-200 relative z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Top Row: Hamburger Menu + Logo & Wordmark + Theme Toggle + Favorites + Cart */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: 3 Stripes Menu Button + Logo + Wordmark */}
          <div className="flex items-center gap-2 sm:gap-2.5 relative">
            {/* Hamburger button: Opens Menu with Dark Mode Option & Admin Access */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center ${
                isMenuOpen ? 'ring-2 ring-[#FF6B35] bg-white/20' : ''
              }`}
              title="Menú de opciones"
              aria-label="Abrir menú de opciones"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Menu Dropdown Modal */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Header in Menu */}
                <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B2545] dark:text-slate-200">
                      Menú Coralink
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2 space-y-1">
                  {/* GLOBAL DARK MODE TOGGLE OPTION IN MENU (Requested) */}
                  <div className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-slate-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                          Modo Oscuro
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {isDarkMode ? 'Tema oscuro activado' : 'Tema claro activado'}
                        </div>
                      </div>
                    </div>

                    {/* Switch Button */}
                    <button
                      onClick={onToggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                        isDarkMode ? 'bg-[#FF6B35]' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={isDarkMode}
                      title="Alternar tema claro y oscuro"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Compartir App Option (Web Share API) */}
                  <button
                    onClick={handleShareApp}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-between text-left cursor-pointer group"
                    title="Compartir Coralink con amigos o en redes sociales"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-[#FF6B35] group-hover:scale-110 transition-transform">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
                          <span>Compartir App</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] font-black">
                            Recomendar
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          Enviar a amigos por WhatsApp o redes
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Share Notification Alert */}
                  {shareToast && (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span className="text-[11px] leading-snug">{shareToast}</span>
                    </div>
                  )}

                  {/* Panel de Administrador Option */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-2.5 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#1BA7D9]">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
                        <span>Panel de Administrador</span>
                        {isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black">
                            Activo
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Gestionar productos y precios
                      </div>
                    </div>
                  </button>

                  {/* Verificar PWA Option */}
                  {onOpenPWAStatus && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenPWAStatus();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-2.5 text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                          Verificar PWA &amp; Offline
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          Diagnóstico de Service Worker y caché
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Logo in rounded container + Brand Name */}
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 text-left cursor-pointer group"
              aria-label="Ir al inicio de Coralink"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <CoralinkLogo src={logoUrl} size="fill" />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Cora
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#FF6B35]">
                  link
                </span>
              </div>
            </button>
          </div>

          {/* Right: Share + Quick Dark/Light Toggle + Favorites + Cart Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Share App Button in Main Bar */}
            <div className="relative">
              <button
                onClick={handleShareApp}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center"
                title="Compartir catálogo y tienda"
                aria-label="Compartir tienda Coralink"
              >
                <Share2 className="w-5 h-5 text-slate-100" />
              </button>

              {/* Floating Share Toast Notification if triggered from main bar */}
              {shareToast && !isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-max max-w-xs z-50 p-2.5 rounded-xl bg-emerald-700 text-white shadow-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in zoom-in-95 border border-emerald-500/30">
                  <Check className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span>{shareToast}</span>
                </div>
              )}
            </div>

            {/* Quick Dark Mode Icon Button in Header */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center"
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-300 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-200 animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Favorites Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center"
              title="Mis Favoritos"
              aria-label="Ver productos favoritos"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B35] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center"
              title="Mi Pedido / Cotización"
              aria-label="Ver pedido y cotización"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B35] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Second Row: Full Width Rounded Search Bar with Voice Recognition Button */}
        <div className="mt-2.5 relative">
          <div className="relative flex items-center">
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos en Coralink..."
              className="w-full pl-10 pr-18 sm:pr-20 py-2 sm:py-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-medium border-0 focus:ring-2 focus:ring-[#1BA7D9] shadow-inner outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

            {/* Actions on the right side of the search input: Clear + Voice Search Button */}
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice Search Button (Web Speech Recognition API) */}
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-[#FF6B35] text-white animate-pulse ring-4 ring-[#FF6B35]/30 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#0B2545] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={
                  !speechSupported
                    ? 'Búsqueda por voz no soportada en este navegador'
                    : isListening
                    ? 'Escuchando... Toca para detener'
                    : 'Buscar por voz'
                }
                aria-label={isListening ? 'Detener búsqueda por voz' : 'Buscar por comando de voz'}
              >
                {isListening ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Voice Search Status Overlay / Feedback Badge */}
          {speechFeedback && (
            <div className="absolute left-2 right-2 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-xl border backdrop-blur-md ${
                  isListening
                    ? 'bg-[#0B2545]/95 dark:bg-slate-900/95 text-white border-[#1BA7D9]/40'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isListening ? (
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] animate-ping" />
                    <Volume2 className="w-4 h-4 text-[#1BA7D9] animate-bounce" />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                )}
                <span className="flex-1 truncate">{speechFeedback}</span>
                {isListening && (
                  <button
                    onClick={() => {
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.stop();
                        } catch (e) {
                          // ignore
                        }
                      }
                      setIsListening(false);
                      setSpeechFeedback(null);
                    }}
                    className="text-[10px] text-slate-300 hover:text-white px-2 py-0.5 rounded-md bg-white/10"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
