import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import {
  X,
  Save,
  RotateCcw,
  Plus,
  Search,
  Edit3,
  Check,
  Image as ImageIcon,
  DollarSign,
  Upload,
  Sparkles,
  Package,
  Shield,
  Key,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Send,
  Smartphone,
  LogOut,
  ArrowLeft,
  Copy,
  HelpCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { CoralinkLogo } from './CoralinkLogo';
import { EditProductModal } from './EditProductModal';
import {
  verifyAdminPassword,
  setAdminPassword,
  getRecoveryEmail,
  setRecoveryEmail,
  getRecoveryPhone,
  setRecoveryPhone,
} from '../utils/adminSecurity';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProducts: (updated: Product[]) => void;
  onResetToDefaults: () => void;
  isAdminUnlocked: boolean;
  onUnlockAdmin: () => void;
  onLockAdmin?: () => void;
  logoUrl?: string;
  onUpdateLogo?: (newLogoUrl: string) => void;
  onResetLogo?: () => void;
  onForceSync?: () => void;
  isUpdating?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProducts,
  onResetToDefaults,
  isAdminUnlocked,
  onUnlockAdmin,
  onLockAdmin,
  logoUrl = '/LG1.png',
  onUpdateLogo,
  onResetLogo,
  onForceSync,
  isUpdating = false,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'logo' | 'security'>('products');
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedMainCat, setSelectedMainCat] = useState<string>('Todas');
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);

  const handleSaveEditedProduct = (updatedProduct: Product) => {
    const updated = localProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setLocalProducts(updated);
    onSaveProducts(updated);
    setSelectedProductToEdit(null);
  };

  // Password / Login Lock Screen State
  const [lockMode, setLockMode] = useState<'login' | 'recovery'>('login');
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Recovery State
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone'>('email');
  const [recoveryStep, setRecoveryStep] = useState<'select' | 'code' | 'new_password'>('select');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Security Tab Settings State (when unlocked)
  const [currentPass, setCurrentPass] = useState('');
  const [newPassTab, setNewPassTab] = useState('');
  const [confirmPassTab, setConfirmPassTab] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState(false);

  const [savedEmail, setSavedEmail] = useState(getRecoveryEmail());
  const [savedPhone, setSavedPhone] = useState(getRecoveryPhone());
  const [savedContactsSuccess, setSavedContactsSuccess] = useState(false);

  // Products and Logo state
  const [saveToast, setSaveToast] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);
  const [logoSaveToast, setLogoSaveToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [copiedJson, setCopiedJson] = useState(false);

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localProducts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `coralink_productos_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCodeJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(localProducts, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // New product initial state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '',
    mainCategory: 'Personalizados',
    subCategory: 'Fotoregalos',
    price: 200,
    originalPrice: 250,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
    description: 'Producto artesanal caribeño de alta calidad personalizado en Nicaragua.',
    rating: 5.0,
    reviewsCount: 12,
    salesCount: 30,
    inStock: true,
  });

  // Sync state
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    setLocalLogoUrl(logoUrl);
  }, [logoUrl]);

  // When modal is reopened, reset lock form
  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setPinError(false);
      setLockMode('login');
      setRecoveryStep('select');
      setGeneratedOtp(null);
      setOtpInput('');
      setOtpError(null);
      setPassError(null);
      setChangePassError(null);
      setChangePassSuccess(false);
      setSavedContactsSuccess(false);
      setSavedEmail(getRecoveryEmail());
      setSavedPhone(getRecoveryPhone());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(pinInput)) {
      onUnlockAdmin();
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleSendRecoveryCode = () => {
    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setRecoveryStep('code');
    setOtpInput('');
    setOtpError(null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      setRecoveryStep('new_password');
      setOtpError(null);
    } else {
      setOtpError('Código de verificación incorrecto. Inténtalo de nuevo.');
    }
  };

  const handleSaveNewPasswordFromRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassInput.length < 4) {
      setPassError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }

    setAdminPassword(newPassInput);
    setPassError(null);
    setRecoverySuccess(true);
    setTimeout(() => {
      onUnlockAdmin();
      setLockMode('login');
      setRecoveryStep('select');
      setRecoverySuccess(false);
    }, 1200);
  };

  const handleChangePasswordInTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyAdminPassword(currentPass)) {
      setChangePassError('La contraseña actual es incorrecta.');
      return;
    }
    if (newPassTab.length < 4) {
      setChangePassError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassTab !== confirmPassTab) {
      setChangePassError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setAdminPassword(newPassTab);
    setChangePassError(null);
    setChangePassSuccess(true);
    setCurrentPass('');
    setNewPassTab('');
    setConfirmPassTab('');
    setTimeout(() => setChangePassSuccess(false), 3000);
  };

  const handleSaveContacts = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryEmail(savedEmail);
    setRecoveryPhone(savedPhone);
    setSavedContactsSuccess(true);
    setTimeout(() => setSavedContactsSuccess(false), 3000);
  };

  const handleLogout = () => {
    if (onLockAdmin) {
      onLockAdmin();
    }
    setPinInput('');
    setPinError(false);
    setLockMode('login');
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    const updated = localProducts.map((p) =>
      p.id === id ? { ...p, price: Math.max(0, newPrice) } : p
    );
    setLocalProducts(updated);
  };

  const handleUpdateImage = (id: string, newImg: string) => {
    const updated = localProducts.map((p) =>
      p.id === id ? { ...p, image: newImg } : p
    );
    setLocalProducts(updated);
  };

  const handleSaveAll = () => {
    onSaveProducts(localProducts);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleSaveLogo = () => {
    if (onUpdateLogo) {
      onUpdateLogo(localLogoUrl);
      setLogoSaveToast(true);
      setTimeout(() => setLogoSaveToast(false), 2500);
    }
  };

  const handleResetToOriginalLogo = () => {
    setLocalLogoUrl('/LG1.png');
    if (onResetLogo) {
      onResetLogo();
      setLogoSaveToast(true);
      setTimeout(() => setLogoSaveToast(false), 2500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLocalLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title) return;

    const created: Product = {
      id: `custom-${Date.now()}`,
      title: newProduct.title || 'Nuevo Producto Coralink',
      mainCategory: (newProduct.mainCategory as any) || 'Personalizados',
      subCategory: newProduct.subCategory || 'Fotoregalos',
      price: Number(newProduct.price) || 150,
      originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price) + 50,
      image: newProduct.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
      description: newProduct.description || 'Detalle exclusivo hecho a mano en Corn Island.',
      rating: 5.0,
      reviewsCount: 1,
      salesCount: 1,
      inStock: true,
      featured: true,
    };

    const updated = [created, ...localProducts];
    setLocalProducts(updated);
    onSaveProducts(updated);
    setShowAddForm(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const filteredProducts = localProducts.filter((p) => {
    const matchesQuery = p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCat = selectedMainCat === 'Todas' || p.mainCategory === selectedMainCat;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 sm:px-6 bg-[#0B2545] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <CoralinkLogo src={logoUrl} size="fill" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Panel de Administración</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B35] text-white font-bold">
                  Coralink
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Gestión de catálogo, precios en Córdobas (C$), logotipo y seguridad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" /> ¡Guardado!
              </span>
            )}
            {isAdminUnlocked && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pin Guard / Lock Screen if not unlocked */}
        {!isAdminUnlocked ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            {lockMode === 'login' ? (
              /* LOGIN VIEW */
              <div className="max-w-md w-full bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0B2545]/10 dark:bg-white/10 text-[#0B2545] dark:text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  <Lock className="w-7 h-7 text-[#0B2545] dark:text-[#1BA7D9]" />
                </div>
                <h3 className="text-xl font-black text-[#0B2545] dark:text-white">Acceso al Panel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                  Ingresa tu contraseña de administración. Por seguridad, la sesión se cierra automáticamente al salir o cerrar la pestaña.
                </p>

                <form onSubmit={handleUnlock} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Contraseña de administrador"
                      className="w-full text-center tracking-widest text-sm py-3 px-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:ring-2 focus:ring-[#1BA7D9]/20 focus:outline-none transition-all font-semibold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {pinError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 animate-in shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Contraseña incorrecta. Inténtalo de nuevo o recupérala abajo.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-black text-xs hover:bg-[#144272] dark:hover:bg-[#158db9] shadow-md shadow-[#0B2545]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Desbloquear Panel</span>
                  </button>
                </form>

                {onForceSync && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={onForceSync}
                      disabled={isUpdating}
                      className="w-full py-2.5 px-3 rounded-2xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 text-xs font-bold hover:bg-sky-100 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                      <span>{isUpdating ? 'Sincronizando...' : '🔄 Sincronizar y Refrescar Fotos en este Teléfono'}</span>
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLockMode('recovery');
                      setRecoveryStep('select');
                      setGeneratedOtp(null);
                      setOtpError(null);
                    }}
                    className="text-xs font-bold text-[#1BA7D9] hover:text-[#0B2545] dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>¿Olvidaste tu contraseña? Recuperar acceso</span>
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Contraseña predeterminada inicial: <code className="font-mono font-bold bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">coral</code>
                  </span>
                </div>
              </div>
            ) : (
              /* RECOVERY VIEW */
              <div className="max-w-md w-full bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setLockMode('login');
                    setRecoveryStep('select');
                  }}
                  className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a iniciar sesión</span>
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2 font-bold">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#0B2545] dark:text-white">Recuperación de Contraseña</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Restablece tu acceso mediante verificación por correo o teléfono
                  </p>
                </div>

                {/* STEP 1: SELECT METHOD */}
                {recoveryStep === 'select' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Selecciona el método de verificación:
                      </span>

                      {/* Option: Email */}
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod('email')}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          recoveryMethod === 'email'
                            ? 'border-[#1BA7D9] bg-[#1BA7D9]/10 ring-2 ring-[#1BA7D9]/30'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 dark:text-white">
                            Enviar a Correo Electrónico
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {getRecoveryEmail()}
                          </div>
                        </div>
                      </button>

                      {/* Option: Phone / WhatsApp */}
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod('phone')}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          recoveryMethod === 'phone'
                            ? 'border-[#1BA7D9] bg-[#1BA7D9]/10 ring-2 ring-[#1BA7D9]/30'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 dark:text-white">
                            Enviar a Teléfono / WhatsApp
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {getRecoveryPhone()}
                          </div>
                        </div>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendRecoveryCode}
                      className="w-full py-3 rounded-2xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-black text-xs hover:bg-[#144272] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Código de 6 Dígitos</span>
                    </button>
                  </div>
                )}

                {/* STEP 2: ENTER CODE */}
                {recoveryStep === 'code' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Simulated Delivery Banner with the generated code */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Código enviado exitosamente</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {recoveryMethod === 'email'
                          ? `Hemos enviado el código de verificación a ${getRecoveryEmail()}`
                          : `Hemos generado el código para ${getRecoveryPhone()}`}
                      </p>
                      
                      {/* Quick Code Display for Instant Testing */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Código de verificación:</span>
                          <span className="font-mono text-base font-black tracking-widest text-[#0B2545] dark:text-[#1BA7D9]">
                            {generatedOtp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (generatedOtp) {
                                navigator.clipboard?.writeText(generatedOtp);
                                setCopiedOtp(true);
                                setOtpInput(generatedOtp);
                                setTimeout(() => setCopiedOtp(false), 2000);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedOtp ? '¡Copiado!' : 'Rellenar'}</span>
                          </button>
                        </div>
                      </div>

                      {recoveryMethod === 'phone' && (
                        <a
                          href={`https://wa.me/${getRecoveryPhone().replace(/[^0-9]/g, '')}?text=Hola,%20mi%20c%C3%B3digo%20de%20recuperaci%C3%B3n%20para%20Coralink%20es:%20${generatedOtp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline pt-1"
                        >
                          <span>📲 Abrir mensaje en WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-left">
                        Ingresa el código de 6 dígitos:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                          setOtpError(null);
                        }}
                        placeholder="000000"
                        className="w-full text-center tracking-[0.3em] font-mono font-black text-lg py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {otpError && (
                      <p className="text-xs text-rose-500 font-semibold">{otpError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRecoveryStep('select')}
                        className="flex-1 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cambiar método
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-2xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-black text-xs hover:bg-[#144272] transition-colors cursor-pointer"
                      >
                        Verificar Código
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: SET NEW PASSWORD */}
                {recoveryStep === 'new_password' && (
                  <form onSubmit={handleSaveNewPasswordFromRecovery} className="space-y-4">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 text-left flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Identidad confirmada. Define tu nueva contraseña de administración:</span>
                    </div>

                    <div className="space-y-3 text-left">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Nueva Contraseña:
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={newPassInput}
                            onChange={(e) => setNewPassInput(e.target.value)}
                            placeholder="Mínimo 4 caracteres"
                            className="w-full text-xs py-2.5 pl-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:outline-none font-semibold"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Confirmar Nueva Contraseña:
                        </label>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={confirmPassInput}
                          onChange={(e) => setConfirmPassInput(e.target.value)}
                          placeholder="Repite la nueva contraseña"
                          className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:outline-none font-semibold"
                        />
                      </div>
                    </div>

                    {passError && (
                      <p className="text-xs text-rose-500 font-semibold">{passError}</p>
                    )}

                    {recoverySuccess && (
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
                        <Check className="w-4 h-4" />
                        <span>¡Contraseña actualizada con éxito! Entrando al panel...</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={recoverySuccess}
                      className="w-full py-3 rounded-2xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white font-black text-xs hover:bg-[#144272] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Contraseña y Desbloquear</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MAIN ADMIN INTERFACE (UNLOCKED) */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
            {/* Top Navigation Tabs: Productos vs Logotipo vs Seguridad */}
            <div className="px-4 pt-3 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#0B2545] dark:bg-[#1BA7D9] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Productos y Precios ({localProducts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('logo')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'logo'
                      ? 'bg-[#0B2545] dark:bg-[#1BA7D9] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Logotipo de la Tienda</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-[#0B2545] dark:bg-[#1BA7D9] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Seguridad y Contraseña</span>
                </button>
              </div>

              {/* Action buttons on the right */}
              {activeTab === 'products' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {onForceSync && (
                    <button
                      onClick={onForceSync}
                      disabled={isUpdating}
                      className="px-2.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Refrescar caché del teléfono y forzar sincronización"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Sincronizar Teléfono</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportJson}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Descargar copia de seguridad en archivo .json"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Exportar JSON</span>
                  </button>

                  <button
                    onClick={handleCopyCodeJson}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copiar código JSON para subirlo a GitHub"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="hidden sm:inline">{copiedJson ? '¡Copiado!' : 'Copiar JSON'}</span>
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddForm ? 'Cerrar' : 'Nuevo'}</span>
                  </button>

                  <button
                    onClick={handleSaveAll}
                    className="px-3 py-1.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white text-xs font-black flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Todo</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas restablecer todos los productos a los valores y precios iniciales?')) {
                        onResetToDefaults();
                      }
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                    title="Restablecer valores de fábrica"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: SEGURIDAD Y CONTRASEÑA */}
            {activeTab === 'security' ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Card 1: Cambiar Contraseña */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-base font-black text-[#0B2545] dark:text-white">
                        <Key className="w-5 h-5 text-[#FF6B35]" />
                        <span>Cambiar Contraseña de Administrador</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Actualiza la clave con la que ingresas al panel de administración.
                      </p>
                    </div>

                    <form onSubmit={handleChangePasswordInTab} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Contraseña Actual:
                          </label>
                          <input
                            type={showChangePass ? 'text' : 'password'}
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            placeholder="Clave actual"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none font-semibold"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Nueva Contraseña:
                          </label>
                          <input
                            type={showChangePass ? 'text' : 'password'}
                            value={newPassTab}
                            onChange={(e) => setNewPassTab(e.target.value)}
                            placeholder="Nueva clave"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none font-semibold"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Confirmar Nueva:
                          </label>
                          <input
                            type={showChangePass ? 'text' : 'password'}
                            value={confirmPassTab}
                            onChange={(e) => setConfirmPassTab(e.target.value)}
                            placeholder="Repetir clave"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowChangePass(!showChangePass)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                        >
                          {showChangePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showChangePass ? 'Ocultar claves' : 'Mostrar claves'}</span>
                        </button>

                        <div className="flex items-center gap-3">
                          {changePassSuccess && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                              <Check className="w-4 h-4" /> ¡Contraseña actualizada!
                            </span>
                          )}
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#0B2545] dark:bg-[#1BA7D9] text-white text-xs font-bold hover:bg-[#144272] transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Actualizar Contraseña</span>
                          </button>
                        </div>
                      </div>

                      {changePassError && (
                        <p className="text-xs text-rose-500 font-semibold">{changePassError}</p>
                      )}
                    </form>
                  </div>

                  {/* Card 2: Correo y Teléfono de Recuperación */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-base font-black text-[#0B2545] dark:text-white">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <span>Datos de Contacto para Recuperación</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Estos datos se utilizarán para enviarte el código de verificación en caso de olvidar tu contraseña.
                      </p>
                    </div>

                    <form onSubmit={handleSaveContacts} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                            <span>Correo Electrónico de Recuperación:</span>
                          </label>
                          <input
                            type="email"
                            value={savedEmail}
                            onChange={(e) => setSavedEmail(e.target.value)}
                            placeholder="tu-correo@gmail.com"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Teléfono / WhatsApp de Recuperación:</span>
                          </label>
                          <input
                            type="text"
                            value={savedPhone}
                            onChange={(e) => setSavedPhone(e.target.value)}
                            placeholder="+505 8204 5433"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          Recibirás códigos de 6 dígitos cuando solicites recuperar el acceso.
                        </span>

                        <div className="flex items-center gap-3">
                          {savedContactsSuccess && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                              <Check className="w-4 h-4" /> ¡Datos de recuperación guardados!
                            </span>
                          )}
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Guardar Datos de Recuperación</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Card 3: Cierre Automático de Sesión */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-base font-black text-[#0B2545] dark:text-white">
                        <Lock className="w-5 h-5 text-indigo-500" />
                        <span>Política de Cierre Automático</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Protección contra accesos no autorizados en dispositivos compartidos.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          Cierre automático al cerrar la pestaña o el panel (Activo)
                        </h4>
                        <p className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-0.5 leading-relaxed">
                          La sesión de administrador no persiste entre pestañas ni recargas de página. Cada vez que cierres la pestaña o salgas del panel, se te pedirá nuevamente la contraseña para volver a entrar.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión de Administrador Ahora</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'logo' ? (
              /* TAB 2: LOGOTIPO DE LA TIENDA */
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* Title & Description */}
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-base sm:text-lg font-black text-[#0B2545] dark:text-white">
                      <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
                      <span>Gestión Manual del Logotipo</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Aquí puedes cambiar el logotipo de Coralink de forma manual subiendo una imagen desde tu dispositivo o ingresando un enlace directo (URL). Por defecto se mantiene el logotipo original enviado.
                    </p>
                  </div>

                  {/* Previews Grid */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Vista previa en tiempo real:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Preview in Header Style (Navy Box) */}
                      <div className="p-4 rounded-2xl bg-[#0B2545] text-white flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                          <CoralinkLogo src={localLogoUrl} size="fill" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Vista en Cabecera</div>
                          <div className="text-[10px] text-slate-300">Fondo azul marino con recuadro blanco</div>
                        </div>
                      </div>

                      {/* Preview in Large Card Style (White / Light Box) */}
                      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-slate-200">
                          <CoralinkLogo src={localLogoUrl} size="fill" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">Vista en Detalle / Footer</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Escalado nítido con proporciones exactas</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Input: URL or File Upload */}
                  <div className="space-y-4 pt-2">
                    {/* Option 1: Upload Image File */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        1. Subir imagen desde tu computadora o teléfono:
                      </label>
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
                        className="px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1BA7D9] dark:hover:border-[#1BA7D9] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer w-full justify-center"
                      >
                        <Upload className="w-4 h-4 text-[#1BA7D9]" />
                        <span>Seleccionar archivo de imagen (PNG, JPG, SVG, WebP)</span>
                      </button>
                    </div>

                    {/* Option 2: Enter URL */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        2. O ingresar URL directa de la imagen:
                      </label>
                      <input
                        type="text"
                        value={localLogoUrl}
                        onChange={(e) => setLocalLogoUrl(e.target.value)}
                        placeholder="Ej. https://miservidor.com/mi-logo.png o /LG1.png"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:ring-1 focus:ring-[#1BA7D9] outline-none"
                      />
                    </div>
                  </div>

                  {/* Save & Reset Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResetToOriginalLogo}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restablecer al Logotipo Original</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {logoSaveToast && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-4 h-4" /> ¡Logotipo guardado exitosamente!
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveLogo}
                        className="px-5 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#FF6B35]/25 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Logotipo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 3: PRODUCTOS Y PRECIOS */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Dedicated GitHub, Vercel & Phone Sync Card */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 border-b border-sky-200 dark:border-sky-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Sincronización con GitHub, Vercel y Teléfonos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                      Para que los cambios de fotos o precios hechos en tu PC se apliquen en los teléfonos instalados, usa estos botones para copiar o exportar tu catálogo a GitHub, o pulsa «Sincronizar Teléfono» para refrescar el dispositivo actual.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onForceSync && (
                      <button
                        onClick={onForceSync}
                        disabled={isUpdating}
                        className="px-3 py-2 rounded-xl bg-[#1BA7D9] hover:bg-[#158db8] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                        title="Refrescar caché del teléfono y cargar últimas fotos"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                        <span>{isUpdating ? 'Sincronizando...' : '🔄 Sincronizar Teléfono'}</span>
                      </button>
                    )}

                    <button
                      onClick={handleCopyCodeJson}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      title="Copiar JSON de productos al portapapeles para actualizar initialProducts.ts"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                      <span>{copiedJson ? '¡Copiado!' : '📋 Copiar JSON'}</span>
                    </button>

                    <button
                      onClick={handleExportJson}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      title="Descargar copia de seguridad en archivo .json"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>💾 Exportar JSON</span>
                    </button>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Buscar producto para editar..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-[#1BA7D9] focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    <select
                      value={selectedMainCat}
                      onChange={(e) => setSelectedMainCat(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-[#1BA7D9] focus:outline-none"
                    >
                      <option value="Todas">Todas las Categorías</option>
                      <option value="Personalizados">Personalizados</option>
                      <option value="Papelería creativa">Papelería creativa</option>
                      <option value="Detalles en resina">Detalles en resina</option>
                    </select>
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Mostrando <b>{filteredProducts.length}</b> de <b>{localProducts.length}</b> productos
                  </span>
                </div>

                {/* Form to Add New Product (Toggleable) */}
                {showAddForm && (
                  <form
                    onSubmit={handleAddNewProduct}
                    className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 grid grid-cols-1 sm:grid-cols-4 gap-3 shrink-0 animate-in slide-in-from-top-2"
                  >
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="Ej: Taza Mágica Edición Corn Island"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Categoría Principal
                      </label>
                      <select
                        value={newProduct.mainCategory}
                        onChange={(e) => setNewProduct({ ...newProduct, mainCategory: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        <option value="Personalizados">Personalizados</option>
                        <option value="Papelería creativa">Papelería creativa</option>
                        <option value="Detalles en resina">Detalles en resina</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Subcategoría
                      </label>
                      <input
                        type="text"
                        value={newProduct.subCategory}
                        onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                        placeholder="Ej: Cerámica, Térmicos"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Precio en Córdobas (C$) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Precio Original / Antes (C$)
                      </label>
                      <input
                        type="number"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, originalPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        URL de la Imagen
                      </label>
                      <input
                        type="text"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-4 flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                      >
                        Guardar y Agregar Producto
                      </button>
                    </div>
                  </form>
                )}

                {/* Products Grid List */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col gap-2.5 group hover:border-[#1BA7D9]/40 transition-colors"
                      >
                        <div className="flex gap-3 items-center">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 dark:border-slate-800 relative">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate">
                                {product.mainCategory} • {product.subCategory}
                              </span>
                              <span className="text-[10px] text-slate-400">ID: {product.id}</span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate" title={product.title}>
                              {product.title}
                            </h4>

                            <div className="flex items-center justify-between text-xs pt-0.5">
                              <span className="text-xs font-black text-[#FF6B35]">
                                C$ {product.price.toLocaleString('es-NI')}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  C$ {product.originalPrice.toLocaleString('es-NI')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Modificar Button in Admin Panel */}
                        <button
                          type="button"
                          onClick={() => setSelectedProductToEdit(product)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          title="Modificar descripción, cargar imagen, cambiar precio y categoría"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Modificar Producto</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dedicated Product Edit Modal triggered from Admin Panel */}
        <EditProductModal
          isOpen={!!selectedProductToEdit}
          product={selectedProductToEdit}
          onClose={() => setSelectedProductToEdit(null)}
          onSaveProduct={handleSaveEditedProduct}
          isAdminUnlocked={true}
        />
      </div>
    </div>
  );
};
