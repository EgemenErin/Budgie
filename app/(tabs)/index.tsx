import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useTransactions, useTransactionSummary, useSettings, getTodayRange, getCurrentMonthRange } from '@/hooks/use-database';
import { CATEGORY_INFO } from '@/database/schema';

import { CircularProgress } from '@/components/ui/circular-progress';

export default function HomeScreen() {
  const router = useRouter();
  const { startDate, endDate } = getCurrentMonthRange();
  
  const { summary, isLoading: isLoadingSummary, refresh: refreshSummary } = useTransactionSummary(startDate, endDate);
  const { transactions, isLoading: isLoadingTransactions, refresh: refreshTransactions } = useTransactions({ limit: 10 });
  const { settings, isLoading: isLoadingSettings, refresh: refreshSettings } = useSettings();

  const onRefresh = React.useCallback(() => {
    refreshSummary();
    refreshTransactions();
    refreshSettings();
  }, [refreshSummary, refreshTransactions, refreshSettings]);

  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const isLoading = isLoadingSummary || isLoadingTransactions || isLoadingSettings;
  const balance = summary?.balance ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  
  // Safe to spend = (Income - Expenses) / Days remaining in month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());
  const safeToSpend = Math.max(0, (totalIncome - totalExpenses) / daysRemaining);

  const dangerZoneAmount = settings?.dangerZoneAmount ?? 0;
  const isDanger = balance < dangerZoneAmount;
  const currency = settings?.currency ?? 'USD';

  // Calculate progress: Expenses / Income (capped at 1)
  const progress = totalIncome > 0 ? Math.min(1, totalExpenses / totalIncome) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#a8e0b0', '#ffffff', '#ccaadd']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notificationButton}>
                   {/* Notification logic here if needed */}
                </TouchableOpacity>
            </View>

            <View style={styles.balanceContainer}>
                <View style={styles.chartContainer}>
                    <CircularProgress
                        size={220}
                        strokeWidth={20}
                        progress={progress}
                        color="#111" // Dark for contrast on light bg
                        backgroundColor="rgba(255,255,255,0.5)"
                    >
                        <View style={styles.chartContent}>
                            <Ionicons name="arrow-up-outline" size={24} color="#333" style={{ marginBottom: 4, opacity: 0.8 }} />
                            <Text style={styles.balanceAmount}>
                                {formatCurrency(balance)}
                            </Text>
                            <View style={styles.percentageBadge}>
                                <Ionicons name="speedometer-outline" size={12} color="#333" />
                                <Text style={styles.percentageText}>{Math.round(progress * 100)}% Spent</Text>
                            </View>
                        </View>
                    </CircularProgress>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Income</Text>
                        <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <Text style={styles.statLabel}>Balance</Text>
                        <Text style={[styles.statValue, isDanger && styles.balanceDanger]}>
                            {formatCurrency(balance)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Safe to spend</Text>
                        <Text style={styles.statValue}>{formatCurrency(safeToSpend)}/day</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.dragHandle} />
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        <ScrollView 
            style={styles.transactionsList}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {transactions.map((t) => (
                <View key={t.id} style={styles.transactionItem}>
                    <View style={styles.transactionIconContainer}>
                        <Text style={styles.transactionEmoji}>
                            {CATEGORY_INFO[t.category]?.emoji ?? '📝'}
                        </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                        <Text style={styles.transactionCategory}>
                            {CATEGORY_INFO[t.category]?.label ?? t.category}
                        </Text>
                        <Text style={styles.transactionDate}>{formatDate(t.timestamp)}</Text>
                    </View>
                    <Text style={[
                        styles.transactionAmount,
                        t.type === 'income' ? styles.incomeText : styles.expenseText
                    ]}>
                        {t.type === 'income' ? '+' : ''}{formatCurrency(t.amount)}
                    </Text>
                </View>
            ))}
            
            {transactions.length === 0 && !isLoading && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No transactions yet</Text>
                </View>
            )}
            
            <View style={{ height: 100 }} /> 
        </ScrollView>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    paddingBottom: 40,
  },
  safeArea: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  chartContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  percentageText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  balanceDanger: {
    color: '#ff4b4b',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#333',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
  },
});
