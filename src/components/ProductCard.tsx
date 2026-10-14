import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { MessageCircle, Plus, Eye, Heart, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { StarRating } from './StarRating';
import { motion, AnimatePresence } from 'framer-motion';
import { CORALINK_LOGO_URL, CORALINK_FALLBACK_LOGO_URL, isReferenceLogo } from '../utils/logoConstants';
import { formatDirectImageUrl } from '../utils/imageUrlResolver';

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
  const hasVariants = Boolean(product.variants && product.variants.length > 1);
  const variants = product.variants || [];

  const [activeVariantIdx, setActiveVariantIdx] = useState<number>(() => {
    return product.activeVariantIndex !== undefined ? product.activeVariantIndex : 0;
  });

  // Keep active variant in sync if product prop changes
  useEffect(() => {
    if (product.activeVariantIndex !== undefined) {
      setActiveVariantIdx(product.activeVariantIndex);
    }
  }, [product.activeVariantIndex, product.id]);

  const currentProduct: Product = hasVariants
    ? variants[activeVariantIdx] || product
    : product;

  // Touch Swipe Gesture Handling for Mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !hasVariants) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // Swiped Left -> Next Variant
        handleNextVariant();
      } else {
        // Swiped Right -> Prev Variant
        handlePrevVariant();
      }
    }
    setTouchStartX(null);
  };

  const handlePrevVariant = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveVariantIdx((prev) => (prev - 1 + variants.length) % variants.length);
  };

  const handleNextVariant = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveVariantIdx((prev) => (prev + 1) % variants.length);
  };

  const handleSelectVariant = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVariantIdx(idx);
  };

  const handleCardClick = () => {
    if (hasVariants) {
      onOpenDetail({
        ...product,
        ...currentProduct,
        variants,
        activeVariantIndex: activeVariantIdx,
      });
    } else {
      onOpenDetail(product);
    }
  };

  const currentImage = currentProduct.image || product.image;
  const currentTitle = hasVariants ? product.title : currentProduct.title;
  const currentVariantLabel = currentProduct.variantName || currentProduct.title;

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
      {/* Product Image Area with Interactive Variant Slider */}
      <div
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer select-none"
        title={hasVariants ? 'Desliza o haz clic para ver más detalles y tallas' : 'Clic para ver más detalles'}
      >
        <AnimatePresence mode="wait">
          {!isReferenceLogo(currentImage) ? (
            <motion.img
              key={currentProduct.id || currentImage}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.7 }}
              transition={{ duration: 0.2 }}
              src={formatDirectImageUrl(currentImage)}
              alt={currentProduct.title}
              loading="lazy"
              className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                currentProduct.inStock === false ? 'grayscale-[35%] opacity-85' : ''
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
              }}
            />
          ) : (
            <motion.div
              key={currentProduct.id || 'logo-holder'}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.7 }}
              className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-4 text-center group-hover:scale-105 transition-transform duration-500"
            >
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
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                {currentProduct.title}
              </span>
              <span className="text-[9px] text-[#1BA7D9] font-black uppercase tracking-wider mt-0.5">
                Coralink Caribe
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Slider Navigation Arrows (Left & Right) */}
        {hasVariants && (
          <>
            <button
              type="button"
              onClick={handlePrevVariant}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-15 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow-lg opacity-85 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Ver talla anterior"
              title="Ver talla o modelo anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 -translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNextVariant}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-15 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow-lg opacity-85 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Ver siguiente talla"
              title="Ver siguiente talla o modelo"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 translate-x-0.5" />
            </button>
          </>
        )}

        {/* Stock Badge or Promo / Interactive Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {currentProduct.inStock === false ? (
            <div className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Agotado
            </div>
          ) : currentProduct.badge ? (
            <div className="px-2 py-0.5 rounded-md bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              {currentProduct.badge}
            </div>
          ) : null}

          {/* Multivariant interactive indicator */}
          {hasVariants && (
            <div className="px-2 py-0.5 rounded-md bg-[#1BA7D9] text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 backdrop-blur-xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{variants.length} Tallas</span>
            </div>
          )}
        </div>

        {/* Bottom banner on image if Agotado */}
        {currentProduct.inStock === false && (
          <div className="absolute inset-x-0 bottom-0 py-1 bg-black/75 backdrop-blur-xs text-center z-5">
            <span className="text-[10px] font-black tracking-widest text-rose-300 uppercase">
              Agotado
            </span>
          </div>
        )}

        {/* Dot Pagination Indicator over Image */}
        {hasVariants && (
          <div className="absolute bottom-1.5 inset-x-0 z-10 flex items-center justify-center gap-1 pointer-events-none">
            {variants.map((v, i) => (
              <span
                key={v.id || i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeVariantIdx
                    ? 'w-3.5 bg-[#FF6B35] shadow-xs'
                    : 'w-1.5 bg-white/70 shadow-2xs'
                }`}
              />
            ))}
          </div>
        )}

        {/* Favorite Button (Top Right) */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(currentProduct.id);
            }}
            className="absolute top-2 right-2 z-15 p-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] shadow-xs transition-colors cursor-pointer"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF6B35] text-[#FF6B35]' : ''}`} />
          </button>
        )}

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-[#0B2545]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-[#0B2545] dark:text-white text-xs font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#1BA7D9]" />
            Ver Detalles
          </span>
        </div>
      </div>

      {/* Interactive Variant Horizontal Slider Pills */}
      {hasVariants && (
        <div className="px-2.5 pt-2 pb-1 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight shrink-0 mr-0.5">
            Tallas:
          </span>
          {variants.map((v, i) => {
            const isSelected = i === activeVariantIdx;
            return (
              <button
                key={v.id || i}
                type="button"
                onClick={(e) => handleSelectVariant(i, e)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6B35] text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
                title={`Ver ${v.variantName || v.title} - C$${v.price}`}
              >
                {v.variantName || `Talla ${i + 1}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Product Details Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        {/* Title */}
        <h3
          onClick={handleCardClick}
          className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-[#1BA7D9] dark:hover:text-[#1BA7D9] cursor-pointer min-h-[2.4rem] leading-snug"
          title="Clic para ver más detalles"
        >
          {currentTitle}
        </h3>

        {/* Selected Variant Subtitle */}
        {hasVariants && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#1BA7D9] mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BA7D9]" />
            <span>Seleccionado: {currentVariantLabel}</span>
          </div>
        )}

        {/* Star Rating System & Average Score Display */}
        <div
          onClick={handleCardClick}
          className="flex items-center justify-between gap-1.5 mt-1.5 p-1 rounded-lg hover:bg-amber-50/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group/rate"
          title="Clic para ver calificaciones y opiniones"
        >
          <div className="flex items-center gap-1.5">
            <StarRating
              rating={currentProduct.rating ?? 5.0}
              size="xs"
              interactive={false}
            />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 group-hover/rate:text-amber-600 dark:group-hover/rate:text-amber-400 transition-colors">
              {(currentProduct.rating ?? 5.0).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              ({currentProduct.reviewsCount ?? 24})
            </span>
          </div>

          <span className="text-[10px] text-[#1BA7D9] font-bold group-hover/rate:underline flex items-center">
            Detalles <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        {/* Price Row in Nicaraguan Cordobas (C$) */}
        <div className="mt-2 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <div className="flex items-baseline text-[#FF6B35]">
              <span className="text-xs font-black mr-0.5">C$</span>
              <span className="text-base sm:text-lg font-black tracking-tight">
                {(typeof currentProduct.price === 'number' ? currentProduct.price : 0).toLocaleString('es-NI')}
              </span>
            </div>

            {typeof currentProduct.originalPrice === 'number' &&
              typeof currentProduct.price === 'number' &&
              currentProduct.originalPrice > currentProduct.price && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
                  C${currentProduct.originalPrice.toLocaleString('es-NI')}
                </span>
              )}
          </div>

          {currentProduct.inStock === false && (
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 uppercase tracking-tight">
              Agotado
            </span>
          )}
        </div>

        {/* Actions Button Row */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          {currentProduct.inStock === false ? (
            <>
              {/* WhatsApp Inquiry for Out-of-Stock */}
              <button
                type="button"
                onClick={() => onDirectWhatsApp(currentProduct)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={`Consultar disponibilidad de ${currentProduct.title} por WhatsApp`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Consultar</span>
              </button>

              {/* Disabled Basket Button */}
              <button
                disabled
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60"
                title="Producto agotado actualmente"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Quick WhatsApp Quote */}
              <button
                type="button"
                onClick={() => onDirectWhatsApp(currentProduct)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={`Cotizar ${currentProduct.title} por WhatsApp`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Cotizar</span>
              </button>

              {/* Add to Quote Basket */}
              <button
                type="button"
                onClick={() => onAddToCart(currentProduct)}
                className="p-1.5 rounded-xl bg-[#0B2545] dark:bg-slate-700 hover:bg-[#144272] dark:hover:bg-slate-600 text-white transition-colors cursor-pointer"
                title={`Añadir ${currentProduct.title} a mi lista de cotización`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
