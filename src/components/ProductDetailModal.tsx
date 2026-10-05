import React, { useState } from 'react';
import { Product } from '../types';
import { X, Star, MessageCircle, ShoppingBag, Check, Sparkles, Shield, Truck, ThumbsUp, Send, Clock, ShieldCheck } from 'lucide-react';
import { StarRating } from './StarRating';
import { CORALINK_LOGO_URL, CORALINK_FALLBACK_LOGO_URL, isReferenceLogo } from '../utils/logoConstants';
import { formatDirectImageUrl } from '../utils/imageUrlResolver';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, options: Record<string, string>, note: string) => void;
  onDirectWhatsApp: (product: Product, quantity: number, options: Record<string, string>, note: string) => void;
  onRateProduct?: (productId: string, rating: number, comment?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectWhatsApp,
  onRateProduct,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.availableOptions?.forEach((opt) => {
      if (opt.choices.length > 0) {
        initial[opt.label] = opt.choices[0];
      }
    });
    return initial;
  });
  const [customNote, setCustomNote] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  // User Rating State
  const [userRating, setUserRating] = useState<number>(product.userRating || 0);
  const [userComment, setUserComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  const totalPrice = product.price * quantity;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedOptions, customNote);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 900);
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    if (onRateProduct) {
      onRateProduct(product.id, stars, userComment);
    }
    setRatingSubmitted(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating > 0 && onRateProduct) {
      onRateProduct(product.id, userRating, userComment);
      setRatingSubmitted(true);
    }
  };

  const sampleReviews = [
    {
      id: 'rev-1',
      name: 'Katherine M.',
      stars: 5,
      date: 'Hace 3 días',
      comment: '¡Quedó bellísimo! La calidad de la impresión superó mis expectativas. Ideal para regalar en Corn Island.',
    },
    {
      id: 'rev-2',
      name: 'Carlos B.',
      stars: 5,
      date: 'Hace 1 semana',
      comment: 'Muy buena atención por WhatsApp y entrega rápida. Recomendadísimo.',
    },
    {
      id: 'rev-3',
      name: 'María José R.',
      stars: 4,
      date: 'Hace 2 semanas',
      comment: 'Los detalles en el acabado están perfectos. Volveré a pedir para los próximos cumpleaños.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B2545]/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row max-h-[92vh]"
        role="dialog"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-md transition-colors cursor-pointer"
          aria-label="Cerrar modal de producto"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Section */}
        <div className="md:w-1/2 bg-white dark:bg-slate-900 relative min-h-[260px] md:min-h-full flex items-center justify-center p-6">
          {!isReferenceLogo(product.image) ? (
            <img
              src={formatDirectImageUrl(product.image)}
              alt={product.title}
              className="w-full h-full max-h-[380px] md:max-h-full object-cover rounded-2xl shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
              }}
            />
          ) : (
            <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="w-36 h-36 rounded-3xl bg-white dark:bg-slate-800 p-3 shadow-md flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-700">
                <img
                  src={CORALINK_LOGO_URL}
                  alt="Coralink"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
                  }}
                />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{product.title}</h3>
              <p className="text-xs text-[#1BA7D9] font-black uppercase tracking-wider mt-1">Coralink Corn Island</p>
            </div>
          )}
          {product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#FF6B35] text-white text-xs font-black uppercase tracking-wider shadow-md">
              {product.badge}
            </div>
          )}
        </div>

        {/* Right Column: Information & Reviews Tabs */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col overflow-y-auto">
          {/* Title & Star Rating Summary */}
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2545] dark:text-white leading-snug">
            {product.title}
          </h2>

          {/* Clickable Tab switcher: Producto / Calificaciones */}
          <div className="flex items-center gap-2 mt-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('info')}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-[#0B2545] dark:bg-slate-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{(product.rating ?? 5.0).toFixed(1)} ({product.reviewsCount ?? 24} opiniones)</span>
            </button>
          </div>

          {activeTab === 'info' ? (
            <>
              {/* Price Box */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Precio Unitario</span>
                  <div className="flex items-baseline text-[#FF6B35]">
                    <span className="text-xs font-black mr-1">C$</span>
                    <span className="text-xl sm:text-2xl font-black">{product.price.toLocaleString('es-NI')}</span>
                  </div>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 line-through block">
                      C$ {product.originalPrice.toLocaleString('es-NI')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                      Ahorras C$ {(product.originalPrice - product.price).toLocaleString('es-NI')}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Custom Options */}
              {product.availableOptions && product.availableOptions.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  {product.availableOptions.map((opt) => (
                    <div key={opt.label}>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {opt.label}: <span className="text-[#1BA7D9]">{selectedOptions[opt.label]}</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.choices.map((choice) => {
                          const isSelected = selectedOptions[opt.label] === choice;
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => setSelectedOptions({ ...selectedOptions, [opt.label]: choice })}
                              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#1BA7D9] bg-[#1BA7D9]/10 text-[#0B2545] dark:text-white font-bold shadow-xs'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customization Details Input */}
              <div className="mt-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>Personalización Deseada (Opcional):</span>
                  <span className="text-[10px] text-slate-400">Nombre, fecha, dedicatoria</span>
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ej. Nombre a grabar: Lucía / Foto de aniversario"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-[#1BA7D9] focus:ring-2 focus:ring-[#1BA7D9]/20 outline-none"
                />
              </div>

              {/* Quantity Selector */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cantidad:</span>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-[#0B2545] dark:text-white min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total & 50% Anticipo Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Estimado ({quantity} {quantity === 1 ? 'unidad' : 'unidades'}):</span>
                  <span className="text-lg font-black text-[#FF6B35]">
                    C$ {totalPrice.toLocaleString('es-NI')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-black text-amber-700 dark:text-amber-400">
                  <span>Anticipo requerido (50%):</span>
                  <span>C$ {(totalPrice * 0.5).toLocaleString('es-NI')}</span>
                </div>
              </div>

              {/* Purchase Policy Notice */}
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Política de Compra y Elaboración:</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Se requiere el <b>50% de anticipo</b> para iniciar la producción personalizada. Tiempo de entrega mínimo: <b>3 días hábiles</b>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => onDirectWhatsApp(product, quantity, selectedOptions, customNote)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Cotizar por WhatsApp</span>
                </button>

                <button
                  onClick={handleAdd}
                  disabled={addedToast}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0B2545] dark:bg-slate-700 hover:bg-[#144272] dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {addedToast ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>¡Añadido al Pedido!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#1BA7D9]" />
                      <span>Añadir a mi Cotización</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* TAB: REVIEWS & INTERACTIVE STAR RATING */
            <div className="mt-3 space-y-4 animate-in fade-in duration-150">
              {/* Average Rating Scorecard */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {(product.rating ?? 5.0).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                  </div>
                  <StarRating rating={product.rating ?? 5.0} size="sm" />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Basado en {product.reviewsCount ?? 24} calificaciones verificadas
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                    <ThumbsUp className="w-3 h-3" />
                    <span>98% Recomendado</span>
                  </div>
                </div>
              </div>

              {/* Interactive Rate This Product Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-black text-[#0B2545] dark:text-white uppercase tracking-wide">
                  Califica este producto
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Toca las estrellas para calificar tu experiencia:
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <StarRating
                    rating={userRating}
                    size="md"
                    interactive={true}
                    onRate={handleRate}
                  />
                  {userRating > 0 && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
                      {userRating === 5 && '¡Excelente! ⭐⭐⭐⭐⭐'}
                      {userRating === 4 && 'Muy Bueno ⭐⭐⭐⭐'}
                      {userRating === 3 && 'Bueno ⭐⭐⭐'}
                      {userRating === 2 && 'Regular ⭐⭐'}
                      {userRating === 1 && 'Malo ⭐'}
                    </span>
                  )}
                </div>

                {/* Optional comment box */}
                <form onSubmit={handleSubmitReview} className="mt-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Escribe un breve comentario (opcional)..."
                      className="w-full pl-3 pr-10 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:ring-1 focus:ring-[#1BA7D9] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={userRating === 0}
                      className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-[#0B2545] dark:bg-slate-700 hover:bg-[#144272] dark:hover:bg-slate-600 disabled:opacity-40 text-white text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                      title="Enviar opinión"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </form>

                {ratingSubmitted && (
                  <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Gracias por tu calificación de {userRating} estrellas!</span>
                  </div>
                )}
              </div>

              {/* Recent Customer Reviews */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Opiniones de clientes</h4>
                <div className="space-y-2">
                  {sampleReviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0B2545] dark:text-white">{rev.name}</span>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                      <div className="mt-0.5">
                        <StarRating rating={rev.stars} size="xs" />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
