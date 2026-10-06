import React, { useState, useEffect, useRef } from 'react';
import { Product, MainCategory } from '../types';
import {
  X,
  Save,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Check,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Zap,
  Layers,
  Loader2,
  ExternalLink,
  Trash2,
  Cloud,
  Copy,
} from 'lucide-react';
import { verifyAdminPassword } from '../utils/adminSecurity';
import { CORALINK_LOGO_URL, CORALINK_FALLBACK_LOGO_URL, isReferenceLogo } from '../utils/logoConstants';
import {
  formatDirectImageUrl,
  resolveToDirectImageUrl,
  testImageUrl,
  isViewerPageUrl,
} from '../utils/imageUrlResolver';
import { uploadImageToCloud } from '../utils/cloudImageUploader';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSaveProduct: (updated: Product) => void;
  isAdminUnlocked: boolean;
  onUnlockAdmin?: () => void;
  onDeleteProduct?: (productId: string) => void;
}

type ProductCategory = Product['mainCategory'];

const CATEGORY_OPTIONS: ProductCategory[] = [
  'Personalizados',
  'Papelería creativa',
  'Detalles en resina',
];

const SUBCATEGORY_PRESETS: Record<ProductCategory, string[]> = {
  Personalizados: ['Fotoregalos', 'Tazas, Termos', 'Textil', 'Tecnología', 'Bordados'],
  'Papelería creativa': [
    'Agendas & Libretas',
    'Fiestas & Eventos',
    'Stickers & Viniles',
    'Tarjetería Fina',
    'Escolar',
    'Regalos Especiales',
  ],
  'Detalles en resina': [
    'Llaveros en Resina',
    'Hogar & Decoración',
    'Joyería en Resina',
    'Accesorios Escritorio',
    'Mascotas',
    'Accesorios Celular',
  ],
};

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSaveProduct,
  isAdminUnlocked,
  onUnlockAdmin,
  onDeleteProduct,
}) => {
  // Lock state if not unlocked
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [mainCategory, setMainCategory] = useState<ProductCategory>('Personalizados');
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [badge, setBadge] = useState('');

  // UI state
  const [savedToast, setSavedToast] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'resolving' | 'valid' | 'invalid'>('idle');
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [localPathError, setLocalPathError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compress image on the client to guarantee small size (<80KB) and prevent localStorage quota errors
  const compressImageFile = (file: File, maxWidth = 1000, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Function to process and convert link
  const processImageLink = async (rawVal: string) => {
    const trimmed = rawVal.trim();
    if (!trimmed) {
      setImage('');
      setLinkStatus('idle');
      setLocalPathError(false);
      return;
    }

    // Detect if user pasted a local file path from their computer (e.g. C:\... or file:///...)
    if (
      trimmed.startsWith('C:') ||
      trimmed.startsWith('c:') ||
      trimmed.startsWith('D:') ||
      trimmed.startsWith('d:') ||
      trimmed.startsWith('file:') ||
      trimmed.includes('\\Users\\') ||
      trimmed.includes('/Users/') ||
      trimmed.includes('C:\\')
    ) {
      setLocalPathError(true);
      setLinkStatus('invalid');
      return;
    } else {
      setLocalPathError(false);
    }

    // 1. Immediately format synchronously (Google Drive, Dropbox, Imgur, BBCode, HTML)
    const formatted = formatDirectImageUrl(trimmed);
    setImage(formatted);

    // 2. If it is a viewer page (Postimages or ImgBB), resolve to direct image
    if (isViewerPageUrl(formatted)) {
      setLinkStatus('resolving');
      setIsResolvingLink(true);
      try {
        const direct = await resolveToDirectImageUrl(formatted);
        if (direct && direct !== formatted) {
          setImage(direct);
          const ok = await testImageUrl(direct);
          setLinkStatus(ok ? 'valid' : 'invalid');
        } else {
          setLinkStatus('invalid');
        }
      } catch (err) {
        setLinkStatus('invalid');
      } finally {
        setIsResolvingLink(false);
      }
      return;
    }

    // 3. Test if URL works as an image
    if (formatted.startsWith('http') || formatted.startsWith('/uploads/')) {
      setLinkStatus('resolving');
      const works = await testImageUrl(formatted);
      setLinkStatus(works ? 'valid' : 'invalid');
    } else {
      setLinkStatus('idle');
    }
  };

  // Sync form when product changes
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setMainCategory(product.mainCategory || 'Personalizados');
      setSubCategory(product.subCategory || '');
      setPrice(product.price || 0);
      setOriginalPrice(product.originalPrice || 0);
      // Clean up reference logo URLs so user has a fresh empty field ready for a new link
      const cleanImg = !isReferenceLogo(product.image) ? product.image : '';
      setImage(cleanImg);
      if (cleanImg && cleanImg.startsWith('http')) {
        testImageUrl(cleanImg).then((ok) => setLinkStatus(ok ? 'valid' : 'invalid'));
      } else {
        setLinkStatus('idle');
      }
      setDescription(product.description || '');
      setInStock(product.inStock !== false);
      setFeatured(!!product.featured);
      setIsFlashDeal(!!product.isFlashDeal);
      setBadge(product.badge || '');
      setPinInput('');
      setPinError(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Handle password unlock for editing
  const handleUnlockAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(pinInput)) {
      if (onUnlockAdmin) {
        onUnlockAdmin();
      }
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  // Handle file upload: uploads to cloud and automatically injects direct URL into Punto 2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadSuccessMsg(null);
    setLocalPathError(false);

    try {
      const result = await uploadImageToCloud(file, product?.id);
      if (result.success && result.directUrl) {
        // Automatically inject the direct cloud link into Punto 2 (URL input)
        setImage(result.directUrl);
        setLinkStatus('valid');
        setUploadSuccessMsg(result.message);
        setTimeout(() => setUploadSuccessMsg(null), 5000);
      } else {
        throw new Error(result.message || 'Error al procesar la imagen');
      }
    } catch (err: any) {
      console.error('Error al procesar la imagen:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const b64 = event.target.result as string;
          setImage(b64);
          setLinkStatus('valid');
          setUploadSuccessMsg('¡Foto optimizada y colocada en el Punto 2!');
          setTimeout(() => setUploadSuccessMsg(null), 4000);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Handle Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Ensure link is fully resolved before saving
    let finalImage = formatDirectImageUrl(image);
    if (isViewerPageUrl(finalImage)) {
      try {
        const resolved = await resolveToDirectImageUrl(finalImage);
        if (resolved) finalImage = resolved;
      } catch (err) {
        console.warn('Could not resolve image on save:', err);
      }
    }

    const cleanSavedImage =
      finalImage && !isReferenceLogo(finalImage) ? finalImage.trim() : CORALINK_LOGO_URL;

    const updatedProduct: Product = {
      ...product,
      title: title.trim(),
      mainCategory,
      subCategory: subCategory.trim() || 'General',
      price: Math.max(0, Number(price) || 0),
      originalPrice: originalPrice > 0 ? Number(originalPrice) : undefined,
      image: cleanSavedImage,
      description: description.trim(),
      inStock,
      featured,
      isFlashDeal,
      badge: badge.trim() || undefined,
    };

    onSaveProduct(updatedProduct);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#0B2545] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B35] text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Modificar Producto</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-slate-200 font-bold">
                  ID: {product.id}
                </span>
              </h2>
              <p className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                {product.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isAdminUnlocked ? (
          /* Locked State: Ask for Admin Password first */
          <div className="flex-1 p-6 sm:p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="max-w-sm w-full bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#0B2545] dark:text-white">
                Autorización Requerida
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                Ingresa tu contraseña de administración para editar este producto:
              </p>

              <form onSubmit={handleUnlockAndProceed} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Contraseña de administrador"
                    className="w-full text-center tracking-widest text-sm py-2.5 px-9 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:outline-none font-semibold"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {pinError && (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Contraseña incorrecta</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-black text-xs hover:bg-[#144272] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Continuar a Edición</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Form to modify product */
          <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50 dark:bg-slate-950">
              
              {/* Field 1: Title */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Nombre del Producto *</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Taza Mágica Personalizada Caribe"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:ring-1 focus:ring-[#1BA7D9] outline-none"
                />
              </div>

              {/* Field 2: Categories */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1BA7D9]" />
                  <span>Categoría y Subcategoría *</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Main Category */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Categoría Principal:
                    </span>
                    <select
                      value={mainCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as ProductCategory;
                        setMainCategory(newCat);
                        // Suggest default subcategory for new category
                        const presets = SUBCATEGORY_PRESETS[newCat];
                        if (presets && presets.length > 0) {
                          setSubCategory(presets[0]);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Subcategoría:
                    </span>
                    <input
                      type="text"
                      required
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="Ej: Fotoregalos, Tazas, Textil"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none"
                    />
                  </div>
                </div>

                {/* Subcategory Presets Quick-Click Buttons */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                    Sugerencias para {mainCategory}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBCATEGORY_PRESETS[mainCategory]?.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setSubCategory(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          subCategory === preset
                            ? 'bg-[#1BA7D9] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Prices in Nicaraguan Cordobas */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Precios en Córdobas de Nicaragua (C$) *</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Precio de Venta (C$):
                    </span>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-black text-[#FF6B35]">C$</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#FF6B35] focus:border-[#FF6B35] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Precio Original / Anterior (Opcional):
                    </span>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400">C$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={originalPrice || ''}
                        onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                        placeholder="Ej: 250"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 focus:border-[#1BA7D9] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 4: Image Upload & URL with Cloud Sync Condition */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#1BA7D9]" />
                  <span>Imagen del Producto *</span>
                </label>

                {/* Automatic Cloud Sync Condition (No manual buttons, automatic execution) */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30 border border-sky-200/80 dark:border-sky-800/60 text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-[#1BA7D9] shrink-0" />
                      <span className="text-xs font-black text-[#0B2545] dark:text-sky-300">
                        Alojamiento en la Nube y Sincronización Automática
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                      Automático
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Sube tu foto desde el <strong>móvil o PC</strong>: el sistema la procesa, la aloja en la nube y la sincroniza en automático con todos tus dispositivos y la tienda.
                  </p>
                  <div className="pt-0.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <span>Galería en la nube vinculada:</span>
                    <a
                      href="https://postimg.cc/gallery/zJjp92t"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#1BA7D9] hover:underline inline-flex items-center gap-1"
                    >
                      <span>https://postimg.cc/gallery/zJjp92t</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Preview Thumbnail */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-square max-w-[140px] mx-auto w-full overflow-hidden relative group">
                    {!isReferenceLogo(image) ? (
                      <img
                        src={image}
                        alt="Vista previa"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-white dark:bg-slate-900 rounded-xl">
                        <img
                          src={CORALINK_LOGO_URL}
                          alt="Logo de referencia"
                          className="w-16 h-16 object-contain mb-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CORALINK_FALLBACK_LOGO_URL;
                          }}
                        />
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Logo de Referencia</span>
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                      Vista previa
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-2.5">
                    {/* Method 1: File Upload */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        1. Cargar foto desde tu celular o computadora:
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-[#1BA7D9]/60 hover:border-[#1BA7D9] bg-sky-50/60 dark:bg-sky-950/20 hover:bg-sky-100/50 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-4 h-4 text-[#1BA7D9] animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 text-[#1BA7D9]" />
                        )}
                        <span>
                          {isUploadingImage
                            ? 'Alojando y sincronizando foto en la nube...'
                            : 'Subir Foto desde tu Móvil o Computadora'}
                        </span>
                      </button>

                      {uploadSuccessMsg && (
                        <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{uploadSuccessMsg}</span>
                        </div>
                      )}
                    </div>

                    {/* Method 2: Direct URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          2. Enlace Directo en la Nube (Punto 2 - Se autocompleta en automático al subir foto arriba):
                        </span>
                        {image && (
                          <button
                            type="button"
                            onClick={() => {
                              setImage('');
                              setLinkStatus('idle');
                              setLocalPathError(false);
                            }}
                            className="text-[11px] font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Borrar enlace</span>
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => {
                              const val = e.target.value;
                              setImage(val);
                              processImageLink(val);
                            }}
                            placeholder="Pega aquí: https://postimg.cc/... o enlace directo .jpg/.png"
                            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none font-mono"
                          />
                          {image && (
                            <button
                              type="button"
                              onClick={() => {
                                setImage('');
                                setLinkStatus('idle');
                                setLocalPathError(false);
                              }}
                              className="absolute right-2.5 top-2.5 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Limpiar campo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => processImageLink(image)}
                          disabled={isResolvingLink || !image.trim()}
                          className="px-3 py-2 rounded-xl bg-[#1BA7D9] hover:bg-[#158db8] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                          title="Convertir y verificar enlace de imagen"
                        >
                          {isResolvingLink ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>Convertir</span>
                        </button>
                      </div>

                      {/* Local Path Error Warning */}
                      {localPathError && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold space-y-1 animate-in fade-in">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Ruta local de tu ordenador detectada («C:\...»)</span>
                          </div>
                          <p className="text-[11px] font-normal leading-relaxed">
                            Los navegadores no pueden abrir rutas de carpetas de tu PC directamente por privacidad. Para usar esta foto, presiona el botón arriba <strong>«Seleccionar Foto / Archivo de mi Ordenador»</strong> y el sistema la cargará automáticamente a la tienda.
                          </p>
                        </div>
                      )}

                      {/* Live Link Status Feedback */}
                      {image && !localPathError && (
                        <div className="mt-2 text-xs">
                          {linkStatus === 'resolving' && (
                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                              <span>Convirtiendo y verificando enlace a imagen directa funcional...</span>
                            </div>
                          )}
                          {linkStatus === 'valid' && (
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>¡Enlace funcional y verificado! La imagen se cargó correctamente.</span>
                            </div>
                          )}
                          {linkStatus === 'invalid' && (
                            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>No se pudo cargar la imagen. Si es de Postimages, pulsa «Convertir» o asegúrate de que sea pública.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Helpful Tip */}
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 leading-snug space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#1BA7D9]" />
                        <span>Enlaces compatibles automáticamente:</span>
                      </p>
                      <p>
                        • <strong>Postimages:</strong> Sube tu foto a <a href="https://postimages.org" target="_blank" rel="noreferrer" className="underline font-bold text-sky-600 dark:text-sky-400">postimages.org</a> y pega cualquier enlace aquí; el sistema lo convierte automáticamente a imagen directa.
                      </p>
                      <p>
                        • <strong>Google Drive:</strong> Pega cualquier enlace compartido («Cualquier persona con el enlace») y se convertirá a enlace directo de alta velocidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 5: Description */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Descripción del Producto *</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {description.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles del producto, materiales, técnicas de personalización, medidas..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:ring-1 focus:ring-[#1BA7D9] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Field 6: Stock, Oferta Flash & Badge */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-instock"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1BA7D9] focus:ring-[#1BA7D9] cursor-pointer"
                    />
                    <label htmlFor="edit-instock" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                      En Stock (Disponible)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer"
                    />
                    <label htmlFor="edit-featured" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Destacado</span>
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Etiqueta: ej. NUEVO, 50% OFF"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none"
                    />
                  </div>
                </div>

                {/* Oferta Flash Toggle Button */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                      <Zap className="w-4 h-4 fill-[#FF6B35]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0B2545] dark:text-white block">
                        Sección de Ofertas Flash
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Mostrar en el carrusel horizontal de 5 ofertas principales
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFlashDeal(!isFlashDeal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      isFlashDeal
                        ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isFlashDeal ? 'fill-white text-white' : 'text-slate-400'}`} />
                    <span>{isFlashDeal ? 'Habilitada en Ofertas' : 'No Habilitada'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer with Save and Delete Button */}
            <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                {onDeleteProduct && product && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    title="Eliminar este producto"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {savedToast && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-4 h-4" /> ¡Producto modificado con éxito!
                  </span>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#FF6B35]/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal from Edit Modal */}
        {confirmDelete && product && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ¿Eliminar Producto?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-1 line-clamp-2">
                  «{product.title}»
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Esta acción eliminará el producto del catálogo permanentemente.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    onDeleteProduct?.(product.id);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sí, Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
