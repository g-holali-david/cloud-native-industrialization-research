import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { useSOSStore } from '../stores';
import { formatDistance, formatTime } from '../services/location';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../constants/theme';

export default function ContactScreen() {
  const router = useRouter();
  const { selectedOffer, diagnosticResult, reset } = useSOSStore();

  if (!selectedOffer) {
    router.replace('/');
    return null;
  }

  const mecanicien = selectedOffer.mecanicien || { prenom: 'Mécanicien', nom: '', phone: '+22890000000' };

  const handleWhatsApp = async () => {
    const phone = mecanicien.whatsapp || mecanicien.phone || '22890000000';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${mecanicien.prenom}, je vous contacte via SOS Méca pour ${diagnosticResult?.symptome || 'une panne'}.`
    );
    const url = `whatsapp://send?phone=${cleanPhone}&text=${message}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp non disponible', "WhatsApp n'est pas installé sur votre téléphone.");
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ouvrir WhatsApp");
    }
  };

  const handleCall = async () => {
    const phone = mecanicien.phone || '+22890000000';
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de passer l'appel");
    }
  };

  const handleFinish = () => {
    reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successHeader}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Mécanicien trouvé !</Text>
        <Text style={styles.successSubtitle}>Contactez-le pour organiser l'intervention</Text>
      </View>

      <View style={styles.mechanicCard}>
        <View style={styles.mechanicPhoto}>
          <Text style={styles.mechanicPhotoText}>
            {mecanicien.prenom?.[0]}
            {mecanicien.nom?.[0]}
          </Text>
        </View>
        <Text style={styles.mechanicName}>
          {mecanicien.prenom} {mecanicien.nom}
        </Text>
        <Text style={styles.mechanicMeta}>
          ⭐ {mecanicien.note?.toFixed(1) || '0.0'} • {mecanicien.nombreAvis || 0} avis
        </Text>

        <View style={styles.mechanicDetails}>
          <Text style={styles.detailText}>📍 À {formatDistance(selectedOffer.distance)} de vous</Text>
          <Text style={styles.detailText}>⏱️ Arrivée estimée : ~{formatTime(selectedOffer.tempsEstime)}</Text>
        </View>
      </View>

      <View style={styles.contactButtons}>
        <Button title="💬 Contacter sur WhatsApp" onPress={handleWhatsApp} size="lg" style={styles.whatsappButton} />
        <Button title="📞 Appeler directement" onPress={handleCall} variant="outline" size="lg" />
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Conseils</Text>
        <Text style={styles.tipsText}>
          • Décrivez précisément votre problème{'\n'}• Confirmez le tarif avant l'intervention{'\n'}• Le paiement se
          fait directement au mécanicien
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title="Terminer" onPress={handleFinish} variant="ghost" size="md" />
      </View>

      <Text style={styles.disclaimer}>
        SOS Méca met en relation automobilistes et mécaniciens. Le contrat d'intervention est conclu directement entre
        vous et le mécanicien.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.success + '10',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.success,
  },
  successSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  mechanicCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  mechanicPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mechanicPhotoText: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  mechanicName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  mechanicMeta: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  mechanicDetails: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    width: '100%',
  },
  detailText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  contactButtons: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  tipsContainer: {
    margin: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
  },
  tipsTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
