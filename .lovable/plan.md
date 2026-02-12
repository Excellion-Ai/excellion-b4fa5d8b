

# Fix Password Reset Email Delivery

## Problem

Two issues are preventing password reset emails from arriving:

1. **Rate limiting**: The built-in email service has a strict limit of ~2-3 emails per hour. Multiple reset attempts have exhausted this limit, so emails are silently dropped.
2. **No custom SMTP**: A Resend API key is already configured but not connected to the auth email system. The platform is using the default mailer which has poor deliverability (emails often land in spam or get blocked).

Note: If you enter an email that isn't registered (anything other than your current account email), the system returns "success" for security reasons but won't send an email — this is expected behavior to prevent attackers from discovering which emails are registered.

## Plan

### Step 1: Create a backend function for password reset emails via Resend

Since the built-in mailer is unreliable, we'll create a custom backend function that sends branded password reset emails through Resend (already configured). This bypasses the rate limits entirely.

- Create a new edge function `send-password-reset` that:
  - Accepts an email address
  - Uses the Supabase Admin API to generate a password reset link
  - Sends the link via Resend with Excellion branding
  - Returns success/failure to the frontend

### Step 2: Update the Auth page to use the custom function

- Modify `handleForgotPassword` in `src/pages/Auth.tsx` to call the new backend function instead of `supabase.auth.resetPasswordForEmail()`
- Keep the same user-facing behavior (success toast, loading state)

### Step 3: Add a password update handler

- Add logic to detect when a user arrives via a reset link (Supabase appends tokens to the URL)
- Show a "Set New Password" form so the user can enter their new password
- Call `supabase.auth.updateUser({ password })` to save it

## Technical Details

**New file:** `supabase/functions/send-password-reset/index.ts`
- Uses `RESEND_API_KEY` (already configured) and `SUPABASE_SERVICE_ROLE_KEY` to generate a reset link via `supabase.auth.admin.generateLink()`
- Sends a branded HTML email through Resend's API
- Validates the email format before processing

**Modified file:** `src/pages/Auth.tsx`
- `handleForgotPassword` calls the new edge function via `supabase.functions.invoke('send-password-reset', { body: { email } })`
- Add a `useEffect` to detect `type=recovery` in URL hash and show a new password form
- Add new state: `isResettingPassword`, `newPassword`

