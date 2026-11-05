import Decimal from 'decimal.js';
import { quizSchema, type Quiz, type Question } from './schema';

export const questions = (q: Quiz): Question[] =>
  q.pages.flatMap(p => p.blocks.filter((b): b is Question => b.type === 'question'));

export type Issue = { path: string; message: string };

export function validateQuiz(input: unknown): { success: true; data: Quiz } | { success: false; errors: Issue[] } {
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, errors: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) };

  const q = parsed.data, errors: Issue[] = [];
  const error = (path: string, message: string) => errors.push({ path, message });
  const unique = (ids: string[], path: string) => {
    if (new Set(ids).size !== ids.length) error(path, 'Identificadores duplicados.');
  };

  unique(q.identification.map(f => f.id), 'identification');
  unique(q.pages.map(p => p.id), 'pages');
  const qs = questions(q);
  unique(qs.map(x => x.id), 'pages.questions');
  const byId = new Map(qs.map(x => [x.id, x]));
  qs.forEach(x => unique(x.options.map(o => o.id), `questions.${x.id}.options`));

  // Validate condition references
  for (const page of q.pages) {
    for (const b of page.blocks) {
      if (b.condition && !byId.has(b.condition.questionId)) {
        error(`conditions.${b.condition.questionId}`, 'Pergunta referenciada em condição não existe.');
      }
    }
  }

  const r = q.result;

  const ref = (key: string, allowMoney = false, allowDirectInput = false) => {
    const v = byId.get(key);
    if (!v) {
      error(`result.${key}`, 'Pergunta inexistente.');
    } else {
      if (!v.required && r.kind !== 'business-diagnosis-v1') {
        error(`result.${key}`, 'Pergunta usada por regra deve ser obrigatória.');
      }
      if (v.input === 'money' && !allowMoney && !allowDirectInput) {
        error(`result.${key}`, 'Esta regra exige alternativas, não entrada monetária.');
      }
      if ((v.input === 'number' || v.input === 'text') && !allowDirectInput) {
        error(`result.${key}`, 'Esta regra exige alternativas, não entrada direta.');
      }
    }
    return v;
  };

  const exact = (keys: string[], expected: string[], path: string) => {
    if (keys.length !== expected.length || keys.some(k => !expected.includes(k)))
      error(path, 'Cobertura de opções inválida.');
  };

  if (r.kind === 'category-table-v1') {
    unique(r.questionIds, 'result.questionIds');
    const refs = r.questionIds.map(key => ref(key));
    const seen = new Set<string>();
    for (const [i, row] of r.rows.entries()) {
      exact(Object.keys(row.answers), r.questionIds, `result.rows.${i}`);
      refs.forEach((v, j) => {
        if (v && !v.options.some(o => o.id === row.answers[r.questionIds[j]]))
          error(`result.rows.${i}`, 'Alternativa inexistente.');
      });
      const key = JSON.stringify(r.questionIds.map(k => row.answers[k]));
      if (seen.has(key)) error(`result.rows.${i}`, 'Combinação duplicada.');
      seen.add(key);
    }
    if (refs.every(Boolean) && r.rows.length !== refs.reduce((n, v) => n * v!.options.length, 1))
      error('result.rows', 'Tabela incompleta.');
  } else if (r.kind === 'pricing-v1') {
    unique(r.contributionQuestions, 'result.contributionQuestions');
    unique(r.packages.map(p => p.id), 'result.packages');
    for (const key of r.contributionQuestions) {
      for (const o of ref(key)?.options ?? []) {
        const values = o.values ?? {};
        if (!/^\d+$/.test(values[r.durationKey] ?? '') || !Number.isSafeInteger(Number(values[r.durationKey])))
          error(`questions.${key}.${o.id}.${r.durationKey}`, 'Minutos inteiros não negativos obrigatórios.');
        if (!/^\d+(\.\d{1,2})?$/.test(values[r.materialsKey] ?? ''))
          error(`questions.${key}.${o.id}.${r.materialsKey}`, 'Custo não negativo com até duas casas obrigatório.');
      }
    }
    for (const o of ref(r.availabilityQuestion)?.options ?? []) {
      if (
        !/^\d+$/.test(o.values?.[r.availabilityKey] ?? '') ||
        !Number.isSafeInteger(Number(o.values?.[r.availabilityKey])) ||
        Number(o.values?.[r.availabilityKey]) <= 0
      )
        error('result.availabilityQuestion', 'Disponibilidade deve ser inteira e positiva.');
    }
    const profile = ref(r.profileQuestion), priority = ref(r.priorityQuestion);
    if (profile) exact(Object.keys(r.profiles), profile.options.map(o => o.id), 'result.profiles');
    if (priority) exact(Object.keys(r.priorityTexts), priority.options.map(o => o.id), 'result.priorityTexts');
    const fee = new Decimal(r.scenario.feeRate);
    if (fee.gte(1)) error('result.scenario.feeRate', 'Taxa deve ser menor que 1.');
    r.scenario.targetMargins.forEach((m, i) => {
      if (new Decimal(m).gte(1) || fee.plus(m).gte(1))
        error(`result.scenario.targetMargins.${i}`, 'Taxa + margem deve ser menor que 1.');
    });
    if (!r.scenario.targetMargins.some(m => new Decimal(m).isZero()))
      error('result.scenario.targetMargins', 'Incluir margem zero para preço mínimo.');
    unique(r.scenario.targetMargins.map(m => new Decimal(m).toString()), 'result.scenario.targetMargins');
    if (r.actualPriceKey && !r.actualPriceQuestion)
      error('result.actualPriceQuestion', 'Pergunta de preço praticado obrigatória quando há métrica.');
    if (r.actualPriceQuestion) {
      const apRef = ref(r.actualPriceQuestion, true);
      if (apRef?.input === 'money') {
        if (r.actualPriceKey) error('result.actualPriceKey', 'Preço livre não usa chave de métrica.');
      } else if (!r.actualPriceKey) {
        error('result.actualPriceKey', 'Chave da métrica de preço praticado obrigatória.');
      } else {
        for (const o of apRef?.options ?? []) {
          const v = o.values?.[r.actualPriceKey];
          if (!v || !/^\d+(\.\d{1,2})?$/.test(v) || new Decimal(v).lte(0))
            error(`questions.${r.actualPriceQuestion}.${o.id}.${r.actualPriceKey}`, 'Preço praticado deve ser valor decimal positivo.');
        }
      }
    }
    r.packages.forEach((p, i) => {
      if (!Object.keys(p.overrides).length) error(`result.packages.${i}`, 'Substituição obrigatória.');
      for (const [k, v] of Object.entries(p.overrides)) {
        const x = ref(k);
        if (x && !x.options.some(o => o.id === v)) error(`result.packages.${i}.${k}`, 'Alternativa inexistente.');
      }
    });
  } else if (r.kind === 'business-diagnosis-v1') {
    if (r.growth) {
      const g=r.growth;
      const goal=ref(g.goalQuestion), audience=ref(g.clientNeedQuestion);
      [g.horizonQuestion,g.constraintQuestion,g.clientBarrierQuestion,g.clientReturnQuestion].forEach(k=>ref(k));
      const hours=ref(g.desiredHoursQuestion,false,true);
      if(hours && (hours.input!=='number'||hours.min===undefined||hours.min<=0||hours.max===undefined||hours.max>168)) error('result.growth.desiredHoursQuestion','Exigir número com limites positivos até 168 horas.');
      unique(g.strategies.map(s=>s.option),'result.growth.strategies');
      unique(g.audienceStrategies.map(s=>s.option),'result.growth.audienceStrategies');
      if(goal) exact(g.strategies.map(s=>s.option),goal.options.map(o=>o.id),'result.growth.strategies');
      if(audience) exact(g.audienceStrategies.map(s=>s.option),audience.options.map(o=>o.id),'result.growth.audienceStrategies');
    }
    ref(r.servicesQuestion, false, true);
    unique(r.services.map(s => s.id), 'result.services');
    const serviceIds = new Set(r.services.map(s => s.id));
    for (const s of r.services) {
      ref(s.timeQuestion, false, true);
      ref(s.priceQuestion, true, true);
      ref(s.materialsQuestion, true, true);
      ref(s.quantityQuestion, false, true);
      if (s.category === 'combo' && s.includedServices) {
        for (const inc of s.includedServices) {
          if (!serviceIds.has(inc)) error(`result.services.${s.id}.includedServices`, `Serviço ${inc} não configurado.`);
        }
      }
    }
    ref(r.capacity.daysPerWeekQuestion, false, true);
    ref(r.capacity.hoursPerDayQuestion, false, true);
    ref(r.capacity.supportHoursQuestion, false, true);
    if (r.capacity.spaceTypeQuestion) ref(r.capacity.spaceTypeQuestion, false, true);

    unique(r.expenses.map(e => e.id), 'result.expenses');
    for (const e of r.expenses) {
      ref(e.amountQuestion, true, true);
      if (e.sharePercentQuestion) ref(e.sharePercentQuestion, false, true);
      if (e.workAmountQuestion) ref(e.workAmountQuestion, false, true);
    }

    if (r.feeRateQuestion) ref(r.feeRateQuestion, false, true);
    if (r.feeAmountQuestion) ref(r.feeAmountQuestion, false, true);
    if (r.remunerationQuestion) ref(r.remunerationQuestion, true, true);
    if (r.targetRemunerationQuestion) ref(r.targetRemunerationQuestion, true, true);

    if (r.marketing) {
      ref(r.marketing.channelsQuestion, false, true);
      if (r.marketing.channelExpenses) {
        for (const qId of Object.values(r.marketing.channelExpenses)) ref(qId, true, true);
      }
      if (r.marketing.channelClients) {
        for (const qId of Object.values(r.marketing.channelClients)) ref(qId, false, true);
      }
    }

    if (r.personalFinances) {
      ref(r.personalFinances.optInQuestion, false, true);
      const pf = r.personalFinances;
      [pf.housingQuestion, pf.foodQuestion, pf.utilitiesQuestion, pf.transportQuestion, pf.dependentsQuestion, pf.otherQuestion, pf.otherIncomeQuestion]
        .filter((q): q is string => Boolean(q))
        .forEach(qId => ref(qId, true, true));
    }

    if (r.reservesAndDebts) {
      ref(r.reservesAndDebts.optInQuestion, false, true);
      const rd = r.reservesAndDebts;
      [rd.businessCashQuestion, rd.personalReserveQuestion, rd.monthlyDebtQuestion, rd.totalDebtQuestion, rd.overdueDebtAmountQuestion]
        .filter((q): q is string => Boolean(q))
        .forEach(qId => ref(qId, true, true));
      if (rd.overdueDebtQuestion) {
        ref(rd.overdueDebtQuestion, true, false);
      }
    }

    if (r.monthlyHistory) {
      ref(r.monthlyHistory.optInQuestion, false, true);
      for (const m of r.monthlyHistory.months ?? []) {
        ref(m.revenueQuestion, true, true);
        ref(m.expensesQuestion, true, true);
        ref(m.withdrawalsQuestion, true, true);
      }
    }

    for (const rec of r.recommendations) {
      if (!byId.has(rec.condition.techniqueQuestionId))
        error(`recommendations.${rec.id}`, 'Pergunta de técnica inexistente.');
      if (rec.condition.interestQuestionId && !byId.has(rec.condition.interestQuestionId))
        error(`recommendations.${rec.id}`, 'Pergunta de interesse inexistente.');
    }
  }

  if (r.kind === 'pricing-v1' || r.kind === 'category-table-v1') {
    for (const question of qs) {
      if (question.input === 'money' && (r.kind !== 'pricing-v1' || r.actualPriceQuestion !== question.id)) {
        error(`questions.${question.id}`, 'Entrada monetária deve ser a pergunta de preço praticado.');
      }
    }
  }

  return errors.length ? { success: false, errors } : { success: true, data: q };
}
