/**
 * Database Module Index
 * 
 * Exports all database-related functionality
 */

// Database operations
export {
  initDatabase,
  getDatabase,
  closeDatabase,
  // Transaction operations
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  getTransactionSummary,
  getSpendingByCategory,
  // Budget operations
  setBudget,
  getBudgets,
  deleteBudget,
  // Utility functions
  clearAllData,
  getDatabaseStats,
} from './database';

// Schema types
export {
  type Transaction,
  type TransactionInput,
  type TransactionType,
  type TransactionCategory,
  type Budget,
  CATEGORY_INFO,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from './schema';

// Settings
export {
  getCurrency,
  setCurrency,
  getTheme,
  setTheme,
  getNotificationsEnabled,
  setNotificationsEnabled,
  getDailyReminderTime,
  setDailyReminderTime,
  getBiometricEnabled,
  setBiometricEnabled,
  getOnboardingCompleted,
  setOnboardingCompleted,
  getLastSyncTime,
  setLastSyncTime,
  getDefaultTransactionType,
  setDefaultTransactionType,
  getWeekStartDay,
  setWeekStartDay,
  getAllSettings,
  resetAllSettings,
  isFirstLaunch,
  CURRENCY_INFO,
  type CurrencyCode,
  type ThemeMode,
  type WeekStartDay,
  type AppSettings,
} from './settings';
