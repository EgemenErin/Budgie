import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptions, useSettings } from '@/hooks/use-database';
import { CATEGORY_INFO, TransactionCategory } from '@/database/schema';

export default function SubscriptionsScreen() {
  const { subscriptions, isLoading, add, remove, refresh } = useSubscriptions();
  const { settings } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [notify, setNotify] = useState(true);

  const currency = settings?.currency ?? 'USD';
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  const handleAdd = async () => {
    if (!name || !amount) {
      Alert.alert('Missing Fields', 'Please enter a name and amount');
      return;
    }

    try {
      const nextDate = new Date();
      if (period === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else nextDate.setFullYear(nextDate.getFullYear() + 1);

      await add({
        name,
        amount: parseFloat(amount),
        currency: currency,
        billingPeriod: period,
        nextBillingDate: nextDate.getTime(),
        notificationEnabled: notify,
        category: 'other_expense', // Default for now
      });

      setIsAdding(false);
      setName('');
      setAmount('');
      setNotify(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to add subscription');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (timestamp: number) => {
    const diff = timestamp - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days} days`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={styles.addButton}>
          <Ionicons name={isAdding ? "close" : "add"} size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {isAdding && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>New Subscription</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Name (e.g. Netflix)"
                value={name}
                onChangeText={setName}
              />
              
              <View style={styles.row}>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.prefix}>{currencySymbol}</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.periodSelector}>
                  <TouchableOpacity 
                    style={[styles.periodButton, period === 'monthly' && styles.periodButtonActive]}
                    onPress={() => setPeriod('monthly')}
                  >
                    <Text style={[styles.periodText, period === 'monthly' && styles.periodTextActive]}>Monthly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodButton, period === 'yearly' && styles.periodButtonActive]}
                    onPress={() => setPeriod('yearly')}
                  >
                    <Text style={[styles.periodText, period === 'yearly' && styles.periodTextActive]}>Yearly</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Enable Notifications</Text>
                <Switch value={notify} onValueChange={setNotify} trackColor={{ false: '#767577', true: '#34C759' }} />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveButtonText}>Add Subscription</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No subscriptions yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add one</Text>
            </View>
          ) : (
            subscriptions.map((sub) => (
              <View key={sub.id} style={styles.subCard}>
                <View style={styles.subIcon}>
                  <Text style={styles.subEmoji}>📅</Text>
                </View>
                <View style={styles.subContent}>
                    <View style={styles.subHeader}>
                        <Text style={styles.subName}>{sub.name}</Text>
                        <Text style={styles.subAmount}>{currencySymbol}{sub.amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.subFooter}>
                        <Text style={styles.subDate}>Due {formatDate(sub.nextBillingDate)} • {getDaysUntil(sub.nextBillingDate)}</Text>
                        {sub.notificationEnabled && (
                            <Ionicons name="notifications-outline" size={16} color="#666" />
                        )}
                    </View>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Delete', 'Remove this subscription?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(sub.id) }])}>
                    <Ionicons name="trash-outline" size={20} color="#ff3b30" style={{ marginLeft: 10, opacity: 0.5 }} />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#e1f0ff',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  amountInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  periodSelector: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  periodText: {
    fontSize: 12,
    color: '#666',
  },
  periodTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  subCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subEmoji: {
    fontSize: 20,
  },
  subContent: {
    flex: 1,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subDate: {
    fontSize: 12,
    color: '#888',
  },
});
