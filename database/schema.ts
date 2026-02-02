/**
 * Database Schema Types for Budgie
 * 
 * Defines TypeScript interfaces for all database entities
 */

// Transaction types
export type TransactionType = 'income' | 'expense';

// Transaction categories
export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'gift'
  | 'other_income'
  | 'food'
  | 'transportation'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'other_expense';

// Main transaction interface
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  timestamp: number; // Unix timestamp in milliseconds
  createdAt: number;
  updatedAt: number;
}

// Input type for creating new transactions
export interface TransactionInput {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  timestamp?: number;
}

// Subscription interface
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingPeriod: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: number; // Unix timestamp
  notificationEnabled: boolean;
  category: TransactionCategory;
  createdAt: number;
  updatedAt: number;
}

// User Settings interface
export interface UserSettings {
  id: string; // usually just 'default'
  dangerZoneAmount: number; // Amount below which balance turns red
  currency: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// Category display info
export const CATEGORY_INFO: Record<TransactionCategory, { label: string; emoji: string }> = {
  // Income categories
  salary: { label: 'Salary', emoji: '💰' },
  freelance: { label: 'Freelance', emoji: '💼' },
  investment: { label: 'Investment', emoji: '📈' },
  gift: { label: 'Gift', emoji: '🎁' },
  other_income: { label: 'Other Income', emoji: '💵' },
  // Expense categories
  food: { label: 'Food & Dining', emoji: '🍔' },
  transportation: { label: 'Transportation', emoji: '🚗' },
  utilities: { label: 'Utilities', emoji: '💡' },
  entertainment: { label: 'Entertainment', emoji: '🎬' },
  shopping: { label: 'Shopping', emoji: '🛍️' },
  healthcare: { label: 'Healthcare', emoji: '🏥' },
  education: { label: 'Education', emoji: '📚' },
  travel: { label: 'Travel', emoji: '✈️' },
  other_expense: { label: 'Other', emoji: '📝' },
};

// Income categories list
export const INCOME_CATEGORIES: TransactionCategory[] = [
  'salary',
  'freelance',
  'investment',
  'gift',
  'other_income',
];

// Expense categories list
export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food',
  'transportation',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'education',
  'travel',
  'other_expense',
];
