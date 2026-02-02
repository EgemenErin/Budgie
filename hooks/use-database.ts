/**
 * React Hooks for Database Operations
 * 
 * Provides easy-to-use hooks for accessing and manipulating data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionSummary,
  getSpendingByCategory,
  getDatabaseStats,
  Transaction,
  TransactionInput,
} from '@/database';

// ============================================
// DATABASE INITIALIZATION HOOK
// ============================================

/**
 * Hook to initialize the database on app start
 */
export function useDatabaseInit() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await initDatabase();
        if (mounted) {
          setIsReady(true);
        }
      } catch (err) {
        console.error('[useDatabaseInit] Error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize database'));
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return { isReady, error };
}

// ============================================
// TRANSACTIONS HOOK
// ============================================

interface UseTransactionsOptions {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

/**
 * Hook to fetch and manage transactions
 */
export function useTransactions(options?: UseTransactionsOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTransactions(options);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('[useTransactions] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    } finally {
      setIsLoading(false);
    }
  }, [options?.type, options?.category, options?.startDate, options?.endDate, options?.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const add = useCallback(async (input: TransactionInput) => {
    try {
      const newTransaction = await addTransaction(input);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('[useTransactions] Add error:', err);
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<TransactionInput>) => {
    try {
      const updated = await updateTransaction(id, updates);
      if (updated) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
      return updated;
    } catch (err) {
      console.error('[useTransactions] Update error:', err);
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const success = await deleteTransaction(id);
      if (success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
      return success;
    } catch (err) {
      console.error('[useTransactions] Delete error:', err);
      throw err;
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refresh: fetchTransactions,
    add,
    update,
    remove,
  };
}

// ============================================
// TRANSACTION SUMMARY HOOK
// ============================================

interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

/**
 * Hook to get transaction summary for a date range
 */
export function useTransactionSummary(startDate: number, endDate: number) {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTransactionSummary(startDate, endDate);
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error('[useTransactionSummary] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch summary'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refresh: fetchSummary };
}

// ============================================
// SPENDING BY CATEGORY HOOK
// ============================================

/**
 * Hook to get spending grouped by category
 */
export function useSpendingByCategory(startDate: number, endDate: number) {
  const [spending, setSpending] = useState<{ category: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSpending = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSpendingByCategory(startDate, endDate);
      setSpending(data);
      setError(null);
    } catch (err) {
      console.error('[useSpendingByCategory] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch spending'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSpending();
  }, [fetchSpending]);

  return { spending, isLoading, error, refresh: fetchSpending };
}

// ============================================
// DATABASE STATS HOOK
// ============================================

/**
 * Hook to get database statistics
 */
export function useDatabaseStats() {
  const [stats, setStats] = useState<{
    transactionCount: number;
    budgetCount: number;
    oldestTransaction: number | null;
    newestTransaction: number | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err) {
      console.error('[useDatabaseStats] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refresh: fetchStats };
}

// ============================================
// DATE RANGE HELPERS
// ============================================

/**
 * Get start and end timestamps for the current month
 */
export function getCurrentMonthRange(): { startDate: number; endDate: number } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  return { startDate, endDate };
}

/**
 * Get start and end timestamps for the current week
 */
export function getCurrentWeekRange(weekStartDay: number = 1): { startDate: number; endDate: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = (dayOfWeek - weekStartDay + 7) % 7;
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - diff);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate: startDate.getTime(), endDate: endDate.getTime() };
}

/**
 * Get start and end timestamps for today
 */
export function getTodayRange(): { startDate: number; endDate: number } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  return { startDate, endDate };
}
