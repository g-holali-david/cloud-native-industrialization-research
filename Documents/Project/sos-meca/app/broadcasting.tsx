import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { useSOSStore } from '../stores';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { formatDistance, formatTime, estimateTime, calculateDistance } from '../services/location';
import { getMecaniciensDisponibles, createDemande, MecanicienProfile } from '../services/api';

export default function BroadcastingScreen() {
  const router = useRouter();
  const { 
    offers, 
    setOffers, 
    selectOffer, 
    diagnosticResult, 
    location, 
    address,
    setStep, 
    setDemandeId,
    reset 
  } = useSOSStore();
  
  const [isSearching, setIsSearching] = useState(true);
  const [mecaniciens, setMecaniciens] = useState<(MecanicienProfile & { distance: number })[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de pulsation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Créer la demande et chercher les mécaniciens
    searchMecaniciens();

    return () => {
      pulse.stop();
    };
  }, []);

  const searchMecaniciens = async () => {
    try {
      // 1. Créer la demande dans Firebase
      if (location && diagnosticResult) {
        const demandeResult = await createDemande({
          automobilisteId: 'user_anonymous', // Pour l'instant, pas d'auth côté automobiliste
          automobiliste: {
            prenom: 'Automobiliste',
            nom: '',
            phone: '',
          },
          status: 'en_attente',
          diagnostic: {
            symptome: diagnosticResult.symptome,
            sousCategorie: diagnosticResult.sousCategorie,
            gravite: diagnosticResult.gravite,
          },
          latitude: location.latitude,
          longitude: location.longitude,
          adresse: address || undefined,
        });

        if (demandeResult.success && demandeResult.demandeId) {
          setDemandeId(demandeResult.demandeId);
        }
      }

      // 2. Récupérer les mécaniciens disponibles
      const allMecaniciens = await getMecaniciensDisponibles();
      
      // 3. Calculer la distance et filtrer
      if (location) {
        const mecaniciensAvecDistance = allMecaniciens
          .map((mec) => ({
            ...mec,
            distance: calculateDistance(
              location.latitude,
              location.longitude,
              mec.latitude,
              mec.longitude
            ),
          }))
          .filter((mec) => mec.distance <= mec.rayon) // Dans leur rayon d'intervention
          .sort((a, b) => a.distance - b.distance);

        setMecaniciens(mecaniciensAvecDistance);

        // 4. Simuler des offres après 3 secondes (pour la démo)
        setTimeout(() => {
          const simulatedOffers = mecaniciensAvecDistance.slice(0, 3).map((mec) => ({
            id: `offer_${mec.id}`,
            demandeId: 'demo',
            mecanicienId: mec.id,
            mecanicien: {
              prenom: mec.prenom,
              nom: mec.nom,
              phone: mec.phone,
              whatsapp: mec.whatsapp,
              note: mec.note,
              nombreAvis: mec.nombreAvis,
              specialites: mec.specialites,
            },
            distance: mec.distance,
            tempsEstime: estimateTime(mec.distance),
            message: `Je peux intervenir rapidement pour votre ${diagnosticResult?.symptome || 'problème'}.`,
            status: 'envoyee' as const,
          }));

          setOffers(simulatedOffers);
          setIsSearching(false);
        }, 3000);
      } else {
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Erreur recherche mécaniciens:', error);
      Alert.alert('Erreur', 'Impossible de rechercher des mécaniciens');
      setIsSearching(false);
    }
  };

  const handleAcceptOffer = (offer: any) => {
    selectOffer(offer);
    setStep('connected');
    router.push('/contact');
  };

  const handleCancel = () => {
    reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isSearching ? 'Recherche en cours...' : `${offers.length} mécanicien(s) disponible(s)`}</Text>
        {diagnosticResult && <Text style={styles.subtitle}>{diagnosticResult.symptome} - {diagnosticResult.sousCategorie}</Text>}
      </View>

      {isSearching ? (
        <View style={styles.searchingContainer}>
          <Animated.View style={[styles.searchingCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.searchingIcon}>📡</Text>
          </Animated.View>
          <Text style={styles.searchingText}>Envoi de votre demande aux mécaniciens à proximité...</Text>
          <Text style={styles.searchingSubtext}>Veuillez patienter quelques secondes</Text>
        </View>
      ) : offers.length > 0 ? (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id || `offer-${Math.random()}`}
          renderItem={({ item }) => (
            <View style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View style={styles.offerPhoto}>
                  <Text style={styles.offerPhotoText}>
                    {item.mecanicien?.prenom?.[0]}{item.mecanicien?.nom?.[0]}
                  </Text>
                </View>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerName}>
                    {item.mecanicien?.prenom} {item.mecanicien?.nom}
                  </Text>
                  <View style={styles.offerRating}>
                    <Text style={styles.offerRatingText}>
                      ⭐ {item.mecanicien?.note?.toFixed(1)} ({item.mecanicien?.nombreAvis} avis)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.offerDetails}>
                <View style={styles.offerDetailItem}>
                  <Text style={styles.offerDetailIcon}>📍</Text>
                  <Text style={styles.offerDetailText}>{formatDistance(item.distance)}</Text>
                </View>
                <View style={styles.offerDetailItem}>
                  <Text style={styles.offerDetailIcon}>⏱️</Text>
                  <Text style={styles.offerDetailText}>~{formatTime(item.tempsEstime)}</Text>
                </View>
              </View>

              <View style={styles.offerSpecialites}>
                {item.mecanicien?.specialites?.slice(0, 3).map((spec: string, idx: number) => (
                  <View key={idx} style={styles.specialiteBadge}>
                    <Text style={styles.specialiteText}>{spec}</Text>
                  </View>
                ))}
              </View>

              {item.message && (
                <View style={styles.offerMessage}>
                  <Text style={styles.offerMessageText}>💬 "{item.message}"</Text>
                </View>
              )}

              <Button 
                title="Contacter ce mécanicien" 
                onPress={() => handleAcceptOffer(item)} 
                size="md" 
                style={{ marginTop: Spacing.md }} 
              />
            </View>
          )}
          contentContainerStyle={styles.offersList}
        />
      ) : (
        <View style={styles.noOffersContainer}>
          <Text style={styles.noOffersIcon}>😔</Text>
          <Text style={styles.noOffersText}>Aucun mécanicien disponible</Text>
          <Text style={styles.noOffersSubtext}>
            Aucun mécanicien n'est disponible dans votre zone pour le moment.{'\n'}
            Réessayez dans quelques minutes.
          </Text>
          <Button 
            title="Réessayer" 
            onPress={searchMecaniciens} 
            variant="outline" 
            size="md" 
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Button title="Annuler la demande" onPress={handleCancel} variant="ghost" size="md" />
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
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  searchingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  searchingIcon: {
    fontSize: 48,
  },
  searchingText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  searchingSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  offersList: {
    padding: Spacing.lg,
  },
  offerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  offerPhotoText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.lg,
  },
  offerInfo: {
    flex: 1,
  },
  offerName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  offerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  offerRatingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  offerDetails: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  offerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerDetailIcon: {
    fontSize: FontSize.md,
    marginRight: Spacing.xs,
  },
  offerDetailText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  offerSpecialites: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  specialiteBadge: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  specialiteText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  offerMessage: {
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  offerMessageText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontStyle: 'italic',
  },
  noOffersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  noOffersIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  noOffersText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  noOffersSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: 'center',
  },
});
