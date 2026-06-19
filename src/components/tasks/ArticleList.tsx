import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTaskStore from '@/store/useTaskStore';
import type { Article } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ArticleCard from './ArticleCard';
import EmptyState from '@/components/common/EmptyState';

interface ArticleListProps {
  onAssign?: (article?: Article) => void;
}

export default function ArticleList({ onAssign }: ArticleListProps) {
  const {
    getFilteredArticles,
    selectedArticleIds,
    toggleSelectArticle,
    selectAllFiltered,
    clearSelection,
  } = useTaskStore();

  const filtered = useMemo(() => getFilteredArticles(), [getFilteredArticles]);
  const allSelected = filtered.length > 0 && filtered.every((a) => selectedArticleIds.includes(a.id));
  const someSelected = selectedArticleIds.length > 0;

  function handleToggleAll() {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllFiltered();
    }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleAll}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
              allSelected
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <CheckSquare className="w-4 h-4" />
            <span>全选本页</span>
          </button>
          {someSelected && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-slate-500"
            >
              已选 <span className="font-semibold text-brand-600">{selectedArticleIds.length}</span> 条
            </motion.span>
          )}
        </div>
        <Button
          variant="divergence"
          size="md"
          disabled={!someSelected}
          onClick={() => onAssign?.()}
        >
          <Users className="w-4 h-4 mr-1.5" />
          批量分配
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 animate-stagger scrollbar-thin"
        style={{ animationDelay: `${0}ms` }}
      >
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState title="暂无符合筛选条件的报道" />
          </div>
        ) : (
          filtered.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index}
              onAssign={onAssign}
            />
          ))
        )}
      </div>
    </Card>
  );
}
