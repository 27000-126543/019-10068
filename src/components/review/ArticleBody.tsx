import { useState, useMemo } from 'react';
import { Highlighter, GitBranch, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Article, HistoryArticle, RepostRelation } from '@/types';
import { sentimentBgClass, sentimentLabel } from '@/utils/sentiment';
import { formatDate, formatDateTime } from '@/utils/date';
import Tag from '@/components/common/Tag';

interface ArticleBodyProps {
  article: Article;
}

type TabType = 'repost' | 'history';

const NEGATIVE_KEYWORDS = [
  '召回', '隐患', '下跌', '暴跌', '负面', '危机', '违规', '处罚',
  '投诉', '维权', '逾期', '违约', '调查', '冻结', '停牌', '爆雷',
  '虫卵', '超标', '欺诈', '虚假', '漏洞', '质量问题', '安全问题'
];

const POSITIVE_KEYWORDS = [
  '增长', '突破', '正面', '优秀', '好评', '积极', '回应', '负责任',
  '赔偿', '修复', '升级', '优秀', '亮眼', '强劲', '增长', '上市',
  '认证', '通过', '提升'
];

function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  let result: React.ReactNode[] = [text];
  let keyIdx = 0;

  const allHighlightWords = [...keywords, ...NEGATIVE_KEYWORDS, ...POSITIVE_KEYWORDS];

  allHighlightWords.forEach((kw) => {
    const newResult: React.ReactNode[] = [];
    result.forEach((part) => {
      if (typeof part !== 'string') {
        newResult.push(part);
        return;
      }
      const parts = part.split(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      parts.forEach((p, i) => {
        if (p.toLowerCase() === kw.toLowerCase()) {
          const isNegative = NEGATIVE_KEYWORDS.some(n => n.toLowerCase() === kw.toLowerCase());
          const isPositive = POSITIVE_KEYWORDS.some(po => po.toLowerCase() === kw.toLowerCase());
          const className = isNegative
            ? 'keyword-highlight-negative'
            : isPositive
            ? 'keyword-highlight-positive'
            : keywords.includes(kw)
            ? 'keyword-highlight-positive'
            : '';
          newResult.push(
            <span key={`kw-${keyIdx++}`} className={className}>
              {p}
            </span>
          );
        } else {
          newResult.push(p);
        }
      });
    });
    result = newResult;
  });

  return result;
}

function RepostGraph({ relations }: { relations: RepostRelation[] }) {
  const centerX = 200;
  const centerY = 120;
  const radius = 80;

  return (
    <div className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
      <svg width="400" height="240" viewBox="0 0 400 240" className="mx-auto">
        <defs>
          <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        {relations.map((_, idx) => {
          const angle = (idx / relations.length) * Math.PI * 2 - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return (
            <line
              key={`line-${idx}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#C4B5FD"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          );
        })}

        <circle cx={centerX} cy={centerY} r="24" fill="url(#centerGrad)" />
        <text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="600"
        >
          原文
        </text>

        {relations.map((rel, idx) => {
          const angle = (idx / relations.length) * Math.PI * 2 - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return (
            <g key={`node-${idx}`}>
              <circle cx={x} cy={y} r="18" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.5" />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#7C3AED"
                fontSize="11"
                fontWeight="600"
              >
                {idx + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
        {relations.map((rel, idx) => (
          <div
            key={rel.sourceId}
            className="flex items-start gap-2 text-xs p-2 bg-white rounded border border-slate-100"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-semibold text-[10px]">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 font-medium truncate">{rel.sourceTitle}</div>
              <div className="text-slate-500 mt-0.5">
                {rel.sourceMedia} · {formatDate(rel.repostTime)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTimeline({ articles: hArticles }: { articles: HistoryArticle[] }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="relative pl-6 space-y-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

        {hArticles.map((h, idx) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative"
          >
            <div
              className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                h.sentiment === 'positive'
                  ? 'bg-emerald-500'
                  : h.sentiment === 'negative'
                  ? 'bg-orange-500'
                  : h.sentiment === 'severe_negative'
                  ? 'bg-red-500'
                  : 'bg-slate-400'
              }`}
            />
            <div className="bg-white rounded border border-slate-100 p-3">
              <div className="text-sm text-slate-800 font-medium leading-snug mb-1.5">
                {h.title}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{h.media}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{formatDate(h.publishTime)}</span>
                <Tag
                  variant={
                    h.sentiment === 'positive'
                      ? 'positive'
                      : h.sentiment === 'negative'
                      ? 'negative'
                      : h.sentiment === 'severe_negative'
                      ? 'severe'
                      : 'neutral'
                  }
                  size="sm"
                  className="ml-auto"
                >
                  {sentimentLabel[h.sentiment]}
                </Tag>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ArticleBody({ article }: ArticleBodyProps) {
  const [activeTab, setActiveTab] = useState<TabType>('repost');
  const [hoveredParagraph, setHoveredParagraph] = useState<number | null>(null);

  const paragraphs = useMemo(() => {
    return article.content.split(/(?<=。)/).filter((p) => p.trim().length > 0);
  }, [article.content]);

  return (
    <div className="bg-white rounded-lg shadow-card border border-surface-border flex flex-col h-full">
      <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {paragraphs.map((para, idx) => (
            <div
              key={idx}
              className="relative group rounded transition-colors duration-200"
              onMouseEnter={() => setHoveredParagraph(idx)}
              onMouseLeave={() => setHoveredParagraph(null)}
            >
              <p className="p-3 text-[15px] leading-[1.9] text-slate-700 hover:bg-slate-50 rounded">
                {highlightKeywords(para.trim(), article.keywords)}
              </p>
              <AnimatePresence>
                {hoveredParagraph === idx && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-500 text-white text-xs font-medium rounded-md hover:bg-violet-600 transition-colors shadow-sm"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    标注此段
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('repost')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'repost'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              转载关系
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              历史报道
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'repost' ? (
              <motion.div
                key="repost"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {article.repostRelations && article.repostRelations.length > 0 ? (
                  <RepostGraph relations={article.repostRelations} />
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    暂无转载关系数据
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {article.historyArticles && article.historyArticles.length > 0 ? (
                  <HistoryTimeline articles={article.historyArticles} />
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    暂无历史报道数据
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
