import React from 'react';
import { MainCategory } from '../types';
import { LayoutGrid, Sparkles, BookOpen, Gem, ArrowUpDown } from 'lucide-react';

interface CategoryNavProps {
  selectedMainCategory: MainCategory | 'Todo';
  onSelectCategory: (cat: MainCategory | 'Todo') => void;
  selectedSubCategory: string;
  onSelectSubCategory: (sub: string) => void;
  subCategories: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'sales' | 'rating';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc' | 'sales' | 'rating') => void;
  isAdmin?: boolean;
  enabledCategories?: { 'Papelería creativa': boolean; 'Detalles en resina': boolean };
  onLockedCategoryClick?: (categoryName: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedMainCategory,
  onSelectCategory,
  selectedSubCategory,
  onSelectSubCategory,
  subCategories,
  sortBy,
  onSortChange,
  isAdmin = false,
  enabledCategories = { 'Papelería creativa': false, 'Detalles en resina': false },
  onLockedCategoryClick,
}) => {
  const categories: {
    key: MainCategory | 'Todo';
    label: string;
    icon: React.ReactNode;
    isComingSoon?: boolean;
  }[] = [
    { key: 'Todo', label: 'Todo', icon: <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
    { key: 'Personalizados', label: 'Personalizados', icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
    {
      key: 'Papelería creativa',
      label: 'Papelería Creativa',
      icon: <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
      isComingSoon: !isAdmin && !enabledCategories['Papelería creativa'],
    },
    {
      key: 'Detalles en resina',
      label: 'Resina',
      icon: <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
      isComingSoon: !isAdmin && !enabledCategories['Detalles en resina'],
    },
  ];

  return (
    <div id="catalog-section" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 py-3 sm:py-3 px-3 sm:px-6 transition-colors duration-200 shadow-xs relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Category Buttons: Equalized / averaged size for all buttons */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full pt-1.5">
          {categories.map((cat) => {
            const isSelected = selectedMainCategory === cat.key;
            const isLocked = cat.isComingSoon;

            return (
              <div key={cat.key} className="relative flex justify-center">
                {isLocked && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-[#FF6B35] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm pointer-events-none z-20 whitespace-nowrap">
                    Muy Pronto
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      if (onLockedCategoryClick) {
                        onLockedCategoryClick(cat.label);
                      }
                      return;
                    }
                    if (isSelected && cat.key !== 'Todo') {
                      onSelectCategory('Todo');
                      onSelectSubCategory('Todas');
                    } else {
                      onSelectCategory(cat.key);
                      onSelectSubCategory('Todas');
                    }
                  }}
                  className={`w-full py-2 sm:py-2.5 px-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all truncate shadow-xs ${
                    isSelected
                      ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25 cursor-pointer'
                      : isLocked
                      ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 hover:border-amber-400/50 cursor-not-allowed opacity-90'
                      : 'bg-[#E8F0F8] dark:bg-slate-800 text-[#0B2545] dark:text-slate-200 hover:bg-[#dbe7f3] dark:hover:bg-slate-700 cursor-pointer'
                  }`}
                  title={isLocked ? `${cat.label} (Muy Pronto)` : cat.label}
                >
                  {cat.icon}
                  <span className="truncate tracking-tight">{cat.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Subcategories */}
        {selectedMainCategory !== 'Todo' && subCategories.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 shrink-0 py-0.5">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
                Subcategorías:
              </span>
              <button
                onClick={() => onSelectSubCategory('Todas')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubCategory === 'Todas'
                    ? 'bg-[#0B2545] dark:bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todas
              </button>

              {subCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => onSelectSubCategory(sub)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF6B35] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 shrink-0 ml-auto pl-2 border-l border-slate-100 dark:border-slate-800">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                aria-label="Ordenar productos"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-transparent border-none focus:outline-none cursor-pointer py-0.5"
              >
                <option value="featured" className="dark:bg-slate-800">Subcategorías (A-Z)</option>
                <option value="sales" className="dark:bg-slate-800">Más Vendidos</option>
                <option value="price-asc" className="dark:bg-slate-800">Menor precio C$</option>
                <option value="price-desc" className="dark:bg-slate-800">Mayor precio C$</option>
                <option value="rating" className="dark:bg-slate-800">Mejor Calificados ★</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
