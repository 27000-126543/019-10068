import { useState, useEffect } from 'react';
import { Save, User, ThumbsUp, Minus, ThumbsDown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Annotation, RiskLevel, SentimentType, User as UserType } from '@/types';
import { sentimentLabel, sentimentBgClass, riskLabel } from '@/utils/sentiment';
import { formatDateTime } from '@/utils/date';
import RadioGroup from '@/components/common/RadioGroup';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import { cn } from '@/lib/utils';

interface AnnotationFormProps {
  analyst: 'A' | 'B';
  user?: UserType;
  existingAnnotation?: Annotation;
  onSave?: (annotation: Omit<Annotation, 'id' | 'articleId' | 'userId' | 'annotatedAt'>) => void;
  readOnly?: boolean;
}

const QUICK_REASON_TAGS = [
  '产品质量问题', '品牌声誉受损', '股价下跌', '消费者投诉',
  '监管介入', '官方回应', '危机公关', '召回事件',
  '销量增长', '新品上市', '正面评价', '行业认可',
  '数据亮眼', '市场反应积极', '财务影响', '法律风险'
];

const sentimentOptions = [
  {
    value: 'positive',
    label: '正面',
    icon: ThumbsUp,
    color: 'text-emerald-600',
    bgActive: 'bg-emerald-50 border-emerald-500',
    bgDefault: 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50',
  },
  {
    value: 'neutral',
    label: '中性',
    icon: Minus,
    color: 'text-slate-600',
    bgActive: 'bg-slate-50 border-slate-500',
    bgDefault: 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50',
  },
  {
    value: 'negative',
    label: '负面',
    icon: ThumbsDown,
    color: 'text-orange-600',
    bgActive: 'bg-orange-50 border-orange-500',
    bgDefault: 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50',
  },
  {
    value: 'severe_negative',
    label: '严重负面',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgActive: 'bg-red-50 border-red-500',
    bgDefault: 'border-slate-200 hover:border-red-300 hover:bg-red-50/50',
  },
];

const riskLevelOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

const analystAccent: Record<'A' | 'B', { label: string; badge: string; border: string }> = {
  A: {
    label: 'A',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    border: 'border-l-sky-400',
  },
  B: {
    label: 'B',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    border: 'border-l-amber-400',
  },
};

