import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  hint?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  variant?: 'pill' | 'card';
}

export default function RadioGroup({
  options,
  value,
  onChange,
  variant = 'pill',
}: RadioGroupProps) {
  if (variant === 'pill') {
    return (
      <div className="inline-flex bg-slate-100 p-1 rounded-lg">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200',
              isActive
                ? 'border-brand-500 bg-brand-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <input
              type="radio"
              value={opt.value}
              checked={isActive}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <div
              className={cn(
                'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                isActive ? 'border-brand-500' : 'border-slate-300'
              )}
            >
              {isActive && <div className="w-2 h-2 rounded-full bg-brand-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-brand-700' : 'text-slate-900'
                )}
              >
                {opt.label}
              </div>
              {opt.hint && (
                <div className="mt-0.5 text-xs text-slate-500">{opt.hint}</div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
