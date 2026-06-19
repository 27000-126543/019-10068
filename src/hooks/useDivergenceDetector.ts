import { useMemo } from 'react';
import type { Annotation, DivergenceResult } from '@/types';
import { detectDivergence } from '@/utils/divergence';

export default function useDivergenceDetector(
  annotationA?: Annotation,
  annotationB?: Annotation,
): DivergenceResult | null {
  return useMemo(() => {
    return detectDivergence(annotationA, annotationB);
  }, [annotationA, annotationB]);
}
