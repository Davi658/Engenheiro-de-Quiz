import Decimal from 'decimal.js';
export const D = Decimal.clone({precision:40});
export function priceScenario(cost:string,feeRate:string,margin:string) {
 const denominator=new D(1).minus(feeRate).minus(margin);
 if(denominator.lte(0))throw Error('Taxa + margem inválida.');
 const price=new D(cost).div(denominator).toDecimalPlaces(2,D.ROUND_CEIL);
 const fee=price.times(feeRate), profit=price.minus(fee).minus(cost);
 return {margin,price:price.toFixed(2),fee:fee.toString(),profit:profit.toString(),effectiveMargin:price.isZero()?'0':profit.div(price).toString()};
}
