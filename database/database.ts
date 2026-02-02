/**
 * Native SQLite Database Service for Budgie
 * 
 * High-performance local-first storage using expo-sqlite
 * Functions 100% offline with persistent data on the physical device
 */

import * as SQLite from 'expo-sqlite';
import { Transaction, TransactionInput, Budget, Subscription, UserSettings } from './schema';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Initialize the database connection and create tables
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  // Open or create the database
  db = await SQLite.openDatabaseAsync('budgie.db');

  // Enable WAL mode for better performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create transactions table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category TEXT NOT NULL,
      description TEXT,
      timestamp INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Create index on timestamp for faster queries
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp 
    ON transactions (timestamp DESC);
  `);

  // Create index on type for filtering
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_type 
    ON transactions (type);
  `);

  // Create index on category for grouping
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_category 
    ON transactions (category);
  `);

  // Create budgets table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Create subscriptions table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      billingPeriod TEXT NOT NULL CHECK (billingPeriod IN ('weekly', 'monthly', 'yearly')),
      nextBillingDate INTEGER NOT NULL,
      notificationEnabled INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Create settings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY NOT NULL,
      dangerZoneAmount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      theme TEXT NOT NULL DEFAULT 'system',
      notificationsEnabled INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Initialize default settings if not exists
  const settingsCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM settings');
  if (settingsCount && settingsCount.count === 0) {
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO settings (id, dangerZoneAmount, currency, theme, notificationsEnabled, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['default', 100, 'USD', 'system', 1, now, now]
    );
  }

  console.log('[Database] Initialized successfully');
  return db;
}

/**
 * Get the database instance (must call initDatabase first)
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('[Database] Closed');
  }
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

/**
 * Add a new transaction
 */
export async function addTransaction(input: TransactionInput): Promise<Transaction> {
  const database = getDatabase();
  const now = Date.now();
  
  const transaction: Transaction = {
    id: generateUUID(),
    amount: input.amount,
    type: input.type,
    category: input.category,
    description: input.description,
    timestamp: input.timestamp ?? now,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `INSERT INTO transactions (id, amount, type, category, description, timestamp, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.description ?? null,
      transaction.timestamp,
      transaction.createdAt,
      transaction.updatedAt,
    ]
  );

  console.log('[Database] Transaction added:', transaction.id);
  return transaction;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  updates: Partial<TransactionInput>
): Promise<Transaction | null> {
  const database = getDatabase();
  const now = Date.now();

  // Get current transaction
  const current = await getTransactionById(id);
  if (!current) {
    return null;
  }

  const updated: Transaction = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  await database.runAsync(
    `UPDATE transactions 
     SET amount = ?, type = ?, category = ?, description = ?, timestamp = ?, updatedAt = ?
     WHERE id = ?`,
    [
      updated.amount,
      updated.type,
      updated.category,
      updated.description ?? null,
      updated.timestamp,
      updated.updatedAt,
      id,
    ]
  );

  console.log('[Database] Transaction updated:', id);
  return updated;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  const database = getDatabase();
  
  const result = await database.runAsync(
    'DELETE FROM transactions WHERE id = ?',
    [id]
  );

  const deleted = result.changes > 0;
  if (deleted) {
    console.log('[Database] Transaction deleted:', id);
  }
  return deleted;
}

/**
 * Get a transaction by ID
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const database = getDatabase();
  
  const result = await database.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );

  return result ?? null;
}

/**
 * Get all transactions, optionally filtered
 */
export async function getTransactions(options?: {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}): Promise<Transaction[]> {
  const database = getDatabase();
  
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: (string | number)[] = [];

  if (options?.type) {
    query += ' AND type = ?';
    params.push(options.type);
  }

  if (options?.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }

  if (options?.startDate) {
    query += ' AND timestamp >= ?';
    params.push(options.startDate);
  }

  if (options?.endDate) {
    query += ' AND timestamp <= ?';
    params.push(options.endDate);
  }

  query += ' ORDER BY timestamp DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  if (options?.offset) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  const results = await database.getAllAsync<Transaction>(query, params);
  return results;
}

/**
 * Get transaction summary for a date range
 */
