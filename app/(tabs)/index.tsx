import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions, useTransactionSummary, getCurrentMonthRange } from '@/hooks/use-database';
import { useCurrency } from '@/hooks/use-settings';
import { Transaction, TransactionCategory, CATEGORY_INFO } from '@/database';

export default function HomeScreen() {
  const { startDate, endDate } = getCurrentMonthRange();
  const { transactions, isLoading, refresh, add, remove } = useTransactions({ limit: 50 });
  const { summary, refresh: refreshSummary } = useTransactionSummary(startDate, endDate);
  const { formatAmount } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshSummary()]);
    setRefreshing(false);
  }, [refresh, refreshSummary]);

  const handleAddTransaction = useCallback(async (type: 'income' | 'expense') => {
    const categories: TransactionCategory[] = type === 'income' 
      ? ['salary', 'freelance', 'gift']
      : ['food', 'transportation', 'shopping', 'entertainment'];
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = Math.floor(Math.random() * 100) + 10;

    try {
      await add({
        amount: randomAmount,
        type,
        category: randomCategory,
        description: `Sample ${type}`,
      });
      await refreshSummary();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  }, [add, refreshSummary]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(id);
              await refreshSummary();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  }, [remove, refreshSummary]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const categoryInfo = CATEGORY_INFO[item.category];
    const isIncome = item.type === 'income';
    
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onLongPress={() => handleDeleteTransaction(item.id)}
      >
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionEmoji}>{categoryInfo?.emoji || '💵'}</Text>
          <View>
            <Text style={styles.transactionCategory}>
              {categoryInfo?.label || item.category}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text style={[
          styles.transactionAmount,
          isIncome ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {isIncome ? '+' : '-'}{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgie</Text>
        <Text style={styles.headerSubtitle}>Local-First Budget Tracker</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Month</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, styles.incomeAmount]}>
              {formatAmount(summary?.totalIncome ?? 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseAmount]}>
              {formatAmount(summary?.totalExpenses ?? 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[
              styles.summaryValue,
              (summary?.balance ?? 0) >= 0 ? styles.incomeAmount : styles.expenseAmount
            ]}>
              {formatAmount(summary?.balance ?? 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity
          style={[styles.quickAddButton, styles.incomeButton]}
          onPress={() => handleAddTransaction('income')}
        >
          <Text style={styles.quickAddText}>+ Income</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAddButton, styles.expenseButton]}
          onPress={() => handleAddTransaction('expense')}
        >
          <Text style={styles.quickAddText}>+ Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Indicator */}
      <View style={styles.offlineIndicator}>
        <Text style={styles.offlineText}>
          100% Offline - Data stored on device
        </Text>
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>
          Recent Transactions ({summary?.transactionCount ?? 0})
        </Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? 'Loading...' : 'No transactions yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                Tap the buttons above to add your first transaction
              </Text>
            </View>
          }
          contentContainerStyle={transactions.length === 0 ? styles.emptyList : undefined}
        />
      </View>
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
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#f44336',
  },
  quickAddContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  incomeButton: {
    backgroundColor: '#4CAF50',
  },
  expenseButton: {
    backgroundColor: '#f44336',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineIndicator: {
    marginTop: 15,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  transactionsContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionEmoji: {
    fontSize: 24,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});
