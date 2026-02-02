/**
 * React Hooks for Settings
 * 
 * Provides reactive settings that update the UI when changed
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  getCurrency,
  setCurrency as saveCurrency,
  getTheme,
  setTheme as saveTheme,
  getNotificationsEnabled,
  setNotificationsEnabled as saveNotificationsEnabled,
  getBiometricEnabled,
  setBiometricEnabled as saveBiometricEnabled,
  getOnboardingCompleted,
  setOnboardingCompleted as saveOnboardingCompleted,
  getDefaultTransactionType,
  setDefaultTransactionType as saveDefaultTransactionType,
  getWeekStartDay,
  setWeekStartDay as saveWeekStartDay,
  getAllSettings,
  resetAllSettings,
  CURRENCY_INFO,
  CurrencyCode,
  ThemeMode,
  WeekStartDay,
  AppSettings,
} from '@/database';

// ============================================
// CURRENCY HOOK
// ============================================

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrency().then((value) => {
      setCurrencyState(value);
      setIsLoading(false);
    });
  }, []);

  const setCurrency = useCallback(async (newCurrency: CurrencyCode) => {
    await saveCurrency(newCurrency);
    setCurrencyState(newCurrency);
  }, []);

  const currencyInfo = useMemo(() => CURRENCY_INFO[currency], [currency]);

  const formatAmount = useCallback(
    (amount: number) => {
      return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    },
    [currencyInfo.symbol]
  );

  return {
    currency,
    setCurrency,
    currencyInfo,
    formatAmount,
    isLoading,
  };
}

// ============================================
// THEME HOOK
// ============================================

export function useThemeSetting() {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTheme().then((value) => {
      setThemeState(value);
      setIsLoading(false);
    });
  }, []);

  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    await saveTheme(newTheme);
    setThemeState(newTheme);
  }, []);

  return {
    theme,
    setTheme,
    isLoading,
  };
}

// ============================================
// NOTIFICATIONS HOOK
// ============================================

export function useNotifications() {
  const [enabled, setEnabledState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getNotificationsEnabled().then((value) => {
      setEnabledState(value);
      setIsLoading(false);
    });
  }, []);

  const setEnabled = useCallback(async (value: boolean) => {
    await saveNotificationsEnabled(value);
    setEnabledState(value);
  }, []);

  return {
    enabled,
    setEnabled,
    isLoading,
  };
}

// ============================================
// BIOMETRIC HOOK
// ============================================

export function useBiometric() {
  const [enabled, setEnabledState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBiometricEnabled().then((value) => {
      setEnabledState(value);
      setIsLoading(false);
    });
  }, []);

  const setEnabled = useCallback(async (value: boolean) => {
    await saveBiometricEnabled(value);
    setEnabledState(value);
  }, []);

  return {
    enabled,
    setEnabled,
    isLoading,
  };
}

// ============================================
// ONBOARDING HOOK
// ============================================

export function useOnboarding() {
  const [completed, setCompletedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingCompleted().then((value) => {
      setCompletedState(value);
      setIsLoading(false);
    });
  }, []);

  const setCompleted = useCallback(async (value: boolean) => {
    await saveOnboardingCompleted(value);
    setCompletedState(value);
  }, []);

  return {
    completed,
    setCompleted,
    isLoading,
  };
}

// ============================================
// DEFAULT TRANSACTION TYPE HOOK
// ============================================

export function useDefaultTransactionType() {
  const [type, setTypeState] = useState<'income' | 'expense'>('expense');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDefaultTransactionType().then((value) => {
      setTypeState(value);
      setIsLoading(false);
    });
  }, []);

  const setType = useCallback(async (value: 'income' | 'expense') => {
    await saveDefaultTransactionType(value);
    setTypeState(value);
  }, []);

  return {
    type,
    setType,
    isLoading,
  };
}

// ============================================
// WEEK START DAY HOOK
// ============================================

export function useWeekStartDay() {
  const [day, setDayState] = useState<WeekStartDay>(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getWeekStartDay().then((value) => {
      setDayState(value);
      setIsLoading(false);
    });
  }, []);

  const setDay = useCallback(async (value: WeekStartDay) => {
    await saveWeekStartDay(value);
    setDayState(value);
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    day,
    setDay,
    dayName: dayNames[day],
    isLoading,
  };
}

// ============================================
// ALL SETTINGS HOOK
// ============================================

export function useAllSettings() {
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const allSettings = await getAllSettings();
    setSettingsState(allSettings);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const reset = useCallback(async () => {
    await resetAllSettings();
    await refresh();
  }, [refresh]);

  return {
    settings,
    refresh,
    reset,
    isLoading,
  };
}
