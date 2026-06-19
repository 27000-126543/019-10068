import { useState } from 'react';
import { Check, RotateCcw, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RulingDecision } from '@/types';
import { cn } from '@/lib/utils';

interface RulingBarProps {
  onSubmit?: (decision: RulingDecision, opinion: string) => void;
  disabled?: boolean;
}

const rulingOptions = [
  {
    value: 'accept_a',
    label: '采信A',
    icon: UserCheck,
    hint: '以分析师A为准',
    color: 'sky',
  },
  {
    value: 'accept_b',
    label: '采信B',
    icon: UserCheck,
    hint: '以分析师B为准',
    color: 'amber',
  },
  {
    value: 'reannotate',
    label: '发回重标注',
    icon: RotateCcw,
    hint: '退回重新标注',
    color: 'rose',
  },
] as const;

export default function RulingBar({ onSubmit, disabled = false }: RulingBarProps) {
  const [decision, setDecision] = useState<RulingDecision | null>(null);
  const [opinion, setOpinion] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = () => {
    if (!decision || disabled) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsDone(true);
      setTimeout(() => {
        onSubmit?.(decision, opinion);
        setIsAnimating(false);
        setIsDone(false);
      }, 800);
    }, 400);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 text-white p-4 shadow-2xl z-50">
      <div className="max-w-[1600px] mx-auto flex items-center gap-4 flex-wrap lg:flex-nowrap">
        <div className="flex-shrink-0">
          <div className="text-xs font-medium text-violet-200 mb-1.5">最终裁定</div>
          <div className="inline-flex bg-white/10 p-1 rounded-lg backdrop-blur-sm">
            {rulingOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = decision === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setDecision(opt.value as RulingDecision)}
                  className={cn(
                    'relative px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    'inline-flex items-center gap-1.5',
                    isActive
                      ? opt.color === 'sky'
                        ? 'bg-sky-400 text-white shadow-md'
                        : opt.color === 'amber'
                        ? 'bg-amber-400 text-white shadow-md'
                        : 'bg-rose-400 text-white shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <div className="text-xs font-medium text-violet-200 mb-1.5">裁定意见</div>
          <input
            type="text"
            value={opinion}
            onChange={(e) => !disabled && setOpinion(e.target.value)}
            disabled={disabled}
            placeholder="请输入裁定说明，阐述判断依据..."
            className={cn(
              'w-full px-4 py-2.5 text-sm rounded-lg transition-all',
              'bg-white/10 border border-white/20 text-white placeholder-white/50',
              'focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        </div>

        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="text-xs font-medium text-transparent mb-1.5 select-none">操作</div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!decision || disabled || isAnimating}
            className={cn(
              'relative w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition-all duration-200 overflow-hidden',
              decision && !disabled && !isAnimating
                ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-white/20 text-white/60 cursor-not-allowed'
            )}
          >
            <AnimatePresence mode="wait">
              {isDone ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="relative w-5 h-5"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ strokeDasharray: '100', strokeDashoffset: '100' }}
                      animate={{ strokeDashoffset: '0' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="check"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isAnimating ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>完成裁定</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}
