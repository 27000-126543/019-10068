import { useState } from 'react';
import { Plus, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import type { InterpretationRule } from '@/types';
import AddRuleModal from './AddRuleModal';

export default function RuleCloud() {
  const { getFilteredRules } = useLexiconStore();
  const rules = getFilteredRules();
  const [hoveredRule, setHoveredRule] = useState<InterpretationRule | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);

  const overInterpretRules = rules.filter((r) => r.category === 'over_interpret');
  const needAttentionRules = rules.filter((r) => r.category === 'need_attention');

  const handleMouseEnter = (e: React.MouseEvent, rule: InterpretationRule) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setHoveredRule(rule);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">解读规则库</h3>
          <p className="text-sm text-slate-500 mt-1">
            共 {rules.length} 条规则，用于指导标注人员统一口径
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          添加规则
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">不应过度解读</h4>
            <span className="text-xs text-slate-400">({overInterpretRules.length})</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {overInterpretRules.map((rule, idx) => (
              <motion.button
                key={rule.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={(e) => handleMouseEnter(e, rule)}
                onMouseLeave={() => setHoveredRule(null)}
                className="relative group px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:shadow-md transition-shadow"
              >
                <span className="font-semibold">"{rule.phrase}"</span>
                <span className="ml-2 text-xs text-slate-400">{rule.usageCount}次</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
            <h4 className="text-sm font-semibold text-slate-700">需特别关注</h4>
            <span className="text-xs text-slate-400">({needAttentionRules.length})</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {needAttentionRules.map((rule, idx) => (
              <motion.button
                key={rule.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={(e) => handleMouseEnter(e, rule)}
                onMouseLeave={() => setHoveredRule(null)}
                className={cn(
                  'relative group px-4 py-2 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-shadow',
                  'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_auto] hover:bg-[position:right_center]'
                )}
              >
                <span className="font-semibold">"{rule.phrase}"</span>
                <span className="ml-2 text-xs text-white/80">{rule.usageCount}次</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hoveredRule && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-80 p-4 bg-white rounded-xl shadow-2xl border border-slate-200"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45" />
            <button
              onClick={() => setHoveredRule(null)}
              className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 mb-3">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  hoveredRule.category === 'over_interpret'
                    ? 'bg-slate-100'
                    : 'bg-gradient-to-r from-orange-100 to-red-100'
                )}
              >
                <Info
                  className={cn(
                    'w-5 h-5',
                    hoveredRule.category === 'over_interpret'
                      ? 'text-slate-600'
                      : 'text-red-600'
                  )}
                />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-900 text-lg">"{hoveredRule.phrase}"</h5>
                <span
                  className={cn(
                    'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    hoveredRule.category === 'over_interpret'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {hoveredRule.category === 'over_interpret' ? '不应过度解读' : '需特别关注'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">规则说明</p>
                <p className="text-sm text-slate-700 leading-relaxed">{hoveredRule.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">上下文示例</p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    "{hoveredRule.exampleContext}"
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">引用次数：{hoveredRule.usageCount}</p>
                <p className="text-xs text-slate-400">添加于 {hoveredRule.addedAt.slice(0, 10)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddRuleModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
