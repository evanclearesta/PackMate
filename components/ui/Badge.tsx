import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  color: string;
  variant?: 'filled' | 'outlined';
}

export default function Badge({
  label,
  color,
  variant = 'filled',
}: BadgeProps) {
  const isFilled = variant === 'filled';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isFilled ? color + '20' : 'transparent',
          borderColor: color,
          borderWidth: isFilled ? 0 : 1.5,
        },
      ]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
