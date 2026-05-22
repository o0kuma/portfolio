/** True when real Stripe price IDs are configured (not placeholders). */
export function isStripeConfigured(): boolean {
  const monthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY?.trim()
  const yearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY?.trim()
  const isReal = (id?: string) =>
    !!id && id.startsWith('price_') && !id.includes('xxxxxxxx')
  return isReal(monthly) || isReal(yearly)
}
