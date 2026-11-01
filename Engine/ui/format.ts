import { D } from '../core/pricing';

/** Displayed money: half-up to cents (suggested prices are already rounded up by the core). */
export function money(value: string): string {
  const [int, cents] = new D(value).toDecimalPlaces(2, D.ROUND_HALF_UP).toFixed(2).split('.');
  return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`;
}

export function percent(value: string): string {
  return `${new D(value).times(100).toDecimalPlaces(2, D.ROUND_HALF_UP).toString().replace('.', ',')}%`;
}

export function duration(minutes: number): string {
  const label = `${minutes} minutos`;
  if (minutes < 60) return label;
  const hours = Math.floor(minutes / 60), rest = minutes % 60;
  return `${label} (${hours} h${rest ? ` ${rest} min` : ''})`;
}

