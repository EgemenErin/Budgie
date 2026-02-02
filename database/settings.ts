/**
 * AsyncStorage Settings Store for Budgie
 * 
 * Key-value storage for app settings and preferences
 * Compatible with Expo Go (for development builds, consider react-native-mmkv for better performance)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// SETTING KEYS
// ============================================

const KEYS = {
  CURRENCY: 'settings.currency',
  THEME: 'settings.theme',
  NOTIFICATIONS_ENABLED: 'settings.notificationsEnabled',
  DAILY_REMINDER_TIME: 'settings.dailyReminderTime',
  BIOMETRIC_ENABLED: 'settings.biometricEnabled',
  ONBOARDING_COMPLETED: 'settings.onboardingCompleted',
  LAST_SYNC_TIME: 'settings.lastSyncTime',
  DEFAULT_TRANSACTION_TYPE: 'settings.defaultTransactionType',
  WEEK_START_DAY: 'settings.weekStartDay',
} as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'TRY' | 'INR' | 'BRL' | 'CAD' | 'AUD';
export type ThemeMode = 'light' | 'dark' | 'system';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export interface AppSettings {
  currency: CurrencyCode;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  dailyReminderTime: string | null; // HH:MM format
  biometricEnabled: boolean;
  onboardingCompleted: boolean;
  lastSyncTime: number | null;
  defaultTransactionType: 'income' | 'expense';
  weekStartDay: WeekStartDay;
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULTS: AppSettings = {
  currency: 'USD',
  theme: 'system',
  notificationsEnabled: true,
  dailyReminderTime: null,
  biometricEnabled: false,
  onboardingCompleted: false,
  lastSyncTime: null,
  defaultTransactionType: 'expense',
  weekStartDay: 1, // Monday
};

// ============================================
// CURRENCY SETTINGS
// ============================================

export async function getCurrency(): Promise<CurrencyCode> {
  const value = await AsyncStorage.getItem(KEYS.CURRENCY);
  return (value as CurrencyCode) ?? DEFAULTS.currency;
}

export async function setCurrency(currency: CurrencyCode): Promise<void> {
  await AsyncStorage.setItem(KEYS.CURRENCY, currency);
}

// Currency display info
export const CURRENCY_INFO: Record<CurrencyCode, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  TRY: { symbol: '₺', name: 'Turkish Lira' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
};

// ============================================
// THEME SETTINGS
// ============================================

export async function getTheme(): Promise<ThemeMode> {
  const value = await AsyncStorage.getItem(KEYS.THEME);
  return (value as ThemeMode) ?? DEFAULTS.theme;
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.THEME, theme);
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================

export async function getNotificationsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED);
  return value !== null ? value === 'true' : DEFAULTS.notificationsEnabled;
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, String(enabled));
}

export async function getDailyReminderTime(): Promise<string | null> {
  const value = await AsyncStorage.getItem(KEYS.DAILY_REMINDER_TIME);
  return value ?? DEFAULTS.dailyReminderTime;
}

export async function setDailyReminderTime(time: string | null): Promise<void> {
  if (time === null) {
    await AsyncStorage.removeItem(KEYS.DAILY_REMINDER_TIME);
  } else {
    await AsyncStorage.setItem(KEYS.DAILY_REMINDER_TIME, time);
  }
}

// ============================================
// SECURITY SETTINGS
// ============================================

export async function getBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
  return value !== null ? value === 'true' : DEFAULTS.biometricEnabled;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, String(enabled));
}

// ============================================
// APP STATE SETTINGS
// ============================================

export async function getOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
  return value !== null ? value === 'true' : DEFAULTS.onboardingCompleted;
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, String(completed));
}

export async function getLastSyncTime(): Promise<number | null> {
  const value = await AsyncStorage.getItem(KEYS.LAST_SYNC_TIME);
  return value !== null ? Number(value) : DEFAULTS.lastSyncTime;
}

export async function setLastSyncTime(time: number | null): Promise<void> {
  if (time === null) {
    await AsyncStorage.removeItem(KEYS.LAST_SYNC_TIME);
  } else {
    await AsyncStorage.setItem(KEYS.LAST_SYNC_TIME, String(time));
  }
}

// ============================================
// TRANSACTION DEFAULTS
// ============================================

export async function getDefaultTransactionType(): Promise<'income' | 'expense'> {
  const value = await AsyncStorage.getItem(KEYS.DEFAULT_TRANSACTION_TYPE);
  return (value as 'income' | 'expense') ?? DEFAULTS.defaultTransactionType;
}

export async function setDefaultTransactionType(type: 'income' | 'expense'): Promise<void> {
  await AsyncStorage.setItem(KEYS.DEFAULT_TRANSACTION_TYPE, type);
}

export async function getWeekStartDay(): Promise<WeekStartDay> {
  const value = await AsyncStorage.getItem(KEYS.WEEK_START_DAY);
  return value !== null ? (Number(value) as WeekStartDay) : DEFAULTS.weekStartDay;
}

export async function setWeekStartDay(day: WeekStartDay): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEK_START_DAY, String(day));
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Get all settings as an object
 */
export async function getAllSettings(): Promise<AppSettings> {
  const [
    currency,
    theme,
    notificationsEnabled,
    dailyReminderTime,
    biometricEnabled,
    onboardingCompleted,
    lastSyncTime,
    defaultTransactionType,
    weekStartDay,
  ] = await Promise.all([
    getCurrency(),
    getTheme(),
    getNotificationsEnabled(),
    getDailyReminderTime(),
    getBiometricEnabled(),
    getOnboardingCompleted(),
    getLastSyncTime(),
    getDefaultTransactionType(),
    getWeekStartDay(),
  ]);

  return {
    currency,
    theme,
    notificationsEnabled,
    dailyReminderTime,
    biometricEnabled,
    onboardingCompleted,
    lastSyncTime,
    defaultTransactionType,
    weekStartDay,
  };
}

/**
 * Reset all settings to defaults
 */
export async function resetAllSettings(): Promise<void> {
  const keys = Object.values(KEYS);
  await AsyncStorage.multiRemove(keys);
  console.log('[Settings] All settings reset to defaults');
}

/**
 * Check if this is the first app launch
 */
export async function isFirstLaunch(): Promise<boolean> {
  return !(await getOnboardingCompleted());
}
