import React from 'react';
import { Home, Search, Heart, ShoppingBag } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'inicio' | 'buscar' | 'favoritos' | 'pedido';
  onTabChange: (tab: 'inicio' | 'buscar' | 'favoritos' | 'pedido') => void;
  favoritesCount: number;
  cartCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  cartCount,
}) => {
  return (
    <nav 
      aria-label="Navegación inferior principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-black/50 transition-colors duration-200"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-15 px-2">
        {/* Inicio */}
        <button
          onClick={() => onTabChange('inicio')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'inicio' ? 'text-[#0B2545] dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'inicio' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-bold ${activeTab === 'inicio' ? 'text-[#0B2545] dark:text-white' : ''}`}>
            Inicio
          </span>
        </button>

        {/* Buscar */}
        <button
          onClick={() => onTabChange('buscar')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'buscar' ? 'text-[#1BA7D9]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === 'buscar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-bold ${activeTab === 'buscar' ? 'text-[#1BA7D9]' : ''}`}>
            Buscar
          </span>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => onTabChange('favoritos')}
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'favoritos' ? 'text-[#FF6B35]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 ${
                activeTab === 'favoritos' ? 'stroke-[2.5] fill-[#FF6B35]' : 'stroke-2'
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#FF6B35] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold ${activeTab === 'favoritos' ? 'text-[#FF6B35]' : ''}`}>
            Favoritos
          </span>
        </button>

        {/* Pedido / Cotización */}
        <button
          onClick={() => onTabChange('pedido')}
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'pedido' ? 'text-[#0B2545] dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'pedido' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#1BA7D9] text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold ${activeTab === 'pedido' ? 'text-[#0B2545] dark:text-white' : ''}`}>
            Pedido
          </span>
        </button>
      </div>
    </nav>
  );
};
