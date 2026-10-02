import React from 'react';
import { Product } from '../types';
import { MessageCircle, Plus, Eye, Heart, ChevronRight } from 'lucide-react';
import { StarRating } from './StarRating';
import { motion } from 'framer-motion';
import { CORALINK_LOGO_URL, CORALINK_FALLBACK_LOGO_URL, isReferenceLogo } from '../utils/logoConstants';

interface ProductCardProps {
  product: Product;
  index?: number;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onDirectWhatsApp: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  onOpenDetail,
  onAddToCart,
  onDirectWhatsApp,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        delay: index !== undefined ? Math.min((index % 4) * 0.08, 0.24) : 0,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1BA7D9]/60 dark:hover:border-[#1BA7D9]/60 hover:shadow-xl hover:shadow-[#0B2545]/8 dark:hover:shadow-black/40 transition-all duration-300 overflow-hidden"
    >
      {/* Product Image Area */}
      <div 
        onClick={() => onOpenDetail(product)}
        className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
        title="Clic para ver más detalles del producto"
      >
        {!isReferenceLogo(product.image) ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-4 text-center group-hover:scale-105 transition-transform duration-500">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xs flex items-center justify-center mb-2 border border-slate-100 dark:border-slate-800">
              <img
                src={CORALINK_LOGO_URL}
                alt="Coralink"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
                }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{product.title}</span>
            <span className="text-[9px] text-[#1BA7D9] font-black uppercase tracking-wider mt-0.5">Coralink Caribe</span>
          </div>
        )}

        {/* Badge (Top Left) */}
        {product.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            {product.badge}
          </div>
        )}

        {/* Favorite Button (Top Right) */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] shadow-xs transition-colors cursor-pointer"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF6B35] text-[#FF6B35]' : ''}`} />
          </button>
        )}

        {/* Subcategory Pill (Bottom Left of image) */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold">
          {product.subCategory}
        </div>

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-[#0B2545]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-[#0B2545] dark:text-white text-xs font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#1BA7D9]" />
            Ver Detalles
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        {/* Title */}
        <h3
          onClick={() => onOpenDetail(product)}
          className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-[#1BA7D9] dark:hover:text-[#1BA7D9] cursor-pointer min-h-[2.4rem] leading-snug"
          title="Clic para ver más detalles"
        >
          {product.title}
        </h3>

        {/* Star Rating System & Average Score Display */}
        <div
          onClick={() => onOpenDetail(product)}
          className="flex items-center justify-between gap-1.5 mt-1.5 p-1 rounded-lg hover:bg-amber-50/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group/rate"
          title="Clic para ver calificaciones y opiniones"
        >
          <div className="flex items-center gap-1.5">
            <StarRating
              rating={product.rating}
              size="xs"
              interactive={false}
            />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 group-hover/rate:text-amber-600 dark:group-hover/rate:text-amber-400 transition-colors">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              ({product.reviewsCount})
            </span>
          </div>

          <span className="text-[10px] text-[#1BA7D9] font-bold group-hover/rate:underline flex items-center">
            Detalles <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        {/* Price Row in Nicaraguan Cordobas (C$) */}
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <div className="flex items-baseline text-[#FF6B35]">
            <span className="text-xs font-black mr-0.5">C$</span>
            <span className="text-base sm:text-lg font-black tracking-tight">
              {product.price.toLocaleString('es-NI')}
            </span>
          </div>

          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
              C${product.originalPrice.toLocaleString('es-NI')}
            </span>
          )}
        </div>

        {/* Actions Button Row */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          {/* Quick WhatsApp Quote */}
          <button
            onClick={() => onDirectWhatsApp(product)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Cotizar por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Cotizar</span>
          </button>

          {/* Add to Quote Basket */}
          <button
            onClick={() => onAddToCart(product)}
            className="p-1.5 rounded-xl bg-[#0B2545] dark:bg-slate-700 hover:bg-[#144272] dark:hover:bg-slate-600 text-white transition-colors cursor-pointer"
            title="Añadir a mi lista de cotización"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
