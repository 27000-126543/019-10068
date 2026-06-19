import { create } from 'zustand';
import type { Annotation, Ruling, TypicalCase } from '@/types';
import { annotations, rulings } from '@/data/mockData';
import useTaskStore from './useTaskStore';
import useLexiconStore from './useLexiconStore';

interface AnnotationState {
  annotations: Annotation[];
  rulings: Ruling[];
  getAnnotationsByArticle: (articleId: string) => { a?: Annotation; b?: Annotation };
  saveAnnotation: (annotation: Annotation) => void;
  saveRuling: (ruling: Ruling, articleId: string) => void;
  archiveToLexicon: (articleId: string, tags?: string[]) => void;
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

  archiveToLexicon: (articleId: string, tags?: string[]) => {
    const state = get();
    const article = useTaskStore.getState().articles.find((a) => a.id === articleId);
    if (!article) return;

    const anns = state.getAnnotationsByArticle(articleId);
    if (!anns.a || !anns.b) return;

    const ruling = state.rulings.find((r) => r.articleId === articleId);
    if (!ruling) return;

    const typicalCase: TypicalCase = {
      id: `tc_${Date.now()}`,
      articleSnapshot: { ...article },
      annotationA: { ...anns.a },
      annotationB: { ...anns.b },
      ruling: { ...ruling },
      tags: tags || [ruling.finalSentiment, `风险${ruling.finalRiskLevel}级`, article.mediaProperty],
      summary: ruling.typicalReason || ruling.opinion,
      archivedAt: new Date().toISOString(),
    };

    useLexiconStore.getState().addTypicalCase(typicalCase);
  },
}));

export default useAnnotationStore;
