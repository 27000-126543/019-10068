import { create } from 'zustand';
import type { Article, Client, Event, TaskStatus } from '@/types';
import { articles, clients, events } from '@/data/mockData';

interface TaskState {
  articles: Article[];
  clients: Client[];
  events: Event[];
  selectedClientId: string | null;
  selectedEventIds: string[];
  statusFilter: TaskStatus | 'all';
  dateRange: { start: string; end: string };
  keyword: string;
  selectedArticleIds: string[];
  setSelectedClient: (id: string | null) => void;
  toggleEvent: (id: string) => void;
  setStatusFilter: (s: TaskStatus | 'all') => void;
  setDateRange: (r: { start: string; end: string }) => void;
  setKeyword: (k: string) => void;
  toggleSelectArticle: (id: string) => void;
  clearSelection: () => void;
  selectAllFiltered: () => void;
  assignArticles: (
    articleIds: string[],
    assigneeAId: string,
    assigneeBId: string,
    note?: string,
  ) => void;
  getFilteredArticles: () => Article[];
  getStats: () => { pending: number; annotating: number; divergent: number; completed: number };
  updateArticleStatus: (articleId: string, status: TaskStatus) => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  articles: [...articles],
  clients: [...clients],
  events: [...events],
  selectedClientId: clients[0]?.id ?? null,
  selectedEventIds: [],
  statusFilter: 'all',
  dateRange: { start: '', end: '' },
  keyword: '',
  selectedArticleIds: [],

  setSelectedClient: (id: string | null) => {
    set({ selectedClientId: id, selectedEventIds: [] });
  },

  toggleEvent: (id: string) => {
    set((state) => {
      const exists = state.selectedEventIds.includes(id);
      return {
        selectedEventIds: exists
          ? state.selectedEventIds.filter((eid) => eid !== id)
          : [...state.selectedEventIds, id],
      };
    });
  },

  setStatusFilter: (s: TaskStatus | 'all') => {
    set({ statusFilter: s });
  },

  setDateRange: (r: { start: string; end: string }) => {
    set({ dateRange: r });
  },

  setKeyword: (k: string) => {
    set({ keyword: k });
  },

  toggleSelectArticle: (id: string) => {
    set((state) => {
      const exists = state.selectedArticleIds.includes(id);
      return {
        selectedArticleIds: exists
          ? state.selectedArticleIds.filter((aid) => aid !== id)
          : [...state.selectedArticleIds, id],
      };
    });
  },

  clearSelection: () => {
    set({ selectedArticleIds: [] });
  },

  selectAllFiltered: () => {
    const filtered = get().getFilteredArticles();
    set({ selectedArticleIds: filtered.map((a) => a.id) });
  },

  assignArticles: (
    articleIds: string[],
    assigneeAId: string,
    assigneeBId: string,
    note?: string,
  ) => {
    const now = new Date().toISOString();
    set((state) => ({
      articles: state.articles.map((a) =>
        articleIds.includes(a.id)
          ? {
              ...a,
              status: 'annotating' as TaskStatus,
              assigneeA: assigneeAId,
              assigneeB: assigneeBId,
              assignedAt: now,
            }
          : a,
      ),
    }));
  },

  getFilteredArticles: () => {
    const state = get();
    return state.articles.filter((a) => {
      if (state.selectedClientId && a.clientId !== state.selectedClientId) return false;
      if (state.selectedEventIds.length > 0 && !state.selectedEventIds.includes(a.eventId))
        return false;
      if (state.statusFilter !== 'all' && a.status !== state.statusFilter) return false;
      if (state.dateRange.start && a.publishTime < state.dateRange.start) return false;
      if (state.dateRange.end && a.publishTime > state.dateRange.end) return false;
      if (state.keyword) {
        const kw = state.keyword.toLowerCase();
        const titleMatch = a.title.toLowerCase().includes(kw);
        const contentMatch = a.content.toLowerCase().includes(kw);
        const keywordMatch = a.keywords.some((k) => k.toLowerCase().includes(kw));
        if (!titleMatch && !contentMatch && !keywordMatch) return false;
      }
      return true;
    });
  },

  getStats: () => {
    const state = get();
    const stats = { pending: 0, annotating: 0, divergent: 0, completed: 0 };
    state.articles.forEach((a) => {
      stats[a.status]++;
    });
    return stats;
  },

  updateArticleStatus: (articleId: string, status: TaskStatus) => {
    set((state) => ({
      articles: state.articles.map((a) =>
        a.id === articleId ? { ...a, status } : a,
      ),
    }));
  },
}));

export default useTaskStore;
