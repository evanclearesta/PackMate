import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export default function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: checked ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [checked]);

  return (
    <Pressable style={styles.container} onPress={onToggle}>
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name="checkmark" size={16} color={Colors.white} />
        </Animated.View>
      </View>
      {label ? (
        <Text style={[styles.label, checked && styles.labelChecked]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 15,
    color: Colors.text,
  },
  labelChecked: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
});
