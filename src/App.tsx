/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Search, Zap, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeMode } from './hooks/useThemeMode';
import { CORALINK_LOGO_URL, isReferenceLogo } from './utils/logoConstants';
import { scanAndRecoverCustomProducts, mergePreservingCustomizations } from './utils/productMerger';
import {
  fetchProductsFromFirestore,
  syncAllProductsToFirestore,
} from './services/firebaseProductsService';

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

  // Horizontal scroll ref for Ofertas Flash
  const flashScrollRef = useRef<HTMLDivElement>(null);

  // Enabled Categories State (Papelería Creativa & Resina locked by default for regular customers)
  const [enabledCategories, setEnabledCategories] = useState<{
    'Papelería creativa': boolean;
    'Detalles en resina': boolean;
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('coralink_enabled_categories');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return { 'Papelería creativa': false, 'Detalles en resina': false };
  });

  const handleToggleCategory = (category: 'Papelería creativa' | 'Detalles en resina') => {
    setEnabledCategories((prev) => {
      const next = { ...prev, [category]: !prev[category] };
      try {
        localStorage.setItem('coralink_enabled_categories', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleLockedCategoryClick = (categoryName: string) => {
    setSyncToastMsg(`✨ ¡Muy Pronto! La categoría «${categoryName}» estará disponible próximamente.`);
    setTimeout(() => setSyncToastMsg(null), 3500);
  };

  const [syncToastMsg, setSyncToastMsg] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Manual one-tap sync for user: ONLY runs when user clicks the "Sincronizar" button
  const handleManualSyncCatalog = async () => {
    if (isManualSyncing) return;
    setIsManualSyncing(true);
    setSyncToastMsg('Sincronizando catálogo con la nube...');

    try {
      // 1. Try manual fetch from Firestore first
      const firestoreProducts = await fetchProductsFromFirestore();
      if (firestoreProducts && firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
        try {
          localStorage.setItem('coralink_custom_products', JSON.stringify(firestoreProducts));
          localStorage.setItem('coralink_custom_products_backup', JSON.stringify(firestoreProducts));
        } catch (e) {
          console.error(e);
        }
        setSyncToastMsg('¡Catálogo sincronizado exitosamente!');
        setTimeout(() => setSyncToastMsg(null), 3000);
        return;
      }

      // 2. Fallback to server API
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        localStorage.setItem('coralink_custom_products', JSON.stringify(data.products));
        localStorage.setItem('coralink_custom_products_backup', JSON.stringify(data.products));
        syncAllProductsToFirestore(data.products).catch(() => {});
        setSyncToastMsg('¡Catálogo sincronizado exitosamente!');
      } else {
        setSyncToastMsg('¡Catálogo al día!');
      }
    } catch (err) {
      console.warn('Manual sync fallback notice:', err);
      setSyncToastMsg('¡Catálogo al día!');
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setSyncToastMsg(null), 3000);
    }
  };

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

    // 1. Instantly push to Firebase Firestore in the cloud
    syncAllProductsToFirestore(updated).catch((err) =>
      console.warn('Firestore sync background notice:', err)
    );

    // 2. Also send to local backend if available
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: updated }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          localStorage.setItem('coralink_custom_products', JSON.stringify(data.products));
        }
      })
      .catch((e) => console.log('Backend sync skipped:', e));
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
    const totalItemPrice = product.price * quantity;
    const anticipo50 = totalItemPrice * 0.5;

    let msg = `🌊 *¡Hola Coralink! (Arte & Personalización Caribeña)*\n\n`;
    msg += `Me interesa cotizar el siguiente producto de su catálogo:\n\n`;
    msg += `📌 *Producto:* ${product.title}\n`;
    msg += `📦 *Cantidad:* ${quantity}\n`;
    msg += `💰 *Precio Total:* C$ ${totalItemPrice.toLocaleString('es-NI')}\n`;
    msg += `💵 *Anticipo requerido (50%):* C$ ${anticipo50.toLocaleString('es-NI')}\n`;
    msg += `⏱️ *Tiempo de entrega:* Mínimo 3 días hábiles\n`;

    if (Object.keys(selectedOptions).length > 0) {
      const opts = Object.entries(selectedOptions)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      msg += `✨ *Opciones:* ${opts}\n`;
    }

    if (customNote) {
      msg += `📝 *Detalle personal:* "${customNote}"\n`;
    }

    msg += `\n📋 *Política de Compra:* Entiendo que se requiere dar el 50% de anticipo para iniciar la elaboración y que el tiempo de entrega es mínimo 3 días hábiles. ¿Tienen disponibilidad? ¡Muchas gracias!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/50582045433?text=${encoded}`, '_blank');
  };

  // Compute Subcategories dynamically ONLY for the currently selected category, sorted A-Z
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'Todo') return [];
    const set = new Set<string>();
    products
      .filter((p) => p.mainCategory === selectedCategory)
      .forEach((p) => set.add(p.subCategory));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [products, selectedCategory]);

  // Filtered & Sorted Products: In 'Todo', show exclusively 'Personalizados' sorted A-Z by subCategory
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Main Category filter: When 'Todo' is active, show only 'Personalizados' products
        if (selectedCategory === 'Todo') {
          if (p.mainCategory !== 'Personalizados') {
            return false;
          }
        } else if (p.mainCategory !== selectedCategory) {
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
        if (sortBy === 'price-asc') {
          if (a.price !== b.price) return a.price - b.price;
        } else if (sortBy === 'price-desc') {
          if (a.price !== b.price) return b.price - a.price;
        } else if (sortBy === 'sales') {
          if (a.salesCount !== b.salesCount) return b.salesCount - a.salesCount;
        } else if (sortBy === 'rating') {
          if (a.rating !== b.rating) return b.rating - a.rating;
        }

        // Default or featured: For 'Personalizados', order A-Z by subCategory, then title A-Z
        if (a.mainCategory === 'Personalizados' && b.mainCategory === 'Personalizados') {
          const subComparison = (a.subCategory || '').trim().localeCompare(
            (b.subCategory || '').trim(),
            'es',
            { sensitivity: 'base' }
          );
          if (subComparison !== 0) return subComparison;
          return (a.title || '').trim().localeCompare((b.title || '').trim(), 'es', { sensitivity: 'base' });
        }

        // Generic fallback by subCategory A-Z, then badge
        const catComparison = (a.subCategory || '').localeCompare(
          b.subCategory || '',
          'es',
          { sensitivity: 'base' }
        );
        if (catComparison !== 0) return catComparison;

        return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
      });
  }, [products, selectedCategory, selectedSubCategory, searchQuery, sortBy]);

  // Flash Deals special selection (shows exactly 5 products, prioritizing admin-enabled flash deals)
  const flashDealProducts = useMemo(() => {
    const explicit = products.filter((p) => p.isFlashDeal === true);
    if (explicit.length > 0) {
      return explicit.slice(0, 5);
    }
    // Fallback if none marked yet: items with discount
    return products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 5);
  }, [products]);

  // Quintuplicated list for seamless infinite loop on mobile touch scroll
  const cyclicFlashProducts = useMemo(() => {
    if (flashDealProducts.length <= 1) {
      return flashDealProducts.map((p) => ({ ...p, _cyclicKey: p.id }));
    }
    const sets = [0, 1, 2, 3, 4];
    return sets.flatMap((setNum) =>
      flashDealProducts.map((p, idx) => ({
        ...p,
        _cyclicKey: `set${setNum}-${p.id}-${idx}`,
      }))
    );
  }, [flashDealProducts]);

  // Cyclic horizontal carousel for Ofertas Flash
  const [flashActiveIndex, setFlashActiveIndex] = useState(0);

  const handleScrollFlashLeft = () => {
    const container = flashScrollRef.current;
    if (!container || flashDealProducts.length === 0) return;
    const singleSetWidth = container.scrollWidth / 5;
    const itemWidth = singleSetWidth / flashDealProducts.length;
    container.scrollBy({ left: -itemWidth, behavior: 'smooth' });
  };

  const handleScrollFlashRight = () => {
    const container = flashScrollRef.current;
    if (!container || flashDealProducts.length === 0) return;
    const singleSetWidth = container.scrollWidth / 5;
    const itemWidth = singleSetWidth / flashDealProducts.length;
    container.scrollBy({ left: itemWidth, behavior: 'smooth' });
  };

  // Handle continuous loop wrap & active indicator updates on mobile touch scroll
  const handleFlashScroll = () => {
    const container = flashScrollRef.current;
    if (!container || flashDealProducts.length <= 1) return;

    const singleSetWidth = container.scrollWidth / 5;
    if (singleSetWidth > 0) {
      // Seamless wrap: when swiping past set 2 into set 3, reset back to set 2 invisibly
      if (container.scrollLeft >= singleSetWidth * 3) {
        container.scrollLeft -= singleSetWidth;
      } else if (container.scrollLeft <= singleSetWidth * 1) {
        container.scrollLeft += singleSetWidth;
      }

      const itemWidth = singleSetWidth / flashDealProducts.length;
      if (itemWidth > 0) {
        const offsetInSet = ((container.scrollLeft % singleSetWidth) + singleSetWidth) % singleSetWidth;
        const currentIdx = Math.round(offsetInSet / itemWidth) % flashDealProducts.length;
        setFlashActiveIndex(currentIdx);
      }
    }
  };

  // Initial scroll position in center set (Set 2) for endless scroll in both directions
  useEffect(() => {
    const container = flashScrollRef.current;
    if (!container || flashDealProducts.length <= 1) return;

    const initTimer = setTimeout(() => {
      if (!container) return;
      const singleSetWidth = container.scrollWidth / 5;
      if (singleSetWidth > 0) {
        container.scrollLeft = singleSetWidth * 2;
      }
    }, 100);

    return () => clearTimeout(initTimer);
  }, [flashDealProducts]);

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
          onForceSync={handleManualSyncCatalog}
          isUpdating={isUpdating}
        />

        {/* Real-time synchronization toast */}
        {syncToastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center shadow-md animate-in fade-in flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{syncToastMsg}</span>
          </div>
        )}

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
          isAdmin={isAdminUnlocked}
          enabledCategories={enabledCategories}
          onLockedCategoryClick={handleLockedCategoryClick}
        />
      </div>

      <main className="flex-1">
        {/* Banner with Slogan, Verificar PWA button, Orange 50% OFF Card, and Navy Ofertas Flash Countdown */}
        {!searchQuery && selectedCategory === 'Todo' && (
          <PromoHeroBanner onVerifyPWA={handleVerifyPWA} />
        )}

        {/* Catalog Section */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          {/* Section: Ofertas Flash Horizontal Carousel (When on Todo / Home view without active text search) */}
          {!searchQuery && selectedCategory === 'Todo' && selectedSubCategory === 'Todas' && flashDealProducts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-[#0B2545] dark:text-white">
                  <Zap className="w-5 h-5 text-[#FF6B35] fill-[#FF6B35]" />
                  <span>Ofertas Flash</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FF6B35] ml-1">
                    {flashDealProducts.length} productos
                  </span>
                </div>

                {/* Horizontal scroll controls (Cyclic) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleScrollFlashLeft}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    title="Desplazar a la izquierda"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollFlashRight}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    title="Desplazar a la derecha"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flash Deals Horizontal Carousel (Cyclic / Endless Loop) */}
              <div
                ref={flashScrollRef}
                onScroll={handleFlashScroll}
                className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 pt-1 snap-x snap-mandatory no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0"
              >
                {cyclicFlashProducts.map((product, idx) => (
                  <div
                    key={product._cyclicKey}
                    className="w-[170px] sm:w-[210px] md:w-[230px] shrink-0 snap-start flex flex-col"
                  >
                    <ProductCard
                      product={product}
                      index={idx % flashDealProducts.length}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetail={setDetailProduct}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onDirectWhatsApp={(p) => handleDirectWhatsApp(p, 1)}
                    />
                  </div>
                ))}
              </div>

              {/* Cyclic pagination dot indicators */}
              {flashDealProducts.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {flashDealProducts.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const container = flashScrollRef.current;
                        if (!container) return;
                        const singleSetWidth = container.scrollWidth / 5;
                        const itemWidth = singleSetWidth / flashDealProducts.length;
                        container.scrollTo({ left: singleSetWidth * 2 + i * itemWidth, behavior: 'smooth' });
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        flashActiveIndex === i
                          ? 'w-6 bg-[#FF6B35]'
                          : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      aria-label={`Ver oferta ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Main Products Grid */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5 px-0.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">
                <span>
                  {selectedCategory === 'Todo' ? 'Todos los Productos' : selectedCategory}
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
      <Footer onOpenAdmin={handleOpenAdmin} logoUrl={storeLogo} onForceSync={handleManualSyncCatalog} />

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
        onForceSync={handleManualSyncCatalog}
        isUpdating={isUpdating}
        onRecoverCustomProducts={handleRecoverCustomProducts}
        enabledCategories={enabledCategories}
        onToggleCategory={handleToggleCategory}
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
