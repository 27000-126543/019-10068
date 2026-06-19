import { useState } from 'react';
import { Plus, Trash2, FileText, Building2, CalendarDays } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import useTaskStore from '@/store/useTaskStore';
import type { MediaProperty } from '@/types';

const industryOptions = [
  '新能源汽车',
  '快消品零售',
  '金融科技',
  '互联网',
  '医药健康',
  '教育',
  '房地产',
  '其他',
];

const mediaPropertyOptions: { value: MediaProperty; label: string }[] = [
  { value: 'central', label: '央媒' },
  { value: 'market', label: '市场化媒体' },
  { value: 'selfmedia', label: '自媒体' },
  { value: 'overseas', label: '境外媒体' },
];

const mediaPropertyMap: Record<MediaProperty, { label: string; variant: 'neutral' | 'info' | 'warning' | 'severe' }> = {
  central: { label: '央媒', variant: 'info' },
  market: { label: '市场化', variant: 'neutral' },
  selfmedia: { label: '自媒体', variant: 'warning' },
  overseas: { label: '境外', variant: 'severe' },
};

interface ArticleDraft {
  title: string;
  mediaName: string;
  mediaProperty: MediaProperty;
  publishTime: string;
  content: string;
  keywords: string;
  repostCount: number;
}

const emptyArticleDraft: ArticleDraft = {
  title: '',
  mediaName: '',
  mediaProperty: 'central',
  publishTime: '',
  content: '',
  keywords: '',
  repostCount: 0,
};

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const createTask = useTaskStore((s) => s.createTask);

  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState(industryOptions[0]);
  const [eventName, setEventName] = useState('');
  const [eventTags, setEventTags] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [articles, setArticles] = useState<ArticleDraft[]>([]);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleDraft, setArticleDraft] = useState<ArticleDraft>(emptyArticleDraft);

  function handleAddArticle() {
    if (!articleDraft.title.trim() || !articleDraft.mediaName.trim()) return;
    setArticles((prev) => [...prev, { ...articleDraft }]);
    setArticleDraft(emptyArticleDraft);
    setShowArticleForm(false);
  }

  function handleRemoveArticle(index: number) {
    setArticles((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setClientName('');
    setClientIndustry(industryOptions[0]);
    setEventName('');
    setEventTags('');
    setStartTime('');
    setEndTime('');
    setArticles([]);
    setShowArticleForm(false);
    setArticleDraft(emptyArticleDraft);
  }

  function handleSubmit() {
    createTask({
      clientName: clientName.trim(),
      clientIndustry,
      eventName: eventName.trim(),
      eventTags: eventTags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
      startTime: `${startTime}T00:00:00Z`,
      endTime: `${endTime}T23:59:59Z`,
      articlesData: articles.map((a) => ({
        title: a.title.trim(),
        content: a.content.trim(),
        mediaName: a.mediaName.trim(),
        mediaProperty: a.mediaProperty,
        publishTime: a.publishTime || new Date().toISOString(),
        repostCount: a.repostCount,
        keywords: a.keywords
          .split(/[,，]/)
          .map((k) => k.trim())
          .filter(Boolean),
      })),
    });
    resetForm();
    onClose();
  }

  const canSubmit =
    clientName.trim() !== '' &&
    eventName.trim() !== '' &&
    startTime !== '' &&
    endTime !== '' &&
    articles.length > 0;

  const inputCls =
    'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1.5';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新建任务"
      widthClass="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
            创建任务
          </Button>
        </>
      }
    >
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {/* 客户信息 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-slate-800">客户信息</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                客户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="请输入客户名称"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>所属行业</label>
              <select
                value={clientIndustry}
                onChange={(e) => setClientIndustry(e.target.value)}
                className={inputCls}
              >
                {industryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 事件信息 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-slate-800">事件信息</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                事件名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="请输入事件名称"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>事件标签</label>
              <input
                type="text"
                value={eventTags}
                onChange={(e) => setEventTags(e.target.value)}
                placeholder="用逗号分隔多个标签"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* 时间段 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-slate-800">时间段</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                结束时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* 添加报道 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">报道列表</span>
            {!showArticleForm && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowArticleForm(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加报道
              </Button>
            )}
          </div>

          {articles.length > 0 && (
            <div className="space-y-2 mb-3">
              {articles.map((article, idx) => {
                const mediaInfo = mediaPropertyMap[article.mediaProperty];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {article.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{article.mediaName}</span>
                        <Tag variant={mediaInfo.variant} size="sm">
                          {mediaInfo.label}
                        </Tag>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {articles.length === 0 && !showArticleForm && (
            <p className="text-xs text-slate-400 text-center py-4">
              暂无报道，请点击"添加报道"添加至少一条
            </p>
          )}

          {showArticleForm && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={articleDraft.title}
                    onChange={(e) =>
                      setArticleDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    placeholder="报道标题"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    媒体名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={articleDraft.mediaName}
                    onChange={(e) =>
                      setArticleDraft((d) => ({ ...d, mediaName: e.target.value }))
                    }
                    placeholder="媒体名称"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>媒体属性</label>
                  <select
                    value={articleDraft.mediaProperty}
                    onChange={(e) =>
                      setArticleDraft((d) => ({
                        ...d,
                        mediaProperty: e.target.value as MediaProperty,
                      }))
                    }
                    className={inputCls}
                  >
                    {mediaPropertyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>发布时间</label>
                  <input
                    type="datetime-local"
                    value={articleDraft.publishTime}
                    onChange={(e) =>
                      setArticleDraft((d) => ({ ...d, publishTime: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>正文</label>
                <textarea
                  value={articleDraft.content}
                  onChange={(e) =>
                    setArticleDraft((d) => ({ ...d, content: e.target.value }))
                  }
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="报道正文内容"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>关键词</label>
                  <input
                    type="text"
                    value={articleDraft.keywords}
                    onChange={(e) =>
                      setArticleDraft((d) => ({ ...d, keywords: e.target.value }))
                    }
                    placeholder="用逗号分隔关键词"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>转载数</label>
                  <input
                    type="number"
                    value={articleDraft.repostCount}
                    onChange={(e) =>
                      setArticleDraft((d) => ({
                        ...d,
                        repostCount: Number(e.target.value) || 0,
                      }))
                    }
                    min={0}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowArticleForm(false);
                    setArticleDraft(emptyArticleDraft);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddArticle}
                  disabled={!articleDraft.title.trim() || !articleDraft.mediaName.trim()}
                >
                  确认添加
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
