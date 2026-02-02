import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions, useSpendingByCategory, getCurrentMonthRange, useSettings } from '@/hooks/use-database';
import { CATEGORY_INFO } from '@/database/schema';
import { useFocusEffect } from 'expo-router';

export default function ListScreen() {
  const { startDate, endDate } = getCurrentMonthRange();
  const { transactions, isLoading: loadingTrans, refresh: refreshTrans } = useTransactions({ limit: 100 });
  const { spending, isLoading: loadingSpend, refresh: refreshSpend } = useSpendingByCategory(startDate, endDate);
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<'transactions' | 'stats'>('transactions');

  useFocusEffect(
    React.useCallback(() => {
      refreshTrans();
      refreshSpend();
    }, [refreshTrans, refreshSpend])
  );

  const currency = settings?.currency ?? 'USD';
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const maxSpending = spending.length > 0 ? Math.max(...spending.map(s => s.total)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={styles.segmentControl}>
          <TouchableOpacity 
            style={[styles.segment, activeTab === 'transactions' && styles.segmentActive]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[styles.segmentText, activeTab === 'transactions' && styles.segmentTextActive]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segment, activeTab === 'stats' && styles.segmentActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.segmentText, activeTab === 'stats' && styles.segmentTextActive]}>Stats</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'transactions' ? (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loadingTrans}
          onRefresh={refreshTrans}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
          renderItem={({ item }) => (
             <View style={styles.transactionItem}>
                <View style={styles.transactionIconContainer}>
                    <Text style={styles.transactionEmoji}>
                        {CATEGORY_INFO[item.category]?.emoji ?? '📝'}
                    </Text>
                </View>
                <View style={styles.transactionDetails}>
                    <Text style={styles.transactionCategory}>
                        {CATEGORY_INFO[item.category]?.label ?? item.category}
                    </Text>
                    <Text style={styles.transactionDesc}>{item.description || formatDate(item.timestamp)}</Text>
                </View>
                <Text style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeText : styles.expenseText
                ]}>
                    {item.type === 'income' ? '+' : ''}{formatCurrency(item.amount)}
                </Text>
            </View>
          )}
        />
      ) : (
        <ScrollView style={styles.statsContent} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.sectionTitle}>Monthly Spending</Text>
          
          {loadingSpend ? (
             <ActivityIndicator />
          ) : spending.length === 0 ? (
             <Text style={styles.emptyText}>No spending data for this month</Text>
          ) : (
            spending.map((item) => (
              <View key={item.category} style={styles.statItem}>
                <View style={styles.statHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.statEmoji}>{CATEGORY_INFO[item.category as any]?.emoji ?? '📝'}</Text>
                        <Text style={styles.statLabel}>{CATEGORY_INFO[item.category as any]?.label ?? item.category}</Text>
                    </View>
                    <Text style={styles.statAmount}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={styles.barContainer}>
                    <View 
                        style={[
                            styles.barFill, 
                            { width: `${(item.total / maxSpending) * 100}%` }
                        ]} 
                    />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  segmentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContent: {
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
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
  },
  transactionDesc: {
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
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statItem: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
});
