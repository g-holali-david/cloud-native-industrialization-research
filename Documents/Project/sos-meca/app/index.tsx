import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.logo}>🔧</Text>
        <Text style={styles.title}>SOS Méca</Text>
        <Text style={styles.subtitle}>Assistance mécanique rapide</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Vous êtes :</Text>

        <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/(tabs)')} activeOpacity={0.8}>
          <Text style={styles.optionIcon}>🚗</Text>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Automobiliste</Text>
            <Text style={styles.optionDescription}>J'ai besoin d'un mécanicien</Text>
          </View>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/auth/register-mecanicien')}
          activeOpacity={0.8}
        >
          <Text style={styles.optionIcon}>🔧</Text>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Mécanicien</Text>
            <Text style={styles.optionDescription}>Je propose mes services</Text>
          </View>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Disponible 24h/24 à Lomé et environs</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  question: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  optionIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  optionDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
