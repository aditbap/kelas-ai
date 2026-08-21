export type PricingTier = {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  seatsLabel: string;
  seatLimit: number;
  description: string;
  highlighted: boolean;
  priceEnvVar: string;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    seatsLabel: 'Up to 25 seats',
    seatLimit: 25,
    description: 'One onsite session, core curriculum, and full platform access.',
    highlighted: false,
    priceEnvVar: 'STRIPE_PRICE_STARTER_ID',
  },
  {
    id: 'growth',
    name: 'Growth',
    seatsLabel: 'Up to 100 seats',
    seatLimit: 100,
    description: 'Multiple onsite sessions, role-specific curriculum, and adoption reporting.',
    highlighted: true,
    priceEnvVar: 'STRIPE_PRICE_GROWTH_ID',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    seatsLabel: '100+ seats',
    seatLimit: 1000,
    description: 'Multi-site rollout, custom curriculum, and a dedicated instructor team.',
    highlighted: false,
    priceEnvVar: 'STRIPE_PRICE_ENTERPRISE_ID',
  },
];

export function getPricingTier(id: string): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.id === id);
}
