import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle, UserRound, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTaskStore from '@/store/useTaskStore';
import { users } from '@/data/mockData';
import type { User } from '@/types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
}

function AnalystOption({ user, workloadMax = 20 }: { user: User; workloadMax?: number }) {
  const percent = Math.min((user.workload / workloadMax) * 100, 100);
  const isHigh = percent > 80;
  return (
    <div className="flex items-center justify-between w-full gap-3 py-1">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
          {user.name.slice(0, 1)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">{user.name}</span>
          <span className="text-[11px] text-slate-500">{user.workload} 条 / 20 上限</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isHigh ? 'bg-amber-500' : 'bg-brand-500'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <Tag variant={user.role === 'senior_analyst' ? 'divergence' : 'info'} size="sm">
          {user.role === 'senior_analyst' ? '资深' : '分析师'}
        </Tag>
      </div>
    </div>
  );
}

export default function AssignModal({ open, onClose }: AssignModalProps) {
  const { selectedArticleIds, assignArticles, clearSelection } = useTaskStore();

  const [assigneeAId, setAssigneeAId] = useState<string>('');
  const [assigneeBId, setAssigneeBId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const analysts = useMemo(
    () => users.filter((u) => u.role === 'analyst' || u.role === 'senior_analyst'),
    []
  );

  const canSubmit = useMemo(() => {
    return assigneeAId && assigneeBId && assigneeAId !== assigneeBId;
  }, [assigneeAId, assigneeBId]);

  function handleClose() {
    setError('');
    setAssigneeAId('');
    setAssigneeBId('');
    setDueDate('');
    setNote('');
    onClose();
  }

  function handleSubmit() {
    if (!canSubmit) {
      if (!assigneeAId || !assigneeBId) {
        setError('请选择两位分析师');
      } else if (assigneeAId === assigneeBId) {
        setError('分析师A和B不能为同一人');
      }
      return;
    }
    assignArticles(selectedArticleIds, assigneeAId, assigneeBId, note || undefined);
    clearSelection();
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-brand-600" />
          <span>分配分析师</span>
          <Tag variant="divergence" size="sm">
            {selectedArticleIds.length} 篇报道
          </Tag>
        </div>
      }
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} disabled={!canSubmit}>
            确认分配
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              分析师 A <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={assigneeAId}
                onChange={(e) => {
                  setAssigneeAId(e.target.value);
                  if (e.target.value === assigneeBId) setAssigneeBId('');
                  setError('');
                }}
                className={cn(
                  'w-full pl-9 pr-3 py-2 text-sm rounded-md border transition-colors',
                  'bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                  assigneeAId ? 'border-slate-300' : 'border-red-300 bg-red-50'
                )}
              >
                <option value="">请选择分析师A</option>
                {analysts.map((u) => (
                  <option key={u.id} value={u.id} disabled={u.id === assigneeBId}>
                    {u.name} - 工作量 {u.workload}/20
                  </option>
                ))}
              </select>
            </div>
            {assigneeAId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 p-2 rounded-md bg-slate-50 border border-slate-200"
              >
                <AnalystOption user={analysts.find((u) => u.id === assigneeAId)!} />
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              分析师 B <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={assigneeBId}
                onChange={(e) => {
                  setAssigneeBId(e.target.value);
                  if (e.target.value === assigneeAId) setAssigneeAId('');
                  setError('');
                }}
                className={cn(
                  'w-full pl-9 pr-3 py-2 text-sm rounded-md border transition-colors',
                  'bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                  assigneeBId ? 'border-slate-300' : 'border-red-300 bg-red-50'
                )}
              >
                <option value="">请选择分析师B</option>
                {analysts.map((u) => (
                  <option key={u.id} value={u.id} disabled={u.id === assigneeAId}>
                    {u.name} - 工作量 {u.workload}/20
                  </option>
                ))}
              </select>
            </div>
            {assigneeBId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 p-2 rounded-md bg-slate-50 border border-slate-200"
              >
                <AnalystOption user={analysts.find((u) => u.id === assigneeBId)!} />
              </motion.div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Clock className="w-4 h-4 inline -mt-0.5 mr-1 text-slate-500" />
            预估完成时间
          </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">备注说明</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="可补充标注要求、优先级等信息..."
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
          />
        </div>

        <div className="p-3 rounded-md bg-brand-50 border border-brand-100">
          <div className="text-xs text-brand-700 space-y-1">
            <p className="font-semibold">分配规则提醒：</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1 text-brand-600/90">
              <li>系统将自动将报道状态更新为「标注中」</li>
              <li>两位分析师独立标注后，系统自动检测分歧</li>
              <li>分歧内容将交由资深分析师裁定</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}
