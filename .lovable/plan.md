

# Fix Publishing, Domains, and Infrastructure Gaps

## Current State Summary

- **Course publishing** works entirely through client-side routing (`/course/{subdomain}`). Data lives in the `courses` table and is rendered by your React app. No static HTML, no Caddy involvement.
- **Site builder publishing** generates static HTML, uploads it to storage, and serves it via `{slug}.excellion.app` through Caddy and the `serve-site` edge function.
- **Custom domains for sites** have a full pipeline: DNS instructions (A records + TXT verification), `verify-domain-dns` edge function, `allowed-domains` check, and `serve-site` resolution.
- **Custom domains for courses** are just a text input that saves a string to the database. There is no DNS verification, no serving infrastructure, and the CNAME instructions shown are incorrect (pointing to a nonexistent `courses.excellion.com`).
- **Caddy config** references an old Supabase project ID (`twaljzxgbbkhhjjocilf`) instead of the current one (`ejrbfyvlkibbaufcyxtc`).

## Planned Changes

### 1. Fix Caddy configuration (infrastructure)
**File:** `caddy/Caddyfile`

Update all `reverse_proxy` URLs from `twaljzxgbbkhhjjocilf.supabase.co` to `ejrbfyvlkibbaufcyxtc.supabase.co` so that site serving and domain validation actually reach the correct backend.

### 2. Fix wrong storage URL in CustomDomainsPanel
**File:** `src/components/secret-builder/CustomDomainsPanel.tsx`

The `STORAGE_BASE_URL` constant on line 31 references the old project ID. Update it to use the current project ID (`ejrbfyvlkibbaufcyxtc`).

### 3. Upgrade the Course Publish Settings domain tab with real DNS verification
**File:** `src/components/secret-builder/CoursePublishSettingsDialog.tsx`

Replace the current placeholder Domain tab with a proper implementation:
- When a custom domain is entered and saved, insert a record into the `custom_domains` table (linking to the course via the course's `builder_project_id` or a new reference column)
- Show the correct DNS setup instructions: A records pointing to `185.158.133.1` and a TXT verification record
- Add a "Verify Now" button that calls the existing `verify-domain-dns` edge function
- Show verification status badge (Pending / Verified)
- Remove the incorrect CNAME instructions

### 4. Update `serve-site` edge function to also resolve course domains
**File:** `supabase/functions/serve-site/index.ts`

When a custom domain resolves to a project via the `custom_domains` table, check if that project has a linked course (`builder_project_id` on the `courses` table). If so, redirect to the course's published URL on the main app (e.g., `excellion.lovable.app/course/{subdomain}`) instead of trying to fetch static HTML from storage.

This enables custom domains like `learn.mybrand.com` to redirect to the course page.

### 5. Fix TXT record naming convention
**File:** `src/components/secret-builder/CustomDomainsPanel.tsx`

The current DNS instructions show `_lovable` as the TXT record name with `lovable_verify=...` as the value. However, the `verify-domain-dns` edge function checks for `excellion={token}`. These need to be aligned:
- Update the UI to show `_excellion` as the TXT name and `excellion={token}` as the value (matching what the edge function expects), OR
- Update the edge function to also accept the `lovable_verify=` format

The recommendation is to update the UI to use `_excellion` and `excellion={token}` since this is your own platform.

---

## Technical Details

### DNS instruction alignment

Current mismatch:
- **UI shows:** TXT name `_lovable`, value `lovable_verify={token}`
- **Edge function checks:** TXT name `_excellion.{domain}`, value `excellion={token}`

Fix: Update `CustomDomainsPanel.tsx` lines 566-570 to show `_excellion` and `excellion={token}`.

### Course domain serving flow

```text
User visits learn.mybrand.com
  --> Caddy proxies to serve-site edge function
  --> serve-site looks up custom_domains table
  --> Finds project_id, checks for linked course
  --> Returns 302 redirect to excellion.lovable.app/course/{subdomain}
```

This avoids needing to generate static HTML for courses while still enabling custom domain access.

### Files changed summary

| File | Change |
|------|--------|
| `caddy/Caddyfile` | Fix Supabase project ID |
| `src/components/secret-builder/CustomDomainsPanel.tsx` | Fix storage URL, fix TXT record instructions |
| `src/components/secret-builder/CoursePublishSettingsDialog.tsx` | Add real DNS verification UI for course custom domains |
| `supabase/functions/serve-site/index.ts` | Add course domain redirect logic |

### No database changes needed

The existing `custom_domains` table already has `project_id` which can reference the course's `builder_project_id`. The `courses` table already has `custom_domain` and `builder_project_id` columns.
