import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTaskStore from '@/store/useTaskStore';
import type { Article } from '@/types';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';

interface StatCardProps {
  title: string;
  value: number;
  percentage: number;
  colorClass: string;
  bgClass: string;
  textClass: string;
  articles: Article[];
  showPulse?: boolean;
  index: number;
}

function StatCard({
  title,
  value,
  percentage,
  colorClass,
  bgClass,
  textClass,
  articles,
  showPulse = false,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Card
        hover
        className={cn(
          'relative overflow-hidden p-5',
          showPulse && 'animate-pulse-divergence'
        )}
      >
        <div className={cn('absolute top-0 right-0 w-32 h-32 opacity-[0.04] rounded-full -translate-y-1/2 translate-x-1/2', bgClass)} />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className={cn('text-sm font-medium', textClass)}>{title}</h3>
                {showPulse && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-4 h-4 text-violet-500" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className={cn('text-3xl font-bold mb-3 tracking-tight', textClass)}>
            {value.toLocaleString()}
          </div>
          <ProgressBar value={percentage} colorClass={colorClass} size="sm" />
          <div className="mt-4 space-y-2">
            <p className="text-[11px] text-slate-400 font-medium">最近报道</p>
            <div className="space-y-1.5">
              {articles.slice(0, 3).map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 + 0.15 + i * 0.05 }}
                  className="text-xs text-slate-600 truncate cursor-pointer hover:text-brand-600 transition-colors py-1 border-l-2 border-transparent hover:border-brand-300 pl-2"
                  title={article.title}
                >
                  {article.title}
                </motion.div>
              ))}
              {articles.length === 0 && (
                <p className="text-xs text-slate-400 italic">暂无记录</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function StatsDashboard() {
  const { articles, getStats } = useTaskStore();
  const stats = getStats();
  const total = articles.length;

  const categorized = useMemo(() => {
    const groups: Record<string, Article[]> = {
      pending: [],
      annotating: [],
      divergent: [],
      completed: [],
    };
    articles.forEach((a) => {
      groups[a.status].push(a);
    });
    return groups;
  }, [articles]);

  const cards: Omit<StatCardProps, 'index'>[] = [
    {
      title: '待分配',
      value: stats.pending,
      percentage: total ? Math.round((stats.pending / total) * 100) : 0,
      colorClass: 'bg-slate-500',
      bgClass: 'bg-slate-500',
      textClass: 'text-slate-600',
      articles: categorized.pending,
    },
    {
      title: '标注中',
      value: stats.annotating,
      percentage: total ? Math.round((stats.annotating / total) * 100) : 0,
      colorClass: 'bg-brand-500',
      bgClass: 'bg-brand-500',
      textClass: 'text-brand-700',
      articles: categorized.annotating,
    },
    {
      title: '分歧待裁定',
      value: stats.divergent,
      percentage: total ? Math.round((stats.divergent / total) * 100) : 0,
      colorClass: 'bg-violet-500',
      bgClass: 'bg-violet-500',
      textClass: 'text-violet-700',
      articles: categorized.divergent,
      showPulse: true,
    },
    {
      title: '已完成',
      value: stats.completed,
      percentage: total ? Math.round((stats.completed / total) * 100) : 0,
      colorClass: 'bg-emerald-500',
      bgClass: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      articles: categorized.completed,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <StatCard key={card.title} {...card} index={idx} />
      ))}
    </div>
  );
}
