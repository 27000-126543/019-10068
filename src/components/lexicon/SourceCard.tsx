import { Newspaper, Award, TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';
import Tag from '@/components/common/Tag';
import ProgressBar from '@/components/common/ProgressBar';
import { mediaPropertyLabel } from '@/utils/sentiment';
import type { SourceStance, MediaProperty } from '@/types';

const stanceLabel: Record<SourceStance, { label: string; index: number }> = {
  strong_support: { label: '强烈支持', index: 0 },
  mild_support: { label: '温和支持', index: 1 },
  neutral: { label: '中立', index: 2 },
  mild_oppose: { label: '温和反对', index: 3 },
  strong_oppose: { label: '强烈反对', index: 4 },
};

const propertyVariantMap: Record<MediaProperty, 'info' | 'neutral' | 'warning' | 'divergence'> = {
  central: 'info',
  market: 'neutral',
  selfmedia: 'warning',
  overseas: 'divergence',
};

function StanceBar({ stance }: { stance: SourceStance }) {
  const currentIndex = stanceLabel[stance].index;
  const segments = [
    { color: 'bg-emerald-500', label: '强支' },
    { color: 'bg-emerald-300', label: '温支' },
    { color: 'bg-slate-400', label: '中立' },
    { color: 'bg-orange-300', label: '温反' },
    { color: 'bg-red-500', label: '强反' },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">立场倾向</span>
        <span className="text-xs font-semibold text-slate-700">{stanceLabel[stance].label}</span>
      </div>
      <div className="relative flex gap-0.5 h-3 rounded-full overflow-hidden">
        {segments.map((seg, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={idx}
              className={cn(
                'flex-1 relative transition-all',
                seg.color,
                isActive ? 'ring-2 ring-offset-1 ring-slate-900 scale-105 z-10 rounded-sm' : 'opacity-60'
              )}
              title={seg.label}
            >
              {isActive && (
                <motion.div
                  layoutId={`stance-indicator`}
                  className="absolute inset-0 bg-white/30 animate-pulse"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <TrendingUp className="w-3 h-3 text-emerald-500" />
        <Minus className="w-3 h-3" />
        <TrendingDown className="w-3 h-3 text-red-500" />
      </div>
    </div>
  );
}

function CredibilityBadge({ score }: { score: number }) {
  let colorClass = '';
  let bgClass = '';
  if (score >= 90) {
    colorClass = 'text-emerald-700';
    bgClass = 'bg-emerald-50 border-emerald-200';
  } else if (score >= 75) {
    colorClass = 'text-blue-700';
    bgClass = 'bg-blue-50 border-blue-200';
  } else if (score >= 60) {
    colorClass = 'text-amber-700';
    bgClass = 'bg-amber-50 border-amber-200';
  } else {
    colorClass = 'text-red-700';
    bgClass = 'bg-red-50 border-red-200';
  }

  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg border', bgClass)}>
      <Award className={cn('w-4 h-4', colorClass)} />
      <span className={cn('text-sm font-bold', colorClass)}>{score}</span>
    </div>
  );
}

export default function SourceCard() {
  const { mediaProfiles } = useLexiconStore();

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">消息源档案库</h3>
        <p className="text-sm text-slate-500 mt-1">
          共 {mediaProfiles.length} 家媒体档案，记录立场倾向与历史可信度
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
        {mediaProfiles.map((profile, idx) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="group bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-200 transition-colors">
                    <Newspaper className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">{profile.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Tag variant={propertyVariantMap[profile.property]} size="sm">
                        {mediaPropertyLabel[profile.property]}
                      </Tag>
                      <Tag variant="info" size="sm">
                        <FileText className="w-3 h-3 mr-0.5" />
                        {profile.sampleCount} 样本
                      </Tag>
                    </div>
                  </div>
                </div>
                <CredibilityBadge score={profile.credibility} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-500">可信度评分</span>
                    <span className="text-xs font-semibold text-slate-700">{profile.credibility}%</span>
                  </div>
                  <ProgressBar
                    value={profile.credibility}
                    max={100}
                    colorClass={
                      profile.credibility >= 90
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : profile.credibility >= 75
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                        : profile.credibility >= 60
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-red-400 to-red-500'
                    }
                    size="md"
                  />
                </div>

                <StanceBar stance={profile.stance} />

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-1.5">历史记录说明</p>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {profile.historicalNotes}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
