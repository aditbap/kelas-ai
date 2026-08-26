/**
 * There is exactly one product: the All-Access package, paid once, which
 * unlocks every published Module for that Student forever. Overridable via
 * env so ops can adjust the price without a code change/redeploy.
 */
export const ALL_ACCESS_PRICE_IDR = Number(process.env.ALL_ACCESS_PRICE_IDR) || 500_000;
