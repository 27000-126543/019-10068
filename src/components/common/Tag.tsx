import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TagVariant = 'neutral' | 'positive' | 'negative' | 'severe' | 'divergence' | 'info' | 'warning';
type TagSize = 'sm' | 'md';

interface TagProps {
  variant?: TagVariant;
  size?: TagSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  negative: 'bg-amber-50 text-amber-700 border border-amber-200',
  severe: 'bg-red-50 text-red-700 border border-red-200',
  divergence: 'bg-violet-50 text-violet-700 border border-violet-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  warning: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
};

export default function Tag({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
