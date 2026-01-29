import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Demander la permission et obtenir le token
export async function registerForPushNotifications(): Promise<string | null> {
  let token = null;

  // Vérifier si c'est un appareil physique
  if (!Device.isDevice) {
    console.log('Les notifications push nécessitent un appareil physique');
    return null;
  }

  // Vérifier les permissions existantes
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Demander la permission si pas encore accordée
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission de notification refusée');
    return null;
  }

  // Obtenir le token Expo Push
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'sos-meca', // Ton project ID Expo
    });
    token = tokenData.data;
    console.log('Push token:', token);
  } catch (error) {
    console.error('Erreur obtention token:', error);
  }

  // Configuration spécifique Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B00',
    });

    // Canal pour les demandes urgentes
    await Notifications.setNotificationChannelAsync('urgences', {
      name: 'Demandes urgentes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: 'default',
    });
  }

  return token;
}

// Sauvegarder le token dans Firebase pour un mécanicien
export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'mecaniciens', userId), {
      pushToken: token,
      pushTokenUpdatedAt: new Date(),
    });
    console.log('Token sauvegardé pour', userId);
  } catch (error) {
    console.error('Erreur sauvegarde token:', error);
  }
}

// Envoyer une notification locale (pour les tests)
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Immédiat
  });
}

// Envoyer une notification pour une nouvelle demande
export async function notifyNewDemande(
  symptome: string,
  distance: number,
  demandeId: string
): Promise<void> {
  await sendLocalNotification(
    '🚨 Nouvelle demande !',
    `${symptome} à ${distance.toFixed(1)} km de vous`,
    { type: 'new_demande', demandeId }
  );
}

// Envoyer une notification quand une offre est acceptée
export async function notifyOffreAcceptee(
  automobilisteName: string
): Promise<void> {
  await sendLocalNotification(
    '✅ Offre acceptée !',
    `${automobilisteName} a accepté votre offre. Contactez-le maintenant.`,
    { type: 'offre_acceptee' }
  );
}

// Écouter les notifications reçues
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Écouter les interactions avec les notifications
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Obtenir le nombre de badges
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Définir le nombre de badges
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Effacer tous les badges
export async function clearBadges(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
