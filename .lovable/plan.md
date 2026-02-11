

# Update Project Secrets

Since you have your API keys ready, here's what we'll do:

## Secrets to Update (7 total)

1. **HCAPTCHA_SECRET_KEY** - From hCaptcha dashboard
2. **GITHUB_CLIENT_ID** - From GitHub OAuth app settings
3. **GITHUB_CLIENT_SECRET** - From GitHub OAuth app settings
4. **TOKEN_ENCRYPTION_KEY** - Generated via `openssl rand -hex 32`
5. **ANTHROPIC_API_KEY** - From Anthropic console
6. **HCAPTCHA_SITE_KEY** - From hCaptcha sites dashboard
7. **STRIPE_WEBHOOK_SECRET** - From Stripe webhooks dashboard

## Skipped

- **RESEND_API_KEY** - No longer used; will leave as-is (can be cleaned up later)

## Process

I'll prompt you for each secret value one at a time using the secure secret input tool. You'll paste each key into the secure input field that appears.

## Technical Notes

- The secrets are stored securely and accessible only from backend functions
- The VITE_HCAPTCHA_SITE_KEY in `.env` is a separate client-side variable and is already set
- No code changes are needed -- just updating the secret values

