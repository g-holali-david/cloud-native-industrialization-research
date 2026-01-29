export interface DiagnosticOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: DiagnosticOption[];
  nextQuestionMap?: Record<string, string>;
}

export interface DiagnosticResult {
  symptome: string;
  sousCategorie: string;
  gravite: 'mineur' | 'moyen' | 'serieux';
  conseil?: string;
  tutoriel?: {
    titre: string;
    etapes: string[];
    avertissement?: string;
  };
  besoinMecanicien: boolean;
}

export const QUESTIONS_MAP: Record<string, DiagnosticQuestion> = {
  mobilite: {
    id: 'mobilite',
    question: 'Votre véhicule peut-il encore rouler ?',
    options: [
      { id: 'oui', label: 'Oui, il roule', icon: '✅' },
      { id: 'non', label: 'Non, immobilisé', icon: '🚫' },
      { id: 'inconnu', label: 'Je ne sais pas', icon: '❓' },
    ],
    nextQuestionMap: { oui: 'symptome', non: 'symptome', inconnu: 'symptome' },
  },
  symptome: {
    id: 'symptome',
    question: 'Que se passe-t-il ?',
    options: [
      { id: 'batterie', label: 'Batterie / Démarrage', icon: '🔋', description: 'Ne démarre pas' },
      { id: 'surchauffe', label: 'Surchauffe moteur', icon: '🌡️', description: 'Voyant rouge, fumée' },
      { id: 'pneu', label: 'Pneu crevé', icon: '💨', description: 'Pneu à plat' },
      { id: 'bruit', label: 'Bruit anormal', icon: '🔧', description: 'Claquement, grincement' },
      { id: 'carburant', label: 'Panne de carburant', icon: '⛽', description: 'Réservoir vide' },
      { id: 'voyant', label: 'Voyant allumé', icon: '🚨', description: 'Témoin au tableau' },
      { id: 'autre', label: 'Autre problème', icon: '❓', description: 'Autre' },
    ],
    nextQuestionMap: {
      batterie: 'batterie_detail',
      surchauffe: 'result_surchauffe',
      pneu: 'pneu_detail',
      bruit: 'result_bruit',
      carburant: 'result_carburant',
      voyant: 'voyant_detail',
      autre: 'result_autre',
    },
  },
  batterie_detail: {
    id: 'batterie_detail',
    question: 'Que se passe-t-il quand vous tournez la clé ?',
    options: [
      { id: 'rien', label: 'Rien du tout', icon: '⚫' },
      { id: 'cliquetis', label: 'Cliquetis', icon: '🔊' },
      { id: 'tourne', label: 'Moteur tourne', icon: '🔄' },
      { id: 'cale', label: 'Démarre puis cale', icon: '💨' },
    ],
  },
  pneu_detail: {
    id: 'pneu_detail',
    question: 'Avez-vous une roue de secours ?',
    options: [
      { id: 'oui_sait', label: 'Oui et je sais changer', icon: '✅' },
      { id: 'oui_sait_pas', label: 'Oui mais je ne sais pas', icon: '🤔' },
      { id: 'non', label: 'Non', icon: '❌' },
    ],
  },
  voyant_detail: {
    id: 'voyant_detail',
    question: 'De quelle couleur est le voyant ?',
    options: [
      { id: 'rouge', label: 'Rouge', icon: '🔴' },
      { id: 'orange', label: 'Orange', icon: '🟠' },
      { id: 'autre', label: 'Autre', icon: '⚪' },
    ],
  },
};

