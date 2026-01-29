import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Coordinates, calculateDistance } from './location';

// ============================================
// AUTHENTIFICATION
// ============================================

export async function registerWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  type: 'automobiliste' | 'mecanicien';
  prenom: string;
  nom: string;
  phone: string;
  createdAt: any;
}

export interface MecanicienProfile extends UserProfile {
  type: 'mecanicien';
  specialites: string[];
  latitude: number;
  longitude: number;
  rayon: number;
  disponible: boolean;
  note: number;
  nombreAvis: number;
  whatsapp?: string;
  description?: string;
}

export interface DemandeAssistance {
  id?: string;
  automobilisteId: string;
  automobiliste: {
    prenom: string;
    nom: string;
    phone: string;
  };
  status: 'en_attente' | 'offres_recues' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
  diagnostic: {
    symptome: string;
    sousCategorie: string;
    gravite: 'mineur' | 'moyen' | 'serieux';
  };
  latitude: number;
  longitude: number;
  adresse?: string;
  createdAt?: any;
}

export interface OffreIntervention {
  id?: string;
  demandeId: string;
  mecanicienId: string;
  mecanicien: {
    prenom: string;
    nom: string;
    phone: string;
    whatsapp?: string;
    note: number;
    nombreAvis: number;
    specialites: string[];
  };
  distance: number;
  tempsEstime: number;
  tarifMin?: number;
  tarifMax?: number;
  message?: string;
  status: 'envoyee' | 'acceptee' | 'refusee';
  createdAt?: any;
}

// ============================================
// PROFILS
// ============================================

export async function createMecanicienProfile(
  userId: string,
  data: Omit<MecanicienProfile, 'id' | 'createdAt' | 'note' | 'nombreAvis'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profileData = {
      ...data,
      note: 0,
      nombreAvis: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', userId), profileData);
    await setDoc(doc(db, 'mecaniciens', userId), profileData);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | MecanicienProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile | MecanicienProfile;
    }
    return null;
  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    return null;
  }
}

export async function updateMecanicienDisponibilite(
  userId: string,
  disponible: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'users', userId), { disponible });
    await updateDoc(doc(db, 'mecaniciens', userId), { disponible });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// DEMANDES
// ============================================

export async function createDemande(
  data: Omit<DemandeAssistance, 'id' | 'createdAt'>
): Promise<{ success: boolean; demandeId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'demandes'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true, demandeId: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function onDemandesEnAttente(callback: (demandes: DemandeAssistance[]) => void) {
  const q = query(collection(db, 'demandes'), where('status', '==', 'en_attente'));
  return onSnapshot(q, (snapshot) => {
    const demandes: DemandeAssistance[] = [];
    snapshot.forEach((doc) => {
      demandes.push({ id: doc.id, ...doc.data() } as DemandeAssistance);
    });
    callback(demandes);
  });
}

export async function updateDemandeStatus(
  demandeId: string,
  status: DemandeAssistance['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'demandes', demandeId), { status });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// OFFRES
// ============================================

export async function envoyerOffre(
  data: Omit<OffreIntervention, 'id' | 'createdAt'>
): Promise<{ success: boolean; offreId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'offres'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await updateDemandeStatus(data.demandeId, 'offres_recues');
    return { success: true, offreId: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function onOffresForDemande(demandeId: string, callback: (offres: OffreIntervention[]) => void) {
  const q = query(collection(db, 'offres'), where('demandeId', '==', demandeId));
  return onSnapshot(q, (snapshot) => {
    const offres: OffreIntervention[] = [];
    snapshot.forEach((doc) => {
      offres.push({ id: doc.id, ...doc.data() } as OffreIntervention);
    });
    offres.sort((a, b) => a.distance - b.distance);
    callback(offres);
  });
}

export async function accepterOffre(offreId: string, demandeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'offres', offreId), { status: 'acceptee' });
    await updateDemandeStatus(demandeId, 'acceptee');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// RECHERCHE
// ============================================

export async function getMecaniciensDisponibles(): Promise<MecanicienProfile[]> {
  try {
    const q = query(collection(db, 'mecaniciens'), where('disponible', '==', true));
    const snapshot = await getDocs(q);
    const mecaniciens: MecanicienProfile[] = [];
    snapshot.forEach((doc) => {
      mecaniciens.push({ id: doc.id, ...doc.data() } as MecanicienProfile);
    });
    return mecaniciens;
  } catch (error) {
    console.error('Erreur getMecaniciensDisponibles:', error);
    return [];
  }
}

export function filterMecaniciensByDistance(
  mecaniciens: MecanicienProfile[],
  userLocation: Coordinates,
  maxDistance: number = 20
): (MecanicienProfile & { distance: number })[] {
  return mecaniciens
    .map((mec) => ({
      ...mec,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, mec.latitude, mec.longitude),
    }))
    .filter((mec) => mec.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}
