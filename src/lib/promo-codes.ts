export type PromoCode = { code: string; discountPercent: number };

// A small hardcoded table for now - promo codes aren't yet something editors
// manage themselves, so this is the single source of truth until they are.
// No secrets live here (the discount table isn't sensitive), so this module
// has no server-only dependencies and is safe to import from client code for
// an instant price preview - the checkout API always re-validates server-side
// before anything is charged or an enrollment is recorded.
const PROMO_CODES: Record<string, PromoCode> = {
  PLNERS123: { code: 'PLNERS123', discountPercent: 100 },
};

/** Promo codes are case-insensitive; students shouldn't be tripped up by shift-lock. */
export function findPromoCode(input: string): PromoCode | null {
  const normalized = input.trim().toUpperCase();
  return PROMO_CODES[normalized] ?? null;
}

export function applyDiscount(amount: number, discountPercent: number): number {
  return Math.max(0, Math.round(amount * (1 - discountPercent / 100)));
}
