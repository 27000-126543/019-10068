import type { Annotation, DivergenceResult, DivergencePoint, SentimentType, RiskLevel } from '@/types';

const SENTIMENT_LABELS: Record<SentimentType, string> = {
  positive: '正面',
  neutral: '中性',
  negative: '负面',
  severe_negative: '严重负面',
};

function tokenize(text: string): Set<string> {
  const clean = text.replace(/[，。！？、；：""''（）【】\s,.!?;:"'()\[\]]+/g, ' ');
  const words = clean
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => w.toLowerCase());
  return new Set(words);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  a.forEach((w) => {
    if (b.has(w)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return intersection / union;
}

export function detectDivergence(annotationA?: Annotation, annotationB?: Annotation): DivergenceResult | null {
  if (!annotationA || !annotationB) return null;

  const points: DivergencePoint[] = [];

  if (annotationA.sentiment !== annotationB.sentiment) {
    points.push({
      field: 'sentiment',
      level: 'critical',
      description: `倾向判定不一致：A判定为"${SENTIMENT_LABELS[annotationA.sentiment]}"，B判定为"${SENTIMENT_LABELS[annotationB.sentiment]}"`,
      valueA: annotationA.sentiment,
      valueB: annotationB.sentiment,
    });
  }

  const riskDiff = Math.abs((annotationA.riskLevel as number) - (annotationB.riskLevel as number));
  if (riskDiff >= 2) {
    points.push({
      field: 'riskLevel',
      level: 'critical',
      description: `风险等级差异${riskDiff}级：A判定${annotationA.riskLevel}级，B判定${annotationB.riskLevel}级`,
      valueA: annotationA.riskLevel,
      valueB: annotationB.riskLevel,
    });
  } else if (riskDiff === 1) {
    points.push({
      field: 'riskLevel',
      level: 'warning',
      description: `风险等级相差1级：A判定${annotationA.riskLevel}级，B判定${annotationB.riskLevel}级`,
      valueA: annotationA.riskLevel,
      valueB: annotationB.riskLevel,
    });
  }

  const tokensA = tokenize(annotationA.reason);
  const tokensB = tokenize(annotationB.reason);
  const similarity = jaccardSimilarity(tokensA, tokensB);
  if (similarity < 0.4) {
    points.push({
      field: 'reason',
      level: 'notice',
      description: `判断理由关键词重合度仅${(similarity * 100).toFixed(0)}%，建议沟通确认分析角度是否一致`,
      valueA: annotationA.reason,
      valueB: annotationB.reason,
    });
  }

  const hasDivergence = points.length > 0;

  let summary = '';
  if (!hasDivergence) {
    summary = '两人标注结果一致，无需裁定';
  } else {
    const criticalCount = points.filter((p) => p.level === 'critical').length;
    const warningCount = points.filter((p) => p.level === 'warning').length;
    const noticeCount = points.filter((p) => p.level === 'notice').length;
    const parts: string[] = [];
    if (criticalCount > 0) parts.push(`${criticalCount}处重大分歧`);
    if (warningCount > 0) parts.push(`${warningCount}处警告`);
    if (noticeCount > 0) parts.push(`${noticeCount}处提示`);
    summary = `检测到${parts.join('、')}，建议高级分析师介入裁定`;
  }

  return { hasDivergence, points, summary };
}
