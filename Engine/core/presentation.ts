import type { Quiz, Presentation, Offer, Evidence } from './schema';

export type ResolvedPresentation = {
  presentation: Presentation;
  offer: Offer;
  evidence: Evidence;
};

export function resolvePresentation(quiz: Quiz): ResolvedPresentation {
  if (quiz.schemaVersion === 2 || quiz.schemaVersion === 3) {
    return {
      presentation: quiz.presentation,
      offer: quiz.offer,
      evidence: quiz.evidence,
    };
  }

  // Schema v1 defaults
  const isPricing = quiz.result.kind === 'pricing-v1';
  return {
    presentation: {
      preview: {
        title: 'Sua prévia de atendimento',
        blocks: isPricing
          ? ['profile', 'pricing-diagnosis', 'time-audit', 'hourly-rate', 'scenarios']
          : ['profile'],
      },
      report: isPricing
        ? {
            template: 'pricing-report-v1',
            title: 'Relatório Técnico e Comercial',
            blocks: ['profile', 'pricing-diagnosis', 'cost-breakdown', 'margin-scenarios', 'packages'],
          }
        : null,
    },
    offer: {
      mode: 'demo',
      currency: 'BRL',
      priceCents: null,
    },
    evidence: {
      sources: [],
      limitations: ['Valores de referência para demonstração da metodologia de cálculo.'],
    },
  };
}
