import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DivergenceResult, DivergencePoint, SentimentType, RiskLevel } from '@/types';
import { sentimentLabel, sentimentBgClass, riskLabel } from '@/utils/sentiment';
import Tag from '@/components/common/Tag';
import { cn } from '@/lib/utils';

interface DivergencePanelProps {
  divergence: DivergenceResult | null;
}

const levelConfig = {
  critical: {
    icon: AlertTriangle,
    tagVariant: 'severe' as const,
    label: '重大分歧',
    colorClass: 'border-red-200 bg-red-50/50',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    tagVariant: 'warning' as const,
    label: '警告',
    colorClass: 'border-orange-200 bg-orange-50/50',
    iconColor: 'text-orange-500',
  },
  notice: {
    icon: Info,
    tagVariant: 'info' as const,
    label: '提示',
    colorClass: 'border-blue-200 bg-blue-50/50',
    iconColor: 'text-blue-500',
  },
};

const fieldLabels: Record<DivergencePoint['field'], string> = {
  sentiment: '倾向判定',
  riskLevel: '风险等级',
  reason: '判断理由',
};

function formatValue(field: DivergencePoint['field'], value: any): React.ReactNode {
  if (field === 'sentiment') {
    const v = value as SentimentType;
    return (
      <Tag variant={
        v === 'positive' ? 'positive' :
        v === 'negative' ? 'negative' :
        v === 'severe_negative' ? 'severe' : 'neutral'
      }>
        {sentimentLabel[v]}
      </Tag>
    );
  }
  if (field === 'riskLevel') {
    const v = value as RiskLevel;
    return (
      <Tag variant={
        v >= 4 ? 'severe' : v >= 3 ? 'warning' : 'positive'
      }>
        {v}级 · {riskLabel(v)}
      </Tag>
    );
  }
  return (
    <span className="text-xs text-slate-600 leading-relaxed line-clamp-2">
      {value}
    </span>
  );
}

export default function DivergencePanel({ divergence }: DivergencePanelProps) {
  if (!divergence || !divergence.hasDivergence) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-emerald-800">标注一致</div>
            <div className="text-sm text-emerald-600">{divergence?.summary || '两位分析师标注结果完全一致，无需裁定'}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const criticalCount = divergence.points.filter((p) => p.level === 'critical').length;
  const warningCount = divergence.points.filter((p) => p.level === 'warning').length;
  const noticeCount = divergence.points.filter((p) => p.level === 'notice').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-violet-50 to-white border border-violet-200 rounded-lg p-4 mb-4 animate-pulse-divergence"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-violet-900 text-base">
            ⚠️ 检测到{divergence.points.length}处分歧
          </h3>
          <p className="text-sm text-violet-700 mt-0.5">
            {divergence.summary}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {criticalCount > 0 && (
              <Tag variant="severe" size="sm">{criticalCount}处重大</Tag>
            )}
            {warningCount > 0 && (
              <Tag variant="warning" size="sm">{warningCount}处警告</Tag>
            )}
            {noticeCount > 0 && (
              <Tag variant="info" size="sm">{noticeCount}处提示</Tag>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {divergence.points.map((point, idx) => {
          const config = levelConfig[point.level];
          const LevelIcon = config.icon;

          return (
            <motion.div
              key={`${point.field}-${idx}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'rounded-lg border p-3.5',
                config.colorClass
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <LevelIcon className={cn('w-4 h-4', config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {fieldLabels[point.field]}
                    </span>
                    <Tag variant={config.tagVariant} size="sm">
                      {config.label}
                    </Tag>
                  </div>

                  <div className="bg-white/70 rounded-md p-2.5 border border-white">
                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 min-w-0 p-2 rounded bg-sky-50/80 border border-sky-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                            A
                          </span>
                          <span className="text-[11px] font-medium text-sky-700">分析师A</span>
                        </div>
                        <div className="min-h-[20px]">
                          {formatValue(point.field, point.valueA)}
                        </div>
                      </div>

                      <div className="flex items-center justify-center px-1">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>

                      <div className="flex-1 min-w-0 p-2 rounded bg-amber-50/80 border border-amber-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                            B
                          </span>
                          <span className="text-[11px] font-medium text-amber-700">分析师B</span>
                        </div>
                        <div className="min-h-[20px]">
                          {formatValue(point.field, point.valueB)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