export async function getTransactionSummary(
  startDate: number,
  endDate: number
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}> {
  const database = getDatabase();

  const incomeResult = await database.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(amount) as total FROM transactions 
     WHERE type = 'income' AND timestamp >= ? AND timestamp <= ?`,
    [startDate, endDate]
  );

  const expenseResult = await database.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(amount) as total FROM transactions 
     WHERE type = 'expense' AND timestamp >= ? AND timestamp <= ?`,
    [startDate, endDate]
  );

  const countResult = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM transactions 
     WHERE timestamp >= ? AND timestamp <= ?`,
    [startDate, endDate]
  );

  const totalIncome = incomeResult?.total ?? 0;
  const totalExpenses = expenseResult?.total ?? 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: countResult?.count ?? 0,
  };
}

/**
 * Get spending by category for a date range
 */
export async function getSpendingByCategory(
  startDate: number,
  endDate: number
): Promise<{ category: string; total: number }[]> {
  const database = getDatabase();

  const results = await database.getAllAsync<{ category: string; total: number }>(
    `SELECT category, SUM(amount) as total FROM transactions 
     WHERE type = 'expense' AND timestamp >= ? AND timestamp <= ?
     GROUP BY category
     ORDER BY total DESC`,
    [startDate, endDate]
  );

  return results;
}

// ============================================
// BUDGET OPERATIONS
// ============================================

/**
 * Set a budget for a category
 */
export async function setBudget(
  category: string,
  amount: number,
  period: 'weekly' | 'monthly' | 'yearly'
): Promise<Budget> {
  const database = getDatabase();
  const now = Date.now();

  const budget: Budget = {
    id: generateUUID(),
    category: category as Budget['category'],
    amount,
    period,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `INSERT INTO budgets (id, category, amount, period, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(category) DO UPDATE SET
       amount = excluded.amount,
       period = excluded.period,
       updatedAt = excluded.updatedAt`,
    [budget.id, budget.category, budget.amount, budget.period, budget.createdAt, budget.updatedAt]
  );

  console.log('[Database] Budget set:', category, amount, period);
  return budget;
}

/**
 * Get all budgets
 */
export async function getBudgets(): Promise<Budget[]> {
  const database = getDatabase();
  return database.getAllAsync<Budget>('SELECT * FROM budgets');
}

/**
 * Delete a budget
 */
export async function deleteBudget(category: string): Promise<boolean> {
  const database = getDatabase();
  
  const result = await database.runAsync(
    'DELETE FROM budgets WHERE category = ?',
    [category]
  );

  return result.changes > 0;
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================

export async function addSubscription(input: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
  const database = getDatabase();
  const now = Date.now();
  
  const subscription: Subscription = {
    id: generateUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `INSERT INTO subscriptions (id, name, amount, currency, billingPeriod, nextBillingDate, notificationEnabled, category, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      subscription.id,
      subscription.name,
      subscription.amount,
      subscription.currency,
      subscription.billingPeriod,
      subscription.nextBillingDate,
      subscription.notificationEnabled ? 1 : 0,
      subscription.category,
      subscription.createdAt,
      subscription.updatedAt,
    ]
  );

  return subscription;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const database = getDatabase();
  const results = await database.getAllAsync<any>('SELECT * FROM subscriptions ORDER BY nextBillingDate ASC');
  return results.map(sub => ({
    ...sub,
    notificationEnabled: sub.notificationEnabled === 1
  }));
}

export async function deleteSubscription(id: string): Promise<boolean> {
  const database = getDatabase();
  const result = await database.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
  return result.changes > 0;
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

export async function getSettings(): Promise<UserSettings> {
  const database = getDatabase();
  const result = await database.getFirstAsync<any>('SELECT * FROM settings WHERE id = ?', ['default']);
  
  if (!result) {
    // Should have been created in init, but fallback just in case
    return {
      id: 'default',
      dangerZoneAmount: 0,
      currency: 'USD',
      theme: 'system',
      notificationsEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  return {
    ...result,
    notificationsEnabled: result.notificationsEnabled === 1
  };
}

export async function updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  const database = getDatabase();
  const now = Date.now();
  const current = await getSettings();
  
  const updated: UserSettings = {
    ...current,
    ...updates,
    updatedAt: now
  };

  await database.runAsync(
    `UPDATE settings 
     SET dangerZoneAmount = ?, currency = ?, theme = ?, notificationsEnabled = ?, updatedAt = ?
     WHERE id = ?`,
    [
      updated.dangerZoneAmount,
      updated.currency,
      updated.theme,
      updated.notificationsEnabled ? 1 : 0,
      updated.updatedAt,
      'default'
    ]
  );

  return updated;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = getDatabase();
  await database.execAsync('DELETE FROM transactions');
  await database.execAsync('DELETE FROM budgets');
  console.log('[Database] All data cleared');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  transactionCount: number;
  budgetCount: number;
  oldestTransaction: number | null;
  newestTransaction: number | null;
}> {
  const database = getDatabase();

  const transactionCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM transactions'
  );

  const budgetCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM budgets'
  );

  const oldest = await database.getFirstAsync<{ timestamp: number | null }>(
    'SELECT MIN(timestamp) as timestamp FROM transactions'
  );

  const newest = await database.getFirstAsync<{ timestamp: number | null }>(
    'SELECT MAX(timestamp) as timestamp FROM transactions'
  );

  return {
    transactionCount: transactionCount?.count ?? 0,
    budgetCount: budgetCount?.count ?? 0,
    oldestTransaction: oldest?.timestamp ?? null,
    newestTransaction: newest?.timestamp ?? null,
  };
}
