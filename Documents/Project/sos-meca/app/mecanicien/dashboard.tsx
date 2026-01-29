import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { onDemandesEnAttente, DemandeAssistance, updateMecanicienDisponibilite, getUserProfile, MecanicienProfile, logout } from '../../services/api';
import { auth } from '../../services/firebase';
import { formatDistance, calculateDistance, estimateTime } from '../../services/location';
import { 
  registerForPushNotifications, 
  savePushToken, 
  addNotificationReceivedListener,
  addNotificationResponseListener,
  notifyNewDemande,
  clearBadges
} from '../../services/notifications';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export default function MecanicienDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<MecanicienProfile | null>(null);
  const [disponible, setDisponible] = useState(true);
  const [demandes, setDemandes] = useState<DemandeAssistance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const previousDemandesCount = useRef(0);

  useEffect(() => {
    loadProfile();
    setupNotifications();
    clearBadges();

    // Écouter les notifications reçues
    const notifListener = addNotificationReceivedListener((notification) => {
      console.log('Notification reçue:', notification);
    });

    // Écouter les interactions avec les notifications
    const responseListener = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'new_demande') {
        // Naviguer vers les détails de la demande
        console.log('Ouvrir demande:', data.demandeId);
      }
    });

    return () => {
      notifListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onDemandesEnAttente((newDemandes) => {
      if (profile) {
        const demandesProches = newDemandes.filter((d) => {
          const distance = calculateDistance(profile.latitude, profile.longitude, d.latitude, d.longitude);
          return distance <= profile.rayon;
        });
        
        // Notifier si nouvelles demandes
        if (demandesProches.length > previousDemandesCount.current && previousDemandesCount.current > 0) {
          const newDemande = demandesProches[0];
          const distance = calculateDistance(profile.latitude, profile.longitude, newDemande.latitude, newDemande.longitude);
          notifyNewDemande(newDemande.diagnostic.symptome, distance, newDemande.id || '');
        }
        
        previousDemandesCount.current = demandesProches.length;
        setDemandes(demandesProches);
      } else {
        setDemandes(newDemandes);
      }
    });
    return () => unsubscribe();
  }, [profile]);

  const setupNotifications = async () => {
    const token = await registerForPushNotifications();
    if (token) {
      setNotificationsEnabled(true);
      const user = auth.currentUser;
      if (user) {
        await savePushToken(user.uid, token);
      }
    }
  };

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const p = await getUserProfile(user.uid);
      if (p && p.type === 'mecanicien') {
        setProfile(p as MecanicienProfile);
        setDisponible((p as MecanicienProfile).disponible);
      }
    } else {
      // Pas connecté, rediriger vers login
      router.replace('/auth/login-mecanicien');
    }
  };

  const handleToggleDisponible = async (value: boolean) => {
    setDisponible(value);
    const user = auth.currentUser;
    if (user) {
      await updateMecanicienDisponibilite(user.uid, value);
      if (value) {
        Alert.alert('En ligne', 'Vous recevrez les demandes à proximité');
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const getDistanceFromDemande = (demande: DemandeAssistance): number => {
    if (!profile) return 0;
    return calculateDistance(profile.latitude, profile.longitude, demande.latitude, demande.longitude);
  };

  const handleVoirDemande = (demande: DemandeAssistance) => {
    const distance = getDistanceFromDemande(demande);
    const temps = estimateTime(distance);
    
    Alert.alert(
      `${demande.diagnostic.symptome}`,
      `${demande.diagnostic.sousCategorie}\n\n📍 Distance: ${formatDistance(distance)}\n⏱️ Temps estimé: ~${temps} min\n\nVoulez-vous proposer votre aide ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Proposer mon aide',
          onPress: () => {
            Alert.alert('✅ Offre envoyée', "L'automobiliste a été notifié de votre proposition.");
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {profile?.prenom || 'Mécanicien'} 👋</Text>
          <Text style={styles.subtitle}>
            {disponible ? '🟢 En ligne' : '🔴 Hors ligne'}
            {notificationsEnabled ? ' • 🔔 Notifs actives' : ''}
          </Text>
        </View>
        <View style={styles.disponibleToggle}>
          <Text style={styles.disponibleLabel}>Disponible</Text>
          <Switch
            value={disponible}
            onValueChange={handleToggleDisponible}
            trackColor={{ false: Colors.gray[300], true: Colors.success + '50' }}
            thumbColor={disponible ? Colors.success : Colors.gray[400]}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{demandes.length}</Text>
          <Text style={styles.statLabel}>Demandes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.note?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Note</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.nombreAvis || 0}</Text>
          <Text style={styles.statLabel}>Avis</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>
          {disponible ? `Demandes à proximité (${profile?.rayon || 15} km)` : 'Activez votre disponibilité'}
        </Text>

        {!disponible ? (
          <View style={styles.emptyMessage}>
            <Text style={styles.emptyIcon}>🔴</Text>
            <Text style={styles.emptyText}>Vous êtes hors ligne</Text>
            <Text style={styles.emptySubtext}>Activez votre disponibilité pour recevoir des demandes</Text>
          </View>
        ) : demandes.length === 0 ? (
          <View style={styles.emptyMessage}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyText}>Aucune demande</Text>
            <Text style={styles.emptySubtext}>Les nouvelles demandes apparaîtront ici en temps réel</Text>
          </View>
        ) : (
          demandes.map((demande) => {
            const distance = getDistanceFromDemande(demande);
            const temps = estimateTime(distance);
            const isUrgent = demande.diagnostic.gravite === 'serieux';
            
            return (
              <TouchableOpacity 
                key={demande.id} 
                style={[styles.demandeCard, isUrgent && styles.demandeCardUrgent]}
                onPress={() => handleVoirDemande(demande)}
                activeOpacity={0.8}
              >
                <View style={styles.demandeHeader}>
                  <Text style={[
                    styles.graviteText, 
                    demande.diagnostic.gravite === 'serieux' && styles.graviteSerieux,
                    demande.diagnostic.gravite === 'moyen' && styles.graviteMoyen
                  ]}>
                    {demande.diagnostic.gravite === 'serieux' ? '🔴 URGENT' : 
                     demande.diagnostic.gravite === 'moyen' ? '🟠 MOYEN' : '🟢 MINEUR'}
                  </Text>
                  <Text style={styles.demandeTime}>À l'instant</Text>
                </View>
                
                <Text style={styles.demandeSymptome}>{demande.diagnostic.symptome}</Text>
                <Text style={styles.demandeSousCategorie}>{demande.diagnostic.sousCategorie}</Text>
                
                <View style={styles.demandeFooter}>
                  <Text style={styles.demandeDistance}>📍 {formatDistance(distance)}</Text>
                  <Text style={styles.demandeTemps}>⏱️ ~{temps} min</Text>
                </View>
                
                <Button 
                  title="Voir et proposer" 
                  onPress={() => handleVoirDemande(demande)} 
                  size="md" 
                  style={{ marginTop: Spacing.md }} 
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Se déconnecter" onPress={handleLogout} variant="ghost" size="md" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, ...Shadows.sm },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  disponibleToggle: { alignItems: 'center' },
  disponibleLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', ...Shadows.sm },
  statNumber: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginVertical: Spacing.md },
  emptyMessage: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.text, textAlign: 'center', fontWeight: '600' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
  demandeCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md },
  demandeCardUrgent: { borderLeftWidth: 4, borderLeftColor: Colors.error },
  demandeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  demandeTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  graviteText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.success },
  graviteSerieux: { color: Colors.error },
  graviteMoyen: { color: Colors.warning },
  demandeSymptome: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  demandeSousCategorie: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },
  demandeFooter: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md },
  demandeDistance: { fontSize: FontSize.md, color: Colors.text },
  demandeTemps: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '500' },
  footer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray[200], alignItems: 'center' },
});
