import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Animated,
} from 'react-native';
import { Colors } from '@/lib/constants';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border: string }
> = {
  primary: { bg: Colors.primary, text: Colors.white, border: Colors.primary },
  secondary: { bg: 'transparent', text: Colors.primary, border: Colors.primary },
  accent: { bg: Colors.accent, text: Colors.white, border: Colors.accent },
  danger: { bg: Colors.error, text: Colors.white, border: Colors.error },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const v = VARIANT_STYLES[variant];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: v.bg,
            borderColor: v.border,
            borderWidth: variant === 'secondary' ? 1.5 : 0,
            opacity: disabled ? 0.5 : 1,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} size="small" />
        ) : (
          <Text style={[styles.text, { color: v.text }]}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
