import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useCurrency,
  useThemeSetting,
  useNotifications,
  useWeekStartDay,
  useAllSettings,
} from '@/hooks/use-settings';
import { useDatabaseStats } from '@/hooks/use-database';
import { clearAllData } from '@/database';
import { CURRENCY_INFO, CurrencyCode, ThemeMode } from '@/database';

const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'TRY', 'JPY', 'INR', 'CAD', 'AUD'];
const THEMES: ThemeMode[] = ['system', 'light', 'dark'];
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsScreen() {
  const { currency, setCurrency, currencyInfo } = useCurrency();
  const { theme, setTheme } = useThemeSetting();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } = useNotifications();
  const { day: weekStartDay, setDay: setWeekStartDay } = useWeekStartDay();
  const { stats, refresh: refreshStats } = useDatabaseStats();
  const { reset: resetSettings } = useAllSettings();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showWeekDayPicker, setShowWeekDayPicker] = useState(false);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all transactions and budgets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await refreshStats();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  }, [refreshStats]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('Success', 'Settings have been reset.');
          },
        },
      ]
    );
  }, [resetSettings]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Configure your app preferences</Text>
        </View>

        {/* Storage Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Storage Status</Text>
          <View style={styles.storageInfo}>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Transactions</Text>
              <Text style={styles.storageValue}>{stats?.transactionCount ?? 0}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Budgets</Text>
              <Text style={styles.storageValue}>{stats?.budgetCount ?? 0}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Storage</Text>
              <Text style={styles.storageValue}>SQLite + MMKV</Text>
            </View>
          </View>
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>100% Offline Storage</Text>
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>General</Text>

          {/* Currency */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          >
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingValue}>
              {currencyInfo.symbol} {currency}
            </Text>
          </TouchableOpacity>
          {showCurrencyPicker && (
            <View style={styles.pickerContainer}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pickerItem, currency === c && styles.pickerItemSelected]}
                  onPress={() => {
                    setCurrency(c);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={[styles.pickerText, currency === c && styles.pickerTextSelected]}>
                    {CURRENCY_INFO[c].symbol} {c} - {CURRENCY_INFO[c].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Theme */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowThemePicker(!showThemePicker)}
          >
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>
          </TouchableOpacity>
          {showThemePicker && (
            <View style={styles.pickerContainer}>
              {THEMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.pickerItem, theme === t && styles.pickerItemSelected]}
                  onPress={() => {
                    setTheme(t);
                    setShowThemePicker(false);
                  }}
                >
                  <Text style={[styles.pickerText, theme === t && styles.pickerTextSelected]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Week Start Day */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowWeekDayPicker(!showWeekDayPicker)}
          >
            <Text style={styles.settingLabel}>Week Starts On</Text>
            <Text style={styles.settingValue}>{WEEK_DAYS[weekStartDay]}</Text>
          </TouchableOpacity>
          {showWeekDayPicker && (
            <View style={styles.pickerContainer}>
              {WEEK_DAYS.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.pickerItem, weekStartDay === index && styles.pickerItemSelected]}
                  onPress={() => {
                    setWeekStartDay(index as 0 | 1 | 2 | 3 | 4 | 5 | 6);
                    setShowWeekDayPicker(false);
                  }}
                >
                  <Text style={[styles.pickerText, weekStartDay === index && styles.pickerTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notifications */}
          <View style={styles.settingRowSwitch}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Management</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleResetSettings}>
            <Text style={styles.dangerButtonText}>Reset Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dangerButton, styles.dangerButtonRed]} onPress={handleClearData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Database</Text>
            <Text style={styles.aboutValue}>expo-sqlite (Native)</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Settings Storage</Text>
            <Text style={styles.aboutValue}>AsyncStorage</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your data is stored locally on your device and never leaves it.
          </Text>
        </View>
      </ScrollView>
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
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    margin: 20,
    marginBottom: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  storageItem: {
    alignItems: 'center',
  },
  storageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  storageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  offlineBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineBadgeText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRowSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  pickerTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonRed: {
    backgroundColor: '#f44336',
    marginBottom: 0,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
