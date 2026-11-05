import Decimal from 'decimal.js';
import type { Quiz, Answers, BusinessDiagnosisConfig, Recommendation } from './schema';
import { normalizeMoney, normalizeNumber, parseMultiChoice, parseMoneyAnswer } from './answers';
import { buildGrowthPlan, type GrowthPlan } from './growth';

export const D = Decimal.clone({ precision: 40 });

export type BusinessServiceResult = {
  id: string;
  label: string;
  category: 'avulso' | 'adicional' | 'combo';
  price: string;
  timeMinutes: number;
  materialsCost: string;
  monthlyQuantity: number;
  monthlyRevenue: string;
  monthlyMaterialsCost: string;
  unitContributionMargin: string;
  contributionMarginRatio: string;
  contributionPerHour: string;
  hourlyRanking: number;
  suggestedPrices: { margin: string; price: string }[];
};

export type BusinessDiagnosisResult = {
  growthPlan?: GrowthPlan;
  quizId: string;
  version: string;
  demo: boolean;
  kind: 'business-diagnosis-v1';
  profile: { label: string; description: string };
  explanation: string;

  services: BusinessServiceResult[];

  totalMonthlyServices: number;
  grossMonthlyRevenue: string;
  totalMonthlyMaterials: string;
  paymentFeeRate: string | null;
  paymentFeeRateEstimated?: boolean;
  totalPaymentFees: string | null;
  paymentFeeStatus: 'zero' | 'known' | 'unknown' | 'uninformed';
  totalVariableCosts: string;
  totalContributionMargin: string;
  averageContributionMarginRatio: string;

  capacity: {
    daysPerWeek: number;
    hoursPerDay: number;
    grossHoursAvailablePerMonth: string;
    supportHoursPerMonth: string;
    netHoursAvailablePerMonth: string;
    hoursDemandedPerMonth: string;
    occupancyRate: string;
    occupancyPercent: string;
    status: 'overcapacity' | 'balanced' | 'undercapacity';
    message: string;
    spaceType?: string;
  };

  fixedExpenses: {
    items: {
      id: string;
      label: string;
      category: string;
      rawAmount: string;
      sharePercent?: string;
      workAmount?: string | null;
      isEstimated?: boolean;
      period: 'month' | 'year';
      effectiveMonthlyAmount: string;
    }[];
    totalGeneralExpenses: string;
    totalMarketingExpenses: string;
    totalFixedExpenses: string;
    costPerHourFixed: string;
  };

  financials: {
    grossRevenue: string;
    variableCosts: string;
    contributionMargin: string;
    fixedExpenses: string;
    operatingProfitBeforeWithdrawal: string;
    currentRemuneration: string;
    targetRemuneration: string;
    netOperatingProfit: string;
    breakEvenOperationalRevenue: string | null;
    breakEvenTotalRevenue: string | null;
    breakEvenExplanation: string;
    hasIncompleteExpenses?: boolean;
    incompleteExpensesNotice?: string;
    status: 'healthy' | 'warning' | 'deficit';
  };

  personalFinances?: {
    isProvided: boolean;
    totalPersonalExpenses: string;
    otherIncome: string;
    netPersonalNeed: string;
    currentWithdrawal: string;
    difference: string;
    isSufficient: boolean | null;
    hasUninformedExpenses?: boolean;
    uninformedCategories?: string[];
    items: { category: string; amount: string | null }[];
  };

  reservesAndDebts?: {
    isProvided: boolean;
    businessCash: string;
    personalReserve: string;
    monthlyDebt: string;
    totalDebt: string;
    hasOverdueDebt: boolean;
    overdueDebtStatus: 'overdue' | 'up_to_date' | 'no_debt' | 'uninformed';
    overdueDebtAmount?: string | null;
    runwayMonths: string | null;
  };

  monthlyHistory?: {
    isProvided: boolean;
    months: {
      monthKey: string;
      label: string;
      revenue: string;
      expenses: string | null;
      withdrawals: string | null;
      netResult: string | null;
    }[];
    averageHistoricalRevenue: string;
    averageHistoricalExpenses?: string | null;
    averageHistoricalWithdrawals?: string | null;
    averageHistoricalNetResult?: string | null;
    discrepancyWithEstimatedRoutine: string | null;
    trend?: {
      direction: 'growing' | 'stable' | 'declining' | 'fluctuating' | 'single_month';
      percentage: string | null;
      message: string;
    };
  };

  actionPlan: {
    timeframe: '30_dias' | '60_dias' | '90_dias';
    title: string;
    problem: string;
    evidence: string;
    action: string;
    priority: 'alta' | 'media' | 'baixa';
    effort: 'baixo' | 'medio' | 'alto';
    cost: string;
    indicator: string;
  }[];

  sensitivityScenarios: {
    title: string;
    description: string;
    projectedRevenue: string;
    projectedNetProfit: string;
  }[];

  recommendations: Recommendation[];
  limitations: string[];
};

