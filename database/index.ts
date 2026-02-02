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
  // Subscription operations
  addSubscription,
  getSubscriptions,
  deleteSubscription,
  // Settings operations
  getSettings,
  updateSettings,
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
  type Subscription,
  type UserSettings,
  CATEGORY_INFO,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from './schema';
