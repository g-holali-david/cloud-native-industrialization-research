import { create } from 'zustand';
import { Coordinates } from '../services/location';
import { DiagnosticResult } from '../services/diagnosis';
import { OffreIntervention } from '../services/api';

interface SOSState {
  step: 'idle' | 'diagnostic' | 'location' | 'broadcasting' | 'offers' | 'connected';
  diagnosticAnswers: Record<string, string>;
  diagnosticResult: DiagnosticResult | null;
  location: Coordinates | null;
  address: string | null;
  offers: OffreIntervention[];
  selectedOffer: OffreIntervention | null;
  demandeId: string | null;

  setStep: (step: SOSState['step']) => void;
  setDiagnosticAnswer: (questionId: string, answerId: string) => void;
  setDiagnosticResult: (result: DiagnosticResult) => void;
  setLocation: (location: Coordinates, address?: string) => void;
  setDemandeId: (id: string) => void;
  addOffer: (offer: OffreIntervention) => void;
  setOffers: (offers: OffreIntervention[]) => void;
  selectOffer: (offer: OffreIntervention | null) => void;
  reset: () => void;
}

const initialState = {
  step: 'idle' as const,
  diagnosticAnswers: {},
  diagnosticResult: null,
  location: null,
  address: null,
  offers: [],
  selectedOffer: null,
  demandeId: null,
};

export const useSOSStore = create<SOSState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setDiagnosticAnswer: (questionId, answerId) =>
    set((state) => ({
      diagnosticAnswers: { ...state.diagnosticAnswers, [questionId]: answerId },
    })),
  setDiagnosticResult: (diagnosticResult) => set({ diagnosticResult }),
  setLocation: (location, address) => set({ location, address }),
  setDemandeId: (demandeId) => set({ demandeId }),
  addOffer: (offer) => set((state) => ({ offers: [...state.offers, offer] })),
  setOffers: (offers) => set({ offers }),
  selectOffer: (selectedOffer) => set({ selectedOffer }),
  reset: () => set(initialState),
}));

// Store pour l'utilisateur connecté
interface UserState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null }),
}));
