import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const animatedValue = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const onToggle = () => {
    toggleTheme();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 28],
  });

  return (
    <Pressable
      style={[styles.switch, isDark ? styles.switchDark : styles.switchLight]}
      onPress={onToggle}
    >
      <Animated.View
        style={[
          styles.thumb,
          isDark ? styles.thumbDark : styles.thumbLight,
          { transform: [{ translateX }] },
        ]}
      >
        <MaterialCommunityIcons
          name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
          size={16}
          color={isDark ? '#fff' : '#FF9800'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
  },
  switchLight: {
    backgroundColor: '#E0E0E0',
  },
  switchDark: {
    backgroundColor: '#666',
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbDark: {
    backgroundColor: '#303030',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 