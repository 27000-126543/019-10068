import { Briefcase, FileText, Radio } from 'lucide-react';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';

type LexiconTab = 'cases' | 'rules' | 'sources';

interface TabItem {
  key: LexiconTab;
  label: string;
  icon: React.ElementType;
  count: number;
}

export default function LexiconTabs() {
  const { activeTab, toggleActiveTab, typicalCases, rules, mediaProfiles } =
    useLexiconStore();

  const tabs: TabItem[] = [
    { key: 'cases', label: '典型案例', icon: Briefcase, count: typicalCases.length },
    { key: 'rules', label: '解读规则', icon: FileText, count: rules.length },
    { key: 'sources', label: '消息源档案', icon: Radio, count: mediaProfiles.length },
  ];

  return (
    <div className="bg-white rounded-lg shadow-card p-2 w-full">
      <div className="flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => toggleActiveTab(tab.key)}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-md text-left transition-all duration-200 group',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-indigo-500" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'
                )}
              />
              <span className="flex-1 text-sm font-medium">{tab.label}</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
