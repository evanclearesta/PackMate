import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/lib/constants';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  color = Colors.primary,
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clamped * 100)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  track: {
    backgroundColor: Colors.lightGray,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'right',
  },
});
