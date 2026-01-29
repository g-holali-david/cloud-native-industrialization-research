import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { Colors, Shadows, FontSize } from '../../constants/theme';

interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function SOSButton({ onPress, disabled = false }: SOSButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({ inputRange: [1, 1.1], outputRange: [0.3, 0] }),
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.mecaText}>MÉCA</Text>
      </TouchableOpacity>
      <Text style={styles.helpText}>Appuyez en cas d'urgence mécanique</Text>
    </View>
  );
}

const BUTTON_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 40,
    height: BUTTON_SIZE + 40,
    borderRadius: (BUTTON_SIZE + 40) / 2,
    backgroundColor: Colors.primary,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  sosText: {
    fontSize: FontSize.display,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 4,
  },
  mecaText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
    marginTop: -4,
  },
  helpText: {
    marginTop: 24,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
