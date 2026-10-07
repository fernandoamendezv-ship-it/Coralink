import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, MessageCircle, MapPin, User, ShoppingBag, Clock, ShieldCheck } from 'lucide-react';
import { CORALINK_LOGO_URL, CORALINK_FALLBACK_LOGO_URL, isReferenceLogo } from '../utils/logoConstants';
import { formatDirectImageUrl } from '../utils/imageUrlResolver';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('Managua');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSendWhatsApp = () => {
    if (items.length === 0) return;

    let message = `🌊 *¡Hola Coralink! (Arte & Personalización Caribeña)*\n\n`;
    message += `Deseo cotizar los siguientes productos de su catálogo:\n\n`;

    items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.product.title}*\n`;
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio: C$ ${(item.product.price * item.quantity).toLocaleString('es-NI')}\n`;
      if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
        const opts = Object.entries(item.selectedOptions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        message += `   • Opciones: ${opts}\n`;
      }
      if (item.customNote) {
        message += `   • Detalle personal: "${item.customNote}"\n`;
      }
      message += `\n`;
    });

    const anticipo50 = totalAmount * 0.5;
    message += `💰 *TOTAL ESTIMADO: C$ ${totalAmount.toLocaleString('es-NI')}*\n`;
    message += `💵 *Anticipo requerido (50%): C$ ${anticipo50.toLocaleString('es-NI')}*\n`;
    message += `⏱️ *Tiempo de entrega:* Mínimo 3 días hábiles\n\n`;

    if (customerName) {
      message += `👤 *Cliente:* ${customerName}\n`;
    }
    if (customerCity) {
      message += `📍 *Ciudad / Departamento:* ${customerCity}, Nicaragua\n`;
    }
    if (notes) {
      message += `📝 *Comentarios adicionales:* ${notes}\n`;
    }

    message += `\n📋 *Política de Compra:* Entiendo que se requiere dar el 50% de anticipo del total cotizado para iniciar la elaboración y que el tiempo de entrega es mínimo 3 días hábiles.\n\n¿Me confirman disponibilidad para proceder? ¡Gracias!`;

    const encoded = encodeURIComponent(message);
    // WhatsApp direct link to Coralink official number +505 8204 5433
    const whatsappUrl = `https://wa.me/50582045433?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const citiesNicaragua = [
    'Managua',
    'Masaya',
    'Granada',
    'León',
    'Chinandega',
    'Matagalpa',
    'Estelí',
    'Jinotega',
    'Rivas',
    'Carazo (Jinotepe)',
    'Chontales (Juigalpa)',
    'Boaco',
    'Río San Juan (San Carlos)',
    'Costa Caribe Sur (Bluefields)',
    'Costa Caribe Norte (Bilwi / Puerto Cabezas)',
    'Nueva Segovia (Ocotal)',
    'Madriz (Somoto)',
    'Otro Municipio'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col transition-colors">
          {/* Drawer Header */}
          <div className="bg-[#0B2545] dark:bg-slate-950 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1BA7D9]/20 flex items-center justify-center text-[#1BA7D9]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Lista de Cotización</h3>
                <p className="text-xs text-slate-300">
                  {items.length} {items.length === 1 ? 'producto' : 'productos'} seleccionados
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">Tu lista está vacía</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Agrega productos desde el catálogo para generar tu pedido personalizado por WhatsApp.
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex gap-3 relative"
                >
                  {!isReferenceLogo(item.product.image) ? (
                    <img
                      src={formatDirectImageUrl(item.product.image)}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <img
                        src={CORALINK_LOGO_URL}
                        alt="Coralink"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-[#0B2545] dark:text-white truncate">
                        {item.product.title}
                      </h4>
                      {item.product.inStock === false && (
                        <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/50 uppercase">
                          Agotado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#FF6B35] font-black mt-0.5">
                      C$ {(item.product.price * item.quantity).toLocaleString('es-NI')}
                    </p>

                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </p>
                    )}

                    {item.customNote && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                        &quot;{item.customNote}&quot;
                      </p>
                    )}

                    {/* Quantity Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-[#0B2545] dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Item Button */}
                  <button
                    onClick={() => onRemoveItem(idx)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Eliminar de cotización"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Customer Details Form (When items exist) */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Tus datos para la entrega:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-[#1BA7D9]"
                  />
                </div>

                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <select
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-[#1BA7D9] cursor-pointer"
                  >
                    {citiesNicaragua.map((c) => (
                      <option key={c} value={c} className="dark:bg-slate-800">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones adicionales (ej. Fecha de cumpleaños)"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-[#1BA7D9]"
              />
            </div>
          )}

          {/* Drawer Footer with Total, Purchase Policy & WhatsApp Button */}
          {items.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {/* Purchase Policy Banner */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Política de Compra y Elaboración:</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                  <p className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><b>Anticipo del 50%:</b> Se requiere dar el 50% del total para iniciar la personalización de tu pedido.</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><b>Tiempo de Entrega:</b> Mínimo <b>3 días hábiles</b> a partir de la confirmación del anticipo.</span>
                  </p>
                </div>
              </div>

              {/* Total & 50% Anticipo Breakdown */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Total de Productos:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    C$ {totalAmount.toLocaleString('es-NI')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-black text-[#FF6B35]">
                  <span>Anticipo a pagar (50%):</span>
                  <span className="text-base">
                    C$ {(totalAmount * 0.5).toLocaleString('es-NI')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Pedido por WhatsApp</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Respuesta rápida en horario laboral</span>
                <button
                  onClick={onClearCart}
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Vaciar lista
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
