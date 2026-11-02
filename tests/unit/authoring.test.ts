import { describe, it, expect } from 'vitest';
import { validateQuiz } from '../../Engine/core/validate';
import { resolvePresentation } from '../../Engine/core/presentation';
import v1Quiz from '../../data/preferencia-atendimento/quiz.json';

const validV2Base = {
  schemaVersion: 2,
  id: 'beleza-unhas',
  version: '4.0.0',
  title: 'Diagnóstico de Precificação para Nail Designers',
  locale: 'pt-BR',
  demo: true,
  theme: 'rose',
  identification: [
    { id: 'nome', label: 'Seu nome', type: 'text', required: true }
  ],
  pages: [
    {
      id: 'p1',
      title: 'Etapa 1',
      blocks: [
        {
          type: 'question',
          id: 'servico',
          label: 'Serviço',
          required: true,
          input: 'choice',
          options: [
            { id: 'a', label: 'Opção A', values: { minutes: '40', materials: '10' } },
            { id: 'b', label: 'Opção B', values: { minutes: '60', materials: '20' } }
          ]
        }
      ]
    }
  ],
  result: {
    kind: 'pricing-v1',
    contributionQuestions: ['servico'],
    durationKey: 'minutes',
    materialsKey: 'materials',
    availabilityQuestion: 'servico',
    availabilityKey: 'minutes',
    profileQuestion: 'servico',
    profiles: {
      a: { label: 'Perfil A', description: 'Desc A' },
      b: { label: 'Perfil B', description: 'Desc B' }
    },
    priorityQuestion: 'servico',
    priorityTexts: {
      a: 'Texto A',
      b: 'Texto B'
    },
    scenario: {
      currency: 'BRL',
      operatingHourly: '12.00',
      compensationHourly: '24.00',
      feeRate: '0.05',
      targetMargins: ['0.00', '0.15', '0.25']
    },
    packages: [
      { id: 'p1', label: 'Pacote 1', overrides: { servico: 'a' } },
      { id: 'p2', label: 'Pacote 2', overrides: { servico: 'b' } }
    ]
  },
  presentation: {
    preview: {
      title: 'Diagnóstico Preliminar',
      blocks: ['profile', 'time-audit', 'pricing-diagnosis', 'hourly-rate']
    },
    report: {
      template: 'pricing-report-v1',
      title: 'Relatório Executivo Completo',
      blocks: ['cost-breakdown', 'margin-scenarios', 'packages', 'menu-recommendation', 'whatsapp-script']
    }
  },
  offer: {
    mode: 'demo',
    currency: 'BRL',
    priceCents: 1990
  },
  evidence: {
    sources: [
      {
        title: 'E-book Sebrae Formação de Preço',
        url: 'https://conhecimento.sebraers.com.br/wp-content/uploads/2023/08/E-Book-Como-formar-preco-de-servicos-12857.pdf',
        accessedOn: '2026-11-02',
        scope: 'Metodologia de rateio de despesas fixas e margem sobre faturamento'
      }
    ],
    limitations: [
      'Valores de materiais e tempos são referências médias e dependem da marca e destreza individual.'
    ]
  }
};

describe('Contrato de Autoria v2 e Compatibilidade v1', () => {
  it('valida quiz v1 legado com sucesso', () => {
    const v = validateQuiz(v1Quiz);
    expect(v.success).toBe(true);
    if (!v.success) return;
    const p = resolvePresentation(v.data);
    expect(p.presentation.preview.title).toBeDefined();
    expect(p.offer.mode).toBe('demo');
    expect(p.evidence.limitations.length).toBeGreaterThan(0);
  });

  it('valida quiz v2 completo com sucesso', () => {
    const v = validateQuiz(validV2Base);
    expect(v.success).toBe(true);
  });

  it('rejeita quiz v2 sem presentation, offer ou evidence', () => {
    const semPresentation = { ...validV2Base, presentation: undefined };
    expect(validateQuiz(semPresentation).success).toBe(false);

    const semOffer = { ...validV2Base, offer: undefined };
    expect(validateQuiz(semOffer).success).toBe(false);

    const semEvidence = { ...validV2Base, evidence: undefined };
    expect(validateQuiz(semEvidence).success).toBe(false);
  });

  it('rejeita blocos duplicados em presentation.preview', () => {
    const dup = {
      ...validV2Base,
      presentation: {
        ...validV2Base.presentation,
        preview: {
          title: 'Prévia',
          blocks: ['profile', 'profile']
        }
      }
    };
    const v = validateQuiz(dup);
    expect(v.success).toBe(false);
  });

  it('rejeita blocos desconhecidos', () => {
    const inv = {
      ...validV2Base,
      presentation: {
        ...validV2Base.presentation,
        preview: {
          title: 'Prévia',
          blocks: ['bloco-inexistente']
        }
      }
    };
    expect(validateQuiz(inv).success).toBe(false);
  });

  it('rejeita offer com priceCents quando report é nulo', () => {
    const inv = {
      ...validV2Base,
      presentation: {
        ...validV2Base.presentation,
        report: null
      },
      offer: {
        mode: 'demo',
        currency: 'BRL',
        priceCents: 1500
      }
    };
    const v = validateQuiz(inv);
    expect(v.success).toBe(false);
  });

  it('permite report nulo quando priceCents é nulo', () => {
    const ok = {
      ...validV2Base,
      presentation: {
        ...validV2Base.presentation,
        report: null
      },
      offer: {
        mode: 'demo',
        currency: 'BRL',
        priceCents: null
      }
    };
    expect(validateQuiz(ok).success).toBe(true);
  });

  it('rejeita fontes que não utilizem protocolo HTTPS', () => {
    const inv = {
      ...validV2Base,
      evidence: {
        ...validV2Base.evidence,
        sources: [
          {
            title: 'Inseguro',
            url: 'http://inseguro.com/artigo.pdf',
            accessedOn: '2026-11-02',
            scope: 'Geral'
          }
        ]
      }
    };
    expect(validateQuiz(inv).success).toBe(false);
  });

  it('rejeita fontes com data inválida', () => {
    const inv = {
      ...validV2Base,
      evidence: {
        ...validV2Base.evidence,
        sources: [
          {
            title: 'Fonte',
            url: 'https://sebrae.com.br/artigo.pdf',
            accessedOn: '02-11-2026',
            scope: 'Geral'
          }
        ]
      }
    };
    expect(validateQuiz(inv).success).toBe(false);
  });

  it('rejeita evidence sem limitações declaradas', () => {
    const inv = {
      ...validV2Base,
      evidence: {
        sources: [],
        limitations: []
      }
    };
    expect(validateQuiz(inv).success).toBe(false);
  });
});
