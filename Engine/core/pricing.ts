import Decimal from 'decimal.js';
export const D = Decimal.clone({precision:40});
export function priceScenario(cost:string,feeRate:string,margin:string) {
 const denominator=new D(1).minus(feeRate).minus(margin);
 if(denominator.lte(0))throw Error('Taxa + margem inválida.');
 const price=new D(cost).div(denominator).toDecimalPlaces(2,D.ROUND_CEIL);
 const fee=price.times(feeRate), profit=price.minus(fee).minus(cost);
 return {margin,price:price.toFixed(2),fee:fee.toString(),profit:profit.toString(),effectiveMargin:price.isZero()?'0':profit.div(price).toString()};
}

export type ActualPriceDiagnosis = {
  actualPrice: string;
  fee: string;
  netRevenue: string;
  profit: string;
  effectiveMargin: string;
  status: 'loss' | 'sub_target' | 'healthy';
  message: string;
};

export function evaluateActualPrice(actualPrice: string, cost: string, feeRate: string, breakEvenCost: string): ActualPriceDiagnosis {
  const p = new D(actualPrice);
  const fee = p.times(feeRate);
  const netRevenue = p.minus(fee);
  const profit = netRevenue.minus(cost);
  const effectiveMargin = p.isZero() ? '0' : profit.div(p).toString();

  // Se a receita líquida não cobre sequer os materiais e despesas operacionais básicas: prejuízo
  if (netRevenue.lt(breakEvenCost)) {
    return {
      actualPrice,
      fee: fee.toString(),
      netRevenue: netRevenue.toString(),
      profit: profit.toString(),
      effectiveMargin,
      status: 'loss',
      message: 'Atenção: o valor cobrado atualmente não cobre sequer o custo dos materiais e despesas do atendimento. Você está tendo prejuízo.',
    };
  }

  // Se cobre o básico mas sobra menos que o custo total com sua remuneração-alvo:
  if (profit.lt(0)) {
    return {
      actualPrice,
      fee: fee.toString(),
      netRevenue: netRevenue.toString(),
      profit: profit.toString(),
      effectiveMargin,
      status: 'sub_target',
      message: 'O valor cobre seus custos diretos, mas paga menos que a remuneração por hora ideal pelo seu tempo de mesa.',
    };
  }

  return {
    actualPrice,
    fee: fee.toString(),
    netRevenue: netRevenue.toString(),
    profit: profit.toString(),
    effectiveMargin,
    status: 'healthy',
    message: 'Excelente! Seu preço atual cobre todos os custos, sua remuneração por tempo de mesa e gera margem de lucro.',
  };
}
