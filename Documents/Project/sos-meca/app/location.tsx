import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { getCurrentLocation } from '../services/location';
import { useSOSStore } from '../stores';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

export default function LocationScreen() {
  const router = useRouter();
  const { setLocation, setStep, diagnosticResult } = useSOSStore();
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    setIsLoading(true);
    const result = await getCurrentLocation();
    if (result.success && result.coordinates) {
      setPosition(result.coordinates);
      setAddress(result.address || 'Position actuelle');
    } else {
      Alert.alert('Erreur', result.error || "Impossible d'obtenir votre position");
    }
    setIsLoading(false);
  };

  const handleConfirm = () => {
    if (!position) return;
    setLocation(position, address);
    setStep('broadcasting');
    router.push('/broadcasting');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Recherche de votre position...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirmez votre position</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapText}>Carte</Text>
          {position && (
            <Text style={styles.coords}>
              {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {diagnosticResult && (
          <View style={styles.diagnosticInfo}>
            <Text style={styles.diagnosticLabel}>Problème :</Text>
            <Text style={styles.diagnosticValue}>
              {diagnosticResult.symptome} - {diagnosticResult.sousCategorie}
            </Text>
          </View>
        )}

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>📍 Adresse</Text>
          <Text style={styles.addressText}>{address}</Text>
        </View>

        <Button
          title="📍 Actualiser ma position"
          onPress={loadLocation}
          variant="outline"
          size="md"
          style={{ marginBottom: Spacing.md }}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Confirmer et trouver un mécanicien"
          onPress={handleConfirm}
          size="lg"
          style={{ width: '100%' }}
          disabled={!position}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  mapIcon: {
    fontSize: 48,
  },
  mapText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  coords: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  diagnosticInfo: {
    padding: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  diagnosticLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  diagnosticValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  addressContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  addressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  addressText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
});
