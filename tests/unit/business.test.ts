import { describe, it, expect } from 'vitest';
import { evaluateBusinessDiagnosis, D } from '../../Engine/core/business';
import type { Quiz, BusinessDiagnosisConfig } from '../../Engine/core/schema';
import { serializeMultiChoice } from '../../Engine/core/answers';

const mockConfig: BusinessDiagnosisConfig = {
  kind: 'business-diagnosis-v1',
  servicesQuestion: 'servicos',
  services: [
    {
      id: 'tradicional',
      label: 'Manicure tradicional',
      category: 'avulso',
      timeQuestion: 'tempo_tradicional',
      priceQuestion: 'preco_tradicional',
      materialsQuestion: 'material_tradicional',
      quantityQuestion: 'qtd_tradicional',
    },
    {
      id: 'gel',
      label: 'Esmaltação em gel',
      category: 'avulso',
      timeQuestion: 'tempo_gel',
      priceQuestion: 'preco_gel',
      materialsQuestion: 'material_gel',
      quantityQuestion: 'qtd_gel',
    },
    {
      id: 'combo_completo',
      label: 'Combo Tradicional + Gel',
      category: 'combo',
      timeQuestion: 'tempo_combo',
      priceQuestion: 'preco_combo',
      materialsQuestion: 'material_combo',
      quantityQuestion: 'qtd_combo',
      includedServices: ['tradicional', 'gel'],
    },
  ],
  capacity: {
    daysPerWeekQuestion: 'dias_semana',
    hoursPerDayQuestion: 'horas_dia',
    supportHoursQuestion: 'horas_apoio',
    supportHoursPeriod: 'week',
    spaceTypeQuestion: 'espaco',
  },
  expenses: [
    {
      id: 'aluguel',
      label: 'Aluguel do espaço',
      category: 'espaco',
      amountQuestion: 'despesa_aluguel',
      sharePercentQuestion: 'rateio_aluguel',
      period: 'month',
    },
    {
      id: 'anuidade',
      label: 'Taxa anual do alvará',
      category: 'impostos',
      amountQuestion: 'despesa_anuidade',
      period: 'year',
    },
  ],
  feeRateQuestion: 'taxa_cartao',
  defaultFeeRate: '0.05',
  targetMargins: ['0.15', '0.20', '0.25'],
  remunerationQuestion: 'retirada_atual',
  targetRemunerationQuestion: 'retirada_desejada',
  marketing: {
    channelsQuestion: 'canais_mkt',
    channelExpenses: {
      insta: 'gasto_insta',
      indicacao: 'gasto_indicacao',
    },
  },
  personalFinances: {
    optInQuestion: 'preencher_pessoal',
    housingQuestion: 'moradia',
    foodQuestion: 'alimentacao',
    utilitiesQuestion: 'contas',
    transportQuestion: 'transporte_pessoal',
    dependentsQuestion: 'dependentes',
    otherQuestion: 'outros_pessoal',
    otherIncomeQuestion: 'outras_rendas',
  },
  reservesAndDebts: {
    optInQuestion: 'preencher_reservas',
    businessCashQuestion: 'caixa_empresa',
    personalReserveQuestion: 'reserva_pessoal',
    monthlyDebtQuestion: 'divida_mensal',
    totalDebtQuestion: 'divida_total',
  },
  monthlyHistory: {
    optInQuestion: 'preencher_historico',
    months: [
      {
        monthKey: 'm1',
        label: 'Mês anterior',
        revenueQuestion: 'hist_rev_1',
        expensesQuestion: 'hist_exp_1',
        withdrawalsQuestion: 'hist_with_1',
      },
    ],
  },
  recommendations: [
    {
      id: 'curso_gel',
      title: 'Especialização em Gel Estruturado',
      need: 'Domínio de alinhamento e estrutura em gel',
      targetAudience: 'Manicures iniciantes no gel',
      prerequisites: 'Cutilagem básica',
      cost: 'R$ 197,00',
      verifiedOn: '2026-11-04',
      link: 'https://exemplo.com/curso-gel',
      isAffiliate: true,
      affiliateDisclaimer: 'Indicação parceira com comissão transparente.',
      condition: {
        techniqueQuestionId: 'exp_gel',
        levels: ['nunca', 'aprendendo'],
        interestQuestionId: 'interesse_gel',
      },
      freeAlternative: {
        title: 'Playlist Gratuita Sebrae de Gestão de Salão',
        url: 'https://sebrae.com.br/gestao',
        description: 'Conteúdo aberto sem custo.',
      },
    },
  ],
};

