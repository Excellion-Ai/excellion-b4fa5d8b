

# Fix Pricing Page -- $19 First Month + Copy Updates

## What's Wrong
The pricing page (`BuilderPricing.tsx`) has three issues:
1. When "Monthly" is selected, it just shows "$79/month" with no mention of the **$19 first month** introductory deal
2. Feature list uses old terminology ("offers", "Client") instead of course-focused language ("courses", "Student")
3. The Stripe Price IDs are still placeholders (TODO) instead of the real ones

## Changes

### File: `src/pages/BuilderPricing.tsx`

**1. Update Price IDs** -- Replace the TODO placeholder IDs with the real Stripe Price IDs (already used in `Pricing.tsx`):
- Monthly: `price_1T1YnuPCTHzXvqDgZwElpsRS`
- Annual: `price_1T1YjxPCTHzXvqDg3Plq3gtT`

**2. Monthly price display** -- When "Monthly" is selected, show the $19 first-month promo prominently:
- Large text: **$19** with "first month" label
- Subtext: "then $79/month" with a link to switch to yearly + "(save $158)"
- CTA button text: "Start for $19"

**3. Yearly price display** -- Keep as-is ($790/year) but update CTA button to "Start for $790/year"

**4. Update features list** to match the course-builder language:
- "Up to 3 active courses" (not "offers")
- "Student portal" (not "Client access portal")
- "Intake & check-ins" (not "Intake forms & check-ins")
- Keep: Unlimited page views, Custom domain support, Built-in analytics, SSL included, Cancel anytime

**5. Update checkout flow** -- Route to `create-checkout` edge function (like the working `Pricing.tsx` does) instead of navigating to `/checkout`.

**6. Update FAQ item** -- Change "3 active offers" to "3 active courses" in the FAQ answer.

## Technical Details

- Only one file is modified: `src/pages/BuilderPricing.tsx`
- The `billingPeriod` state type changes from `"monthly" | "yearly"` to `"monthly" | "annual"` for consistency with the checkout edge function
- The checkout handler will invoke `supabase.functions.invoke("create-checkout")` and open the returned URL, matching the pattern already used in `Pricing.tsx`
