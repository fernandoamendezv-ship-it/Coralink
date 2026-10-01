import React from 'react';
import { Product } from '../types';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  allProducts: Product[];
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onDirectWhatsApp: (product: Product) => void;
  onClearFavorites: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  allProducts,
  onToggleFavorite,
  onOpenDetail,
  onAddToCart,
  onDirectWhatsApp,
  onClearFavorites,
}) => {
  if (!isOpen) return null;

  const favoriteProducts = allProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B2545] dark:bg-slate-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
              <Heart className="w-4 h-4 fill-[#FF6B35]" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mis Productos Favoritos</h3>
              <p className="text-xs text-slate-300">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto guardado' : 'productos guardados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {favoriteProducts.length > 0 && (
              <button
                onClick={onClearFavorites}
                className="text-xs text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer mr-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vaciar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          {favoriteProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <Heart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Aún no tienes productos favoritos</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Toca el corazón en cualquier producto del catálogo para guardarlo en tu lista de favoritos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {favoriteProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={idx}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onOpenDetail={onOpenDetail}
                  onAddToCart={onAddToCart}
                  onDirectWhatsApp={onDirectWhatsApp}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0B2545] hover:bg-[#144272] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
};