export function evaluateBusinessDiagnosis(
  quiz: Quiz,
  config: BusinessDiagnosisConfig,
  answers: Answers
): BusinessDiagnosisResult {
  const selectedServiceIds = parseMultiChoice(answers[config.servicesQuestion]);
  const activeServices = config.services.filter(s => selectedServiceIds.includes(s.id));

  // 1. Calculate Services & Combos
  let totalMonthlyServices = 0;
  let grossMonthlyRevenue = new D(0);
  let totalMonthlyMaterials = new D(0);
  let totalHoursDemanded = new D(0);

  const baseServices = activeServices.map(s => {
    const priceStr = normalizeMoney(answers[s.priceQuestion] ?? '0') ?? '0';
    const price = new D(priceStr);

    const timeNum = normalizeNumber(answers[s.timeQuestion] ?? '0', 0) ?? 0;
    const timeMinutes = timeNum;

    const materialsStr = normalizeMoney(answers[s.materialsQuestion] ?? '0') ?? '0';
    const materials = new D(materialsStr);

    const qtyNum = normalizeNumber(answers[s.quantityQuestion] ?? '0', 0) ?? 0;
    const monthlyQuantity = Math.floor(qtyNum);

    const monthlyRevenue = price.times(monthlyQuantity);
    const monthlyMaterialsCost = materials.times(monthlyQuantity);
    const hoursSpent = new D(timeMinutes).times(monthlyQuantity).div(60);

    totalMonthlyServices += monthlyQuantity;
    grossMonthlyRevenue = grossMonthlyRevenue.plus(monthlyRevenue);
    totalMonthlyMaterials = totalMonthlyMaterials.plus(monthlyMaterialsCost);
    totalHoursDemanded = totalHoursDemanded.plus(hoursSpent);

    return {
      service: s,
      price,
      timeMinutes,
      materials,
      monthlyQuantity,
      monthlyRevenue,
      monthlyMaterialsCost,
    };
  });

  // Payment fee calculation
  let totalPaymentFees: Decimal | null = null;
  let paymentFeeRate: Decimal | null = null;
  let paymentFeeStatus: 'zero' | 'known' | 'unknown' | 'uninformed' = 'uninformed';
  let isPaymentFeeEstimated = false;

  if (config.feeAmountQuestion) {
    const feeState = parseMoneyAnswer(answers[config.feeAmountQuestion]);
    paymentFeeStatus = feeState.kind;
    if (feeState.kind === 'zero') {
      totalPaymentFees = new D(0);
      paymentFeeRate = new D(0);
    } else if (feeState.kind === 'known') {
      totalPaymentFees = new D(feeState.value);
      if (grossMonthlyRevenue.gt(0)) {
        paymentFeeRate = totalPaymentFees.div(grossMonthlyRevenue);
        isPaymentFeeEstimated = true;
      }
    } else {
      totalPaymentFees = null;
      paymentFeeRate = null;
    }
  } else if (config.feeRateQuestion) {
    const rawFeeRate = normalizeNumber(answers[config.feeRateQuestion], 0, 100);
    if (rawFeeRate !== null) {
      paymentFeeRate = new D(rawFeeRate).div(100);
      totalPaymentFees = grossMonthlyRevenue.times(paymentFeeRate);
      paymentFeeStatus = rawFeeRate === 0 ? 'zero' : 'known';
    } else {
      paymentFeeRate = new D(config.defaultFeeRate);
      totalPaymentFees = grossMonthlyRevenue.times(paymentFeeRate);
      paymentFeeStatus = 'uninformed';
      isPaymentFeeEstimated = true;
    }
  }

  const effectiveUnitFeeRate = paymentFeeRate ?? new D(0);

  const intermediateServices = baseServices.map(item => {
    // Unit contribution margin = Price * (1 - feeRate) - Materials
    const feeAmount = item.price.times(effectiveUnitFeeRate);
    const unitContribution = item.price.minus(feeAmount).minus(item.materials);
    const contributionRatio = item.price.isZero() ? new D(0) : unitContribution.div(item.price);
    const timeInHours = new D(item.timeMinutes).div(60);
    const contributionPerHour = timeInHours.isZero() ? new D(0) : unitContribution.div(timeInHours);

    return {
      ...item,
      unitContribution,
      contributionRatio,
      contributionPerHour,
    };
  });

  // Sort by contribution per hour descending to rank
  const sortedByPerHour = [...intermediateServices].sort((a, b) =>
    b.contributionPerHour.comparedTo(a.contributionPerHour)
  );
  const rankings = new Map<string, number>();
  sortedByPerHour.forEach((item, idx) => {
    rankings.set(item.service.id, idx + 1);
  });

  // 2. Capacity & Occupancy
  const daysPerWeek = normalizeNumber(answers[config.capacity.daysPerWeekQuestion] ?? '5', 1, 7) ?? 5;
  const hoursPerDay = normalizeNumber(answers[config.capacity.hoursPerDayQuestion] ?? '8', 1, 24) ?? 8;
  const weeksPerMonth = new D(52).div(12); // ~4.3333333333 weeks/month

  const grossHoursAvailablePerMonth = new D(daysPerWeek).times(hoursPerDay).times(weeksPerMonth);

  const supportHoursVal = normalizeNumber(answers[config.capacity.supportHoursQuestion] ?? '0', 0) ?? 0;
  const supportHoursPerMonth =
    config.capacity.supportHoursPeriod === 'week'
      ? new D(supportHoursVal).times(weeksPerMonth)
      : new D(supportHoursVal);

  const netHoursAvailablePerMonth = D.max(0, grossHoursAvailablePerMonth.minus(supportHoursPerMonth));

  let occupancyRate = new D(0);
  if (netHoursAvailablePerMonth.gt(0)) {
    occupancyRate = totalHoursDemanded.div(netHoursAvailablePerMonth);
  }

  let capacityStatus: 'overcapacity' | 'balanced' | 'undercapacity' = 'balanced';
  let capacityMessage =
    'Sua rotina estimada está dentro das horas líquidas disponíveis para atendimento.';

  if (occupancyRate.gt(1.0) || (netHoursAvailablePerMonth.isZero() && totalHoursDemanded.gt(0))) {
    capacityStatus = 'overcapacity';
    capacityMessage = `Atenção: A demanda mensal estimada (${totalHoursDemanded.toFixed(1)} horas) supera a sua disponibilidade líquida de atendimento (${netHoursAvailablePerMonth.toFixed(1)} horas). Isso indica sobrecarga e risco de atrasos ou esgotamento.`;
  } else if (occupancyRate.lt(0.65) && totalMonthlyServices > 0) {
    capacityStatus = 'undercapacity';
    capacityMessage = `Você tem capacidade ociosa (${totalHoursDemanded.toFixed(1)} horas ocupadas de ${netHoursAvailablePerMonth.toFixed(1)} disponíveis). Há espaço para expandir o número de atendimentos.`;
  }

  // 3. Fixed Expenses & Marketing
  let totalGeneralExpenses = new D(0);
  const incompleteExpenses: string[] = [];

  const expenseItems = config.expenses.map(e => {
    const rawState = parseMoneyAnswer(answers[e.amountQuestion]);
    if (rawState.kind === 'uninformed' || rawState.kind === 'unknown') {
      incompleteExpenses.push(e.label);
    }
    const rawAmountStr = (rawState.kind === 'known' || rawState.kind === 'zero') ? rawState.value : '0';
    let rawAmount = new D(rawAmountStr);
    if (e.period === 'year') {
      rawAmount = rawAmount.div(12);
    }

    let effectiveMonthlyAmount: Decimal;
    let workAmount: string | null = null;
    let sharePercent: string | undefined = undefined;
    let isEstimated = false;

    if (e.workAmountQuestion) {
      const workState = parseMoneyAnswer(answers[e.workAmountQuestion]);
      if (workState.kind === 'known') {
        let w = new D(workState.value);
        if (e.period === 'year') w = w.div(12);
        effectiveMonthlyAmount = w;
        workAmount = w.toFixed(2);
        isEstimated = true;
      } else if (workState.kind === 'zero') {
        effectiveMonthlyAmount = new D(0);
        workAmount = '0.00';
        isEstimated = true;
      } else {
        effectiveMonthlyAmount = rawAmount;
        workAmount = null;
      }
    } else if (e.sharePercentQuestion) {
      const sharePercentNum = normalizeNumber(answers[e.sharePercentQuestion] ?? '100', 0, 100) ?? 100;
      const sp = new D(sharePercentNum);
      sharePercent = sp.toString();
      effectiveMonthlyAmount = rawAmount.times(sp.div(100));
    } else {
      effectiveMonthlyAmount = rawAmount;
    }

    totalGeneralExpenses = totalGeneralExpenses.plus(effectiveMonthlyAmount);

    return {
      id: e.id,
      label: e.label,
      category: e.category,
      rawAmount: rawAmount.toFixed(2),
      sharePercent,
      workAmount,
      isEstimated,
      period: e.period,
      effectiveMonthlyAmount: effectiveMonthlyAmount.toFixed(2),
    };
  });

  // Marketing expenses
  let totalMarketingExpenses = new D(0);
  if (config.marketing && answers[config.marketing.channelsQuestion]) {
    const selectedChannels = parseMultiChoice(answers[config.marketing.channelsQuestion]);
    if (config.marketing.channelExpenses) {
      for (const [chId, qId] of Object.entries(config.marketing.channelExpenses)) {
        if (selectedChannels.includes(chId)) {
          const mktStr = normalizeMoney(answers[qId] ?? '0') ?? '0';
          totalMarketingExpenses = totalMarketingExpenses.plus(new D(mktStr));
        }
      }
    }
  }

  const totalFixedExpenses = totalGeneralExpenses.plus(totalMarketingExpenses);

  // Remuneration / Pró-labore
  const currentRemunerationStr = config.remunerationQuestion
    ? normalizeMoney(answers[config.remunerationQuestion] ?? '0') ?? '0'
    : '0';
  const currentRemuneration = new D(currentRemunerationStr);

  const targetRemunerationStr = config.targetRemunerationQuestion
    ? normalizeMoney(answers[config.targetRemunerationQuestion] ?? currentRemunerationStr) ?? currentRemunerationStr
    : currentRemunerationStr;
  const targetRemuneration = new D(targetRemunerationStr);

  // Hourly fixed cost and remuneration rate for Sebrae pricing
  const baseHoursForRate = totalHoursDemanded.gt(0)
    ? totalHoursDemanded
    : netHoursAvailablePerMonth.gt(0)
    ? netHoursAvailablePerMonth
    : new D(1);

  const costPerHourFixed = totalFixedExpenses.div(baseHoursForRate);
  const costPerHourRemuneration = targetRemuneration.div(baseHoursForRate);

  // Suggested Sebrae Prices for each service
  const feeForMarkup = paymentFeeRate ?? (paymentFeeStatus === 'zero' ? new D(0) : new D(config.defaultFeeRate));
  const markupFeeEstimated = paymentFeeRate === null && paymentFeeStatus !== 'zero';

  const processedServices: BusinessServiceResult[] = intermediateServices.map(item => {
    const durationHours = new D(item.timeMinutes).div(60);
    const unitFixedCost = durationHours.times(costPerHourFixed);
    const unitRemunerationCost = durationHours.times(costPerHourRemuneration);
    const baseUnitCost = item.materials.plus(unitFixedCost).plus(unitRemunerationCost);

    const suggestedPrices = config.targetMargins.map(mStr => {
      const margin = new D(mStr);
      const denom = new D(1).minus(feeForMarkup).minus(margin);
      let price = new D(0);
      if (denom.gt(0)) {
        price = baseUnitCost.div(denom).toDecimalPlaces(2, D.ROUND_CEIL);
      }
      return { margin: mStr, price: price.toFixed(2) };
    });

    return {
      id: item.service.id,
      label: item.service.label,
      category: item.service.category,
      price: item.price.toFixed(2),
      timeMinutes: item.timeMinutes,
      materialsCost: item.materials.toFixed(2),
      monthlyQuantity: item.monthlyQuantity,
      monthlyRevenue: item.monthlyRevenue.toFixed(2),
      monthlyMaterialsCost: item.monthlyMaterialsCost.toFixed(2),
      unitContributionMargin: item.unitContribution.toFixed(2),
      contributionMarginRatio: item.contributionRatio.toFixed(4),
      contributionPerHour: item.contributionPerHour.toFixed(2),
      hourlyRanking: rankings.get(item.service.id) ?? 1,
      suggestedPrices,
    };
  });

  // 4. Financials (DRE)
  const effectiveMonthlyFees = totalPaymentFees ?? new D(0);
  const totalVariableCosts = totalMonthlyMaterials.plus(effectiveMonthlyFees);
  const totalContributionMargin = grossMonthlyRevenue.minus(totalVariableCosts);

  const averageContributionMarginRatio = grossMonthlyRevenue.isZero()
    ? new D(0)
    : totalContributionMargin.div(grossMonthlyRevenue);

  const operatingProfitBeforeWithdrawal = totalContributionMargin.minus(totalFixedExpenses);
  const netOperatingProfit = operatingProfitBeforeWithdrawal.minus(currentRemuneration);

  const hasIncompleteExpenses = incompleteExpenses.length > 0 || totalPaymentFees === null;
  let incompleteExpensesNotice: string | undefined = undefined;
  if (hasIncompleteExpenses) {
    const missingItems = [...incompleteExpenses];
    if (totalPaymentFees === null) missingItems.push('taxas de pagamento');
    incompleteExpensesNotice = `Resultado baseado em despesas parciais: ${missingItems.join(', ')} não foram informadas. O resultado operacional real pode ser inferior e a distância até a meta pode ser maior.`;
  }

  // Break-even points
  let breakEvenOperationalRevenue: string | null = null;
  let breakEvenTotalRevenue: string | null = null;
  let breakEvenExplanation = '';

  const fmtBrl = (val: Decimal) => {
    const [int, cents] = val.toDecimalPlaces(2, D.ROUND_HALF_UP).toFixed(2).split('.');
    return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`;
  };

  if (grossMonthlyRevenue.isZero()) {
    breakEvenExplanation = 'Sem faturamento ou atendimentos informados para calcular a margem de contribuição e o ponto de equilíbrio.';
  } else if (averageContributionMarginRatio.lte(0)) {
    breakEvenExplanation = 'Nas condições informadas, aumentar as vendas não resolve o problema: cada atendimento gera prejuízo (margem de contribuição negativa ou nula). É necessário antes reajustar preços ou reduzir custos de insumos e taxas.';
  } else {
    const beOp = totalFixedExpenses
      .div(averageContributionMarginRatio)
      .toDecimalPlaces(2, D.ROUND_CEIL);
    const beTot = totalFixedExpenses
      .plus(currentRemuneration)
      .div(averageContributionMarginRatio)
      .toDecimalPlaces(2, D.ROUND_CEIL);
    breakEvenOperationalRevenue = beOp.toFixed(2);
    breakEvenTotalRevenue = beTot.toFixed(2);
    breakEvenExplanation = `Ponto de equilíbrio operacional: faturamento mínimo de ${fmtBrl(beOp)} para pagar materiais e custos fixos; e ${fmtBrl(beTot)} para cobrir também a sua retirada atual.`;
  }

  let financialStatus: 'healthy' | 'warning' | 'deficit' = 'healthy';
  if (netOperatingProfit.lt(0)) {
    financialStatus = operatingProfitBeforeWithdrawal.lt(0) ? 'deficit' : 'warning';
  }

  // 5. Personal Finances (Optional)
  let personalFinances: BusinessDiagnosisResult['personalFinances'] = undefined;
  if (config.personalFinances) {
    const optIn = answers[config.personalFinances.optInQuestion];
    if (optIn === 'sim') {
      const pf = config.personalFinances;
      const categoryDefs: { label: string; question?: string }[] = [
        { label: 'Moradia', question: pf.housingQuestion },
        { label: 'Alimentação', question: pf.foodQuestion },
        { label: 'Contas básicas', question: pf.utilitiesQuestion },
        { label: 'Transporte pessoal', question: pf.transportQuestion },
        { label: 'Dependentes/Família', question: pf.dependentsQuestion },
        { label: 'Outras despesas', question: pf.otherQuestion },
      ];

      const items: { category: string; amount: string | null }[] = [];
      const uninformedCategories: string[] = [];
      let totalPersonal = new D(0);

      for (const cat of categoryDefs) {
        if (!cat.question) continue;
        const raw = answers[cat.question];
        const norm = normalizeMoney(raw);
        if (norm !== null) {
          totalPersonal = totalPersonal.plus(new D(norm));
          items.push({ category: cat.label, amount: new D(norm).toFixed(2) });
        } else {
          items.push({ category: cat.label, amount: null });
          uninformedCategories.push(cat.label);
        }
      }

      const rawOtherIncome = pf.otherIncomeQuestion ? normalizeMoney(answers[pf.otherIncomeQuestion]) : null;
      const otherIncome = rawOtherIncome !== null ? new D(rawOtherIncome) : new D(0);
      const netPersonalNeed = D.max(0, totalPersonal.minus(otherIncome));
      const diff = currentRemuneration.minus(netPersonalNeed);

      const hasUninformedExpenses = uninformedCategories.length > 0;
      let isSufficient: boolean | null = null;
      if (!hasUninformedExpenses) {
        isSufficient = currentRemuneration.gte(netPersonalNeed);
      } else {
        isSufficient = currentRemuneration.lt(netPersonalNeed) ? false : null;
      }

      personalFinances = {
        isProvided: true,
        totalPersonalExpenses: totalPersonal.toFixed(2),
        otherIncome: otherIncome.toFixed(2),
        netPersonalNeed: netPersonalNeed.toFixed(2),
        currentWithdrawal: currentRemuneration.toFixed(2),
        difference: diff.toFixed(2),
        isSufficient,
        hasUninformedExpenses,
        uninformedCategories,
        items,
      };
    }
  }

  // 6. Reserves and Debts (Optional)
  let reservesAndDebts: BusinessDiagnosisResult['reservesAndDebts'] = undefined;
  if (config.reservesAndDebts) {
    const optIn = answers[config.reservesAndDebts.optInQuestion];
    if (optIn === 'sim') {
      const rd = config.reservesAndDebts;
      const bCash = rd.businessCashQuestion ? normalizeMoney(answers[rd.businessCashQuestion] ?? '0') ?? '0' : '0';
      const pRes = rd.personalReserveQuestion ? normalizeMoney(answers[rd.personalReserveQuestion] ?? '0') ?? '0' : '0';
      const mDebt = rd.monthlyDebtQuestion ? normalizeMoney(answers[rd.monthlyDebtQuestion] ?? '0') ?? '0' : '0';
      const tDebt = rd.totalDebtQuestion ? normalizeMoney(answers[rd.totalDebtQuestion] ?? '0') ?? '0' : '0';

      let hasOverdueDebt = false;
      let overdueDebtStatus: 'overdue' | 'up_to_date' | 'no_debt' | 'uninformed' = 'uninformed';
      let overdueDebtAmount: string | null = null;

      if (rd.overdueDebtQuestion) {
        const rawOverdue = answers[rd.overdueDebtQuestion];
        if (rawOverdue === 'sim' || rawOverdue === 'atraso') {
          hasOverdueDebt = true;
          overdueDebtStatus = 'overdue';
        } else if (rawOverdue === 'nao' || rawOverdue === 'em_dia' || rawOverdue === 'em-dia') {
          hasOverdueDebt = false;
          overdueDebtStatus = 'up_to_date';
        } else if (rawOverdue === 'sem-dividas' || rawOverdue === 'sem_dividas') {
          hasOverdueDebt = false;
          overdueDebtStatus = 'no_debt';
        }
      } else {
        overdueDebtStatus = new D(mDebt).gt(0) || new D(tDebt).gt(0) ? 'up_to_date' : 'no_debt';
      }

      if (rd.overdueDebtAmountQuestion) {
        const normOverdueAmt = normalizeMoney(answers[rd.overdueDebtAmountQuestion]);
        if (normOverdueAmt !== null) {
          overdueDebtAmount = new D(normOverdueAmt).toFixed(2);
          if (new D(normOverdueAmt).gt(0)) {
            hasOverdueDebt = true;
            overdueDebtStatus = 'overdue';
          }
        }
      }

      const monthlyBurn = totalFixedExpenses.plus(currentRemuneration);
      let runway: string | null = null;
      if (monthlyBurn.gt(0)) {
        runway = new D(bCash).div(monthlyBurn).toFixed(1);
      }

      reservesAndDebts = {
        isProvided: true,
        businessCash: new D(bCash).toFixed(2),
        personalReserve: new D(pRes).toFixed(2),
        monthlyDebt: new D(mDebt).toFixed(2),
        totalDebt: new D(tDebt).toFixed(2),
        hasOverdueDebt,
        overdueDebtStatus,
        overdueDebtAmount,
        runwayMonths: runway,
      };
    }
  }

  // 7. Monthly History (Optional)
  let monthlyHistory: BusinessDiagnosisResult['monthlyHistory'] = undefined;
  if (config.monthlyHistory) {
    const optIn = answers[config.monthlyHistory.optInQuestion];
    if (optIn && optIn !== 'pular' && optIn !== 'nao' && config.monthlyHistory.months) {
      const recordedMonths: NonNullable<BusinessDiagnosisResult['monthlyHistory']>['months'] = [];
      let totalHistRev = new D(0);
      let totalHistExp = new D(0);
      let allExpInformed = true;
      let totalHistWithdr = new D(0);
      let allWithdrInformed = true;
      let totalHistNet = new D(0);
      let allNetInformed = true;

      for (const m of config.monthlyHistory.months) {
        const rev = normalizeMoney(answers[m.revenueQuestion] ?? '') ?? null;
        if (rev !== null) {
          const normExp = normalizeMoney(answers[m.expensesQuestion]);
          const normWithdr = normalizeMoney(answers[m.withdrawalsQuestion]);

          const net = (normExp !== null && normWithdr !== null)
            ? new D(rev).minus(new D(normExp)).minus(new D(normWithdr)).toFixed(2)
            : null;

          totalHistRev = totalHistRev.plus(new D(rev));
          if (normExp !== null) {
            totalHistExp = totalHistExp.plus(new D(normExp));
          } else {
            allExpInformed = false;
          }
          if (normWithdr !== null) {
            totalHistWithdr = totalHistWithdr.plus(new D(normWithdr));
          } else {
            allWithdrInformed = false;
          }
          if (net !== null) {
            totalHistNet = totalHistNet.plus(new D(net));
          } else {
            allNetInformed = false;
          }

          recordedMonths.push({
            monthKey: m.monthKey,
            label: m.label,
            revenue: new D(rev).toFixed(2),
            expenses: normExp !== null ? new D(normExp).toFixed(2) : null,
            withdrawals: normWithdr !== null ? new D(normWithdr).toFixed(2) : null,
            netResult: net,
          });
        }
      }

      if (recordedMonths.length > 0) {
        const avgRev = totalHistRev.div(recordedMonths.length);
        let discrepancy: string | null = null;
        if (grossMonthlyRevenue.gt(0)) {
          const diffPct = avgRev.minus(grossMonthlyRevenue).div(grossMonthlyRevenue).times(100);
          discrepancy = `${diffPct.gte(0) ? '+' : ''}${diffPct.toFixed(0)}%`;
        }

        // Trend analysis
        let trend: NonNullable<BusinessDiagnosisResult['monthlyHistory']>['trend'] = undefined;
        if (recordedMonths.length === 1) {
          trend = {
            direction: 'single_month',
            percentage: null,
            message: 'Apenas 1 mês informado. Para comparar evolução ou sazonalidade, registre 2 ou mais meses.',
          };
        } else {
          // Chronological comparison: oldest is recordedMonths[0], newest is recordedMonths[last]
          const oldest = recordedMonths[0];
          const newest = recordedMonths[recordedMonths.length - 1];
          const revOldest = new D(oldest.revenue);
          const revNewest = new D(newest.revenue);
          const revenues = recordedMonths.map(m => new D(m.revenue));
          const minRev = D.min(...revenues);
          const maxRev = D.max(...revenues);

          if (revOldest.isZero()) {
            if (revNewest.gt(0)) {
              trend = {
                direction: 'growing',
                percentage: null,
                message: `Crescimento de R$ 0,00 para ${fmtBrl(revNewest)}.`,
              };
            } else {
              trend = {
                direction: 'stable',
                percentage: '0.0%',
                message: 'Faturamento estável em R$ 0,00.',
              };
            }
          } else {
            const diffPct = revNewest.minus(revOldest).div(revOldest).times(100);
            const spreadRatio = avgRev.gt(0) ? maxRev.minus(minRev).div(avgRev) : new D(0);

            if (diffPct.gt(5)) {
              trend = {
                direction: 'growing',
                percentage: `+${diffPct.toFixed(1)}%`,
                message: `Tendência de alta: crescimento de ${diffPct.toFixed(1)}% entre ${oldest.label} (${fmtBrl(revOldest)}) e ${newest.label} (${fmtBrl(revNewest)}).`,
              };
            } else if (diffPct.lt(-5)) {
              trend = {
                direction: 'declining',
                percentage: `${diffPct.toFixed(1)}%`,
                message: `Tendência de recuo: redução de ${diffPct.abs().toFixed(1)}% entre ${oldest.label} (${fmtBrl(revOldest)}) e ${newest.label} (${fmtBrl(revNewest)}).`,
              };
            } else if (spreadRatio.gt(0.20)) {
              trend = {
                direction: 'fluctuating',
                percentage: `${diffPct.gte(0) ? '+' : ''}${diffPct.toFixed(1)}%`,
                message: `Faturamento oscilante entre ${fmtBrl(minRev)} e ${fmtBrl(maxRev)} nos últimos ${recordedMonths.length} meses.`,
              };
            } else {
              trend = {
                direction: 'stable',
                percentage: `${diffPct.gte(0) ? '+' : ''}${diffPct.toFixed(1)}%`,
                message: `Faturamento estável ao longo dos últimos ${recordedMonths.length} meses (média de ${fmtBrl(avgRev)}/mês).`,
              };
            }
          }
        }

        monthlyHistory = {
          isProvided: true,
          months: recordedMonths,
          averageHistoricalRevenue: avgRev.toFixed(2),
          averageHistoricalExpenses: allExpInformed ? totalHistExp.div(recordedMonths.length).toFixed(2) : null,
          averageHistoricalWithdrawals: allWithdrInformed ? totalHistWithdr.div(recordedMonths.length).toFixed(2) : null,
          averageHistoricalNetResult: allNetInformed ? totalHistNet.div(recordedMonths.length).toFixed(2) : null,
          discrepancyWithEstimatedRoutine: discrepancy,
          trend,
        };
      }
    }
  }

  const growthPlan = buildGrowthPlan(quiz, answers, {
    currentWithdrawal: currentRemuneration.toFixed(2),
    targetWithdrawal: targetRemuneration.toFixed(2),
    operatingResult: operatingProfitBeforeWithdrawal.toFixed(2),
    weeklyHours: daysPerWeek * hoursPerDay,
    occupiedMonthlyHours: totalHoursDemanded.toNumber(),
    supportMonthlyHours: supportHoursPerMonth.toNumber(),
  });

  // 8. Action Plan (30, 60, 90 days)
  const actionPlan: BusinessDiagnosisResult['actionPlan'] = [];

  // Action 1: Pricing / Margins (30 days)
  const subOptimalServices = processedServices.filter(s =>
    new D(s.unitContributionMargin).lte(0) || new D(s.price).lt(new D(s.materialsCost).times(1.5))
  );

  if (subOptimalServices.length > 0) {
    const names = subOptimalServices.map(s => s.label).join(', ');
    const goalContext = growthPlan ? ` Sem margem unitária positiva, o negócio absorve prejuízo a cada atendimento, inviabilizando o objetivo de ${growthPlan.goal}.` : '';
    actionPlan.push({
      timeframe: '30_dias',
      title: 'Adequação dos serviços de menor margem',
      problem: `Serviços com retorno unitário insuficiente ou deficitário: ${names}.`,
      evidence: `Preços atuais cobram menos do que o custo de materiais somado às taxas de pagamento e rateio mínimo de despesas.${goalContext}`,
      action: `Reajustar a tabela dos procedimentos identificados aplicando ao menos a margem de 15% calculada na metodologia Sebrae.`,
      priority: 'alta',
      effort: 'baixo',
      cost: 'R$ 0,00',
      indicator: 'Margem de contribuição unitária positiva em 100% dos serviços do cardápio.',
    });
  } else if (growthPlan) {
    actionPlan.push({
      timeframe: '30_dias',
      title: 'Sua primeira mudança para o objetivo',
      problem: growthPlan.constraint,
      evidence: `Objetivo declarado: ${growthPlan.goal}. Horizonte desejado: ${growthPlan.horizon}.`,
      action: growthPlan.action,
      priority: 'alta',
      effort: 'medio',
      cost: 'A definir conforme a ação; não assumir compra de curso ou material.',
      indicator: growthPlan.indicator,
    });
  } else {
    const feeEvidence = paymentFeeRate !== null
      ? `Taxa média calculada de ${(paymentFeeRate.times(100)).toFixed(1)}% sobre o faturamento total.`
      : totalPaymentFees !== null
        ? `Despesa declarada de R$ ${totalPaymentFees.toFixed(2)} em taxas de pagamento.`
        : 'Taxas de pagamento não informadas ou não calculadas.';
    actionPlan.push({
      timeframe: '30_dias',
      title: 'Formalização de taxas e precificação transparente',
      problem: 'Possível absorção silenciosa de taxas de pagamento nas modalidades de crédito e parcelamento.',
      evidence: feeEvidence,
      action: 'Adotar chave PIX como opção prioritária e embutir formalmente taxas de parcelamento na tabela de serviços.',
      priority: 'media',
      effort: 'baixo',
      cost: 'R$ 0,00',
      indicator: 'Custo de taxas financeiras controlado abaixo de 3% do faturamento.',
    });
  }

  // Action 2: Capacity & Time (60 days)
  if (occupancyRate.gt(1.0)) {
    const hoursContext = growthPlan?.desiredHours ? ` Jornada desejada declarada de ${growthPlan.desiredHours} h/semana; proteger blocos de tempo é essencial para evitar sobrecarga.` : '';
    actionPlan.push({
      timeframe: '60_dias',
      title: 'Reestruturação de horários e limites de mesa',
      problem: 'Sobrecarga de capacidade de atendimento.',
      evidence: `A demanda estimada de ${totalHoursDemanded.toFixed(1)} horas/mês excede a capacidade líquida de ${netHoursAvailablePerMonth.toFixed(1)} horas/mês (${(occupancyRate.times(100)).toFixed(0)}% de ocupação).${hoursContext}`,
      action: 'Definir blocos protegidos de esterilização/preparo e limitar o número de procedimentos longos por dia.',
      priority: 'alta',
      effort: 'medio',
      cost: 'R$ 0,00',
      indicator: 'Taxa de ocupação de atendimento estabilizada entre 75% e 90%.',
    });
  } else if (growthPlan) {
    actionPlan.push({
      timeframe: '60_dias',
      title: 'Validar com suas clientes',
      problem: 'Confirmar se a oferta atende ao público observado.',
      evidence: `Preferência: ${growthPlan.audienceEvidence}. Objeção: ${growthPlan.audienceBarrier}. Retorno: ${growthPlan.audienceReturn}.`,
      action: growthPlan.audienceAction,
      priority: 'media',
      effort: 'medio',
      cost: 'Começar por conversas com clientes atuais, sem orçamento de anúncios presumido.',
      indicator: 'Motivos registrados, procura e retorno observados.',
    });
  } else {
    actionPlan.push({
      timeframe: '60_dias',
      title: 'Otimização dos tempos de mesa e combos de maior valor',
      problem: 'Oportunidade de elevar a rentabilidade por hora dedicada.',
      evidence: `Variação de rentabilidade por hora entre procedimentos avulsos e combos no cardápio atual.`,
      action: 'Promover combos dos serviços com maior margem por hora e padronizar o tempo de mesa.',
      priority: 'media',
      effort: 'medio',
      cost: 'R$ 0,00',
      indicator: 'Aumento de 10% a 15% na receita média por hora de mesa trabalhada.',
    });
  }

  // Action 3: Finance & Reserve (90 days)
  if (reservesAndDebts?.hasOverdueDebt) {
    const overdueAmtText = reservesAndDebts.overdueDebtAmount
      ? ` com R$ ${reservesAndDebts.overdueDebtAmount} em atraso imediato`
      : '';
    const deficitExtra = netOperatingProfit.lt(0)
      ? ` Somado ao déficit operacional de R$ ${netOperatingProfit.abs().toFixed(2)}, há risco iminente de bola de neve com encargos e juros rotativos.`
      : '';
    actionPlan.push({
      timeframe: '90_dias',
      title: 'Renegociação urgente de dívidas e contenção de juros',
      problem: 'Existência de dívidas ou parcelas em atraso com incidência de encargos moratórios.',
      evidence: `Parcelas ou contas em atraso declaradas${overdueAmtText} (saldo devedor total: R$ ${reservesAndDebts.totalDebt}).${deficitExtra}`,
      action: 'Buscar renegociação imediata das pendências vencidas (portabilidade, desconto para quitação ou parcelamento fixo), congelando juros rotativos antes de destinar recursos a reservas ou novos investimentos.',
      priority: 'alta',
      effort: 'baixo',
      cost: 'R$ 0,00 para negociar diretamente com os credores.',
      indicator: 'Todas as parcelas repactuadas e juros de mora estancados em até 60 dias.',
    });
  } else if (netOperatingProfit.lt(0)) {
    const deficitContext = growthPlan ? ` Para alcançar a retirada desejada de R$ ${growthPlan.targetWithdrawal}, é pré-requisito indispensável sanar o déficit operacional atual.` : '';
    actionPlan.push({
      timeframe: '90_dias',
      title: 'Ajuste do pró-labore e separação de finanças',
      problem: 'Retirada atual superior à geração operacional do negócio.',
      evidence: `Déficit operacional líquido de R$ ${netOperatingProfit.abs().toFixed(2)} ao mês considerando o pró-labore informado.${deficitContext}`,
      action: breakEvenTotalRevenue !== null
        ? 'Ajustar a retirada mensal temporariamente e alinhar ao faturamento para cobrir custos e manter contas bancárias totalmente separadas.'
        : 'Estancar o prejuízo operacional dos atendimentos antes de qualquer retirada, mantendo contas bancárias totalmente separadas.',
      priority: 'alta',
      effort: 'medio',
      cost: 'R$ 0,00',
      indicator: 'Resultado operacional líquido nulo ou positivo por 3 meses consecutivos.',
    });
  } else if (growthPlan) {
    actionPlan.push({
      timeframe: '90_dias',
      title: 'Revisar o caminho escolhido',
      problem: 'O plano precisa acompanhar mudanças de rotina, renda e prioridades.',
      evidence: growthPlan.warnings.join(' ') || 'Comparar os registros do período com a meta declarada.',
      action: 'Compare renda, horas e feedback com o ponto de partida. Mantenha o que ajudou e ajuste o que não funcionou, sem obrigação de expandir.',
      priority: 'media',
      effort: 'baixo',
      cost: 'Tempo reservado para revisão.',
      indicator: growthPlan.indicator,
    });
  } else {
    actionPlan.push({
      timeframe: '90_dias',
      title: 'Constituição de reserva de giro e reinvestimento',
      problem: 'Necessidade de colchão de segurança para sazonalidade e renovação de equipamentos.',
      evidence: 'Negócio com saldo operacional positivo propício à acumulação de reservas.',
      action: 'Destinar 15% do lucro líquido mensal para um fundo de reserva de no mínimo 3 meses de despesas fixas.',
      priority: 'media',
      effort: 'medio',
      cost: 'R$ 0,00',
      indicator: 'Reserva operacional equivalente a 3 meses de despesas fixas acumulada.',
    });
  }

  // 9. Sensitivity Scenarios
  const scenarioAdd10Price = grossMonthlyRevenue.times(1.10);
  const feeRateForSensitivity = paymentFeeRate ?? (paymentFeeStatus === 'zero' ? new D(0) : new D(config.defaultFeeRate));
  const feeCostInAdd10 = totalPaymentFees !== null && paymentFeeRate !== null
    ? scenarioAdd10Price.times(paymentFeeRate)
    : (totalPaymentFees !== null ? totalPaymentFees : scenarioAdd10Price.times(feeRateForSensitivity));
  const profitAdd10Price = scenarioAdd10Price.minus(totalMonthlyMaterials).minus(feeCostInAdd10).minus(totalFixedExpenses).minus(currentRemuneration);

  const scenarioAdd15Volume = grossMonthlyRevenue.times(1.15);
  const variableAdd15Volume = totalVariableCosts.times(1.15);
  const profitAdd15Volume = scenarioAdd15Volume.minus(variableAdd15Volume.plus(totalFixedExpenses).plus(currentRemuneration));

  const sensitivityScenarios: BusinessDiagnosisResult['sensitivityScenarios'] = [
    {
      title: 'Cenário 1: Reajuste médio de 10% nos preços',
      description: 'Mantendo o mesmo volume de atendimentos e a mesma estrutura de despesas.',
      projectedRevenue: scenarioAdd10Price.toFixed(2),
      projectedNetProfit: profitAdd10Price.toFixed(2),
    },
    {
      title: 'Cenário 2: Expansão de 15% no volume de atendimentos',
      description: totalHoursDemanded.times('1.15').gt(netHoursAvailablePerMonth)
        ? 'Hipótese incompatível com a agenda atual: exige mais horas do que as disponíveis. Não é recomendação de expansão.'
        : 'Hipótese matemática com capacidade disponível; exige demanda adicional, ainda não comprovada. Custos variáveis acompanham o volume.',
      projectedRevenue: scenarioAdd15Volume.toFixed(2),
      projectedNetProfit: profitAdd15Volume.toFixed(2),
    },
  ];

  // 10. Matched Recommendations (Affiliates / Training)
  const matchedRecs: Recommendation[] = [];
  for (const rec of config.recommendations) {
    const levelAnswer = answers[rec.condition.techniqueQuestionId];
    if (levelAnswer && rec.condition.levels.includes(levelAnswer)) {
      if (rec.condition.interestQuestionId) {
        const interestAnswer = answers[rec.condition.interestQuestionId];
        if (interestAnswer === 'sim') {
          matchedRecs.push(rec);
        }
      } else {
        matchedRecs.push(rec);
      }
    }
  }

  // Limitations
  const limitations = [
    'Os valores informados de preços, tempos, materiais e despesas são autodeclarados e não constituem auditoria contábil.',
    'A metodologia Sebrae de rateio por hora e markup divisor fundamenta o cálculo do preço sugerido, mas a aceitação dos preços depende do mercado e da fidelização de clientes.',
    'Os resultados são estimativas determinísticas e não representam promessa de faturamento ou ganho financeiro futuro.',
  ];
  if (!personalFinances) {
    limitations.push('O módulo de finanças pessoais não foi preenchido; a análise restringe-se estritamente aos números operacionais do negócio.');
  } else if (personalFinances.hasUninformedExpenses) {
    limitations.push(`Despesas pessoais não informadas foram desconsideradas da soma (${personalFinances.uninformedCategories?.join(', ')}). Isso não significa despesa zero; a retirada pessoal pode não ser suficiente.`);
  }
  if (monthlyHistory?.months.some(m => m.expenses === null || m.withdrawals === null)) {
    limitations.push('Despesas ou retiradas não preenchidas no histórico mensal foram registradas como não informadas, sem presumir valor zero.');
  }
  if (monthlyHistory && monthlyHistory.months.length === 1) {
    limitations.push('O histórico financeiro considerou apenas 1 mês; para identificar tendências de crescimento e oscilação sazonal com maior precisão, é recomendável registrar 3 ou mais meses.');
  }
  if (totalPaymentFees === null) {
    if (paymentFeeStatus === 'unknown') {
      limitations.push('As taxas de pagamento foram marcadas como desconhecidas e não foram abatidas dos custos mensais operacionais.');
    } else {
      limitations.push('As taxas de pagamento não foram informadas e não foram abatidas dos custos mensais operacionais.');
    }
  }
  if (markupFeeEstimated) {
    limitations.push(`O preço sugerido Sebrae utilizou uma taxa de pagamento de referência estimada de ${(feeForMarkup.times(100)).toFixed(1)}%, pois o valor real não foi informado ou não pôde ser proporcionalizado sem faturamento.`);
  }
  if (incompleteExpenses.length > 0) {
    limitations.push(`Despesas profissionais não informadas foram excluídas da soma: ${incompleteExpenses.join(', ')}. Isso não significa custo zero; o resultado real e a distância até a meta podem estar superestimados.`);
  }
  if (config.reservesAndDebts) {
    if (reservesAndDebts?.hasOverdueDebt) {
      limitations.push('Foram identificadas parcelas ou compromissos em atraso; estancar juros de mora deve anteceder qualquer destinação a reservas de investimento.');
    } else {
      limitations.push('As parcelas de dívidas exibidas não são abatidas automaticamente do resultado operacional; revise os compromissos de caixa antes de definir retiradas.');
    }
  }

  // Profile classification based on services & techniques
  let profileLabel = 'Especialista em Atendimento Customizado';
  let profileDesc = 'Você atua de forma autônoma com foco em serviços sob medida para sua carteira de clientes.';

  if (activeServices.some(s => s.id.includes('alongamento') || s.id.includes('gel'))) {
    profileLabel = 'Nail Designer Estrutural e Gel';
    profileDesc = 'Seu foco principal concentra procedimentos de maior valor agregado técnico e durabilidade em mesa.';
  } else if (activeServices.some(s => s.id.includes('tradicional'))) {
    profileLabel = 'Manicure Ágil e Essencial';
    profileDesc = 'Seu posicionamento valoriza frequência de retorno, agilidade e fidelização rotineira.';
  }

  return {
    growthPlan,
    quizId: quiz.id,
    version: quiz.version,
    demo: quiz.demo,
    kind: 'business-diagnosis-v1',
    profile: { label: profileLabel, description: profileDesc },
    explanation: 'Diagnóstico calculado com base exclusivamente nos seus dados e na metodologia Sebrae de formação de preço de serviços.',

    services: processedServices,

    totalMonthlyServices,
    grossMonthlyRevenue: grossMonthlyRevenue.toFixed(2),
    totalMonthlyMaterials: totalMonthlyMaterials.toFixed(2),
    paymentFeeRate: paymentFeeRate !== null ? paymentFeeRate.toFixed(4) : null,
    paymentFeeRateEstimated: isPaymentFeeEstimated,
    totalPaymentFees: totalPaymentFees !== null ? totalPaymentFees.toFixed(2) : null,
    paymentFeeStatus,
    totalVariableCosts: totalVariableCosts.toFixed(2),
    totalContributionMargin: totalContributionMargin.toFixed(2),
    averageContributionMarginRatio: averageContributionMarginRatio.toFixed(4),

    capacity: {
      daysPerWeek,
      hoursPerDay,
      grossHoursAvailablePerMonth: grossHoursAvailablePerMonth.toFixed(1),
      supportHoursPerMonth: supportHoursPerMonth.toFixed(1),
      netHoursAvailablePerMonth: netHoursAvailablePerMonth.toFixed(1),
      hoursDemandedPerMonth: totalHoursDemanded.toFixed(1),
      occupancyRate: occupancyRate.toFixed(2),
      occupancyPercent: `${(occupancyRate.times(100)).toFixed(0)}%`,
      status: capacityStatus,
      message: capacityMessage,
      spaceType: config.capacity.spaceTypeQuestion ? answers[config.capacity.spaceTypeQuestion] : undefined,
    },

    fixedExpenses: {
      items: expenseItems,
      totalGeneralExpenses: totalGeneralExpenses.toFixed(2),
      totalMarketingExpenses: totalMarketingExpenses.toFixed(2),
      totalFixedExpenses: totalFixedExpenses.toFixed(2),
      costPerHourFixed: costPerHourFixed.toFixed(2),
    },

    financials: {
      grossRevenue: grossMonthlyRevenue.toFixed(2),
      variableCosts: totalVariableCosts.toFixed(2),
      contributionMargin: totalContributionMargin.toFixed(2),
      fixedExpenses: totalFixedExpenses.toFixed(2),
      operatingProfitBeforeWithdrawal: operatingProfitBeforeWithdrawal.toFixed(2),
      currentRemuneration: currentRemuneration.toFixed(2),
      targetRemuneration: targetRemuneration.toFixed(2),
      netOperatingProfit: netOperatingProfit.toFixed(2),
      breakEvenOperationalRevenue,
      breakEvenTotalRevenue,
      breakEvenExplanation,
      hasIncompleteExpenses,
      incompleteExpensesNotice,
      status: financialStatus,
    },

    personalFinances,
    reservesAndDebts,
    monthlyHistory,
    actionPlan,
    sensitivityScenarios,
    recommendations: matchedRecs,
    limitations,
  };
}

