import { cn } from '@/lib/utils';

type ProgressSize = 'sm' | 'md';

interface ProgressBarProps {
  value: number;
  max?: number;
  colorClass?: string;
  showLabel?: boolean;
  size?: ProgressSize;
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export default function ProgressBar({
  value,
  max = 100,
  colorClass = 'bg-brand-500',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs text-slate-500">
            {value} / {max}
          </span>
        )}
        {showLabel && (
          <span className="text-xs font-medium text-slate-700">
            {Math.round(percent)}%
          </span>
        )}
      </div>
      <div className={cn('w-full rounded-full bg-slate-100 overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClass)}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
