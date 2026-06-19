import type { SentimentType, RiskLevel, MediaProperty, TaskStatus } from '../types';

export const sentimentLabel: Record<SentimentType, string> = {
  positive: '正面',
  neutral: '中性',
  negative: '负面',
  severe_negative: '严重负面',
};

export const sentimentColor: Record<SentimentType, string> = {
  positive: 'text-emerald-600',
  neutral: 'text-slate-500',
  negative: 'text-orange-600',
  severe_negative: 'text-red-600',
};

export const sentimentBgClass: Record<SentimentType, string> = {
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  negative: 'bg-orange-50 text-orange-700 border-orange-200',
  severe_negative: 'bg-red-50 text-red-700 border-red-200',
};

export function riskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    1: '低风险',
    2: '较低风险',
    3: '中等风险',
    4: '较高风险',
    5: '高风险',
  };
  return labels[level];
}

export const mediaPropertyLabel: Record<MediaProperty, string> = {
  central: '央媒',
  market: '市场化媒体',
  selfmedia: '自媒体',
  overseas: '境外媒体',
};

export const statusLabel: Record<TaskStatus, string> = {
  pending: '待分配',
  annotating: '标注中',
  divergent: '分歧待裁定',
  completed: '已完成',
};

export const statusColorClass: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  annotating: 'bg-blue-100 text-blue-700',
  divergent: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};
