import { create } from 'zustand';
import type { Article, Client, Event, TaskStatus } from '@/types';
import { articles as mockArticles, clients as mockClients, events as mockEvents } from '@/data/mockData';

const STORAGE_KEY = 'opinion-workbench-tasks';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

interface CreateTaskPayload {
  clientName: string;
  clientIndustry: string;
  eventName: string;
  eventTags: string[];
  startTime: string;
  endTime: string;
  articlesData: Array<{
    title: string;
    content: string;
    mediaName: string;
    mediaProperty: Article['mediaProperty'];
    publishTime: string;
    repostCount: number;
    keywords: string[];
  }>;
}

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
  createTask: (payload: CreateTaskPayload) => void;
}

function persist(state: { articles: Article[]; clients: Client[]; events: Event[] }) {
  saveToStorage(STORAGE_KEY, state);
}

const initialData = loadFromStorage<{
  articles: Article[];
  clients: Client[];
  events: Event[];
}>(STORAGE_KEY, {
  articles: [...mockArticles],
  clients: [...mockClients],
  events: [...mockEvents],
});

const useTaskStore = create<TaskState>((set, get) => ({
  articles: initialData.articles,
  clients: initialData.clients,
  events: initialData.events,
  selectedClientId: initialData.clients[0]?.id ?? null,
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
    _note?: string,
  ) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = {
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
        clients: state.clients,
        events: state.events,
      };
      persist(updated);
      return { articles: updated.articles };
    });
  },

  getFilteredArticles: () => {
    const state = get();
    return state.articles.filter((a) => {
      if (state.selectedClientId && a.clientId !== state.selectedClientId) return false;
      if (state.selectedEventIds.length > 0 && !state.selectedEventIds.includes(a.eventId))
        return false;
      if (state.statusFilter !== 'all' && a.status !== state.statusFilter) return false;
      if (state.dateRange.start) {
        const articleDate = a.publishTime.slice(0, 10);
        if (articleDate < state.dateRange.start) return false;
      }
      if (state.dateRange.end) {
        const articleDate = a.publishTime.slice(0, 10);
        if (articleDate > state.dateRange.end) return false;
      }
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
    set((state) => {
      const updated = {
        articles: state.articles.map((a) =>
          a.id === articleId ? { ...a, status } : a,
        ),
        clients: state.clients,
        events: state.events,
      };
      persist(updated);
      return { articles: updated.articles };
    });
  },

  createTask: (payload: CreateTaskPayload) => {
    const clientId = `c_${Date.now()}`;
    const eventId = `e_${Date.now()}`;
    const newClient: Client = {
      id: clientId,
      name: payload.clientName,
      industry: payload.clientIndustry,
    };
    const newEvent: Event = {
      id: eventId,
      clientId,
      name: payload.eventName,
      tags: payload.eventTags,
      startTime: payload.startTime,
      endTime: payload.endTime,
    };
    const newArticles: Article[] = payload.articlesData.map((ad, i) => ({
      id: `a_${Date.now()}_${i}`,
      eventId,
      clientId,
      title: ad.title,
      content: ad.content,
      mediaName: ad.mediaName,
      mediaProperty: ad.mediaProperty,
      publishTime: ad.publishTime,
      repostCount: ad.repostCount,
      repostRelations: [],
      historyArticles: [],
      keywords: ad.keywords,
      status: 'pending' as TaskStatus,
    }));

    set((state) => {
      const updated = {
        articles: [...newArticles, ...state.articles],
        clients: [...state.clients, newClient],
        events: [...state.events, newEvent],
      };
      persist(updated);
      return {
        articles: updated.articles,
        clients: updated.clients,
        events: updated.events,
        selectedClientId: clientId,
        selectedEventIds: [eventId],
        dateRange: { start: payload.startTime.slice(0, 10), end: payload.endTime.slice(0, 10) },
      };
    });
  },
}));

export default useTaskStore;
