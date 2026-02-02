import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cssInterop } from "nativewind";

// Enable animation for View if needed by NativeWind, though Animated.View is usually enough
cssInterop(Animated.View, { className: "style" });

interface BentoCardProps {
  title: string;
  amount?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  colorClass?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large' | 'wide';
  badge?: string;
}

export function BentoCard({ 
  title, 
  amount, 
  subtitle, 
  icon, 
  className = "", 
  colorClass = "bg-white",
  onPress,
  size = 'medium',
  badge
}: BentoCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  // Determine size classes
  let sizeClasses = "aspect-square";
  if (size === 'wide') sizeClasses = "aspect-[2/1] col-span-2";
  if (size === 'large') sizeClasses = "row-span-2 aspect-[1/2]";
  
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      className={`flex-1 ${size === 'wide' ? 'basis-full' : ''}`}
    >
      <Animated.View 
        className={`rounded-3xl p-5 justify-between shadow-sm ${colorClass} ${sizeClasses} ${className}`}
        style={[animatedStyle]}
      >
        <View className="flex-row justify-between items-start">
          <View className="bg-white/50 p-2 rounded-xl">
            {icon}
          </View>
          {badge && (
            <View className="bg-white/90 px-2 py-1 rounded-full">
              <Text className="text-xs font-bold text-gray-800">{badge}</Text>
            </View>
          )}
        </View>

        <View>
          <Text className="text-gray-900 font-bold text-lg mb-0.5">{title}</Text>
          {amount && <Text className="text-gray-900 font-extrabold text-2xl">{amount}</Text>}
          {subtitle && <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}
