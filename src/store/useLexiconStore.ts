import { create } from 'zustand';
import type {
  InterpretationRule,
  MediaSourceProfile,
  TypicalCase,
  SentimentType,
  RiskLevel,
  MediaProperty,
} from '@/types';
import { rules, mediaProfiles, typicalCases } from '@/data/mockData';

type LexiconTab = 'cases' | 'rules' | 'sources';

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
  setFilterSentiment: (s: SentimentType | 'all') => void;
  setFilterRisk: (r: RiskLevel | 'all') => void;
  setFilterMediaProperty: (m: MediaProperty | 'all') => void;
  setSearchKeyword: (k: string) => void;
  toggleActiveTab: (tab: LexiconTab) => void;
  setSelectedCaseId: (id: string | null) => void;
  addRule: (
    rule: Omit<InterpretationRule, 'id' | 'addedAt' | 'usageCount'>,
  ) => void;
  getFilteredCases: () => TypicalCase[];
  getFilteredRules: () => InterpretationRule[];
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
}));

export default useLexiconStore;
