import { useState } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import RadioGroup from '@/components/common/RadioGroup';
import useLexiconStore from '@/store/useLexiconStore';
import { cn } from '@/lib/utils';
import type { InterpretationRule } from '@/types';

interface AddRuleModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddRuleModal({ open, onClose }: AddRuleModalProps) {
  const { addRule } = useLexiconStore();
  const [phrase, setPhrase] = useState('');
  const [category, setCategory] = useState<InterpretationRule['category']>('over_interpret');
  const [description, setDescription] = useState('');
  const [exampleContext, setExampleContext] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setPhrase('');
    setCategory('over_interpret');
    setDescription('');
    setExampleContext('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!phrase.trim()) {
      newErrors.phrase = '请输入词语或短语';
    } else if (phrase.trim().length < 2) {
      newErrors.phrase = '词语至少2个字符';
    }
    if (!description.trim()) {
      newErrors.description = '请输入规则描述';
    } else if (description.trim().length < 10) {
      newErrors.description = '描述至少10个字符，建议清晰说明判断依据';
    }
    if (!exampleContext.trim()) {
      newErrors.exampleContext = '请输入上下文示例';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addRule({
      phrase: phrase.trim(),
      category,
      description: description.trim(),
      exampleContext: exampleContext.trim(),
      addedBy: 'u2',
    });

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="新建解读规则"
      widthClass="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            确认添加
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            词语 / 短语
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              if (errors.phrase) setErrors((p) => ({ ...p, phrase: '' }));
            }}
            placeholder="例如：暴跌、疑似、据传..."
            className={cn(
              'w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              errors.phrase
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
            )}
          />
          {errors.phrase && (
            <p className="mt-1 text-xs text-red-500">{errors.phrase}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            规则类别
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <RadioGroup
            variant="card"
            value={category}
            onChange={(v) => setCategory(v as InterpretationRule['category'])}
            options={[
              {
                value: 'over_interpret',
                label: '不应过度解读',
                hint: '常见于模糊信息来源（据悉、网传等），提醒标注者降低信息权重，避免草率定性',
              },
              {
                value: 'need_attention',
                label: '需特别关注',
                hint: '常见于高风险信号（维权、立案等），提醒标注者提高警惕，风险等级上提',
              },
            ]}
          />
        </div>

        <div className={cn(
          'p-3.5 rounded-lg border',
          category === 'over_interpret'
            ? 'bg-slate-50 border-slate-100'
            : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-100'
        )}>
          <div className="flex items-start gap-2.5">
            {category === 'over_interpret' ? (
              <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <p className={cn(
                'font-semibold mb-0.5',
                category === 'over_interpret' ? 'text-slate-700' : 'text-red-700'
              )}>
                {category === 'over_interpret' ? '提示：填写"不应过度解读"类规则' : '提示：填写"需特别关注"类规则'}
              </p>
              <p className={category === 'over_interpret' ? 'text-slate-500' : 'text-red-600/80'}>
                {category === 'over_interpret'
                  ? '说明该词语/短语的何种语境下容易被过度解读，应如何区分看待。示例建议给出包含该词语但实际不严重的上下文。'
                  : '说明该词语/短语为何需要特别关注，涉及哪些潜在风险。示例建议给出典型触发场景。'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            规则描述
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((p) => ({ ...p, description: '' }));
            }}
            rows={3}
            placeholder="详细说明该词语/短语的判断标准和使用场景..."
            className={cn(
              'w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none',
              errors.description
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            上下文示例
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            value={exampleContext}
            onChange={(e) => {
              setExampleContext(e.target.value);
              if (errors.exampleContext) setErrors((p) => ({ ...p, exampleContext: '' }));
            }}
            rows={2}
            placeholder="一个具体的新闻标题或报道片段，展示该词语在真实语境中的用法..."
            className={cn(
              'w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none',
              errors.exampleContext
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
            )}
          />
          {errors.exampleContext && (
            <p className="mt-1 text-xs text-red-500">{errors.exampleContext}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
