import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, clearAllData } from '@/hooks/use-database';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, isLoading, update } = useSettings();
  const [dangerZone, setDangerZone] = useState('');

  React.useEffect(() => {
    if (settings) {
      setDangerZone(settings.dangerZoneAmount.toString());
    }
  }, [settings]);

  const handleUpdateDangerZone = () => {
    const amount = parseFloat(dangerZone);
    if (!isNaN(amount)) {
      update({ dangerZoneAmount: amount });
      Alert.alert('Saved', 'Danger zone amount updated');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            router.replace('/');
          }
        }
      ]
    );
  };

  if (isLoading || !settings) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Settings</Text>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive alerts for subscriptions</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(val) => update({ notificationsEnabled: val })}
              trackColor={{ false: '#767577', true: '#34C759' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingDescription}>Display currency symbol</Text>
            </View>
            <TouchableOpacity 
                style={styles.currencyButton}
                onPress={() => {
                    const next = settings.currency === 'USD' ? 'EUR' : settings.currency === 'EUR' ? 'GBP' : 'USD';
                    update({ currency: next });
                }}
            >
                <Text style={styles.currencyText}>{settings.currency}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone Settings</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Minimum Balance Limit</Text>
            <Text style={styles.cardDescription}>
              If your balance falls below this amount, the home screen will turn red to warn you.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>{settings.currency === 'GBP' ? '£' : settings.currency === 'EUR' ? '€' : '$'}</Text>
              <TextInput
                style={styles.input}
                value={dangerZone}
                onChangeText={setDangerZone}
                keyboardType="numeric"
                onEndEditing={handleUpdateDangerZone}
                placeholder="0.00"
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateDangerZone}>
                <Text style={styles.saveButtonText}>Save Limit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            <Text style={styles.resetText}>Reset All Data</Text>
          </TouchableOpacity>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
  },
  currencyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyText: {
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 20,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});
