import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SOSButton } from '../../components/ui/SOSButton';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.logo}>SOS Méca</Text>
        <Text style={styles.tagline}>Assistance mécanique rapide</Text>
      </View>

      <View style={styles.content}>
        <SOSButton onPress={() => router.push('/diagnostic')} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🔧 Mécaniciens disponibles 24h/24</Text>
        <Text style={styles.footerSubtext}>Lomé et environs</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
