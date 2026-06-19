import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, CheckCircle, XCircle, ArrowRight, Play } from 'lucide-react';
import useLexiconStore from '@/store/useLexiconStore';
import { sentimentLabel, sentimentColor, riskLabel } from '@/utils/sentiment';
import { formatDateTime } from '@/utils/date';
import Tag from '@/components/common/Tag';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import type { SentimentType, RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

const sentimentOptions: { value: SentimentType; label: string; color: string; bg: string; border: string }[] = [
  { value: 'positive', label: '正面', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  { value: 'neutral', label: '中性', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-300' },
  { value: 'negative', label: '负面', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' },
  { value: 'severe_negative', label: '严重负面', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
];

export default function TrainingView() {
  const {
    typicalCases,
    trainingSession,
    trainingHistory,
    startTraining,
    submitTrainingAnswer,
    revealTraining,
    endTraining,
  } = useLexiconStore();

  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | null>(null);
  const [reason, setReason] = useState('');

  const currentCase = trainingSession
    ? typicalCases.find((c) => c.id === trainingSession.caseId) ?? null
    : null;

  const handleSubmitAnswer = () => {
    if (!selectedSentiment || !selectedRisk) return;
    submitTrainingAnswer({ sentiment: selectedSentiment, riskLevel: selectedRisk, reason });
  };

  const handleContinueTraining = () => {
    endTraining();
    const randomIndex = Math.floor(Math.random() * typicalCases.length);
    startTraining(typicalCases[randomIndex].id);
    setSelectedSentiment(null);
    setSelectedRisk(null);
    setReason('');
  };

  const handleEndTraining = () => {
    endTraining();
    setSelectedSentiment(null);
    setSelectedRisk(null);
    setReason('');
  };

  if (!trainingSession) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900">口径训练</h2>
          </div>
          <p className="text-sm text-slate-500">
            选择一个典型案例进行独立判断训练，对比标准裁定提升判断一致性
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {typicalCases.map((tc) => (
            <Card key={tc.id} className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                {tc.articleSnapshot.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <Tag
                  variant={
                    tc.ruling.finalSentiment === 'positive'
                      ? 'positive'
                      : tc.ruling.finalSentiment === 'neutral'
                      ? 'neutral'
                      : tc.ruling.finalSentiment === 'negative'
                      ? 'negative'
                      : 'severe'
                  }
                  size="sm"
                >
                  {sentimentLabel[tc.ruling.finalSentiment]}
                </Tag>
                <Tag
                  variant={
                    tc.ruling.finalRiskLevel <= 2
                      ? 'positive'
                      : tc.ruling.finalRiskLevel === 3
                      ? 'warning'
                      : 'severe'
                  }
                  size="sm"
                >
                  {riskLabel(tc.ruling.finalRiskLevel)}
                </Tag>
                {tc.ruling.typicalReason && (
                  <Tag variant="info" size="sm">
                    {tc.ruling.typicalReason}
                  </Tag>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => startTraining(tc.id)}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                开始训练
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-slate-500">
          已完成 {trainingHistory.length} 次训练
        </div>
      </div>
    );
  }

  if (!trainingSession.answer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900">独立判断</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Tag variant="info" size="sm">
              {currentCase?.articleSnapshot.mediaName}
            </Tag>
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {currentCase?.articleSnapshot.title}
          </h3>
          <div className="max-h-48 overflow-y-auto scrollbar-thin p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-700 leading-7 whitespace-pre-line font-serif">
              {currentCase?.articleSnapshot.content}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">倾向类别</h4>
            <div className="grid grid-cols-4 gap-3">
              {sentimentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedSentiment(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-all duration-200',
                    selectedSentiment === opt.value
                      ? cn(opt.bg, opt.border, opt.color, 'shadow-sm')
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  )}
                >
                  <span className={cn('text-sm font-semibold', selectedSentiment === opt.value ? opt.color : 'text-slate-500')}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">风险等级</h4>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as RiskLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedRisk(level)}
                  className={cn(
                    'flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                    selectedRisk === level
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            {selectedRisk && (
              <p className="text-xs text-slate-400 mt-1.5 text-center">{riskLabel(selectedRisk)}</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">判断理由</h4>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="请输入您的判断理由..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 resize-none"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={!selectedSentiment || !selectedRisk}
            onClick={handleSubmitAnswer}
          >
            提交判断
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    );
  }

  if (!trainingSession.revealed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900">判断已提交</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-12 space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm text-slate-600">已提交判断，点击下方按钮查看标准裁定</p>
          <Button variant="success" onClick={revealTraining}>
            查看标准裁定
          </Button>
        </motion.div>
      </div>
    );
  }

  const answer = trainingSession.answer;
  const sentimentMatch = answer.sentiment === currentCase?.ruling.finalSentiment;
  const riskMatch = answer.riskLevel === currentCase?.ruling.finalRiskLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-900">训练结果</h2>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200">
        <div className="grid grid-cols-[1fr,auto,1fr] bg-slate-50 border-b border-slate-200">
          <div className="px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">我的判断</span>
          </div>
          <div className="flex items-center justify-center px-3 border-x border-slate-200 bg-white">
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">标准裁定</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div
            className={cn(
              'grid grid-cols-[1fr,auto,1fr]',
              sentimentMatch ? 'bg-white' : 'bg-rose-50/40'
            )}
          >
            <div className="px-4 py-3">
              <div className="text-xs text-slate-400 mb-1">倾向</div>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', sentimentColor[answer.sentiment])}>
                  {sentimentLabel[answer.sentiment]}
                </span>
                {!sentimentMatch && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>
            <div className="flex items-center justify-center px-3 border-x border-slate-200">
              {sentimentMatch ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div className={cn('px-4 py-3', !sentimentMatch && 'bg-emerald-50/60')}>
              <div className="text-xs text-slate-400 mb-1">倾向</div>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', sentimentColor[currentCase!.ruling.finalSentiment])}>
                  {sentimentLabel[currentCase!.ruling.finalSentiment]}
                </span>
                {!sentimentMatch && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          </div>

          <div
            className={cn(
              'grid grid-cols-[1fr,auto,1fr]',
              riskMatch ? 'bg-white' : 'bg-rose-50/40'
            )}
          >
            <div className="px-4 py-3">
              <div className="text-xs text-slate-400 mb-1">风险</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{riskLabel(answer.riskLevel)}</span>
                {!riskMatch && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>
            <div className="flex items-center justify-center px-3 border-x border-slate-200">
              {riskMatch ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div className={cn('px-4 py-3', !riskMatch && 'bg-emerald-50/60')}>
              <div className="text-xs text-slate-400 mb-1">风险</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">
                  {riskLabel(currentCase!.ruling.finalRiskLevel)}
                </span>
                {!riskMatch && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:divide-slate-100">
            <div className="px-4 py-3">
              <div className="text-xs text-slate-400 mb-2">判断理由</div>
              <p className="text-sm text-slate-700 leading-relaxed">{answer.reason || '未填写'}</p>
            </div>
            <div className="px-4 py-3">
              <div className="text-xs text-slate-400 mb-2">裁定理由</div>
              <p className="text-sm text-slate-700 leading-relaxed">{currentCase?.ruling.opinion}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-indigo-700 to-violet-800 p-5 text-white shadow-lg">
        <div className="absolute top-0 right-0 opacity-10 -translate-y-8 translate-x-8">
          <GraduationCap className="w-32 h-32" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-violet-200">裁定意见</span>
            <div className="flex items-center gap-1.5 text-xs text-violet-200">
              <span>最终：</span>
              <span className="font-semibold text-white">
                {sentimentLabel[currentCase!.ruling.finalSentiment]} + {riskLabel(currentCase!.ruling.finalRiskLevel)}
              </span>
            </div>
          </div>
          <p className="text-sm leading-7 text-violet-50/95">{currentCase?.ruling.opinion}</p>
          <div className="mt-4 pt-4 border-t border-white/20 text-xs text-violet-200">
            裁定时间：{formatDateTime(currentCase!.ruling.ruledAt)}
          </div>
        </div>
      </div>

      {(!sentimentMatch || !riskMatch) && (
        <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
          <p className="text-sm text-amber-900/80 leading-7">
            {(() => {
              const parts: string[] = [];
              if (!sentimentMatch) {
                parts.push(
                  `您的判断为${sentimentLabel[answer.sentiment]}，标准裁定为${sentimentLabel[currentCase!.ruling.finalSentiment]}`
                );
              }
              if (!riskMatch) {
                parts.push(
                  `风险等级判断为${riskLabel(answer.riskLevel)}，标准裁定为${riskLabel(currentCase!.ruling.finalRiskLevel)}`
                );
              }
              return parts.join('；') + '。建议回顾裁定意见，理解差异原因，提升判断一致性。';
            })()}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={handleEndTraining}>
          结束训练
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleContinueTraining}>
          继续训练
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
