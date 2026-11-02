import { z } from 'zod';

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine(v => !['constructor', 'prototype'].includes(v));
const decimal = z.string().regex(/^\d+(\.\d+)?$/).max(40);
const money = z.string().regex(/^\d+(\.\d{1,2})?$/).max(20);
const option = z.strictObject({ id, label: text, values: z.record(id, decimal).optional() });

export const questionSchema = z.strictObject({
  type: z.literal('question'),
  id,
  label: text,
  required: z.boolean(),
  input: z.enum(['choice', 'money']).default('choice'),
  options: z.array(option).default([]),
}).superRefine((q, ctx) => {
  if (q.input === 'choice' && q.options.length < 2)
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Pelo menos duas alternativas são obrigatórias.' });
  if (q.input === 'money' && q.options.length)
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Preço livre não aceita alternativas.' });
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

export const previewBlockSchema = z.enum([
  'profile',
  'time-audit',
  'pricing-diagnosis',
  'hourly-rate',
  'scenarios',
  'hidden-costs',
]);

export const reportBlockSchema = z.enum([
  'profile',
  'executive-summary',
  'pricing-diagnosis',
  'cost-breakdown',
  'margin-scenarios',
  'packages',
  'menu-recommendation',
  'whatsapp-script',
]);

export const presentationSchema = z.strictObject({
  preview: z.strictObject({
    title: text,
    blocks: z.array(previewBlockSchema).min(1).refine(arr => new Set(arr).size === arr.length, {
      message: 'Blocos de prévia repetidos não são permitidos.',
    }),
  }),
  report: z.strictObject({
    template: z.literal('pricing-report-v1'),
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
    blocks: z.array(z.discriminatedUnion('type', [
      z.strictObject({ type: z.literal('text'), text }),
      questionSchema,
    ])).min(1),
  })).min(1),
  result: z.discriminatedUnion('kind', [pricing, category]),
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

export const quizSchema = z.discriminatedUnion('schemaVersion', [quizV1Schema, quizV2Schema]);

export type Quiz = z.infer<typeof quizSchema>;
export type QuizV1 = z.infer<typeof quizV1Schema>;
export type QuizV2 = z.infer<typeof quizV2Schema>;
export type Question = z.infer<typeof questionSchema>;
export type Answers = Record<string, string>;
export type Presentation = z.infer<typeof presentationSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
