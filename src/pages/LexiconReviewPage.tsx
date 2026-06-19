import { Search, Filter, X, CalendarRange, ChevronDown } from 'lucide-react';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';
import { sentimentLabel, riskLabel, mediaPropertyLabel } from '@/utils/sentiment';
import LexiconTabs from '@/components/lexicon/LexiconTabs';
import RuleCloud from '@/components/lexicon/RuleCloud';
import SourceCard from '@/components/lexicon/SourceCard';
import TypicalCaseCard from '@/components/lexicon/TypicalCaseCard';
import TrainingView from '@/components/lexicon/TrainingView';
import CaseDetailDrawer from '@/components/lexicon/CaseDetailDrawer';
import type { SentimentType, RiskLevel, MediaProperty } from '@/types';

type FilterItem = {
  value: string;
  label: string;
  colorClass?: string;
};

const sentimentOptions: FilterItem[] = [
  { value: 'all', label: '全部倾向' },
  { value: 'positive', label: sentimentLabel.positive, colorClass: 'text-emerald-600 data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-700' },
  { value: 'neutral', label: sentimentLabel.neutral, colorClass: 'text-slate-600 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-700' },
  { value: 'negative', label: sentimentLabel.negative, colorClass: 'text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700' },
  { value: 'severe_negative', label: sentimentLabel.severe_negative, colorClass: 'text-red-600 data-[active=true]:bg-red-100 data-[active=true]:text-red-700' },
];

const riskOptions: FilterItem[] = [
  { value: 'all', label: '全部风险' },
  { value: '1', label: riskLabel(1), colorClass: 'text-emerald-600 data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-700' },
  { value: '2', label: riskLabel(2), colorClass: 'text-green-600 data-[active=true]:bg-green-100 data-[active=true]:text-green-700' },
  { value: '3', label: riskLabel(3), colorClass: 'text-amber-600 data-[active=true]:bg-amber-100 data-[active=true]:text-amber-700' },
  { value: '4', label: riskLabel(4), colorClass: 'text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700' },
  { value: '5', label: riskLabel(5), colorClass: 'text-red-600 data-[active=true]:bg-red-100 data-[active=true]:text-red-700' },
];

const propertyOptions: FilterItem[] = [
  { value: 'all', label: '全部媒体' },
  { value: 'central', label: mediaPropertyLabel.central, colorClass: 'text-blue-600 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700' },
  { value: 'market', label: mediaPropertyLabel.market, colorClass: 'text-slate-600 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-700' },
  { value: 'selfmedia', label: mediaPropertyLabel.selfmedia, colorClass: 'text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700' },
  { value: 'overseas', label: mediaPropertyLabel.overseas, colorClass: 'text-violet-600 data-[active=true]:bg-violet-100 data-[active=true]:text-violet-700' },
];

function FilterPills<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: FilterItem[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            data-active={isActive}
            onClick={() => onChange(opt.value as T)}
            className={cn(
              'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              isActive
                ? cn('border-transparent shadow-sm', opt.colorClass)
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function LexiconReviewPage() {
  const {
    activeTab,
    filterSentiment,
    filterRisk,
    filterMediaProperty,
    searchKeyword,
    setFilterSentiment,
    setFilterRisk,
    setFilterMediaProperty,
    setSearchKeyword,
  } = useLexiconStore();

  const showFilters = activeTab === 'cases';
  const hasActiveFilters =
    filterSentiment !== 'all' ||
    filterRisk !== 'all' ||
    filterMediaProperty !== 'all' ||
    searchKeyword.trim() !== '';

  const clearAllFilters = () => {
    setFilterSentiment('all');
    setFilterRisk('all');
    setFilterMediaProperty('all');
    setSearchKeyword('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">口径复盘库</h1>
            <p className="text-sm text-slate-500">
              汇总历史裁定案例、解读规则与消息源档案，作为统一标注的口径基准
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={
                activeTab === 'cases'
                  ? '搜索案例标题、标签或摘要...'
                  : activeTab === 'rules'
                  ? '搜索词语或规则描述...'
                  : '搜索媒体名称...'
              }
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-5 bg-white rounded-xl border border-slate-100 shadow-card p-4 animate-stagger">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span>案例筛选</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                清除全部
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex items-center gap-2 pt-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                <span className="text-xs font-medium text-slate-500 w-12 shrink-0">情感</span>
              </div>
              <div className="flex-1 min-w-0">
                <FilterPills<SentimentType | 'all'>
                  options={sentimentOptions}
                  value={filterSentiment}
                  onChange={setFilterSentiment}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex items-center gap-2 pt-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                <span className="text-xs font-medium text-slate-500 w-12 shrink-0">风险</span>
              </div>
              <div className="flex-1 min-w-0">
                <FilterPills<RiskLevel | 'all'>
                  options={riskOptions}
                  value={filterRisk}
                  onChange={(v) => setFilterRisk(v as RiskLevel | 'all')}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex items-center gap-2 pt-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                <span className="text-xs font-medium text-slate-500 w-12 shrink-0">媒体</span>
              </div>
              <div className="flex-1 min-w-0">
                <FilterPills<MediaProperty | 'all'>
                  options={propertyOptions}
                  value={filterMediaProperty}
                  onChange={setFilterMediaProperty}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex items-center gap-2 pt-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                <span className="text-xs font-medium text-slate-500 w-12 shrink-0">时间</span>
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-slate-500 border border-dashed border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  <span>全部时间范围</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-2">
          <div className="lg:sticky lg:top-4">
            <LexiconTabs />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          {activeTab === 'cases' && <TypicalCaseCard />}
          {activeTab === 'rules' && <RuleCloud />}
          {activeTab === 'sources' && <SourceCard />}
          {activeTab === 'training' && <TrainingView />}
        </div>
      </div>

      <CaseDetailDrawer />
    </div>
  );
}
