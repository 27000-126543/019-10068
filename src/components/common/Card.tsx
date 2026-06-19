import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  hover?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export default function Card({ className = '', hover = false, children, onClick }: CardProps) {
  const baseClass = 'bg-white rounded-lg border border-surface-border shadow-card';
  const hoverClass = hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer' : '';

  return (
    <div onClick={onClick} className={cn(baseClass, hoverClass, className)}>
      {children}
    </div>
  );
}
