import { z } from 'zod';

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine(v => !['constructor', 'prototype'].includes(v));
const decimal = z.string().regex(/^\d+(\.\d+)?$/).max(40);
const money = z.string().regex(/^\d+(\.\d{1,2})?$/).max(20);
const option = z.strictObject({
  id,
  label: text,
  description: text.optional(),
  icon: text.optional(),
  badge: text.optional(),
  values: z.record(id, decimal).optional(),
});

export const questionConditionSchema = z.strictObject({
  questionId: id,
  equals: z.string().optional(),
  notEquals: z.string().optional(),
  includes: z.string().optional(),
  notIncludes: z.string().optional(),
});
export type QuestionCondition = z.infer<typeof questionConditionSchema>;

export const questionSchema = z.strictObject({
  type: z.literal('question'),
  id,
  label: text,
  helpText: text.optional(),
  required: z.boolean(),
  input: z.enum(['choice', 'multi-choice', 'money', 'number', 'text']).default('choice'),
  variant: z.enum(['standard', 'cards', 'chips', 'segmented', 'compact', 'inline']).optional(),
  columns: z.enum(['1', '2', '3', '4', 'auto']).optional(),
  unit: text.optional(),
  prefix: text.optional(),
  icon: text.optional(),
  group: text.optional(),
  groupTitle: text.optional(),
  groupIcon: text.optional(),
  groupBadge: text.optional(),
  marginBottom: z.enum(['none', 'tight', 'normal', 'relaxed', 'loose']).optional(),
  placeholder: text.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(option).default([]),
  allowUnknown: z.boolean().optional(),
  condition: questionConditionSchema.optional(),
}).superRefine((q, ctx) => {
  if (q.input === 'choice' && q.options.length < 2)
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Pelo menos duas alternativas são obrigatórias.' });
  if (q.input === 'multi-choice' && q.options.length < 1)
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Pelo menos uma alternativa é obrigatória para seleção múltipla.' });
  if (['money', 'number', 'text'].includes(q.input) && q.options.length > 0)
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Preço livre, números e textos não aceitam alternativas.' });
});

export const textBlockSchema = z.strictObject({
  type: z.literal('text'),
  text,
  variant: z.enum(['standard', 'tip', 'warning', 'info', 'highlight', 'lead']).optional(),
  marginBottom: z.enum(['none', 'tight', 'normal', 'relaxed', 'loose']).optional(),
  title: text.optional(),
  icon: text.optional(),
  condition: questionConditionSchema.optional(),
});

const profile = z.strictObject({ label: text, description: text });

const pricing = z.strictObject({
  kind: z.literal('pricing-v1'),
  contributionQuestions: z.array(id).min(1),
  durationKey: id,
  materialsKey: id,
  availabilityQuestion: id,
  availabilityKey: id,
  profileQuestion: id,
  profiles: z.record(id, profile),
  priorityQuestion: id,
  priorityTexts: z.record(id, text),
  actualPriceQuestion: id.optional(),
  actualPriceKey: id.optional(),
  scenario: z.strictObject({
    currency: z.literal('BRL'),
    operatingHourly: money,
    compensationHourly: money,
    feeRate: decimal,
    targetMargins: z.array(decimal).length(3),
  }),
  packages: z.array(z.strictObject({ id, label: text, overrides: z.record(id, id) })).length(2),
});

const category = z.strictObject({
  kind: z.literal('category-table-v1'),
  questionIds: z.array(id).min(1),
  rows: z.array(z.strictObject({ answers: z.record(id, id), label: text, description: text })).min(1),
});

export const recommendationSchema = z.strictObject({
  id,
  title: text,
  need: text,
  targetAudience: text,
  prerequisites: text,
  cost: text,
  verifiedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data de verificação deve estar no formato AAAA-MM-DD.' }),
  link: z.string().url().refine(u => u.startsWith('https://'), { message: 'URL deve usar HTTPS.' }),
  isAffiliate: z.boolean(),
  affiliateDisclaimer: text,
  condition: z.strictObject({
    techniqueQuestionId: id,
    levels: z.array(z.string()).min(1),
    interestQuestionId: id.optional(),
  }),
  freeAlternative: z.strictObject({
    title: text,
    url: z.string().url().optional(),
    description: text,
  }).optional(),
});