const mockQuiz: Quiz = {
  schemaVersion: 3,
  id: 'beleza-unhas',
  version: '5.0.0',
  title: 'Diagnóstico de Negócio',
  locale: 'pt-BR',
  demo: true,
  theme: 'rose',
  identification: [{ id: 'nome', type: 'text', label: 'Nome', required: true }],
  pages: [
    {
      id: 'p1',
      title: 'Etapa 1',
      blocks: [
        {
          type: 'question',
          id: 'servicos',
          label: 'Serviços',
          required: true,
          input: 'multi-choice',
          options: [
            { id: 'tradicional', label: 'Tradicional' },
            { id: 'gel', label: 'Gel' },
            { id: 'combo_completo', label: 'Combo' },
          ],
        },
      ],
    },
  ],
  result: mockConfig,
  presentation: {
    preview: { title: 'Prévia', blocks: ['business-summary', 'capacity-diagnosis'] },
    report: { template: 'business-report-v1', title: 'Relatório', blocks: ['dre-overview', 'service-pricing-analysis'] },
  },
  offer: { mode: 'demo', currency: 'BRL', priceCents: null },
  evidence: { sources: [], limitations: ['Limitação'] },
};

describe('Cálculos do Diagnóstico de Negócio (Engine/core/business.ts)', () => {
  it('reajuste recalcula taxas e expansão respeita capacidade declarada',()=>{
    const a={servicos:serializeMultiChoice(['tradicional']),tempo_tradicional:'60',preco_tradicional:'100',material_tradicional:'20',qtd_tradicional:'100',taxa_cartao:'10',dias_semana:'5',horas_dia:'5',horas_apoio:'0',retirada_atual:'0',retirada_desejada:'0'};
    const r=evaluateBusinessDiagnosis(mockQuiz,mockConfig,a);
    // 11000 de receita - 2000 de material - 1100 de taxas = 7900.
    expect(r.sensitivityScenarios[0].projectedNetProfit).toBe('7900.00');
    expect(r.sensitivityScenarios[1].description).toContain('incompatível');
    const zero=evaluateBusinessDiagnosis(mockQuiz,mockConfig,{...a,horas_apoio:'25'});
    expect(zero.capacity.status).toBe('overcapacity');
  });
  it('calcula faturamento, materiais, taxas e margem de contribuição de serviços avulsos', () => {
    const answers = {
      servicos: serializeMultiChoice(['tradicional', 'gel']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '30', // 30 atendimentos x R$ 50 = R$ 1500
      tempo_gel: '60',
      preco_gel: '100.00',
      material_gel: '20.00',
      qtd_gel: '20', // 20 atendimentos x R$ 100 = R$ 2000
      taxa_cartao: '5', // 5%
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '4', // 4h/semana de apoio
      despesa_aluguel: '600.00',
      rateio_aluguel: '100',
      despesa_anuidade: '120.00', // anuidade de R$ 120 / 12 = R$ 10/mês
      retirada_atual: '1500.00',
      retirada_desejada: '2000.00',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answers);

    expect(res.totalMonthlyServices).toBe(50);
    expect(res.grossMonthlyRevenue).toBe('3500.00'); // 1500 + 2000
    expect(res.totalMonthlyMaterials).toBe('640.00'); // (30*8) + (20*20) = 240 + 400
    expect(res.totalPaymentFees).toBe('175.00'); // 5% de 3500
    expect(res.totalVariableCosts).toBe('815.00'); // 640 + 175
    expect(res.totalContributionMargin).toBe('2685.00'); // 3500 - 815

    // Total fixed expenses: aluguel (600) + anuidade (10) = 610.00
    expect(res.fixedExpenses.totalFixedExpenses).toBe('610.00');

    // DRE: Operating Profit before withdrawal = 2685 - 610 = 2075.00
    expect(res.financials.operatingProfitBeforeWithdrawal).toBe('2075.00');
    // Net profit after pró-labore (1500) = 2075 - 1500 = 575.00
    expect(res.financials.netOperatingProfit).toBe('575.00');
    expect(res.financials.status).toBe('healthy');
  });

  it('combos não duplicam receita, materiais ou tempo com serviços avulsos', () => {
    const answers = {
      servicos: serializeMultiChoice(['tradicional', 'combo_completo']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '10', // 10 avulsos = R$ 500
      tempo_combo: '90',
      preco_combo: '130.00',
      material_combo: '25.00',
      qtd_combo: '15', // 15 combos = R$ 1950
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '2',
      despesa_aluguel: '400.00',
      despesa_anuidade: '0.00',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answers);

    expect(res.totalMonthlyServices).toBe(25); // 10 + 15
    expect(res.grossMonthlyRevenue).toBe('2450.00'); // 500 + 1950
    expect(res.totalMonthlyMaterials).toBe('455.00'); // 80 + 375
  });

  it('ao desmarcar um serviço anteriormente selecionado, seus dados deixam de afetar os cálculos', () => {
    // answers holds old data for gel, but servicos only selects tradicional
    const answers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '20',
      // Old answers for gel that should be ignored:
      tempo_gel: '60',
      preco_gel: '500.00',
      material_gel: '100.00',
      qtd_gel: '50',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answers);

    expect(res.totalMonthlyServices).toBe(20);
    expect(res.grossMonthlyRevenue).toBe('1000.00');
    expect(res.services).toHaveLength(1);
    expect(res.services[0].id).toBe('tradicional');
  });

  it('rateia despesas compartilhadas com base na porcentagem informada', () => {
    const answers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '10',
      despesa_aluguel: '1000.00',
      rateio_aluguel: '40', // 40% atribuído ao trabalho = R$ 400
      despesa_anuidade: '0.00',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answers);

    expect(res.fixedExpenses.items[0].effectiveMonthlyAmount).toBe('400.00');
    expect(res.fixedExpenses.totalFixedExpenses).toBe('400.00');
  });

  it('calcula capacidade, ocupação e detecta sobrecarga quando a demanda supera horas líquidas', () => {
    const answers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '120', // 2 horas por atendimento
      preco_tradicional: '100.00',
      material_tradicional: '10.00',
      qtd_tradicional: '100', // 100 atendimentos x 2h = 200 horas demandadas
      dias_semana: '5',
      horas_dia: '8', // 40h/semana x 4.333 = ~173.3h brutas
      horas_apoio: '10', // 10h/semana x 4.333 = ~43.3h apoio -> Líquida = ~130h
      despesa_aluguel: '500.00',
      despesa_anuidade: '0.00',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answers);

    expect(res.capacity.status).toBe('overcapacity');
    expect(Number(res.capacity.occupancyRate)).toBeGreaterThan(1.0);
    expect(res.actionPlan.some(a => a.problem.includes('Sobrecarga de capacidade'))).toBe(true);
  });

  it('centraliza despesas de marketing sem duplicar com as despesas gerais', () => {
    const answers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '10',
      despesa_aluguel: '500.00',
      despesa_anuidade: '0.00',
      canais_mkt: serializeMultiChoice(['insta']),
      gasto_insta: '150.00',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answers);

    expect(res.fixedExpenses.totalGeneralExpenses).toBe('500.00');
    expect(res.fixedExpenses.totalMarketingExpenses).toBe('150.00');
    expect(res.fixedExpenses.totalFixedExpenses).toBe('650.00');
  });

  it('processa módulo opcional de finanças pessoais quando preenchido e omite sem erros quando pulado', () => {
    // 1. Pulado
    const skippedAnswers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '10',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      preencher_pessoal: 'pular',
    };
    const resSkipped = evaluateBusinessDiagnosis(mockQuiz, mockConfig, skippedAnswers);
    expect(resSkipped.personalFinances).toBeUndefined();
    expect(resSkipped.limitations.some(l => l.includes('finanças pessoais não foi preenchido'))).toBe(true);

    // 2. Preenchido
    const filledAnswers = {
      ...skippedAnswers,
      preencher_pessoal: 'sim',
      moradia: '1200.00',
      alimentacao: '800.00',
      contas: '300.00',
      transporte_pessoal: '200.00',
      dependentes: '500.00',
      outros_pessoal: '100.00',
      outras_rendas: '1000.00',
      retirada_atual: '2500.00',
    };
    const resFilled = evaluateBusinessDiagnosis(mockQuiz, mockConfig, filledAnswers);
    expect(resFilled.personalFinances).toBeDefined();
    // Total expenses = 1200 + 800 + 300 + 200 + 500 + 100 = 3100
    expect(resFilled.personalFinances?.totalPersonalExpenses).toBe('3100.00');
    // Net personal need = 3100 - 1000 = 2100
    expect(resFilled.personalFinances?.netPersonalNeed).toBe('2100.00');
    // Retirada atual (2500) >= necessidade (2100) -> isSufficient = true
    expect(resFilled.personalFinances?.isSufficient).toBe(true);
    expect(resFilled.personalFinances?.difference).toBe('400.00');
  });

  it('filtra recomendações condicionais declarativas com base em interesse e nível', () => {
    // Caso 1: sem interesse
    const noInterest = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '10',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      exp_gel: 'nunca',
      interesse_gel: 'nao',
    };
    const resNo = evaluateBusinessDiagnosis(mockQuiz, mockConfig, noInterest);
    expect(resNo.recommendations).toHaveLength(0);

    // Caso 2: com interesse e nível compatível
    const withInterest = {
      ...noInterest,
      interesse_gel: 'sim',
    };
    const resYes = evaluateBusinessDiagnosis(mockQuiz, mockConfig, withInterest);
    expect(resYes.recommendations).toHaveLength(1);
    expect(resYes.recommendations[0].id).toBe('curso_gel');
    expect(resYes.recommendations[0].isAffiliate).toBe(true);
    expect(resYes.recommendations[0].freeAlternative).toBeDefined();
  });

  it('taxa de pagamento de 0% não deve reverter para a taxa padrão de 5%', () => {
    const answersZero = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '100.00',
      material_tradicional: '10.00',
      qtd_tradicional: '10',
      taxa_cartao: '0',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
    };
    const resZero = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersZero);
    expect(resZero.paymentFeeRate).toBe('0.0000');
    expect(resZero.totalPaymentFees).toBe('0.00');

    // Quando omitida, reverte para a taxa padrão
    const answersOmitted: Record<string, string> = { ...answersZero };
    delete answersOmitted.taxa_cartao;
    const resOmitted = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersOmitted);
    expect(resOmitted.paymentFeeRate).toBe('0.0500');
    expect(resOmitted.totalPaymentFees).toBe('50.00');
  });

  it('margem de contribuição negativa não recebe ponto de equilíbrio de R$ 0,00 e explica que aumentar vendas não resolve', () => {
    const answersNegativeMargin = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '10.00', // Preço R$ 10
      material_tradicional: '20.00', // Custo de material R$ 20 -> Margem negativa
      qtd_tradicional: '10',
      taxa_cartao: '0',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      despesa_aluguel: '500.00',
    };
    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersNegativeMargin);
    expect(Number(res.totalContributionMargin)).toBeLessThan(0);
    expect(res.financials.breakEvenOperationalRevenue).toBeNull();
    expect(res.financials.breakEvenTotalRevenue).toBeNull();
    expect(res.financials.breakEvenExplanation).toContain('aumentar as vendas não resolve o problema');
    expect(res.financials.breakEvenExplanation).toContain('margem de contribuição negativa');
  });

  it('distingue despesas pessoais não informadas de despesa zero e não afirma suficiência indevidamente', () => {
    // 1. Caso com despesas em branco (não informadas)
    const answersBlankExpenses: Record<string, string> = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '40',
      preco_tradicional: '50.00',
      material_tradicional: '8.00',
      qtd_tradicional: '10',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      preencher_pessoal: 'sim',
      moradia: '',
      contas: '',
      retirada_atual: '2000.00',
    };
    const resBlank = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersBlankExpenses);
    expect(resBlank.personalFinances).toBeDefined();
    expect(resBlank.personalFinances?.hasUninformedExpenses).toBe(true);
    expect(resBlank.personalFinances?.isSufficient).toBeNull(); // Não conclui que é suficiente
    expect(resBlank.personalFinances?.items.find(i => i.category === 'Moradia')?.amount).toBeNull();
    expect(resBlank.limitations.some(l => l.includes('Despesas pessoais não informadas'))).toBe(true);

    // 2. Caso com despesas explicitamente informadas como 0
    const answersZeroExpenses = {
      ...answersBlankExpenses,
      moradia: '0',
      alimentacao: '0.00',
      contas: '0',
      transporte_pessoal: '0',
      dependentes: '0',
      outros_pessoal: '0',
      outras_rendas: '0',
    };
    const resZero = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersZeroExpenses);
    expect(resZero.personalFinances?.hasUninformedExpenses).toBe(false);
    expect(resZero.personalFinances?.isSufficient).toBe(true);
    expect(resZero.personalFinances?.items.find(i => i.category === 'Moradia')?.amount).toBe('0.00');

    // 3. Histórico mensal com despesas não preenchidas
    const answersHist = {
      ...answersZeroExpenses,
      preencher_historico: 'sim',
      hist_rev_1: '3000.00',
      hist_exp_1: '', // Não informado
      hist_with_1: '', // Não informado
    };
    const resHist = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersHist);
    expect(resHist.monthlyHistory?.months[0].revenue).toBe('3000.00');
    expect(resHist.monthlyHistory?.months[0].expenses).toBeNull();
    expect(resHist.monthlyHistory?.months[0].withdrawals).toBeNull();
    expect(resHist.monthlyHistory?.months[0].netResult).toBeNull();
    expect(resHist.limitations.some(l => l.includes('histórico mensal foram registradas como não informadas'))).toBe(true);
  });

  it('o plano de ação prioriza emergências financeiras reais sobre orientações genéricas', () => {
    // Negócio com serviços deficitários, sobrecarga de capacidade e déficit de pró-labore
    const answersDeficit = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '120',
      preco_tradicional: '20.00',
      material_tradicional: '25.00', // Deficitário
      qtd_tradicional: '100', // 200 horas demandadas (sobrecarga)
      dias_semana: '5',
      horas_dia: '8', // ~173h brutas
      horas_apoio: '10',
      despesa_aluguel: '1000.00',
      retirada_atual: '3000.00', // Gera déficit líquido
      retirada_desejada: '5000.00',
      'objetivo-vida': 'renda',
    };

    const res = evaluateBusinessDiagnosis(mockQuiz, mockConfig, answersDeficit);

    // O plano de ação NÃO deve substituir os problemas financeiros críticos por textos genéricos do objetivo
    expect(res.actionPlan[0].title).toBe('Adequação dos serviços de menor margem');
    expect(res.actionPlan[0].priority).toBe('alta');

    expect(res.actionPlan[1].title).toBe('Reestruturação de horários e limites de mesa');
    expect(res.actionPlan[1].priority).toBe('alta');

    expect(res.actionPlan[2].title).toBe('Ajuste do pró-labore e separação de finanças');
    expect(res.actionPlan[2].priority).toBe('alta');
  });

  it('suporta feeAmountQuestion em R$/mês: conhecido, zero, não sei e em branco', () => {
    const configWithFeeAmount: BusinessDiagnosisConfig = {
      ...mockConfig,
      feeRateQuestion: undefined,
      feeAmountQuestion: 'taxa_cartao_reais',
    };

    const baseAnswers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '60',
      preco_tradicional: '50.00',
      material_tradicional: '10.00',
      qtd_tradicional: '40', // Faturamento = 2000.00
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      despesa_aluguel: '500.00',
      retirada_atual: '1000.00',
      retirada_desejada: '2000.00',
    };

    // 1. Conhecido: R$ 100,00
    const resKnown = evaluateBusinessDiagnosis(mockQuiz, configWithFeeAmount, {
      ...baseAnswers,
      taxa_cartao_reais: '100,00',
    });
    expect(resKnown.totalPaymentFees).toBe('100.00');
    expect(resKnown.paymentFeeStatus).toBe('known');
    expect(resKnown.paymentFeeRate).toBe('0.0500'); // 100 / 2000 = 0.05
    expect(resKnown.paymentFeeRateEstimated).toBe(true);
    // Custos variáveis: materiais (400) + taxas (100) = 500
    expect(resKnown.totalVariableCosts).toBe('500.00');

    // 2. Zero: R$ 0,00 (não paga taxa)
    const resZero = evaluateBusinessDiagnosis(mockQuiz, configWithFeeAmount, {
      ...baseAnswers,
      taxa_cartao_reais: '0',
    });
    expect(resZero.totalPaymentFees).toBe('0.00');
    expect(resZero.paymentFeeStatus).toBe('zero');
    expect(resZero.paymentFeeRate).toBe('0.0000');
    expect(resZero.totalVariableCosts).toBe('400.00');

    // 3. Não sei: "nao-sei" ou "desconhecido"
    const resUnknown = evaluateBusinessDiagnosis(mockQuiz, configWithFeeAmount, {
      ...baseAnswers,
      taxa_cartao_reais: 'nao-sei',
    });
    expect(resUnknown.totalPaymentFees).toBeNull();
    expect(resUnknown.paymentFeeStatus).toBe('unknown');
    expect(resUnknown.paymentFeeRate).toBeNull();
    expect(resUnknown.financials.hasIncompleteExpenses).toBe(true);
    expect(resUnknown.financials.incompleteExpensesNotice).toContain('taxas de pagamento');
    expect(resUnknown.limitations.some(l => l.includes('marcadas como desconhecidas'))).toBe(true);

    // 4. Em branco (não informado)
    const resBlank = evaluateBusinessDiagnosis(mockQuiz, configWithFeeAmount, {
      ...baseAnswers,
      taxa_cartao_reais: '',
    });
    expect(resBlank.totalPaymentFees).toBeNull();
    expect(resBlank.paymentFeeStatus).toBe('uninformed');
    expect(resBlank.paymentFeeRate).toBeNull();
    expect(resBlank.financials.hasIncompleteExpenses).toBe(true);
    expect(resBlank.financials.incompleteExpensesNotice).toContain('taxas de pagamento');

    // 5. Sem faturamento bruto (0 atendimentos): taxa em R$ não deriva taxa percentual proporcional
    const resNoRevenue = evaluateBusinessDiagnosis(mockQuiz, configWithFeeAmount, {
      ...baseAnswers,
      qtd_tradicional: '0',
      taxa_cartao_reais: '50,00',
    });
    expect(resNoRevenue.grossMonthlyRevenue).toBe('0.00');
    expect(resNoRevenue.totalPaymentFees).toBe('50.00');
    expect(resNoRevenue.paymentFeeRate).toBeNull(); // Não deriva taxa proporcional sem receita
  });

  it('suporta workAmountQuestion em R$ para despesas mistas sem deduções automáticas', () => {
    const configWithWorkAmount: BusinessDiagnosisConfig = {
      ...mockConfig,
      expenses: [
        {
          id: 'aluguel',
          label: 'Aluguel do espaço',
          category: 'espaco',
          amountQuestion: 'despesa_aluguel',
          workAmountQuestion: 'aluguel_trabalho',
          period: 'month',
        },
      ],
    };

    const baseAnswers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '60',
      preco_tradicional: '50.00',
      material_tradicional: '10.00',
      qtd_tradicional: '20',
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      retirada_atual: '1000.00',
      retirada_desejada: '2000.00',
    };

    // Caso 1: Informou gasto total de R$ 1.500 e estimou R$ 600 de trabalho
    const resWithWork = evaluateBusinessDiagnosis(mockQuiz, configWithWorkAmount, {
      ...baseAnswers,
      despesa_aluguel: '1500,00',
      aluguel_trabalho: '600,00',
    });
    const expItem = resWithWork.fixedExpenses.items[0];
    expect(expItem.rawAmount).toBe('1500.00');
    expect(expItem.workAmount).toBe('600.00');
    expect(expItem.effectiveMonthlyAmount).toBe('600.00');
    expect(expItem.isEstimated).toBe(true);
    expect(resWithWork.fixedExpenses.totalFixedExpenses).toBe('600.00');

    // Caso 2: Informou gasto total de R$ 1.500 e deixou trabalho em branco (assume total para o negócio)
    const resWithoutWork = evaluateBusinessDiagnosis(mockQuiz, configWithWorkAmount, {
      ...baseAnswers,
      despesa_aluguel: '1500,00',
      aluguel_trabalho: '',
    });
    const expItem2 = resWithoutWork.fixedExpenses.items[0];
    expect(expItem2.rawAmount).toBe('1500.00');
    expect(expItem2.workAmount).toBeNull();
    expect(expItem2.effectiveMonthlyAmount).toBe('1500.00');
    expect(expItem2.isEstimated).toBe(false);
    expect(resWithoutWork.fixedExpenses.totalFixedExpenses).toBe('1500.00');

    // Caso 3: Despesa total em branco (não preenchida) -> aviso de despesas incompletas
    const resBlankExp = evaluateBusinessDiagnosis(mockQuiz, configWithWorkAmount, {
      ...baseAnswers,
      despesa_aluguel: '',
      aluguel_trabalho: '',
    });
    expect(resBlankExp.financials.hasIncompleteExpenses).toBe(true);
    expect(resBlankExp.financials.incompleteExpensesNotice).toContain('Aluguel do espaço');
    expect(resBlankExp.limitations.some(l => l.includes('Despesas profissionais não informadas'))).toBe(true);
  });

  it('suporta histórico de múltiplos meses e calcula análise de tendência', () => {
    const configWithMultiMonth: BusinessDiagnosisConfig = {
      ...mockConfig,
      monthlyHistory: {
        optInQuestion: 'preencher_historico',
        months: [
          {
            monthKey: 'm3',
            label: '3 meses atrás',
            revenueQuestion: 'hist_rev_3',
            expensesQuestion: 'hist_exp_3',
            withdrawalsQuestion: 'hist_with_3',
          },
          {
            monthKey: 'm2',
            label: '2 meses atrás',
            revenueQuestion: 'hist_rev_2',
            expensesQuestion: 'hist_exp_2',
            withdrawalsQuestion: 'hist_with_2',
          },
          {
            monthKey: 'm1',
            label: 'Mês anterior',
            revenueQuestion: 'hist_rev_1',
            expensesQuestion: 'hist_exp_1',
            withdrawalsQuestion: 'hist_with_1',
          },
        ],
      },
    };

    const baseAnswers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '60',
      preco_tradicional: '50.00',
      material_tradicional: '10.00',
      qtd_tradicional: '40', // Faturamento estimado = 2000.00
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      despesa_aluguel: '500.00',
      retirada_atual: '1000.00',
      retirada_desejada: '2000.00',
    };

    // 1. Tendência de alta (growing): 2000 -> 2500 -> 3000 (+50%)
    const resGrowing = evaluateBusinessDiagnosis(mockQuiz, configWithMultiMonth, {
      ...baseAnswers,
      preencher_historico: '3-meses',
      hist_rev_3: '2000,00',
      hist_exp_3: '800,00',
      hist_with_3: '1000,00',
      hist_rev_2: '2500,00',
      hist_exp_2: '900,00',
      hist_with_2: '1000,00',
      hist_rev_1: '3000,00',
      hist_exp_1: '1000,00',
      hist_with_1: '1200,00',
    });
    expect(resGrowing.monthlyHistory?.isProvided).toBe(true);
    expect(resGrowing.monthlyHistory?.months.length).toBe(3);
    expect(resGrowing.monthlyHistory?.averageHistoricalRevenue).toBe('2500.00');
    expect(resGrowing.monthlyHistory?.averageHistoricalExpenses).toBe('900.00');
    expect(resGrowing.monthlyHistory?.averageHistoricalWithdrawals).toBe('1066.67');
    expect(resGrowing.monthlyHistory?.trend?.direction).toBe('growing');
    expect(resGrowing.monthlyHistory?.trend?.percentage).toBe('+50.0%');
    expect(resGrowing.monthlyHistory?.trend?.message).toContain('Tendência de alta');

    // 2. Tendência de recuo (declining): 3000 -> 2500 -> 2000 (-33.3%)
    const resDeclining = evaluateBusinessDiagnosis(mockQuiz, configWithMultiMonth, {
      ...baseAnswers,
      preencher_historico: '3-meses',
      hist_rev_3: '3000,00',
      hist_rev_2: '2500,00',
      hist_rev_1: '2000,00',
    });
    expect(resDeclining.monthlyHistory?.trend?.direction).toBe('declining');
    expect(resDeclining.monthlyHistory?.trend?.percentage).toBe('-33.3%');
    expect(resDeclining.monthlyHistory?.trend?.message).toContain('Tendência de recuo');

    // 3. Faturamento estável (stable): 2000 -> 2050 -> 2020 (+1%)
    const resStable = evaluateBusinessDiagnosis(mockQuiz, configWithMultiMonth, {
      ...baseAnswers,
      preencher_historico: '3-meses',
      hist_rev_3: '2000,00',
      hist_rev_2: '2050,00',
      hist_rev_1: '2020,00',
    });
    expect(resStable.monthlyHistory?.trend?.direction).toBe('stable');
    expect(resStable.monthlyHistory?.trend?.message).toContain('estável');

    // 4. Apenas 1 mês informado (single_month)
    const resSingle = evaluateBusinessDiagnosis(mockQuiz, configWithMultiMonth, {
      ...baseAnswers,
      preencher_historico: 'sim',
      hist_rev_1: '2000,00',
    });
    expect(resSingle.monthlyHistory?.months.length).toBe(1);
    expect(resSingle.monthlyHistory?.trend?.direction).toBe('single_month');
    expect(resSingle.limitations.some(l => l.includes('considerou apenas 1 mês'))).toBe(true);

    // 5. Opção pular: não gera monthlyHistory
    const resSkip = evaluateBusinessDiagnosis(mockQuiz, configWithMultiMonth, {
      ...baseAnswers,
      preencher_historico: 'pular',
      hist_rev_1: '2000,00',
    });
    expect(resSkip.monthlyHistory).toBeUndefined();
  });

  it('registra parcelas em atraso e prioriza renegociação de dívidas com juros no plano de ação', () => {
    const configWithDebt: BusinessDiagnosisConfig = {
      ...mockConfig,
      reservesAndDebts: {
        optInQuestion: 'preencher_reservas',
        businessCashQuestion: 'caixa_empresa',
        personalReserveQuestion: 'reserva_pessoal',
        monthlyDebtQuestion: 'divida_mensal',
        totalDebtQuestion: 'divida_total',
        overdueDebtQuestion: 'divida_atraso',
        overdueDebtAmountQuestion: 'divida_atraso_valor',
      },
    };

    const baseAnswers = {
      servicos: serializeMultiChoice(['tradicional']),
      tempo_tradicional: '60',
      preco_tradicional: '50.00',
      material_tradicional: '10.00',
      qtd_tradicional: '40', // Faturamento = 2000.00
      dias_semana: '5',
      horas_dia: '8',
      horas_apoio: '0',
      despesa_aluguel: '500.00',
      retirada_atual: '1000.00',
      retirada_desejada: '2000.00',
      preencher_reservas: 'sim',
      caixa_empresa: '500,00',
      reserva_pessoal: '0,00',
      divida_mensal: '400,00',
      divida_total: '6000,00',
    };

    // Caso 1: Dívidas com parcelas em atraso
    const resOverdue = evaluateBusinessDiagnosis(mockQuiz, configWithDebt, {
      ...baseAnswers,
      divida_atraso: 'sim',
      divida_atraso_valor: '800,00',
    });
    expect(resOverdue.reservesAndDebts?.hasOverdueDebt).toBe(true);
    expect(resOverdue.reservesAndDebts?.overdueDebtStatus).toBe('overdue');
    expect(resOverdue.reservesAndDebts?.overdueDebtAmount).toBe('800.00');
    expect(resOverdue.reservesAndDebts?.monthlyDebt).toBe('400.00');
    expect(resOverdue.reservesAndDebts?.totalDebt).toBe('6000.00');

    // Plano de ação: Ação 3 repriorizada para renegociação urgente
    const action3 = resOverdue.actionPlan[2];
    expect(action3.title).toContain('Renegociação urgente de dívidas');
    expect(action3.priority).toBe('alta');
    expect(action3.evidence).toContain('800.00');
    expect(resOverdue.limitations.some(l => l.includes('parcelas ou compromissos em atraso'))).toBe(true);

    // Caso 2: Dívidas em dia (sem atraso)
    const resUpToDate = evaluateBusinessDiagnosis(mockQuiz, configWithDebt, {
      ...baseAnswers,
      divida_atraso: 'nao',
    });
    expect(resUpToDate.reservesAndDebts?.hasOverdueDebt).toBe(false);
    expect(resUpToDate.reservesAndDebts?.overdueDebtStatus).toBe('up_to_date');
    expect(resUpToDate.actionPlan[2].title).not.toContain('Renegociação urgente');
  });
});

