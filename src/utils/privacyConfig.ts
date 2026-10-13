export interface PrivacyLegalConfig {
  businessName: string;
  address: string;
  email: string;
  phone: string;
  hours: string;
  version: string;
  lastUpdated: string;
  applicationName: string;
  deletionResponseHours: string;
  facebookUrl?: string;
}

export const DEFAULT_PRIVACY_CONFIG: PrivacyLegalConfig = {
  businessName: 'Coralink',
  address: 'Corn Island, Región Autónoma de la Costa Caribe Sur (RACCS), República de Nicaragua.',
  email: 'fernando.a.mendez.v@gmail.com',
  phone: '+505 82045433',
  hours: 'Lunes a Sábado, de 8:00 AM a 6:00 PM (Hora estándar de Nicaragua, UTC-6)',
  version: '2.4',
  lastUpdated: 'Octubre de 2026',
  applicationName: 'Coralink – Catálogo y Tienda de Arte & Personalización Caribeña',
  deletionResponseHours: '48 horas hábiles',
  facebookUrl: 'https://facebook.com/coralinkcornisland',
};

const PRIVACY_STORAGE_KEY = 'coralink_privacy_config';

/**
 * Returns current privacy legal configuration from localStorage or defaults.
 */
export function getPrivacyConfig(): PrivacyLegalConfig {
  if (typeof window === 'undefined') return DEFAULT_PRIVACY_CONFIG;
  try {
    const raw = localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PRIVACY_CONFIG,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Error reading privacy config from localStorage:', err);
  }
  return DEFAULT_PRIVACY_CONFIG;
}

/**
 * Saves privacy legal configuration to localStorage and dispatches update event.
 */
export function savePrivacyConfig(config: Partial<PrivacyLegalConfig>): PrivacyLegalConfig {
  const current = getPrivacyConfig();
  const updated: PrivacyLegalConfig = {
    ...current,
    ...config,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('coralink_privacy_updated', { detail: updated }));
    } catch (err) {
      console.warn('Error saving privacy config to localStorage:', err);
    }
  }

  // Also try to persist on backend server
  try {
    fetch('/api/privacy-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  } catch (_) {}

  return updated;
}