export const businessDiagnosisSchema = z.strictObject({
  kind: z.literal('business-diagnosis-v1'),
  growth: z.strictObject({
    goalQuestion:id, horizonQuestion:id, constraintQuestion:id, desiredHoursQuestion:id,
    clientNeedQuestion:id, clientBarrierQuestion:id, clientReturnQuestion:id,
    strategies:z.array(z.strictObject({option:id,title:text,action:text,indicator:text})).min(1),
    audienceStrategies:z.array(z.strictObject({option:id,action:text})).min(1),
  }).optional(),
  servicesQuestion: id,
  customServiceNameQuestion: id.optional(),
  services: z.array(z.strictObject({
    id,
    label: text,
    category: z.enum(['avulso', 'adicional', 'combo']),
    timeQuestion: id,
    priceQuestion: id,
    materialsQuestion: id,
    quantityQuestion: id,
    includedServices: z.array(id).optional(),
  })).min(1),
  capacity: z.strictObject({
    daysPerWeekQuestion: id,
    hoursPerDayQuestion: id,
    supportHoursQuestion: id,
    supportHoursPeriod: z.enum(['week', 'month']).default('week'),
    spaceTypeQuestion: id.optional(),
  }),
  expenses: z.array(z.strictObject({
    id,
    label: text,
    category: text,
    amountQuestion: id,
    sharePercentQuestion: id.optional(),
    workAmountQuestion: id.optional(),
    period: z.enum(['month', 'year']).default('month'),
  })),
  feeRateQuestion: id.optional(),
  feeAmountQuestion: id.optional(),
  defaultFeeRate: decimal.default('0.05'),
  targetMargins: z.array(decimal).default(['0.15', '0.20', '0.25']),
  remunerationQuestion: id.optional(),
  targetRemunerationQuestion: id.optional(),
  marketing: z.strictObject({
    channelsQuestion: id,
    channelExpenses: z.record(id, id).optional(),
    channelClients: z.record(id, id).optional(),
  }).optional(),
  personalFinances: z.strictObject({
    optInQuestion: id,
    housingQuestion: id.optional(),
    foodQuestion: id.optional(),
    utilitiesQuestion: id.optional(),
    transportQuestion: id.optional(),
    dependentsQuestion: id.optional(),
    otherQuestion: id.optional(),
    otherIncomeQuestion: id.optional(),
  }).optional(),
  reservesAndDebts: z.strictObject({
    optInQuestion: id,
    businessCashQuestion: id.optional(),
    personalReserveQuestion: id.optional(),
    monthlyDebtQuestion: id.optional(),
    totalDebtQuestion: id.optional(),
    overdueDebtQuestion: id.optional(),
    overdueDebtAmountQuestion: id.optional(),
  }).optional(),
  monthlyHistory: z.strictObject({
    optInQuestion: id,
    months: z.array(z.strictObject({
      monthKey: z.string(),
      label: text,
      revenueQuestion: id,
      expensesQuestion: id,
      withdrawalsQuestion: id,
    })).optional(),
  }).optional(),
  recommendations: z.array(recommendationSchema).default([]),
});

export const previewBlockSchema = z.enum([
  'growth-plan',
  'profile',
  'time-audit',
  'pricing-diagnosis',
  'hourly-rate',
  'scenarios',
  'hidden-costs',
  'business-summary',
  'capacity-diagnosis',
  'contribution-ranking',
  'priority-actions',
  'limitations-notice',
  'monthly-history',
]);

export const reportBlockSchema = z.enum([
  'growth-plan',
  'profile',
  'executive-summary',
  'pricing-diagnosis',
  'cost-breakdown',
  'margin-scenarios',
  'packages',
  'menu-recommendation',
  'whatsapp-script',
  'dre-overview',
  'monthly-history',
  'service-pricing-analysis',
  'capacity-audit',
  'personal-finance',
  'reserves-and-debt',
  'action-plan',
  'sensitivity-scenarios',
  'recommendations',
  'methodology-sources',
]);

