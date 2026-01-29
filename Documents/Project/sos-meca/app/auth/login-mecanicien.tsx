import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { loginWithEmail } from '../../services/api';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function LoginMecanicienScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    const result = await loginWithEmail(email, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/mecanicien/dashboard');
    } else {
      Alert.alert('Erreur', result.error || 'Identifiants incorrects');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Connexion Mécanicien</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemple.com"
            placeholderTextColor={Colors.gray[400]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Votre mot de passe"
            placeholderTextColor={Colors.gray[400]}
            secureTextEntry
          />
        </View>

        <Button
          title={isLoading ? 'Connexion...' : 'Se connecter'}
          onPress={handleLogin}
          size="lg"
          disabled={isLoading}
          style={{ width: '100%', marginTop: Spacing.lg }}
        />

        <TouchableOpacity onPress={() => router.push('/auth/register-mecanicien')} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Pas encore inscrit ? <Text style={styles.registerTextBold}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
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
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '500', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray[300], borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  registerLink: { marginTop: Spacing.xl, alignItems: 'center' },
  registerText: { fontSize: FontSize.md, color: Colors.textSecondary },
  registerTextBold: { color: Colors.primary, fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
});
