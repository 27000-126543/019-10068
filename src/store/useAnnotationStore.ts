import { create } from 'zustand';
import type { Annotation, Ruling } from '@/types';
import { annotations, rulings } from '@/data/mockData';
import useTaskStore from './useTaskStore';

interface AnnotationState {
  annotations: Annotation[];
  rulings: Ruling[];
  getAnnotationsByArticle: (articleId: string) => { a?: Annotation; b?: Annotation };
  saveAnnotation: (annotation: Annotation) => void;
  saveRuling: (ruling: Ruling, articleId: string) => void;
}

const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [...annotations],
  rulings: [...rulings],

  getAnnotationsByArticle: (articleId: string) => {
    const state = get();
    const articleAnns = state.annotations.filter((a) => a.articleId === articleId);
    const article = useTaskStore.getState().articles.find((a) => a.id === articleId);
    const result: { a?: Annotation; b?: Annotation } = {};
    if (article) {
      if (article.assigneeA) {
        result.a = articleAnns.find((ann) => ann.userId === article.assigneeA);
      }
      if (article.assigneeB) {
        result.b = articleAnns.find((ann) => ann.userId === article.assigneeB);
      }
    }
    return result;
  },

  saveAnnotation: (annotation: Annotation) => {
    set((state) => {
      const exists = state.annotations.findIndex((a) => a.id === annotation.id);
      if (exists >= 0) {
        const updated = [...state.annotations];
        updated[exists] = annotation;
        return { annotations: updated };
      }
      return { annotations: [...state.annotations, annotation] };
    });
  },

  saveRuling: (ruling: Ruling, articleId: string) => {
    set((state) => {
      const exists = state.rulings.findIndex((r) => r.id === ruling.id);
      const updatedRulings = [...state.rulings];
      if (exists >= 0) {
        updatedRulings[exists] = ruling;
      } else {
        updatedRulings.push(ruling);
      }
      return { rulings: updatedRulings };
    });
    useTaskStore.getState().updateArticleStatus(articleId, 'completed');
  },
}));

export default useAnnotationStore;
