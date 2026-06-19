import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import useTaskStore from '@/store/useTaskStore';
import useAuthStore from '@/store/useAuthStore';
import useAnnotationStore from '@/store/useAnnotationStore';
import { users } from '@/data/mockData';
import { detectDivergence } from '@/utils/divergence';
import { statusLabel, statusColorClass } from '@/utils/sentiment';
import type { Annotation, RulingDecision, SentimentType, RiskLevel } from '@/types';
import ArticleHeader from '@/components/review/ArticleHeader';
import ArticleBody from '@/components/review/ArticleBody';
import AnnotationForm from '@/components/review/AnnotationForm';
import DivergencePanel from '@/components/review/DivergencePanel';
import RulingBar from '@/components/review/RulingBar';
import Tag from '@/components/common/Tag';
import Button from '@/components/common/Button';

export default function DualReviewPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const articles = useTaskStore((s) => s.articles);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { getAnnotationsByArticle, saveAnnotation, saveRuling } = useAnnotationStore();

  const article = useMemo(
    () => articles.find((a) => a.id === articleId),
    [articles, articleId]
  );

  const annotations = useMemo(
    () => (articleId ? getAnnotationsByArticle(articleId) : {}),
    [articleId, getAnnotationsByArticle]
  );

  const divergence = useMemo(
    () => detectDivergence(annotations.a, annotations.b),
    [annotations.a, annotations.b]
  );

  const analystA = useMemo(
    () => users.find((u) => u.id === article?.assigneeA),
    [article?.assigneeA]
  );

  const analystB = useMemo(
    () => users.find((u) => u.id === article?.assigneeB),
    [article?.assigneeB]
  );

  const isSeniorAnalyst = currentUser?.role === 'senior_analyst';

  const handleSaveAnnotation = (
    analyst: 'A' | 'B',
    data: Omit<Annotation, 'id' | 'articleId' | 'userId' | 'annotatedAt'>
  ) => {
    if (!article || !currentUser) return;

    const userId = analyst === 'A' ? article.assigneeA : article.assigneeB;
    if (!userId) return;

    const existing = analyst === 'A' ? annotations.a : annotations.b;
    const annotation: Annotation = {
      id: existing?.id || `an-${article.id}-${userId}-${Date.now()}`,
      articleId: article.id,
      userId,
      annotatedAt: new Date().toISOString(),
      ...data,
    };
    saveAnnotation(annotation);
  };

  const handleRulingSubmit = (decision: RulingDecision, opinion: string) => {
    if (!article || !currentUser) return;

    const baseSentiment: SentimentType =
      decision === 'accept_a'
        ? annotations.a?.sentiment || 'neutral'
        : decision === 'accept_b'
        ? annotations.b?.sentiment || 'neutral'
        : 'neutral';

    const baseRisk: RiskLevel =
      decision === 'accept_a'
        ? annotations.a?.riskLevel || 3
        : decision === 'accept_b'
        ? annotations.b?.riskLevel || 3
        : 3;

    saveRuling(
      {
        id: `rl-${article.id}-${Date.now()}`,
        articleId: article.id,
        seniorAnalystId: currentUser.id,
        decision,
        opinion,
        finalSentiment: baseSentiment,
        finalRiskLevel: baseRisk,
        ruledAt: new Date().toISOString(),
        isTypicalCase: divergence?.hasDivergence || false,
        typicalReason: divergence?.summary,
      },
      article.id
    );
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-slate-500 mb-4">未找到对应的报道</p>
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const canEditA = !isSeniorAnalyst && currentUser?.id === article.assigneeA;
  const canEditB = !isSeniorAnalyst && currentUser?.id === article.assigneeB;
  const readOnlyA = !canEditA;
  const readOnlyB = !canEditB;

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">双人判读工作台</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              报道编号：{article.id}
            </p>
          </div>
        </div>
        <Tag
          className={statusColorClass[article.status]}
          size="md"
        >
          {statusLabel[article.status]}
        </Tag>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <ArticleHeader article={article} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        className="grid grid-cols-12 gap-4 mt-4"
        style={{ height: 'calc(100vh - 340px)', minHeight: '640px' }}
      >
        <div className="col-span-12 lg:col-span-3 flex flex-col min-h-0">
          <AnnotationForm
            analyst="A"
            user={analystA}
            existingAnnotation={annotations.a}
            onSave={(data) => handleSaveAnnotation('A', data)}
            readOnly={readOnlyA}
          />
        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col min-h-0">
          <ArticleBody article={article} />
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col min-h-0">
          <AnnotationForm
            analyst="B"
            user={analystB}
            existingAnnotation={annotations.b}
            onSave={(data) => handleSaveAnnotation('B', data)}
            readOnly={readOnlyB}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' }}
        className="mt-4"
      >
        <DivergencePanel divergence={divergence} />
      </motion.div>

      {isSeniorAnalyst && (
        <RulingBar
          onSubmit={handleRulingSubmit}
          disabled={!annotations.a || !annotations.b}
        />
      )}
    </div>
  );
}
