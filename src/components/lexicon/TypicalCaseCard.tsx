import { User, Calendar, Archive, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';
import Tag from '@/components/common/Tag';
import { sentimentLabel, sentimentBgClass, riskLabel, mediaPropertyLabel } from '@/utils/sentiment';
import { formatDate } from '@/utils/date';
import type { TypicalCase } from '@/types';

interface CaseCardProps {
  item: TypicalCase;
  index: number;
}

function SingleCaseCard({ item, index }: CaseCardProps) {
  const { setSelectedCaseId } = useLexiconStore();
  const risk = item.ruling.finalRiskLevel;
  const sentiment = item.ruling.finalSentiment;

  const rotateDeg =
    index % 3 === 0
      ? -(Math.random() * 0.8 + 0.2).toFixed(2)
      : index % 3 === 1
      ? 0
      : (Math.random() * 0.8 + 0.2).toFixed(2);

  const riskTagVariant =
    risk === 1
      ? 'positive'
      : risk === 2
      ? 'neutral'
      : risk === 3
      ? 'warning'
      : risk === 4
      ? 'negative'
      : 'severe';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, rotate: Number(rotateDeg) * 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{
        rotate: 0,
        y: -6,
        scale: 1.01,
        transition: { duration: 0.25 },
      }}
      style={{ transform: `rotate(${rotateDeg}deg)` }}
      onClick={() => setSelectedCaseId(item.id)}
      className="group relative bg-white rounded-xl shadow-card hover:shadow-card-hover cursor-pointer overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all duration-300"
    >
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors text-[15px]">
            {item.articleSnapshot.title}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Tag
            variant={sentiment === 'positive' ? 'positive' : sentiment === 'neutral' ? 'neutral' : sentiment === 'negative' ? 'negative' : 'severe'}
            size="sm"
          >
            {sentimentLabel[sentiment]}
          </Tag>
          <Tag variant={riskTagVariant} size="sm">
            {riskLabel(risk)}
          </Tag>
          <Tag variant="info" size="sm">
            {mediaPropertyLabel[item.articleSnapshot.mediaProperty]}
          </Tag>
          <span className="text-xs text-slate-400 ml-auto">
            {item.articleSnapshot.mediaName}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.slice(0, 4).map((tag, tIdx) => (
            <span
              key={tIdx}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-400">
              +{item.tags.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Gavel className="w-3.5 h-3.5 text-violet-500" />
            <span>
              裁定{' '}
              <span className="font-medium text-slate-700">
                {item.ruling.decision === 'accept_a'
                  ? '采信A'
                  : item.ruling.decision === 'accept_b'
                  ? '采信B'
                  : '重新标注'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <User className="w-3.5 h-3.5" />
            <span>高级分析师</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <Archive className="w-3 h-3" />
          <span>
            归档于
            <Calendar className="w-3 h-3 ml-1.5 mr-1 inline" />
            {formatDate(item.archivedAt)}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'h-2 w-full transition-all duration-300 group-hover:h-2.5',
          `sentiment-gradient-${risk}`
        )}
      />
    </motion.div>
  );
}

export default function TypicalCaseCard() {
  const { getFilteredCases } = useLexiconStore();
  const cases = getFilteredCases();

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Archive className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-lg font-medium">暂无匹配的典型案例</p>
        <p className="text-sm mt-1">请调整筛选条件或搜索关键词</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">典型案例库</h3>
          <p className="text-sm text-slate-500 mt-1">
            共 {cases.length} 个典型案例，从历史裁定中精选用于教学参考
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-stagger"
        style={{
          ['--stagger-base-delay' as any]: '0ms',
          ['--stagger-step-delay' as any]: '60ms',
        }}
      >
        {cases.map((item, idx) => (
          <SingleCaseCard key={item.id} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}
