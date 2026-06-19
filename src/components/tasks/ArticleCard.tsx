import { motion } from 'framer-motion';
import { RefreshCw, UserRound, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTaskStore from '@/store/useTaskStore';
import { users } from '@/data/mockData';
import type { Article, MediaProperty, TaskStatus } from '@/types';
import { formatRelative } from '@/utils/date';
import Tag from '@/components/common/Tag';
import Button from '@/components/common/Button';

const mediaPropertyMap: Record<MediaProperty, { label: string; variant: 'neutral' | 'info' | 'warning' | 'severe' }> = {
  central: { label: '央媒', variant: 'info' },
  market: { label: '市场化', variant: 'neutral' },
  selfmedia: { label: '自媒体', variant: 'warning' },
  overseas: { label: '境外', variant: 'severe' },
};

const statusMap: Record<TaskStatus, { label: string; variant: 'neutral' | 'info' | 'divergence' | 'positive' }> = {
  pending: { label: '待分配', variant: 'neutral' },
  annotating: { label: '标注中', variant: 'info' },
  divergent: { label: '分歧待裁定', variant: 'divergence' },
  completed: { label: '已完成', variant: 'positive' },
};

interface ArticleCardProps {
  article: Article;
  index: number;
  onAssign?: (article: Article) => void;
}

export default function ArticleCard({ article, index, onAssign }: ArticleCardProps) {
  const { selectedArticleIds, toggleSelectArticle } = useTaskStore();
  const isSelected = selectedArticleIds.includes(article.id);

  const assigneeA = users.find((u) => u.id === article.assigneeA);
  const assigneeB = users.find((u) => u.id === article.assigneeB);

  const statusInfo = statusMap[article.status];
  const mediaPropInfo = mediaPropertyMap[article.mediaProperty];

  function getInitials(name: string): string {
    return name.slice(0, 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className="group relative"
    >
      <div
        onClick={() => toggleSelectArticle(article.id)}
        className={cn(
          'relative flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer overflow-hidden',
          isSelected
            ? 'border-brand-400 bg-brand-50/50 shadow-sm'
            : 'border-surface-border bg-white hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-200'
        )}
      >
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-0 bg-gradient-to-b from-indigo-500 to-indigo-600 transition-all duration-300 group-hover:w-2',
            isSelected && 'w-1'
          )}
        />

        <div className="pt-0.5 shrink-0 relative z-10" onClick={(e) => e.stopPropagation()}>
          <div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
              isSelected
                ? 'bg-brand-500 border-brand-500'
                : 'border-slate-300 bg-white hover:border-brand-400'
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 leading-snug">
              {article.title}
            </h4>
            {article.status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign?.(article);
                  }}
                >
                  <Button variant="primary" size="sm">
                    分配
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs text-slate-600 font-medium">{article.mediaName}</span>
            <Tag variant={mediaPropInfo.variant} size="sm">{mediaPropInfo.label}</Tag>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{formatRelative(article.publishTime)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{article.repostCount}</span>
              </div>
              <Tag variant={statusInfo.variant} size="sm">{statusInfo.label}</Tag>
            </div>

            <div className="flex items-center gap-2">
              {assigneeA || assigneeB ? (
                <div className="flex items-center -space-x-2">
                  {assigneeA && (
                    <motion.div
                      whileHover={{ zIndex: 10, scale: 1.05 }}
                      className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                      title={`分析师A：${assigneeA.name}`}
                    >
                      {getInitials(assigneeA.name)}
                    </motion.div>
                  )}
                  {assigneeB && (
                    <motion.div
                      whileHover={{ zIndex: 10, scale: 1.05 }}
                      className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                      title={`分析师B：${assigneeB.name}`}
                    >
                      {getInitials(assigneeB.name)}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px]">
                  <UserRound className="w-3 h-3" />
                  <span>待分配</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