export const DIAGNOSTIC_RESULTS: Record<string, DiagnosticResult> = {
  batterie_rien: {
    symptome: 'Batterie',
    sousCategorie: 'Batterie déchargée',
    gravite: 'moyen',
    conseil: 'Batterie probablement déchargée.',
    tutoriel: {
      titre: 'Démarrage avec câbles',
      etapes: [
        'Trouvez un véhicule avec batterie chargée',
        'Connectez câble rouge (+) aux deux batteries',
        'Connectez câble noir (-) aux deux batteries',
        "Démarrez l'autre véhicule",
        'Essayez de démarrer votre véhicule',
      ],
      avertissement: 'Ne touchez jamais les pinces entre elles',
    },
    besoinMecanicien: false,
  },
  batterie_cliquetis: {
    symptome: 'Batterie',
    sousCategorie: 'Batterie faible',
    gravite: 'mineur',
    conseil: 'Batterie faible, démarrage avec câbles possible.',
    besoinMecanicien: false,
  },
  batterie_tourne: {
    symptome: 'Démarrage',
    sousCategorie: 'Problème alimentation',
    gravite: 'serieux',
    conseil: "Problème d'alimentation ou d'allumage.",
    besoinMecanicien: true,
  },
  batterie_cale: {
    symptome: 'Démarrage',
    sousCategorie: 'Problème capteur',
    gravite: 'serieux',
    conseil: 'Possible problème de capteur.',
    besoinMecanicien: true,
  },
  pneu_oui_sait: {
    symptome: 'Pneu',
    sousCategorie: 'Pneu crevé',
    gravite: 'mineur',
    conseil: 'Vous pouvez changer la roue.',
    tutoriel: {
      titre: 'Changement de roue',
      etapes: [
        'Garez-vous sur terrain plat',
        'Serrez le frein à main',
        'Desserrez les boulons',
        'Placez le cric',
        'Levez le véhicule',
        'Retirez et remplacez la roue',
        'Serrez les boulons en croix',
      ],
      avertissement: 'Max 80 km/h avec roue de secours',
    },
    besoinMecanicien: false,
  },
  pneu_oui_sait_pas: {
    symptome: 'Pneu',
    sousCategorie: "Besoin d'aide",
    gravite: 'mineur',
    conseil: 'Un mécanicien peut vous aider rapidement.',
    besoinMecanicien: true,
  },
  pneu_non: {
    symptome: 'Pneu',
    sousCategorie: 'Pas de roue de secours',
    gravite: 'serieux',
    conseil: "Vous avez besoin d'un dépanneur.",
    besoinMecanicien: true,
  },
  result_surchauffe: {
    symptome: 'Surchauffe',
    sousCategorie: 'Moteur en surchauffe',
    gravite: 'serieux',
    conseil: 'STOP ! Ne roulez plus. Attendez que le moteur refroidisse.',
    besoinMecanicien: true,
  },
  result_carburant: {
    symptome: 'Carburant',
    sousCategorie: 'Panne sèche',
    gravite: 'mineur',
    conseil: 'Panne de carburant.',
    besoinMecanicien: false,
  },
  result_bruit: {
    symptome: 'Bruit',
    sousCategorie: 'Bruit anormal',
    gravite: 'moyen',
    conseil: 'À faire vérifier par un mécanicien.',
    besoinMecanicien: true,
  },
  voyant_rouge: {
    symptome: 'Voyant',
    sousCategorie: 'Voyant rouge',
    gravite: 'serieux',
    conseil: 'Arrêtez-vous dès que possible.',
    besoinMecanicien: true,
  },
  voyant_orange: {
    symptome: 'Voyant',
    sousCategorie: 'Voyant orange',
    gravite: 'moyen',
    conseil: 'À vérifier, vous pouvez continuer prudemment.',
    besoinMecanicien: false,
  },
  voyant_autre: {
    symptome: 'Voyant',
    sousCategorie: 'Autre voyant',
    gravite: 'mineur',
    conseil: 'Probablement informatif.',
    besoinMecanicien: false,
  },
  result_autre: {
    symptome: 'Autre',
    sousCategorie: 'Problème non identifié',
    gravite: 'moyen',
    conseil: 'Décrivez votre problème au mécanicien.',
    besoinMecanicien: true,
  },
};

export function getDiagnosticResult(answers: Record<string, string>): DiagnosticResult {
  const symptome = answers['symptome'];
  const detail = answers[`${symptome}_detail`];

  let resultKey = detail ? `${symptome}_${detail}` : `result_${symptome}`;

  return DIAGNOSTIC_RESULTS[resultKey] || DIAGNOSTIC_RESULTS['result_autre'];
}
