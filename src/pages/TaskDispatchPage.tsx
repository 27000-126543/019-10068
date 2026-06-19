import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Building2, FolderKanban, LayoutGrid, UserCog2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTaskStore from '@/store/useTaskStore';
import { users } from '@/data/mockData';
import type { Article } from '@/types';
import FilterBar from '@/components/tasks/FilterBar';
import StatsDashboard from '@/components/tasks/StatsDashboard';
import ArticleList from '@/components/tasks/ArticleList';
import AssignModal from '@/components/tasks/AssignModal';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import Tag from '@/components/common/Tag';

export default function TaskDispatchPage() {
  const { clients, events, selectedEventIds, toggleEvent, selectedClientId } = useTaskStore();
  const [assignOpen, setAssignOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set(clients.map((c) => c.id)));

  const analysts = useMemo(
    () => users.filter((u) => u.role === 'analyst' || u.role === 'senior_analyst'),
    []
  );

  const clientEventMap = useMemo(() => {
    const map: Record<string, typeof events> = {};
    clients.forEach((c) => {
      map[c.id] = events.filter((e) => e.clientId === c.id);
    });
    return map;
  }, [clients, events]);

  const articleCountByEvent = useMemo(() => {
    const counts: Record<string, number> = {};
    const { getFilteredArticles } = useTaskStore.getState();
    const allArticles = getFilteredArticles();
    events.forEach((e) => {
      counts[e.id] = allArticles.filter((a) => a.eventId === e.id).length;
    });
    return counts;
  }, [events]);

  function toggleClientExpand(clientId: string) {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }

  function handleAssign(_article?: Article) {
    if (_article) {
      const { selectedArticleIds, toggleSelectArticle, clearSelection } = useTaskStore.getState();
      if (!selectedArticleIds.includes(_article.id)) {
        clearSelection();
        toggleSelectArticle(_article.id);
      }
    }
    setAssignOpen(true);
  }

  return (
    <div className="min-h-full flex flex-col bg-surface-bg">
      <FilterBar />

      <div className="flex-1 p-6 space-y-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <StatsDashboard />
        </motion.div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-28rem)] min-h-[520px]">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="col-span-3"
          >
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <FolderKanban className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-slate-800">事件导航</h3>
                <span className="ml-auto text-xs text-slate-500">
                  {selectedEventIds.length} 个已选
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {clients.map((client, ci) => {
                  const clientEvents = clientEventMap[client.id] || [];
                  const isExpanded = expandedClients.has(client.id);
                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 + ci * 0.05 }}
                    >
                      <button
                        onClick={() => toggleClientExpand(client.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all text-left',
                          selectedClientId === client.id
                            ? 'bg-brand-50 text-brand-800'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="flex-1 font-medium text-sm truncate">{client.name}</span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {clientEvents.length}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-7 pl-2 border-l border-slate-200 py-1 space-y-0.5">
                              {clientEvents.map((event) => {
                                const active = selectedEventIds.includes(event.id);
                                const count = articleCountByEvent[event.id] || 0;
                                return (
                                  <button
                                    key={event.id}
                                    onClick={() => toggleEvent(event.id)}
                                    className={cn(
                                      'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all text-left',
                                      active
                                        ? 'bg-brand-100 text-brand-800 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    )}
                                    title={event.name}
                                  >
                                    <span
                                      className={cn(
                                        'w-1.5 h-1.5 rounded-full shrink-0',
                                        active ? 'bg-brand-500' : 'bg-slate-300'
                                      )}
                                    />
                                    <span className="flex-1 truncate">{event.name}</span>
                                    <span className={cn(
                                      'text-[10px] px-1.5 py-0.5 rounded-full shrink-0',
                                      active
                                        ? 'bg-brand-200 text-brand-700'
                                        : 'bg-slate-100 text-slate-500'
                                    )}>
                                      {count}
                                    </span>
                                  </button>
                                );
                              })}
                              {clientEvents.length === 0 && (
                                <p className="text-xs text-slate-400 px-2.5 py-2 italic">
                                  暂无事件
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="col-span-7"
          >
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-800">报道列表</h3>
            </div>
            <ArticleList onAssign={handleAssign} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="col-span-2"
          >
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <UserCog2 className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-semibold text-slate-800">分析师面板</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
                {analysts.map((analyst, i) => {
                  const workloadPercent = Math.min((analyst.workload / 20) * 100, 100);
                  const isHighLoad = workloadPercent > 80;
                  const annotatingCount = useTaskStore
                    .getState()
                    .articles.filter(
                      (a) =>
                        (a.assigneeA === analyst.id || a.assigneeB === analyst.id) &&
                        a.status === 'annotating'
                    ).length;
                  return (
                    <motion.div
                      key={analyst.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        isHighLoad
                          ? 'bg-amber-50/40 border-amber-200/60'
                          : 'bg-white border-slate-200 hover:border-brand-200'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm',
                            analyst.role === 'senior_analyst'
                              ? 'bg-gradient-to-br from-violet-500 to-violet-600'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          )}
                        >
                          {analyst.name.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800 truncate">
                              {analyst.name}
                            </span>
                          </div>
                          <div className="mt-0.5">
                            <Tag
                              variant={analyst.role === 'senior_analyst' ? 'divergence' : 'info'}
                              size="sm"
                            >
                              {analyst.role === 'senior_analyst' ? '资深分析师' : '分析师'}
                            </Tag>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">工作负载</span>
                          <span
                            className={cn(
                              'font-medium',
                              isHighLoad ? 'text-amber-700' : 'text-slate-700'
                            )}
                          >
                            {analyst.workload}/20
                          </span>
                        </div>
                        <ProgressBar
                          value={analyst.workload}
                          max={20}
                          colorClass={isHighLoad ? 'bg-amber-500' : 'bg-brand-500'}
                          size="sm"
                        />
                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="text-slate-500">当前标注中</span>
                          <span className="font-semibold text-brand-600">{annotatingCount} 篇</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} />
    </div>
  );
}
