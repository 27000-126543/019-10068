import { create } from 'zustand';
import type {
  InterpretationRule,
  MediaSourceProfile,
  TypicalCase,
  SentimentType,
  RiskLevel,
  MediaProperty,
  Annotation,
} from '@/types';
import { rules, mediaProfiles, typicalCases } from '@/data/mockData';

type LexiconTab = 'cases' | 'rules' | 'sources' | 'training';

interface TrainingAnswer {
  caseId: string;
  sentiment: SentimentType;
  riskLevel: RiskLevel;
  reason: string;
  submittedAt: string;
}

interface TrainingSession {
  caseId: string;
  answer: TrainingAnswer | null;
  revealed: boolean;
}

interface LexiconState {
  rules: InterpretationRule[];
  mediaProfiles: MediaSourceProfile[];
  typicalCases: TypicalCase[];
  selectedCaseId: string | null;
  filterSentiment: SentimentType | 'all';
  filterRisk: RiskLevel | 'all';
  filterMediaProperty: MediaProperty | 'all';
  searchKeyword: string;
  activeTab: LexiconTab;
  trainingSession: TrainingSession | null;
  trainingHistory: TrainingAnswer[];
  setFilterSentiment: (s: SentimentType | 'all') => void;
  setFilterRisk: (r: RiskLevel | 'all') => void;
  setFilterMediaProperty: (m: MediaProperty | 'all') => void;
  setSearchKeyword: (k: string) => void;
  toggleActiveTab: (tab: LexiconTab) => void;
  setSelectedCaseId: (id: string | null) => void;
  addRule: (
    rule: Omit<InterpretationRule, 'id' | 'addedAt' | 'usageCount'>,
  ) => void;
  addTypicalCase: (tc: TypicalCase) => void;
  getFilteredCases: () => TypicalCase[];
  getFilteredRules: () => InterpretationRule[];
  startTraining: (caseId: string) => void;
  submitTrainingAnswer: (answer: Omit<TrainingAnswer, 'caseId' | 'submittedAt'>) => void;
  revealTraining: () => void;
  endTraining: () => void;
}

const useLexiconStore = create<LexiconState>((set, get) => ({
  rules: [...rules],
  mediaProfiles: [...mediaProfiles],
  typicalCases: [...typicalCases],
  selectedCaseId: null,
  filterSentiment: 'all',
  filterRisk: 'all',
  filterMediaProperty: 'all',
  searchKeyword: '',
  activeTab: 'cases',
  trainingSession: null,
  trainingHistory: [],

  setFilterSentiment: (s: SentimentType | 'all') => {
    set({ filterSentiment: s });
  },

  setFilterRisk: (r: RiskLevel | 'all') => {
    set({ filterRisk: r });
  },

  setFilterMediaProperty: (m: MediaProperty | 'all') => {
    set({ filterMediaProperty: m });
  },

  setSearchKeyword: (k: string) => {
    set({ searchKeyword: k });
  },

  toggleActiveTab: (tab: LexiconTab) => {
    set({ activeTab: tab });
  },

  setSelectedCaseId: (id: string | null) => {
    set({ selectedCaseId: id });
  },

  addRule: (
    rule: Omit<InterpretationRule, 'id' | 'addedAt' | 'usageCount'>,
  ) => {
    const newRule: InterpretationRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      addedAt: new Date().toISOString().slice(0, 10),
      usageCount: 0,
    };
    set((state) => ({ rules: [...state.rules, newRule] }));
  },

  addTypicalCase: (tc: TypicalCase) => {
    set((state) => ({ typicalCases: [tc, ...state.typicalCases] }));
  },

  getFilteredCases: () => {
    const state = get();
    return state.typicalCases.filter((tc) => {
      if (
        state.filterSentiment !== 'all' &&
        tc.ruling.finalSentiment !== state.filterSentiment
      )
        return false;
      if (state.filterRisk !== 'all' && tc.ruling.finalRiskLevel !== state.filterRisk)
        return false;
      if (
        state.filterMediaProperty !== 'all' &&
        tc.articleSnapshot.mediaProperty !== state.filterMediaProperty
      )
        return false;
      if (state.searchKeyword) {
        const kw = state.searchKeyword.toLowerCase();
        const titleMatch = tc.articleSnapshot.title.toLowerCase().includes(kw);
        const summaryMatch = tc.summary.toLowerCase().includes(kw);
        const tagMatch = tc.tags.some((t) => t.toLowerCase().includes(kw));
        if (!titleMatch && !summaryMatch && !tagMatch) return false;
      }
      return true;
    });
  },

  getFilteredRules: () => {
    const state = get();
    if (!state.searchKeyword) return state.rules;
    const kw = state.searchKeyword.toLowerCase();
    return state.rules.filter(
      (r) =>
        r.phrase.toLowerCase().includes(kw) ||
        r.description.toLowerCase().includes(kw),
    );
  },

  startTraining: (caseId: string) => {
    set({
      trainingSession: { caseId, answer: null, revealed: false },
    });
  },

  submitTrainingAnswer: (answer: Omit<TrainingAnswer, 'caseId' | 'submittedAt'>) => {
    set((state) => {
      if (!state.trainingSession) return state;
      const full: TrainingAnswer = {
        ...answer,
        caseId: state.trainingSession.caseId,
        submittedAt: new Date().toISOString(),
      };
      return {
        trainingSession: { ...state.trainingSession, answer: full },
        trainingHistory: [...state.trainingHistory, full],
      };
    });
  },

  revealTraining: () => {
    set((state) => {
      if (!state.trainingSession) return state;
      return { trainingSession: { ...state.trainingSession, revealed: true } };
    });
  },

  endTraining: () => {
    set({ trainingSession: null });
  },
}));

export default useLexiconStore;
