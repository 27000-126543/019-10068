import { ExternalLink, Clock, Newspaper } from 'lucide-react';
import type { Article } from '@/types';
import { mediaPropertyLabel } from '@/utils/sentiment';
import { formatDateTime } from '@/utils/date';
import Tag from '@/components/common/Tag';

interface ArticleHeaderProps {
  article: Article;
}

const propertyTagVariant: Record<string, 'info' | 'warning' | 'severe' | 'neutral'> = {
  central: 'info',
  market: 'warning',
  selfmedia: 'severe',
  overseas: 'neutral',
};

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-card border border-surface-border">
      <h1 className="font-serif text-xl text-slate-900 mb-3 leading-relaxed">
        {article.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-3">
        <div className="flex items-center gap-1.5">
          <Newspaper className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800">{article.mediaName}</span>
          <Tag
            variant={propertyTagVariant[article.mediaProperty] || 'neutral'}
            size="sm"
            className="ml-1"
          >
            {mediaPropertyLabel[article.mediaProperty]}
          </Tag>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatDateTime(article.publishTime)}</span>
        </div>

        {article.originalUrl && (
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand-500 hover:text-brand-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>原文链接</span>
          </a>
        )}

        <div className="flex items-center gap-1.5 text-slate-500">
          <span>转载</span>
          <span className="font-medium text-slate-700">{article.repostCount}</span>
          <span>次</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {article.keywords.map((kw, idx) => (
          <Tag
            key={idx}
            variant="divergence"
            size="sm"
          >
            {kw}
          </Tag>
        ))}
      </div>
    </div>
  );
}
