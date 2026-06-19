export type SentimentType = 'positive' | 'neutral' | 'negative' | 'severe_negative';
export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type MediaProperty = 'central' | 'market' | 'selfmedia' | 'overseas';
export type TaskStatus = 'pending' | 'annotating' | 'divergent' | 'completed';
export type UserRole = 'project_manager' | 'analyst' | 'senior_analyst';
export type SourceStance = 'strong_support' | 'mild_support' | 'neutral' | 'mild_oppose' | 'strong_oppose';
export type DivergenceLevel = 'critical' | 'warning' | 'notice';
export type RulingDecision = 'accept_a' | 'accept_b' | 'reannotate';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  workload: number;
}

export interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
}

export interface Event {
  id: string;
  clientId: string;
  name: string;
  tags: string[];
  startTime: string;
  endTime: string;
}

export interface RepostRelation {
  sourceId: string;
  sourceTitle: string;
  sourceMedia: string;
  repostTime: string;
}

export interface HistoryArticle {
  id: string;
  title: string;
  publishTime: string;
  media: string;
  sentiment: SentimentType;
}

export interface Article {
  id: string;
  eventId: string;
  clientId: string;
  title: string;
  content: string;
  mediaName: string;
  mediaProperty: MediaProperty;
  publishTime: string;
  repostCount: number;
  repostRelations: RepostRelation[];
  historyArticles: HistoryArticle[];
  keywords: string[];
  originalUrl?: string;
  status: TaskStatus;
  assigneeA?: string;
  assigneeB?: string;
  assignedAt?: string;
}

export interface Annotation {
  id: string;
  articleId: string;
  userId: string;
  sentiment: SentimentType;
  reason: string;
  reasonTags: string[];
  riskLevel: RiskLevel;
  suggestion: string;
  annotatedAt: string;
}

export interface DivergencePoint {
  field: 'sentiment' | 'riskLevel' | 'reason';
  level: DivergenceLevel;
  description: string;
  valueA: any;
  valueB: any;
}

export interface DivergenceResult {
  hasDivergence: boolean;
  points: DivergencePoint[];
  summary: string;
}

export interface Ruling {
  id: string;
  articleId: string;
  seniorAnalystId: string;
  decision: RulingDecision;
  opinion: string;
  finalSentiment: SentimentType;
  finalRiskLevel: RiskLevel;
  ruledAt: string;
  isTypicalCase: boolean;
  typicalReason?: string;
}

export interface InterpretationRule {
  id: string;
  phrase: string;
  category: 'over_interpret' | 'need_attention';
  description: string;
  exampleContext: string;
  addedBy: string;
  addedAt: string;
  usageCount: number;
}

export interface MediaSourceProfile {
  id: string;
  name: string;
  property: MediaProperty;
  stance: SourceStance;
  credibility: number;
  historicalNotes: string;
  sampleCount: number;
}

export interface TypicalCase {
  id: string;
  articleSnapshot: Article;
  annotationA: Annotation;
  annotationB: Annotation;
  ruling: Ruling;
  tags: string[];
  summary: string;
  archivedAt: string;
}
