import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { useSOSStore } from '../stores';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../constants/theme';

export default function AdviceScreen() {
  const router = useRouter();
  const { diagnosticResult, setStep, reset } = useSOSStore();

  if (!diagnosticResult) {
    router.replace('/');
    return null;
  }

  const handleResolved = () => {
    reset();
    router.replace('/');
  };

  const handleNeedMechanic = () => {
    setStep('location');
    router.push('/location');
  };

  const getGravityColor = () => {
    if (diagnosticResult.gravite === 'mineur') return Colors.success;
    if (diagnosticResult.gravite === 'moyen') return Colors.warning;
    return Colors.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.gravityBadge, { backgroundColor: getGravityColor() }]}>
            <Text style={styles.gravityText}>{diagnosticResult.gravite.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>💡 Diagnostic</Text>
          <Text style={styles.symptome}>{diagnosticResult.symptome}</Text>
          <Text style={styles.sousCategorie}>{diagnosticResult.sousCategorie}</Text>
        </View>

        <View style={styles.adviceCard}>
          <Text style={styles.adviceTitle}>Notre conseil</Text>
          <Text style={styles.adviceText}>{diagnosticResult.conseil}</Text>
        </View>

        {diagnosticResult.tutoriel && (
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>📋 {diagnosticResult.tutoriel.titre}</Text>
            {diagnosticResult.tutoriel.etapes.map((etape, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{etape}</Text>
              </View>
            ))}
            {diagnosticResult.tutoriel.avertissement && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ {diagnosticResult.tutoriel.avertissement}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ℹ️ Ces conseils sont indicatifs. En cas de doute, consultez un professionnel.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="✅ Problème résolu"
          onPress={handleResolved}
          variant="outline"
          size="lg"
          style={styles.footerButton}
        />
        <Button
          title="🔧 J'ai besoin d'un mécanicien"
          onPress={handleNeedMechanic}
          size="lg"
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  gravityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  gravityText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  symptome: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  sousCategorie: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  adviceCard: {
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  adviceTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  adviceText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tutorialCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  tutorialTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: Colors.warning + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  warningText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: Spacing.sm,
  },
  footerButton: {
    width: '100%',
  },
});
