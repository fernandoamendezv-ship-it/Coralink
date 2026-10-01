// Admin Security Utility for Coralink

const STORAGE_KEYS = {
  PASSWORD: 'coralink_admin_password',
  EMAIL: 'coralink_recovery_email',
  PHONE: 'coralink_recovery_phone',
  AUTO_LOCK: 'coralink_auto_lock_session',
};

const DEFAULT_PASSWORD = 'coral';
const DEFAULT_EMAIL = 'fernando.a.mendez.v@gmail.com';
const DEFAULT_PHONE = '+505 8204 5433';

export const getStoredAdminPassword = (): string => {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    return saved || DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
};

export const verifyAdminPassword = (input: string): boolean => {
  const current = getStoredAdminPassword();
  const trimmed = input.trim();
  // Match current password, or if default is still in use, allow legacy PINs for convenience
  if (trimmed === current) return true;
  if (current === DEFAULT_PASSWORD && (trimmed === '1234' || trimmed === 'admin' || trimmed === 'coral2026')) {
    return true;
  }
  return false;
};

export const setAdminPassword = (newPassword: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword.trim());
  } catch (e) {
    console.error('Failed to save admin password:', e);
  }
};

export const getRecoveryEmail = (): string => {
  if (typeof window === 'undefined') return DEFAULT_EMAIL;
  try {
    return localStorage.getItem(STORAGE_KEYS.EMAIL) || DEFAULT_EMAIL;
  } catch {
    return DEFAULT_EMAIL;
  }
};

export const setRecoveryEmail = (email: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL, email.trim());
  } catch (e) {
    console.error('Failed to save recovery email:', e);
  }
};

export const getRecoveryPhone = (): string => {
  if (typeof window === 'undefined') return DEFAULT_PHONE;
  try {
    return localStorage.getItem(STORAGE_KEYS.PHONE) || DEFAULT_PHONE;
  } catch {
    return DEFAULT_PHONE;
  }
};

export const setRecoveryPhone = (phone: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PHONE, phone.trim());
  } catch (e) {
    console.error('Failed to save recovery phone:', e);
  }
};
