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
  actualPrice: string; fee: string; netRevenue: string; profit: string;
  effectiveMargin: string; profitPerHour: string | null;
  status: 'loss' | 'sub_target' | 'break_even' | 'healthy'; message: string;
};

export function evaluateActualPrice(actualPrice: string, cost: string, feeRate: string, breakEvenCost: string, minutes = 0): ActualPriceDiagnosis {
  const p = new D(actualPrice), fee = p.times(feeRate), netRevenue = p.minus(fee);
  const profit = netRevenue.minus(cost);
  const common = { actualPrice:p.toString(), fee:fee.toString(), netRevenue:netRevenue.toString(), profit:profit.toString(),
    effectiveMargin:p.isZero()?'0':profit.div(p).toString(),
    profitPerHour:minutes>0?profit.times(60).div(minutes).toString():null };
  if(netRevenue.lt(breakEvenCost))return {...common,status:'loss',message:'Neste cenário de referência, o preço informado não cobre os materiais e as despesas operacionais estimados.'};
  if(profit.lt(0))return {...common,status:'sub_target',message:'Neste cenário, o preço cobre os custos operacionais estimados, mas não alcança a remuneração de referência.'};
  if(profit.isZero())return {...common,status:'break_even',message:'Neste cenário, o preço cobre os custos e a remuneração de referência, sem excedente: ponto de equilíbrio.'};
  return {...common,status:'healthy',message:'Neste cenário, o preço cobre os custos e a remuneração de referência e apresenta resultado estimado positivo. Isso não comprova sua margem real.'};
}
