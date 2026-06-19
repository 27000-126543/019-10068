import { X, ArrowRight, BookOpen, Gavel, Users, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';
import Tag from '@/components/common/Tag';
import Button from '@/components/common/Button';
import { sentimentLabel, riskLabel, mediaPropertyLabel } from '@/utils/sentiment';
import { formatDateTime } from '@/utils/date';
import type { TypicalCase, Annotation } from '@/types';

function AnnotationCompareCard({ annA, annB, ruling }: { annA: Annotation; annB: Annotation; ruling: TypicalCase['ruling'] }) {
  const fields: { key: 'sentiment' | 'riskLevel'; label: string; a: string; b: string; accepted?: 'A' | 'B' | null }[] = [
    {
      key: 'sentiment',
      label: '情感倾向',
      a: sentimentLabel[annA.sentiment],
      b: sentimentLabel[annB.sentiment],
      accepted:
        ruling.decision === 'accept_a'
          ? 'A'
          : ruling.decision === 'accept_b'
          ? 'B'
          : null,
    },
    {
      key: 'riskLevel',
      label: '风险等级',
      a: riskLabel(annA.riskLevel),
      b: riskLabel(annB.riskLevel),
      accepted:
        ruling.decision === 'accept_a'
          ? 'A'
          : ruling.decision === 'accept_b'
          ? 'B'
          : null,
    },
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div className="grid grid-cols-[1fr,auto,1fr] bg-slate-50 border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">分析师 A</span>
            {ruling.decision === 'accept_a' && (
              <Tag variant="positive" size="sm">
                <CheckCircle className="w-3 h-3 mr-0.5" />
                采信
              </Tag>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center px-3 border-x border-slate-200 bg-white">
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">分析师 B</span>
            {ruling.decision === 'accept_b' && (
              <Tag variant="positive" size="sm">
                <CheckCircle className="w-3 h-3 mr-0.5" />
                采信
              </Tag>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {fields.map((field) => {
          const diverged = field.a !== field.b;
          return (
            <div
              key={field.key}
              className={cn(
                'grid grid-cols-[1fr,auto,1fr] transition-colors',
                diverged ? 'bg-rose-50/40' : 'bg-white'
              )}
            >
              <div
                className={cn(
                  'px-4 py-3',
                  field.accepted === 'A' && diverged ? 'bg-emerald-50/60' : ''
                )}
              >
                <div className="text-xs text-slate-400 mb-1">{field.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{field.a}</span>
                  {field.accepted === 'A' && diverged && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  {field.accepted === 'B' && diverged && (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center justify-center px-3 border-x border-slate-200',
                  diverged ? 'bg-rose-100/60' : 'bg-slate-50'
                )}
              >
                {diverged ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div
                className={cn(
                  'px-4 py-3',
                  field.accepted === 'B' && diverged ? 'bg-emerald-50/60' : ''
                )}
              >
                <div className="text-xs text-slate-400 mb-1">{field.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{field.b}</span>
                  {field.accepted === 'B' && diverged && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  {field.accepted === 'A' && diverged && (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:divide-slate-100">
          <div className="px-4 py-3">
            <div className="text-xs text-slate-400 mb-2">判定理由</div>
            <p className="text-sm text-slate-700 leading-relaxed">{annA.reason}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {annA.reasonTags.map((t, i) => (
                <span
                  key={i}
                  className="inline-block px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-xs text-slate-400 mb-2">判定理由</div>
            <p className="text-sm text-slate-700 leading-relaxed">{annB.reason}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {annB.reasonTags.map((t, i) => (
                <span
                  key={i}
                  className="inline-block px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-600 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaseDetailDrawer() {
  const { selectedCaseId, setSelectedCaseId, typicalCases } = useLexiconStore();
  const navigate = useNavigate();
  const selectedCase = typicalCases.find((c) => c.id === selectedCaseId) || null;

  return (
    <AnimatePresence>
      {selectedCase && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setSelectedCaseId(null)}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-14 bottom-0 w-[480px] bg-white shadow-2xl z-40 overflow-y-auto scrollbar-thin animate-stagger"
          >
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900">案例详情</h3>
              </div>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Tag
                    variant={
                      selectedCase.ruling.finalSentiment === 'positive'
                        ? 'positive'
                        : selectedCase.ruling.finalSentiment === 'neutral'
                        ? 'neutral'
                        : selectedCase.ruling.finalSentiment === 'negative'
                        ? 'negative'
                        : 'severe'
                    }
                  >
                    {sentimentLabel[selectedCase.ruling.finalSentiment]}
                  </Tag>
                  <Tag
                    variant={
                      selectedCase.ruling.finalRiskLevel <= 2
                        ? 'positive'
                        : selectedCase.ruling.finalRiskLevel === 3
                        ? 'warning'
                        : 'severe'
                    }
                  >
                    {riskLabel(selectedCase.ruling.finalRiskLevel)}
                  </Tag>
                  <Tag variant="info">{mediaPropertyLabel[selectedCase.articleSnapshot.mediaProperty]}</Tag>
                  <span className="text-xs text-slate-400 ml-auto">
                    {selectedCase.articleSnapshot.mediaName}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {selectedCase.articleSnapshot.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>发布时间：{formatDateTime(selectedCase.articleSnapshot.publishTime)}</span>
                  <span>转发 {selectedCase.articleSnapshot.repostCount}</span>
                </div>
              </div>

              <section>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  报道快照内容
                </h4>
                <div className="max-h-56 overflow-y-auto scrollbar-thin p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-700 leading-7 whitespace-pre-line font-serif">
                    {selectedCase.articleSnapshot.content}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  A/B 标注对比
                </h4>
                <AnnotationCompareCard
                  annA={selectedCase.annotationA}
                  annB={selectedCase.annotationB}
                  ruling={selectedCase.ruling}
                />
              </section>

              <section>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-slate-400" />
                  裁定意见
                </h4>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-indigo-700 to-violet-800 p-5 text-white shadow-lg">
                  <div className="absolute top-0 right-0 opacity-10 -translate-y-8 translate-x-8">
                    <Gavel className="w-32 h-32" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <Tag
                        variant={
                          selectedCase.ruling.decision === 'reannotate'
                            ? 'warning'
                            : 'positive'
                        }
                        size="sm"
                      >
                        {selectedCase.ruling.decision === 'accept_a'
                          ? '采信分析师A'
                          : selectedCase.ruling.decision === 'accept_b'
                          ? '采信分析师B'
                          : '要求重新标注'}
                      </Tag>
                      <div className="flex items-center gap-1.5 text-xs text-violet-200">
                        <span>裁定：</span>
                        <span className="font-semibold text-white">
                          {sentimentLabel[selectedCase.ruling.finalSentiment]} + {riskLabel(selectedCase.ruling.finalRiskLevel)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-violet-50/95">
                      {selectedCase.ruling.opinion}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/20 text-xs text-violet-200">
                      裁定时间：{formatDateTime(selectedCase.ruling.ruledAt)}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  典型性说明
                </h4>
                <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
                  <p className="text-sm text-amber-900/80 leading-7">
                    {selectedCase.ruling.typicalReason || selectedCase.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedCase.tags.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="pt-2">
                <Button
                  variant="divergence"
                  className="w-full"
                  onClick={() => navigate('/dual-review')}
                >
                  引用到双人判读
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  跳转到双人判读工作台，引用此案例作为标注参考
                </p>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
