/**
 * Script de gestion des données de test pour SOS Méca
 * 
 * Usage:
 *   node scripts/seed.js seed      # Ajouter les données de test
 *   node scripts/seed.js clear     # Supprimer les données de test
 *   node scripts/seed.js reset     # Clear + Seed
 *   node scripts/seed.js list      # Lister les mécaniciens
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  query,
  where 
} = require('firebase/firestore');

// Configuration Firebase (même que dans l'app)
const firebaseConfig = {
  apiKey: "AIzaSyABHQ1Ron_lJeYseFk0FAjfDlU9W9QU4c4",
  authDomain: "sos-meca.firebaseapp.com",
  projectId: "sos-meca",
  storageBucket: "sos-meca.firebasestorage.app",
  messagingSenderId: "701181851933",
  appId: "1:701181851933:web:30888e850442f34ad689f4"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// DONNÉES DE TEST
// ============================================

const TEST_MECANICIENS = [
  {
    id: 'meca_test_1',
    prenom: 'Kofi',
    nom: 'Mensah',
    email: 'kofi@test.com',
    phone: '+22890123456',
    whatsapp: '+22890123456',
    type: 'mecanicien',
    specialites: ['Moteur', 'Batterie', 'Freins'],
    description: '10 ans d\'expérience, spécialiste Toyota et Peugeot',
    latitude: 6.1725,
    longitude: 1.2314,
    rayon: 15,
    disponible: true,
    note: 4.5,
    nombreAvis: 23,
    isTestData: true,
    createdAt: new Date(),
  },
  {
    id: 'meca_test_2',
    prenom: 'Yao',
    nom: 'Kouassi',
    email: 'yao@test.com',
    phone: '+22891234567',
    whatsapp: '+22891234567',
    type: 'mecanicien',
    specialites: ['Pneus', 'Suspension', 'Électricité'],
    description: 'Dépannage rapide 24h/24, intervention à domicile',
    latitude: 6.1650,
    longitude: 1.2250,
    rayon: 20,
    disponible: true,
    note: 4.8,
    nombreAvis: 45,
    isTestData: true,
    createdAt: new Date(),
  },
  {
    id: 'meca_test_3',
    prenom: 'Ama',
    nom: 'Dodji',
    email: 'ama@test.com',
    phone: '+22892345678',
    whatsapp: '+22892345678',
    type: 'mecanicien',
    specialites: ['Climatisation', 'Vidange', 'Embrayage'],
    description: 'Garage moderne, toutes marques automobiles',
    latitude: 6.1800,
    longitude: 1.2400,
    rayon: 10,
    disponible: true,
    note: 4.2,
    nombreAvis: 12,
    isTestData: true,
    createdAt: new Date(),
  },
  {
    id: 'meca_test_4',
    prenom: 'Kwame',
    nom: 'Asante',
    email: 'kwame@test.com',
    phone: '+22893456789',
    whatsapp: '+22893456789',
    type: 'mecanicien',
    specialites: ['Moteur', 'Carrosserie', 'Peinture'],
    description: 'Expert carrosserie et réparations moteur',
    latitude: 6.1550,
    longitude: 1.2150,
    rayon: 25,
    disponible: false, // Celui-ci est hors ligne pour tester
    note: 4.6,
    nombreAvis: 31,
    isTestData: true,
    createdAt: new Date(),
  },
  {
    id: 'meca_test_5',
    prenom: 'Adjoa',
    nom: 'Mensah',
    email: 'adjoa@test.com',
    phone: '+22894567890',
    whatsapp: '+22894567890',
    type: 'mecanicien',
    specialites: ['Électricité', 'Diagnostic', 'Batterie'],
    description: 'Spécialiste électricité auto et diagnostic électronique',
    latitude: 6.1900,
    longitude: 1.2500,
    rayon: 12,
    disponible: true,
    note: 4.9,
    nombreAvis: 67,
    isTestData: true,
    createdAt: new Date(),
  },
];

const TEST_DEMANDES = [
  {
    id: 'demande_test_1',
    automobilisteId: 'user_test_1',
    automobiliste: {
      prenom: 'Jean',
      nom: 'Dupont',
      phone: '+22895000001',
    },
    status: 'en_attente',
    diagnostic: {
      symptome: 'Batterie',
      sousCategorie: 'Batterie déchargée',
      gravite: 'moyen',
    },
    latitude: 6.1700,
    longitude: 1.2300,
    adresse: 'Boulevard du 13 Janvier, Lomé',
    isTestData: true,
    createdAt: new Date(),
  },
  {
    id: 'demande_test_2',
    automobilisteId: 'user_test_2',
    automobiliste: {
      prenom: 'Marie',
      nom: 'Akouavi',
      phone: '+22895000002',
    },
    status: 'en_attente',
    diagnostic: {
      symptome: 'Pneu',
      sousCategorie: 'Pneu crevé',
      gravite: 'serieux',
    },
    latitude: 6.1780,
    longitude: 1.2350,
    adresse: 'Avenue de la Libération, Lomé',
    isTestData: true,
    createdAt: new Date(),
  },
];

// ============================================
// FONCTIONS
// ============================================

async function seedMecaniciens() {
  console.log('📝 Ajout des mécaniciens de test...\n');
  
  for (const meca of TEST_MECANICIENS) {
    const { id, ...data } = meca;
    try {
      // Ajouter dans la collection mecaniciens
      await setDoc(doc(db, 'mecaniciens', id), data);
      // Ajouter aussi dans users
      await setDoc(doc(db, 'users', id), data);
      
      const status = data.disponible ? '🟢' : '🔴';
      console.log(`  ${status} ${data.prenom} ${data.nom} (${id})`);
      console.log(`     📍 ${data.latitude}, ${data.longitude} | Rayon: ${data.rayon}km`);
      console.log(`     🔧 ${data.specialites.join(', ')}`);
      console.log(`     ⭐ ${data.note} (${data.nombreAvis} avis)\n`);
    } catch (error) {
      console.error(`  ❌ Erreur pour ${data.prenom}:`, error.message);
    }
  }
  
  console.log(`✅ ${TEST_MECANICIENS.length} mécaniciens ajoutés !`);
}

async function seedDemandes() {
  console.log('\n📝 Ajout des demandes de test...\n');
  
  for (const demande of TEST_DEMANDES) {
    const { id, ...data } = demande;
    try {
      await setDoc(doc(db, 'demandes', id), data);
      
      const graviteIcon = data.diagnostic.gravite === 'serieux' ? '🔴' : 
                          data.diagnostic.gravite === 'moyen' ? '🟠' : '🟢';
      console.log(`  ${graviteIcon} ${data.diagnostic.symptome} - ${data.automobiliste.prenom}`);
      console.log(`     📍 ${data.adresse}\n`);
    } catch (error) {
      console.error(`  ❌ Erreur:`, error.message);
    }
  }
  
  console.log(`✅ ${TEST_DEMANDES.length} demandes ajoutées !`);
}

async function clearTestData() {
  console.log('🗑️  Suppression des données de test...\n');
  
  // Supprimer les mécaniciens de test
  for (const meca of TEST_MECANICIENS) {
    try {
      await deleteDoc(doc(db, 'mecaniciens', meca.id));
      await deleteDoc(doc(db, 'users', meca.id));
      console.log(`  ✓ Supprimé: ${meca.prenom} ${meca.nom}`);
    } catch (error) {
      // Ignore si n'existe pas
    }
  }
  
  // Supprimer les demandes de test
  for (const demande of TEST_DEMANDES) {
    try {
      await deleteDoc(doc(db, 'demandes', demande.id));
      console.log(`  ✓ Supprimé: demande ${demande.id}`);
    } catch (error) {
      // Ignore si n'existe pas
    }
  }
  
  console.log('\n✅ Données de test supprimées !');
}

async function listMecaniciens() {
  console.log('📋 Liste des mécaniciens dans Firebase:\n');
  
  try {
    const snapshot = await getDocs(collection(db, 'mecaniciens'));
    
    if (snapshot.empty) {
      console.log('  (Aucun mécanicien trouvé)');
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.disponible ? '🟢' : '🔴';
      const testBadge = data.isTestData ? ' [TEST]' : '';
      
      console.log(`${status} ${data.prenom} ${data.nom}${testBadge}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   📍 ${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)} | Rayon: ${data.rayon}km`);
      console.log(`   🔧 ${data.specialites?.join(', ') || 'N/A'}`);
      console.log(`   ⭐ ${data.note || 0} (${data.nombreAvis || 0} avis)`);
      console.log(`   📞 ${data.phone}`);
      console.log('');
    });
    
    console.log(`Total: ${snapshot.size} mécanicien(s)`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function listDemandes() {
  console.log('\n📋 Liste des demandes dans Firebase:\n');
  
  try {
    const snapshot = await getDocs(collection(db, 'demandes'));
    
    if (snapshot.empty) {
      console.log('  (Aucune demande trouvée)');
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const graviteIcon = data.diagnostic?.gravite === 'serieux' ? '🔴' : 
                          data.diagnostic?.gravite === 'moyen' ? '🟠' : '🟢';
      const testBadge = data.isTestData ? ' [TEST]' : '';
      
      console.log(`${graviteIcon} ${data.diagnostic?.symptome}${testBadge}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Client: ${data.automobiliste?.prenom} ${data.automobiliste?.nom}`);
      console.log(`   📍 ${data.adresse || 'Adresse inconnue'}`);
      console.log('');
    });
    
    console.log(`Total: ${snapshot.size} demande(s)`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  const command = process.argv[2] || 'help';
  
  console.log('\n🔧 SOS Méca - Gestion des données de test\n');
  console.log('='.repeat(45) + '\n');
  
  switch (command) {
    case 'seed':
      await seedMecaniciens();
      await seedDemandes();
      break;
      
    case 'seed:meca':
      await seedMecaniciens();
      break;
      
    case 'seed:demandes':
      await seedDemandes();
      break;
      
    case 'clear':
      await clearTestData();
      break;
      
    case 'reset':
      await clearTestData();
      console.log('\n' + '-'.repeat(45) + '\n');
      await seedMecaniciens();
      await seedDemandes();
      break;
      
    case 'list':
      await listMecaniciens();
      await listDemandes();
      break;
      
    case 'list:meca':
      await listMecaniciens();
      break;
      
    case 'list:demandes':
      await listDemandes();
      break;
      
    default:
      console.log('📖 Commandes disponibles:\n');
      console.log('  node scripts/seed.js seed          Ajouter toutes les données de test');
      console.log('  node scripts/seed.js seed:meca     Ajouter seulement les mécaniciens');
      console.log('  node scripts/seed.js seed:demandes Ajouter seulement les demandes');
      console.log('  node scripts/seed.js clear         Supprimer les données de test');
      console.log('  node scripts/seed.js reset         Clear + Seed');
      console.log('  node scripts/seed.js list          Lister toutes les données');
      console.log('  node scripts/seed.js list:meca     Lister les mécaniciens');
      console.log('  node scripts/seed.js list:demandes Lister les demandes');
      break;
  }
  
  console.log('\n' + '='.repeat(45));
  console.log('✨ Terminé !\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