export const presentationSchema = z.strictObject({
  preview: z.strictObject({
    title: text,
    blocks: z.array(previewBlockSchema).min(1).refine(arr => new Set(arr).size === arr.length, {
      message: 'Blocos de prévia repetidos não são permitidos.',
    }),
  }),
  report: z.strictObject({
    template: z.enum(['pricing-report-v1', 'business-report-v1']),
    title: text,
    blocks: z.array(reportBlockSchema).min(1).refine(arr => new Set(arr).size === arr.length, {
      message: 'Blocos de relatório repetidos não são permitidos.',
    }),
  }).nullable(),
});

export const offerSchema = z.strictObject({
  mode: z.literal('demo'),
  currency: z.literal('BRL'),
  priceCents: z.number().int().positive().nullable(),
});

export const sourceSchema = z.strictObject({
  title: text,
  url: z.string().url().refine(u => u.startsWith('https://'), { message: 'URL da fonte deve usar HTTPS.' }),
  accessedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data de acesso deve estar no formato AAAA-MM-DD.' }),
  scope: text,
});

export const evidenceSchema = z.strictObject({
  sources: z.array(sourceSchema),
  limitations: z.array(text).min(1),
});

const baseQuizFields = {
  id,
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  title: text,
  locale: z.literal('pt-BR'),
  demo: z.boolean(),
  theme: z.enum(['rose', 'teal']),
  identification: z.array(z.strictObject({ id, type: z.enum(['text', 'email']), label: text, required: z.boolean() })),
  pages: z.array(z.strictObject({
    id,
    title: text,
    subtitle: text.optional(),
    badge: text.optional(),
    layout: z.enum(['standard', 'cards-grid', 'compact', 'split']).optional(),
    blocks: z.array(z.discriminatedUnion('type', [
      textBlockSchema,
      questionSchema,
    ])).min(1),
  })).min(1),
  result: z.discriminatedUnion('kind', [pricing, category, businessDiagnosisSchema]),
};

const quizV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  ...baseQuizFields,
  presentation: presentationSchema.optional(),
  offer: offerSchema.optional(),
  evidence: evidenceSchema.optional(),
});

const quizV2Schema = z.strictObject({
  schemaVersion: z.literal(2),
  ...baseQuizFields,
  presentation: presentationSchema,
  offer: offerSchema,
  evidence: evidenceSchema,
}).superRefine((q, ctx) => {
  if (q.presentation.report === null && q.offer.priceCents !== null) {
    ctx.addIssue({
      code: 'custom',
      path: ['offer', 'priceCents'],
      message: 'Sem relatório configurado, o preço da oferta deve ser nulo.',
    });
  }
});

const quizV3Schema = z.strictObject({
  schemaVersion: z.literal(3),
  ...baseQuizFields,
  presentation: presentationSchema,
  offer: offerSchema,
  evidence: evidenceSchema,
}).superRefine((q, ctx) => {
  if (q.presentation.report === null && q.offer.priceCents !== null) {
    ctx.addIssue({
      code: 'custom',
      path: ['offer', 'priceCents'],
      message: 'Sem relatório configurado, o preço da oferta deve ser nulo.',
    });
  }
});

export const quizSchema = z.discriminatedUnion('schemaVersion', [quizV1Schema, quizV2Schema, quizV3Schema]);

export type Quiz = z.infer<typeof quizSchema>;
export type QuizV1 = z.infer<typeof quizV1Schema>;
export type QuizV2 = z.infer<typeof quizV2Schema>;
export type QuizV3 = z.infer<typeof quizV3Schema>;
export type Question = z.infer<typeof questionSchema>;
export type Answers = Record<string, string>;
export type Presentation = z.infer<typeof presentationSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type BusinessDiagnosisConfig = z.infer<typeof businessDiagnosisSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
