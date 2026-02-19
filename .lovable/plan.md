
# Course Publishing: Temporary Domains + Custom Domains

## Current State Assessment

The infrastructure for this already exists in large part. Here is exactly what is built vs. what is missing:

### What Already Exists

**Database:**
- `courses` table has: `subdomain`, `status`, `published_at`, `published_url`, `custom_domain`, `seo_title`, `seo_description`, `builder_project_id`
- `custom_domains` table with: `domain`, `status`, `verification_token`, `ssl_provisioned`, `is_verified`, `is_verified`, `user_id`, `project_id`

**Backend Edge Functions:**
- `publish-site` - uploads HTML to Supabase Storage and returns a `slug.excellion.app` URL
- `serve-site` - serves HTML from storage for `*.excellion.app` subdomains and custom domains
- `allowed-domains` - validates whether a domain is allowed for SSL provisioning (used by Caddy)
- `verify-domain-dns` - checks DNS TXT records to verify domain ownership
- `unpublish-site` - clears published state

**Frontend Components:**
- `CoursePublishSettingsDialog` - has General, SEO, Domain, and Social tabs
- `CustomDomainsPanel` - for the website builder's domain management
- `serve-site` already handles course custom domains by redirecting to `/course/{subdomain}`

**Routing:**
- `/course/:subdomain` loads `CoursePage` using the subdomain as the lookup key
- `CoursePage` queries `public_courses` view (secure, strips lesson content)

### What is Missing / Broken

**The Core Gap:** Courses currently publish to an internal app URL (`excellion.lovable.app/course/my-slug`) rather than a real standalone website. The `publish-site` edge function is wired for the website builder (static HTML), NOT courses. Course "publishing" just sets a status flag in the database.

**Specific Missing Pieces:**

1. **Temporary Domain Display**: The General tab in `CoursePublishSettingsDialog` shows `window.location.origin/course/{subdomain}` (the internal app URL), not a real `slug.excellion.app` URL. This needs to show the real temp domain.

2. **Custom Domain Serving**: The `serve-site` edge function currently issues a 302 redirect to the main app for course custom domains. This means `mycourse.com` redirects to `excellion.lovable.app/course/slug`, which breaks the custom domain experience — the user's custom domain doesn't stay in the browser bar.

3. **Domain-to-Course Linking**: The `custom_domains` table links to `project_id` (builder projects), but courses need their own direct custom domain linkage. The dialog creates a phantom `builder_project` just to hold the domain record, which is a workaround.

4. **Missing `course_id` column on `custom_domains`**: Custom domains have no direct course reference — they go through `builder_project_id`, which is fragile.

5. **DNS Instructions for Courses**: The Domain tab in `CoursePublishSettingsDialog` shows DNS instructions but they point to the website builder IP (`185.158.133.1`) without explaining the full flow for courses.

---

## Implementation Plan

### Phase 1 - Database Migration

Add a `course_id` column to `custom_domains` so domains can be linked directly to courses without the `builder_project` workaround:

```sql
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
```

### Phase 2 - Fix `serve-site` Edge Function

Change the course custom domain handling from a 302 redirect to a proper server-side render. When a custom domain maps to a course, `serve-site` should:

1. Look up the course by `course_id` (via `custom_domains.course_id`)
2. Fetch the full course data from Supabase
3. Generate and return a full HTML page that is a static render of the course landing page

This is the key fix that makes custom domains actually stay on the user's domain rather than redirecting away.

### Phase 3 - Fix Temporary Domain Display in `CoursePublishSettingsDialog`

Update the General tab to show `{subdomain}.excellion.app` as the real course URL, replacing the internal `window.location.origin/course/{subdomain}` display. This gives creators a proper shareable link.

### Phase 4 - Fix Custom Domain Flow in `CoursePublishSettingsDialog`

Update `handleAddDomain` to:
- Skip creating the phantom `builder_project` (or keep it but also write `course_id`)
- Insert `custom_domains` with `course_id` directly referencing the course
- Update the DNS instructions to show the correct A record target (`185.158.133.1`) and the TXT verification record format

### Phase 5 - Update `allowed-domains` Edge Function

Ensure the function also checks for verified domains linked via `course_id` in the `custom_domains` table (not just `project_id`).

---

## Technical Architecture (After Fix)

```text
Student visits mycourse.com
        |
        v
Caddy (185.158.133.1)
  asks: allowed-domains?domain=mycourse.com
  Response: allowed=true
        |
        v
Caddy proxies to serve-site edge function
  Header: x-original-host: mycourse.com
        |
        v
serve-site looks up custom_domains
  WHERE domain = 'mycourse.com' AND is_verified = true
  Finds: course_id = 'abc-123'
        |
        v
serve-site fetches course from courses table
  Renders full HTML landing page for the course
        |
        v
Returns HTML — URL stays as mycourse.com ✓
```

```text
Creator flow:
1. Creates course in builder
2. Opens Publish Settings dialog
3. General tab shows: myketo.excellion.app (temp domain, shareable now)
4. Clicks Domain tab → enters "learn.mybrand.com"
5. Dialog shows DNS records:
   A Record: @ → 185.158.133.1
   TXT Record: _excellion → excellion={token}
6. Creator adds records at their registrar (GoDaddy, Namecheap, etc.)
7. Clicks "Verify Now" → system checks DNS
8. On success: domain goes live, serves full course page at learn.mybrand.com
```

---

## Files to Create / Modify

| File | Change |
|---|---|
| `supabase/migrations/` | Add `course_id` column to `custom_domains` |
| `supabase/functions/serve-site/index.ts` | Replace 302 redirect with real HTML render for course domains |
| `supabase/functions/allowed-domains/index.ts` | Also allow domains linked via `course_id` |
| `src/components/secret-builder/CoursePublishSettingsDialog.tsx` | Fix temp URL display + custom domain insertion to use `course_id` |

---

## What This Unlocks

- Every course gets a real `{slug}.excellion.app` URL immediately on creation (temp domain, always on)
- Creators can connect `learn.mybrand.com` or any domain they own
- The custom domain shows their actual course landing page — no redirects, no Excellion branding in the URL bar
- DNS verification flow already works via `verify-domain-dns` edge function
- SSL is handled automatically by Caddy's on-demand TLS (already configured)
