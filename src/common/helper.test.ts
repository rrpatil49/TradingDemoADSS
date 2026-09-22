import { formatPrice } from './helper';

describe('formatPrice', () => {
  it('formats a valid price to the requested precision', () => {
    expect(formatPrice(1.23456, 3)).toBe('1.235');
  });

  it.each([undefined, null, Number.NaN])('formats %s as zero', value => {
    expect(formatPrice(value as number, 2)).toBe('0.00');
  });
});
