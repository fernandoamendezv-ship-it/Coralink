import React, { useEffect, useRef } from 'react';
import { Product } from '../types';
import { ArrowLeft, Search, X, ShoppingBag, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface SearchResultsModalProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExecuteSearch?: (query?: string) => void;
  products: Product[];
  onClose: () => void;
  onReturnToHome: () => void;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>,
    customNote?: string
  ) => void;
  onDirectWhatsApp: (
    product: Product,
    selectedOptions?: Record<string, string>,
    customNote?: string
  ) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  isOpen,
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  products,
  onReturnToHome,
  onOpenDetail,
  onAddToCart,
  onDirectWhatsApp,
  favorites,
  onToggleFavorite,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens or auto-focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle ESC key to return home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onReturnToHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onReturnToHome]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    if (onExecuteSearch) {
      onExecuteSearch(searchQuery);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 animate-in fade-in duration-200"
    >
      {/* Top Navigation Bar: Flecha para atrás + Barra de Búsqueda */}
      <header className="sticky top-0 z-30 bg-[#0B2545] text-white shadow-xl px-3 sm:px-6 py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          {/* Botón de Regresar a la página principal con flecha hacia atrás */}
          <button
            type="button"
            onClick={onReturnToHome}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all cursor-pointer shrink-0 group shadow-md"
            title="Regresar a la página principal"
            aria-label="Regresar a la página principal"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#1BA7D9] group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline">Inicio</span>
          </button>

          {/* Formulario de búsqueda con soporte para lupa de teclado móvil */}
          <form
            onSubmit={handleSubmit}
            action="#"
            className="flex-1 relative flex items-center"
          >
            <input
              ref={inputRef}
              id="search-modal-input"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="¿Qué producto buscas hoy?..."
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium border-0 focus:ring-2 focus:ring-[#1BA7D9] shadow-inner outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute left-3 p-0.5 text-slate-400 hover:text-[#1BA7D9] transition-colors cursor-pointer"
              title="Buscar"
              aria-label="Ejecutar búsqueda"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Borrar texto de búsqueda"
                aria-label="Borrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Resumen de resultados en la cabecera */}
        <div className="max-w-7xl mx-auto mt-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#1BA7D9] shrink-0" />
            {searchQuery.trim() ? (
              <span>
                Resultados para <strong className="text-white">«{searchQuery}»</strong>:
              </span>
            ) : (
              <span>Escribe el nombre de algún producto o categoría</span>
            )}
          </div>
          <span className="font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white shrink-0">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      </header>

      {/* Contenedor con únicamente los productos buscados */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 max-w-7xl mx-auto w-full">
        {products.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={onOpenDetail}
                  onAddToCart={(p) => onAddToCart(p)}
                  onDirectWhatsApp={(p) => onDirectWhatsApp(p)}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>

            {/* Botón al final de los resultados para regresar cómodamente al inicio */}
            <div className="mt-10 mb-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                ¿Terminaste de buscar? Regresa a explorar el catálogo completo
              </p>
              <button
                type="button"
                onClick={onReturnToHome}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0B2545] hover:bg-[#144272] dark:bg-[#1BA7D9] dark:hover:bg-[#158db9] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Volver a la Página de Inicio</span>
              </button>
            </div>
          </div>
        ) : (
          /* Estado Vacío cuando no hay coincidencias */
          <div className="py-16 px-4 text-center max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
              <Search className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">
              No encontramos productos
            </h3>

            {searchQuery.trim() ? (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                No hay coincidencias para <span className="font-semibold text-slate-700 dark:text-slate-200">«{searchQuery}»</span>. Puedes intentar con términos más generales o sin sufijos (ejemplo: <em className="text-[#1BA7D9]">taza, termo, piedra, llavero, gorra, camiseta</em>).
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                Ingresa una palabra para buscar en todo el catálogo de productos disponibles.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                type="button"
                onClick={onReturnToHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#144272] dark:hover:bg-[#158db9] active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a la Página Principal</span>
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  Limpiar Búsqueda
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
