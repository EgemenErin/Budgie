import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: 25,
          },
          default: {
            height: 65,
            paddingBottom: 10,
          },
        }),
        tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subs',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "calendar" : "calendar-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{ 
                backgroundColor: Colors[colorScheme ?? 'light'].tint, 
                width: 50, 
                height: 50, 
                borderRadius: 25, 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,
                elevation: 8,
            }}>
                <Ionicons size={32} name="add" color="#fff" />
            </View>
          ),
        }}
        listeners={() => ({
            tabPress: (e) => {
                e.preventDefault();
                router.push('/add-transaction');
            }
        })}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "list" : "list-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "settings" : "settings-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}