export default function AnnotationForm({
  analyst,
  user,
  existingAnnotation,
  onSave,
  readOnly = false,
}: AnnotationFormProps) {
  const [sentiment, setSentiment] = useState<SentimentType>('neutral');
  const [reason, setReason] = useState('');
  const [reasonTags, setReasonTags] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(1);
  const [suggestion, setSuggestion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingAnnotation) {
      setSentiment(existingAnnotation.sentiment);
      setReason(existingAnnotation.reason);
      setReasonTags(existingAnnotation.reasonTags || []);
      setRiskLevel(existingAnnotation.riskLevel);
      setSuggestion(existingAnnotation.suggestion || '');
    }
  }, [existingAnnotation]);

  const handleQuickTagClick = (tag: string) => {
    if (readOnly) return;
    setReasonTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
    if (!reason.includes(tag)) {
      setReason((prev) => (prev ? `${prev}、${tag}` : tag));
    }
  };

  const handleSave = () => {
    if (readOnly || !onSave) return;
    setIsSaving(true);
    onSave({
      sentiment,
      reason,
      reasonTags,
      riskLevel,
      suggestion,
    });
    setTimeout(() => setIsSaving(false), 600);
  };

  const accent = analystAccent[analyst];
  const reasonWordCount = reason.replace(/[，。！？、；：\s]/g, '').length;
  const isReasonValid = reasonWordCount >= 50;

  return (
    <Card className={cn('flex flex-col h-full border-l-4', accent.border)}>
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
          )}
          <span
            className={cn(
              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold',
              accent.badge
            )}
          >
            {accent.label}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">
            {user?.name || `分析师${analyst}`}
          </div>
          {existingAnnotation?.annotatedAt && (
            <div className="text-xs text-slate-500">
              {formatDateTime(existingAnnotation.annotatedAt)}
            </div>
          )}
        </div>
        {!readOnly && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className={cn('w-4 h-4 mr-1.5', isSaving && 'animate-spin')} />
            保存
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2.5">
            倾向类别 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {sentimentOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = sentiment === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && setSentiment(opt.value as SentimentType)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200',
                    isActive ? opt.bgActive : opt.bgDefault,
                    readOnly && 'cursor-default',
                    !readOnly && !isActive && 'cursor-pointer'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? opt.color : 'text-slate-400')} />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isActive ? opt.color : 'text-slate-600'
                    )}
                  >
                    {opt.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId={`sentiment-check-${analyst}`}
                      className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-current"
                      style={{ color: isActive ? opt.color : 'transparent' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2.5">
            判断理由 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => !readOnly && setReason(e.target.value)}
            disabled={readOnly}
            rows={5}
            placeholder="请详细说明判断理由，至少50字以上"
            className={cn(
              'w-full px-3 py-2.5 text-sm rounded-lg border resize-none transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30',
              isReasonValid
                ? 'border-slate-200 focus:border-emerald-400'
                : 'border-slate-200 focus:border-brand-400',
              readOnly && 'bg-slate-50 text-slate-700'
            )}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span
              className={cn(
                'text-xs',
                isReasonValid ? 'text-emerald-600' : 'text-slate-400'
              )}
            >
              {reasonWordCount}/50 字
            </span>
            {reasonTags.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                {reasonTags.map((t) => (
                  <Tag key={t} size="sm" variant="divergence">
                    {t}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>

        {!readOnly && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              快捷标签（点击自动填入）
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASON_TAGS.map((tag) => {
                const isSelected = reasonTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className={cn(
                      'px-2 py-1 text-[11px] rounded-md border transition-all duration-150',
                      isSelected
                        ? 'bg-violet-50 text-violet-700 border-violet-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2.5">
            风险等级 <span className="text-red-500">*</span>
          </label>
          <div className="inline-flex bg-slate-100 p-1 rounded-lg w-full">
            {riskLevelOptions.map((opt) => {
              const isActive = String(riskLevel) === opt.value;
              const levelNum = Number(opt.value) as RiskLevel;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && setRiskLevel(levelNum)}
                  className={cn(
                    'flex-1 relative py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive ? 'text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
                    readOnly && 'cursor-default',
                    !readOnly && !isActive && 'cursor-pointer',
                    isActive && levelNum === 1 && 'bg-emerald-500',
                    isActive && levelNum === 2 && 'bg-teal-500',
                    isActive && levelNum === 3 && 'bg-amber-500',
                    isActive && levelNum === 4 && 'bg-orange-500',
                    isActive && levelNum === 5 && 'bg-red-500'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-slate-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                riskLevel === 1 && 'sentiment-gradient-1 w-[20%]',
                riskLevel === 2 && 'sentiment-gradient-2 w-[40%]',
                riskLevel === 3 && 'sentiment-gradient-3 w-[60%]',
                riskLevel === 4 && 'sentiment-gradient-4 w-[80%]',
                riskLevel === 5 && 'sentiment-gradient-5 w-[100%]'
              )}
            />
          </div>
          <div className="mt-1.5 text-center text-xs text-slate-500">
            {riskLabel(riskLevel)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2.5">
            建议摘要
          </label>
          <textarea
            value={suggestion}
            onChange={(e) => !readOnly && setSuggestion(e.target.value)}
            disabled={readOnly}
            rows={3}
            placeholder="给出简要建议"
            className={cn(
              'w-full px-3 py-2.5 text-sm rounded-lg border resize-none transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400',
              'border-slate-200',
              readOnly && 'bg-slate-50 text-slate-700'
            )}
          />
        </div>
      </div>
    </Card>
  );
}
