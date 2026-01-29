import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Shadows, FontSize, BorderRadius, Spacing } from '../../constants/theme';

interface DiagnosticCardProps {
  icon: string;
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
}

export function DiagnosticCard({ icon, label, description, selected = false, onPress }: DiagnosticCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {description && (
          <Text style={[styles.description, selected && styles.descriptionSelected]}>{description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    ...Shadows.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  icon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.primary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  descriptionSelected: {
    color: Colors.primary,
  },
});
