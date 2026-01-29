import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { registerWithEmail, createMecanicienProfile } from '../../services/api';
import { getCurrentLocation } from '../../services/location';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

const SPECIALITES_OPTIONS = [
  'Moteur',
  'Batterie',
  'Freins',
  'Pneus',
  'Électricité',
  'Climatisation',
  'Vidange',
  'Embrayage',
  'Suspension',
  'Carrosserie',
];

export default function RegisterMecanicienScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    description: '',
    specialites: [] as string[],
    latitude: 0,
    longitude: 0,
  });

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSpecialite = (spec: string) => {
    setForm((prev) => ({
      ...prev,
      specialites: prev.specialites.includes(spec)
        ? prev.specialites.filter((s) => s !== spec)
        : [...prev.specialites, spec],
    }));
  };

  const handleGetLocation = async () => {
    setIsLoading(true);
    const result = await getCurrentLocation();
    setIsLoading(false);

    if (result.success && result.coordinates) {
      updateForm('latitude', result.coordinates.latitude);
      updateForm('longitude', result.coordinates.longitude);
      Alert.alert('Position obtenue', 'Votre position a été enregistrée.');
    } else {
      Alert.alert('Erreur', result.error || "Impossible d'obtenir la position");
    }
  };

  const validateStep1 = () => {
    if (!form.prenom || !form.nom || !form.email || !form.password || !form.phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (form.specialites.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins une spécialité');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (form.latitude === 0 && form.longitude === 0) {
      Alert.alert('Erreur', 'Veuillez obtenir votre position');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    const authResult = await registerWithEmail(form.email, form.password);

    if (!authResult.success || !authResult.user) {
      setIsLoading(false);
      Alert.alert('Erreur', authResult.error || 'Impossible de créer le compte');
      return;
    }

    const profileResult = await createMecanicienProfile(authResult.user.uid, {
      email: form.email,
      type: 'mecanicien',
      prenom: form.prenom,
      nom: form.nom,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      description: form.description,
      specialites: form.specialites,
      latitude: form.latitude,
      longitude: form.longitude,
      rayon: 15,
      disponible: true,
    });

    setIsLoading(false);

    if (profileResult.success) {
      Alert.alert('Inscription réussie !', 'Bienvenue sur SOS Méca.', [
        { text: 'Continuer', onPress: () => router.replace('/mecanicien/dashboard') },
      ]);
    } else {
      Alert.alert('Erreur', profileResult.error || 'Impossible de créer le profil');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inscription Mécanicien</Text>
        <View style={styles.progress}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>
          Étape {step}/3 : {step === 1 ? 'Informations' : step === 2 ? 'Spécialités' : 'Localisation'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={form.prenom}
                onChangeText={(v) => updateForm('prenom', v)}
                placeholder="Votre prénom"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={form.nom}
                onChangeText={(v) => updateForm('nom', v)}
                placeholder="Votre nom"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
                placeholder="email@exemple.com"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(v) => updateForm('password', v)}
                placeholder="Minimum 6 caractères"
                placeholderTextColor={Colors.gray[400]}
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => updateForm('phone', v)}
                placeholder="+228 90 00 00 00"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp (si différent)</Text>
              <TextInput
                style={styles.input}
                value={form.whatsapp}
                onChangeText={(v) => updateForm('whatsapp', v)}
                placeholder="Même numéro si vide"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Sélectionnez vos spécialités</Text>
            <View style={styles.specialitesGrid}>
              {SPECIALITES_OPTIONS.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[styles.specialiteChip, form.specialites.includes(spec) && styles.specialiteChipActive]}
                  onPress={() => toggleSpecialite(spec)}
                >
                  <Text
                    style={[styles.specialiteText, form.specialites.includes(spec) && styles.specialiteTextActive]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(v) => updateForm('description', v)}
                placeholder="Présentez-vous..."
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Votre zone d'intervention</Text>
            <View style={styles.locationBox}>
              {form.latitude !== 0 ? (
                <>
                  <Text style={styles.locationSuccess}>✅ Position obtenue</Text>
                  <Text style={styles.locationCoords}>
                    {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                  </Text>
                </>
              ) : (
                <Text style={styles.locationEmpty}>Position non définie</Text>
              )}
            </View>
            <Button
              title={isLoading ? 'Recherche...' : '📍 Obtenir ma position'}
              onPress={handleGetLocation}
              variant="outline"
              size="lg"
              disabled={isLoading}
              style={{ marginBottom: Spacing.lg }}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <Button title="Continuer" onPress={handleNext} size="lg" style={{ width: '100%' }} />
        ) : (
          <Button
            title={isLoading ? 'Inscription...' : "Terminer l'inscription"}
            onPress={handleSubmit}
            size="lg"
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '500', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  progress: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  progressDot: { flex: 1, height: 4, backgroundColor: Colors.gray[200], borderRadius: 2 },
  progressDotActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  formSection: { paddingVertical: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray[300], borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  specialitesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  specialiteChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.gray[100], borderRadius: BorderRadius.full, borderWidth: 2, borderColor: Colors.gray[200] },
  specialiteChipActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  specialiteText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  specialiteTextActive: { color: Colors.primary },
  locationBox: { backgroundColor: Colors.gray[100], borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md },
  locationSuccess: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.success },
  locationCoords: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  locationEmpty: { fontSize: FontSize.md, color: Colors.textSecondary },
  footer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.gray[200] },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
});
