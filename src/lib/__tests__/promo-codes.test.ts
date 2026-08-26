import { describe, it, expect } from 'vitest';

import { applyDiscount, findPromoCode } from '@/lib/promo-codes';

describe('findPromoCode', () => {
  it('finds the PLNERS123 code and reports its 100% discount', () => {
    expect(findPromoCode('PLNERS123')).toEqual({ code: 'PLNERS123', discountPercent: 100 });
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(findPromoCode('  plners123  ')).toEqual({ code: 'PLNERS123', discountPercent: 100 });
  });

  it('returns null for an unknown code', () => {
    expect(findPromoCode('NOTAREALCODE')).toBeNull();
  });
});

describe('applyDiscount', () => {
  it('zeroes out the amount for a 100% discount', () => {
    expect(applyDiscount(100000, 100)).toBe(0);
  });

  it('leaves the amount untouched for a 0% discount', () => {
    expect(applyDiscount(100000, 0)).toBe(100000);
  });

  it('rounds a partial discount to the nearest whole unit', () => {
    expect(applyDiscount(100000, 25)).toBe(75000);
  });

  it('never goes negative', () => {
    expect(applyDiscount(100000, 150)).toBe(0);
  });
});
