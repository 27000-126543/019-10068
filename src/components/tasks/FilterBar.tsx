import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTaskStore from '@/store/useTaskStore';
import type { TaskStatus } from '@/types';
import Tag from '@/components/common/Tag';
import Button from '@/components/common/Button';

const statusOptions: { value: TaskStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: '全部', color: 'bg-white/10 text-white border border-white/20' },
  { value: 'pending', label: '待分配', color: 'bg-slate-500/20 text-slate-200 border border-slate-400/30' },
  { value: 'annotating', label: '标注中', color: 'bg-blue-500/20 text-blue-200 border border-blue-400/30' },
  { value: 'divergent', label: '分歧待裁定', color: 'bg-violet-500/20 text-violet-200 border border-violet-400/30' },
  { value: 'completed', label: '已完成', color: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' },
];

interface FilterBarProps {
  onCreateTask: () => void;
}

export default function FilterBar({ onCreateTask }: FilterBarProps) {
  const {
    clients,
    events,
    selectedClientId,
    selectedEventIds,
    statusFilter,
    dateRange,
    keyword,
    setSelectedClient,
    toggleEvent,
    setStatusFilter,
    setDateRange,
    setKeyword,
  } = useTaskStore();

  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!selectedClientId) return [];
    return events.filter((e) => e.clientId === selectedClientId);
  }, [events, selectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-brand-900 text-white flex items-center gap-4 px-6 border-b border-white/10"
    >
      <div className="relative">
        <button
          onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded text-sm transition-colors min-w-[180px]"
        >
          <Building2 className="w-4 h-4 text-white/70" />
          <span className="flex-1 text-left truncate">
            {selectedClient ? selectedClient.name : '选择客户'}
          </span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', clientDropdownOpen && 'rotate-180')} />
        </button>
        {clientDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-1 w-[260px] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 text-slate-800"
          >
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClient(client.id);
                  setClientDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left',
                  selectedClientId === client.id && 'bg-brand-50'
                )}
              >
                <span className="flex-1">
                  <span className="block font-medium text-sm">{client.name}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{client.industry}</span>
                </span>
                <Tag variant="info" size="sm">{client.industry}</Tag>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <div className="h-6 w-px bg-white/20" />

      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-thin">
        {filteredEvents.length === 0 ? (
          <span className="text-xs text-white/50">请先选择客户以查看事件</span>
        ) : (
          filteredEvents.map((event) => {
            const active = selectedEventIds.includes(event.id);
            return (
              <button
                key={event.id}
                onClick={() => toggleEvent(event.id)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border',
                  active
                    ? 'bg-brand-500 text-white border-brand-400 shadow-sm'
                    : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'
                )}
              >
                {event.name}
                {active && <X className="w-3 h-3" />}
              </button>
            );
          })
        )}
      </div>

      <div className="h-6 w-px bg-white/20" />

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="px-2.5 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-brand-400 w-[130px]"
        />
        <span className="text-white/50 text-sm">~</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="px-2.5 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-brand-400 w-[130px]"
        />
        {dateRange.end && (
          <span className="text-[10px] text-white/40">含当天</span>
        )}
      </div>

      <div className="h-6 w-px bg-white/20" />

      <div className="flex items-center gap-1.5">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
              statusFilter === opt.value
                ? opt.color + ' ring-1 ring-offset-0'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-white/20" />

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="关键词搜索..."
          className="pl-9 pr-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-brand-400 w-[200px]"
        />
      </div>

      <Button variant="primary" size="md" className="shrink-0" onClick={onCreateTask}>
        <Plus className="w-4 h-4 mr-1" />
        新建任务
      </Button>
    </motion.div>
  );
}
