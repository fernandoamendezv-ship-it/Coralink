/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, MainCategory } from './types';
import { INITIAL_PRODUCTS, CATALOG_VERSION } from './data/initialProducts';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { PromoHeroBanner } from './components/PromoHeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuoteDrawer } from './components/QuoteDrawer';
import { FavoritesModal } from './components/FavoritesModal';
import { AdminModal } from './components/AdminModal';
import { PWAStatusModal } from './components/PWAStatusModal';
import { BottomNavBar } from './components/BottomNavBar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';
import { Search, Zap, Sparkles, RefreshCw } from 'lucide-react';
import { useThemeMode } from './hooks/useThemeMode';
import { CORALINK_LOGO_URL, isReferenceLogo } from './utils/logoConstants';
import { scanAndRecoverCustomProducts, mergePreservingCustomizations } from './utils/productMerger';

export default function App() {
  // Theme mode (Dark / Light)
  const { isDarkMode, toggleTheme } = useThemeMode();

  // Store Logo State (persistent, defaults to user uploaded new logo)
  const [storeLogo, setStoreLogo] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('coralink_custom_logo');
        if (
          saved &&
          !saved.startsWith('/logo') &&
          saved !== '/logos.png' &&
          saved !== '/logo.png' &&
          saved !== '/LG1.png' &&
          saved !== '/logo-app.svg' &&
          saved !== '/logo-clean.svg'
        ) {
          return saved;
        }
      } catch (err) {
        console.error('Failed to read logo from storage:', err);
      }
    }
    return CORALINK_LOGO_URL;
  });

  // Ensure any cached previous paths are reset to the new CORALINK_LOGO_URL
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('coralink_custom_logo');
      if (
        saved &&
        (saved.startsWith('/logo') ||
          saved === '/logos.png' ||
          saved === '/logo.png' ||
          saved === '/LG1.png' ||
          saved === '/logo-app.svg' ||
          saved === '/logo-clean.svg')
      ) {
        localStorage.removeItem('coralink_custom_logo');
        setStoreLogo(CORALINK_LOGO_URL);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUpdateLogo = (newLogoUrl: string) => {
    setStoreLogo(newLogoUrl);
    try {
      localStorage.setItem('coralink_custom_logo', newLogoUrl);
    } catch (err) {
      console.error('Failed to save logo to storage:', err);
    }
  };

  const handleResetLogo = () => {
    setStoreLogo(CORALINK_LOGO_URL);
    try {
      localStorage.removeItem('coralink_custom_logo');
    } catch (err) {
      console.error('Failed to remove custom logo from storage:', err);
    }
  };

  // PWA Install & Update hook
  const { isInstallable, isInstalled, isIOS, install, swStatus, checkSW, hasUpdate, isUpdating, updateApp } = usePWAInstall();

  // Products State with Intelligent Customization Preservation and Auto-Recovery
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const { recoveredProducts } = scanAndRecoverCustomProducts(INITIAL_PRODUCTS);

        // Always save a safe backup
        localStorage.setItem('coralink_custom_products', JSON.stringify(recoveredProducts));
        localStorage.setItem('coralink_custom_products_backup', JSON.stringify(recoveredProducts));
        localStorage.setItem('coralink_catalog_version', CATALOG_VERSION);

        return recoveredProducts;
      } catch (err) {
        console.error('Failed to parse or recover products:', err);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Favorites State with LocalStorage Persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('coralink_favorites');
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Cart / Quote Basket State
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('coralink_cart');
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Navigation & Filtering State
  // Default to 'Todo' as shown in image.png
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | 'Todo'>('Todo');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'sales' | 'rating'>('featured');

  // Active Bottom Navigation Tab
  const [activeBottomTab, setActiveBottomTab] = useState<'inicio' | 'buscar' | 'favoritos' | 'pedido'>('inicio');

  // Modals State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPWAStatusOpen, setIsPWAStatusOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Admin session lock handlers: Always lock on open/close and closing tab
  const handleOpenAdmin = () => {
    setIsAdminUnlocked(false);
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setIsAdminUnlocked(false);
    setIsAdminOpen(false);
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
  };

  // Sync products with backend on initial load (preserving local modifications)
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts((current) => {
            const merged = mergePreservingCustomizations(current, data.products);
            try {
              localStorage.setItem('coralink_custom_products', JSON.stringify(merged));
              localStorage.setItem('coralink_custom_products_backup', JSON.stringify(merged));
            } catch (e) {
              console.error(e);
            }
            return merged;
          });
        }
      })
      .catch((err) => {
        console.log('Running in local/offline mode:', err);
      });
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('coralink_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save favorites changes
  useEffect(() => {
    try {
      localStorage.setItem('coralink_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Toggle favorite
  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Handle Admin Saving Products
  const handleSaveProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('coralink_custom_products', JSON.stringify(updated));
      localStorage.setItem('coralink_custom_products_backup', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: updated }),
    }).catch((e) => console.log('Backend sync skipped:', e));
  };

  // Manual recovery of user customizations from browser caches & history
  const handleRecoverCustomProducts = () => {
    const { recoveredProducts, customCount } = scanAndRecoverCustomProducts(INITIAL_PRODUCTS);
    setProducts(recoveredProducts);
    try {
      localStorage.setItem('coralink_custom_products', JSON.stringify(recoveredProducts));
      localStorage.setItem('coralink_custom_products_backup', JSON.stringify(recoveredProducts));
    } catch (e) {
      console.error(e);
    }
    return customCount;
  };

  const handleResetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('coralink_custom_products');
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: INITIAL_PRODUCTS }),
    }).catch((e) => console.log(e));
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedOptions: Record<string, string> = {},
    customNote = ''
  ) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
          item.customNote === customNote
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      } else {
        return [...prev, { product, quantity, selectedOptions, customNote }];
      }
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCart((prev) => {
        const next = [...prev];
        next[index].quantity = newQty;
        return next;
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Direct WhatsApp quote link generator
  const handleDirectWhatsApp = (
    product: Product,
    quantity = 1,
    selectedOptions: Record<string, string> = {},
    customNote = ''
  ) => {
    let msg = `🌊 *¡Hola Coralink! (Arte & Personalización Caribeña)*\n\n`;
    msg += `Me interesa personalizar el siguiente producto de su catálogo:\n\n`;
    msg += `📌 *Producto:* ${product.title}\n`;
    msg += `📦 *Cantidad:* ${quantity}\n`;
    msg += `💰 *Precio:* C$ ${(product.price * quantity).toLocaleString('es-NI')}\n`;

    if (Object.keys(selectedOptions).length > 0) {
      const opts = Object.entries(selectedOptions)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      msg += `✨ *Opciones:* ${opts}\n`;
    }

    if (customNote) {
      msg += `📝 *Detalle personal:* "${customNote}"\n`;
    }

    msg += `\n¿Tienen disponibilidad para envío en Nicaragua? ¡Muchas gracias!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/50582045433?text=${encoded}`, '_blank');
  };

  // Compute Subcategories dynamically ONLY for the currently selected category
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'Todo') return [];
    const set = new Set<string>();
    products
      .filter((p) => p.mainCategory === selectedCategory)
      .forEach((p) => set.add(p.subCategory));
    return Array.from(set);
  }, [products, selectedCategory]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Main Category filter
        if (selectedCategory !== 'Todo' && p.mainCategory !== selectedCategory) {
          return false;
        }
        // SubCategory filter
        if (selectedSubCategory !== 'Todas' && p.subCategory !== selectedSubCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSub = p.subCategory.toLowerCase().includes(q);
          const matchMain = p.mainCategory.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          return matchTitle || matchSub || matchMain || matchDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'sales') return b.salesCount - a.salesCount;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
      });
  }, [products, selectedCategory, selectedSubCategory, searchQuery, sortBy]);

  // Flash Deals special selection (items with discount badges or popular items)
  const flashDealProducts = useMemo(() => {
    return products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 8);
  }, [products]);

  // Bottom Navigation Handler
  const handleBottomTabChange = (tab: 'inicio' | 'buscar' | 'favoritos' | 'pedido') => {
    setActiveBottomTab(tab);
    if (tab === 'inicio') {
      setSelectedCategory('Todo');
      setSelectedSubCategory('Todas');
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'buscar') {
      const searchInput = document.getElementById('main-search-input');
      searchInput?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'favoritos') {
      setIsFavoritesOpen(true);
    } else if (tab === 'pedido') {
      setIsCartOpen(true);
    }
  };

  const handleRateProduct = (productId: string, stars: number, comment?: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const prevReviews = p.reviewsCount || 1;
          const hadUserRating = p.userRating !== undefined;
          const newReviewsCount = hadUserRating ? prevReviews : prevReviews + 1;
          const currentTotal = p.rating * prevReviews;
          const updatedTotal = hadUserRating
            ? currentTotal - (p.userRating || 0) + stars
            : currentTotal + stars;
          const newRating = Number((updatedTotal / newReviewsCount).toFixed(1));

          const updatedProd: Product = {
            ...p,
            rating: Math.min(5, Math.max(1, newRating)),
            reviewsCount: newReviewsCount,
            userRating: stars,
          };

          if (detailProduct && detailProduct.id === productId) {
            setDetailProduct(updatedProd);
          }

          return updatedProd;
        }
        return p;
      });

      try {
        localStorage.setItem('coralink_custom_products', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      return updated;
    });
  };

  const handleVerifyPWA = async () => {
    await checkSW();
    setIsPWAStatusOpen(true);
  };

  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-18 sm:pb-22 transition-colors duration-200">
      {/* Sticky Navigation Area: Header + Category Bar remain fixed when scrolling */}
      <div className="sticky top-0 z-40 shadow-xs">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={totalCartUnits}
          favoritesCount={favorites.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenAdmin={handleOpenAdmin}
          onOpenPWAStatus={() => setIsPWAStatusOpen(true)}
          isAdmin={isAdminUnlocked}
          onGoHome={() => {
            setSelectedCategory('Todo');
            setSelectedSubCategory('Todas');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          logoUrl={storeLogo}
          onForceSync={updateApp}
          isUpdating={isUpdating}
        />

        {/* Category Pills: Equalized / averaged width, with subcategories hidden when 'Todo' is active */}
        <CategoryNav
          selectedMainCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubCategory('Todas');
          }}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
          subCategories={availableSubCategories}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      <main className="flex-1">
        {/* Banner with Slogan, Verificar PWA button, Orange 50% OFF Card, and Navy Ofertas Flash Countdown */}
        {!searchQuery && selectedCategory === 'Todo' && (
          <PromoHeroBanner onVerifyPWA={handleVerifyPWA} />
        )}

        {/* Catalog Section */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          {/* Section: Ofertas Flash Grid (When on Todo / Home view without active text search) */}
          {!searchQuery && selectedCategory === 'Todo' && selectedSubCategory === 'Todas' && (
            <div className="mb-8">
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-[#0B2545] dark:text-white mb-3">
                <Zap className="w-5 h-5 text-[#FF6B35] fill-[#FF6B35]" />
                <span>Ofertas Flash</span>
              </div>

              {/* Flash Deals Horizontal Carousel / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {flashDealProducts.map((product, idx) => (
                  <ProductCard
                    key={`flash-${product.id}`}
                    product={product}
                    index={idx}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetail={setDetailProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onDirectWhatsApp={(p) => handleDirectWhatsApp(p, 1)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Main Products Grid */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5 px-0.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">
                <span>
                  {selectedCategory === 'Todo'
                    ? 'Todos los Productos'
                    : selectedCategory}
                  <span className="text-slate-400 font-normal ml-1.5">
                    ({filteredProducts.length} disponibles)
                  </span>
                </span>
                {(selectedCategory !== 'Todo' || selectedSubCategory !== 'Todas' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('Todo');
                      setSelectedSubCategory('Todas');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer ml-1.5"
                  >
                    Ver Todo
                  </button>
                )}
              </div>

              {/* Currency badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
                <span>Moneda:</span>
                <span className="text-[#FF6B35] font-black">C$ (Córdobas)</span>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={idx}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetail={setDetailProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onDirectWhatsApp={(p) => handleDirectWhatsApp(p, 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No encontramos productos con ese filtro</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                  Intenta buscar con otros términos o selecciona otra categoría.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('Todo');
                    setSelectedSubCategory('Todas');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-bold text-xs hover:bg-[#144272] dark:hover:bg-[#158db9] transition-colors cursor-pointer"
                >
                  Volver a Todo el Catálogo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Brand Logo, Title, Slogan and Description at the End of Page */}
      <Footer onOpenAdmin={handleOpenAdmin} logoUrl={storeLogo} onForceSync={updateApp} />

      {/* FIXED BOTTOM NAVIGATION BAR: Inicio, Buscar, Favoritos, Pedido */}
      <BottomNavBar
        activeTab={activeBottomTab}
        onTabChange={handleBottomTabChange}
        favoritesCount={favorites.length}
        cartCount={totalCartUnits}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectWhatsApp={handleDirectWhatsApp}
        onRateProduct={handleRateProduct}
      />

      <QuoteDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          setActiveBottomTab('inicio');
        }}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => {
          setIsFavoritesOpen(false);
          setActiveBottomTab('inicio');
        }}
        favorites={favorites}
        allProducts={products}
        onToggleFavorite={handleToggleFavorite}
        onOpenDetail={setDetailProduct}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onDirectWhatsApp={(p) => handleDirectWhatsApp(p, 1)}
        onClearFavorites={() => setFavorites([])}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        products={products}
        onSaveProducts={handleSaveProducts}
        onResetToDefaults={handleResetToDefaults}
        isAdminUnlocked={isAdminUnlocked}
        onUnlockAdmin={() => setIsAdminUnlocked(true)}
        onLockAdmin={handleLockAdmin}
        logoUrl={storeLogo}
        onUpdateLogo={handleUpdateLogo}
        onResetLogo={handleResetLogo}
        onForceSync={updateApp}
        isUpdating={isUpdating}
        onRecoverCustomProducts={handleRecoverCustomProducts}
      />

      <PWAStatusModal
        isOpen={isPWAStatusOpen}
        onClose={() => setIsPWAStatusOpen(false)}
        swStatus={swStatus}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={install}
        onRefreshSW={checkSW}
      />

      {/* PWA Update Banner - Floating alert when Vercel/GitHub has a new version */}
      {hasUpdate && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 bg-[#0B2545] text-white p-3.5 rounded-2xl shadow-2xl border border-[#1BA7D9]/50 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1BA7D9]/20 flex items-center justify-center text-[#1BA7D9] shrink-0">
              <Sparkles className="w-4 h-4 text-[#1BA7D9]" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">¡Nueva versión disponible!</p>
              <p className="text-[11px] text-slate-300">Hay nuevos productos e imágenes listas.</p>
            </div>
          </div>
          <button
            onClick={updateApp}
            disabled={isUpdating}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1BA7D9] to-[#FF6B35] text-white text-xs font-black shadow-md hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      )}

      {/* PWA Offline Network Toast */}
      <OfflineIndicator />
    </div>
  );
}
