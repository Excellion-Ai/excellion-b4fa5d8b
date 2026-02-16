

# Fix Stripe Payments for Creator Subscriptions and Course Purchases

## Problem Summary

There are two blockers preventing Stripe from working:

1. **Missing Secret**: The `STRIPE_SECRET_KEY` is not configured. All three payment edge functions (`create-checkout`, `create-course-checkout`, `verify-course-purchase`) fail immediately with "STRIPE_SECRET_KEY is not set".

2. **Price ID Mismatch**: The Pricing page sends placeholder IDs (`price_coach_monthly`, `price_coach_annual`) but the `create-checkout` edge function expects starter/pro/agency tier IDs that already exist in your Stripe dashboard.

---

## Plan

### Step 1 -- Add the Stripe Secret Key

Use the Stripe integration tool to connect your Stripe account. This will securely store the `STRIPE_SECRET_KEY` so all three edge functions can communicate with Stripe.

### Step 2 -- Align the Pricing Page with Real Stripe Price IDs

Update `Pricing.tsx` to send actual Stripe Price IDs instead of placeholders. Two options:

- **Option A (single plan at $79/mo, $790/yr):** Create these two prices in your Stripe dashboard, then hardcode the real IDs in the Pricing page.
- **Option B (reuse existing tiers):** Switch the Pricing page to show the starter/pro/agency tiers that already have real Price IDs in the `create-checkout` edge function ($19/$39/$99 monthly).

The edge function itself needs no changes -- it already accepts a `priceId` directly and validates it.

### Step 3 -- Add JWT bypass for payment edge functions

The `create-checkout`, `create-course-checkout`, and `verify-course-purchase` functions authenticate users manually via the Authorization header, but they are not listed in `config.toml` with `verify_jwt = false`. This means Supabase's gateway may reject requests before the function code even runs. Add entries to `config.toml`.

### Step 4 -- Verify course purchase flow end-to-end

The course checkout flow (`CoursePage -> create-course-checkout -> Stripe -> PurchaseSuccess -> verify-course-purchase`) is structurally complete. Once the secret key is set, it will work for any course with a non-zero `price_cents` value in the database.

No code changes needed for this flow -- just the secret key from Step 1.

---

## Technical Details

### Files to modify

| File | Change |
|------|--------|
| (Secret) | Add `STRIPE_SECRET_KEY` via Stripe integration tool |
| `src/pages/Pricing.tsx` | Replace placeholder Price IDs with real Stripe IDs |
| `supabase/config.toml` | Add `verify_jwt = false` for `create-checkout`, `create-course-checkout`, `verify-course-purchase` |

### Edge functions (no code changes needed)

- `create-checkout` -- handles creator subscriptions, already supports direct `priceId` param
- `create-course-checkout` -- handles course purchases using dynamic `price_cents` from DB, fully implemented
- `verify-course-purchase` -- verifies Stripe session, updates purchase record, auto-enrolls student, fully implemented

### What needs your input

Before implementation, I need to know which pricing structure you want on the Pricing page:

- Keep the single Coach plan at $79/mo and $790/yr (requires creating 2 new prices in Stripe)
- Or switch to the starter/pro/agency tiers that already have Stripe Price IDs

