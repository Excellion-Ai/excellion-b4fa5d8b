

# Fix and Restructure Excellion Quickstart Course

## Summary

The quickstart course already exists in the database with 4 modules and 15 lessons, status "published", and the correct system-owned user ID. The main issues are: (a) the slug is `excellion-quickstart` but the plan calls for `quickstart`, (b) there is no auto-recovery if the record is missing, (c) no admin reset capability, and (d) the "Optional Add-Ons Checklist" is embedded inside Module 4 Lesson 2 instead of being a standalone page.

---

## A. Final Curriculum (as it will appear in the course player)

**Module 1: Prompt Call (Start Here)** -- 4 lessons, ~13 min
1. What the call covers and how long it takes (3 min) -- Preview
2. Preparing your answers (offer, audience, pricing) (3 min)
3. Start the voice call agent (5 min)
4. Review your generated prompt (2 min)

**Module 2: Generate + Review Your Draft** -- 3 lessons, ~10 min
1. Course structure walkthrough (4 min)
2. Sales page and pricing overview (3 min)
3. Identify sections to regenerate (3 min)

**Module 3: Regenerate Anything** -- 6 lessons, ~25 min
1. How the command prompt works (3 min)
2. Regenerate lesson scripts and module intros (5 min)
3. Regenerate sales page sections (5 min)
4. Regenerate downloads and resources (4 min)
5. Batch prompts for multiple sections (4 min)
6. Preview your full result (4 min)

**Module 4: Publish + Go Live** -- 2 lessons, ~10 min
1. Final preview and domain setup (5 min)
2. Publish and share your live link (5 min)

**Standalone page (not a module): Optional Add-Ons Checklist**
- Linked at the bottom of Module 4 and in the sidebar

Total: 4 modules, 15 lessons, ~58 minutes

---

## B. Optional Add-Ons Checklist Page Content

- Weekly check-in forms (drip a short form each week to track student progress)
- Resource library page (centralize all downloadable worksheets, templates, and PDFs)
- Community or discussion link (connect a Circle, Skool, or Discord community)
- Email notifications (set up enrollment confirmations and lesson reminders)
- Upsell or next-offer page (add a checkout link for your next course or 1:1 coaching)
- Affiliate or referral tracking (create a shareable link with a referral code)
- Student testimonials section (collect and display social proof on your sales page)
- Completion certificate customization (upload a branded certificate background)

---

## C. Implementation Checklist

### 1. Change slug from `excellion-quickstart` to `quickstart`

**Database:** Update the course record's `subdomain` from `excellion-quickstart` to `quickstart`.

**Files to update (all references):**
- `src/pages/CoursePage.tsx` -- change all `excellion-quickstart` string checks to `quickstart`
- `src/pages/LearnPage.tsx` -- change the templates link check
- `src/pages/WebBuilderHome.tsx` -- update navigation URLs
- `src/pages/QuickstartTemplates.tsx` -- update redirect and back-link URLs
- `src/App.tsx` -- update the templates route path from `/course/excellion-quickstart/templates` to `/course/quickstart/templates`

### 2. Auto-seed with recovery fallback (CoursePage.tsx)

When loading the quickstart course (`subdomain === 'quickstart'`):
- If the database query returns no course, instead of showing "Course Not Found", call a new `seed-quickstart` edge function that upserts the canonical curriculum
- Show a "Restoring this course..." spinner while the seed runs
- After seed completes, re-fetch the course and render normally
- If the seed also fails, show a recovery UI: "We're restoring this course now. Refresh in 10 seconds." with a Refresh button

### 3. Create `seed-quickstart` edge function

**File:** `supabase/functions/seed-quickstart/index.ts`

This function:
- Checks if the course already exists (by subdomain `quickstart`)
- If missing, inserts the full canonical curriculum with:
  - `user_id`: `00000000-0000-0000-0000-000000000000` (system-owned)
  - `status`: `published`
  - `published_at`: current timestamp
  - `subdomain`: `quickstart`
  - `price_cents`: 0
  - All 4 modules with 15 lessons (exact content from section A above)
- If exists but unpublished, updates `status` to `published` and sets `published_at`
- Returns the course record

**Config:** Add `verify_jwt = false` in `supabase/config.toml` for this function (it needs to run for unauthenticated recovery scenarios, but uses service_role internally).

### 4. Admin "Reset Quickstart Course" button (AdminCourses.tsx)

Add a button visible only when the quickstart course is listed (or missing). When clicked:
- Calls the `seed-quickstart` edge function with a `{ force_reset: true }` flag
- The edge function, when `force_reset` is true, overwrites the `modules` JSONB with the canonical curriculum regardless of current content
- Shows a success toast on completion

### 5. Standalone Add-Ons Checklist page

**File:** `src/pages/QuickstartAddons.tsx` (new)

A simple page showing the checklist from section B above, with:
- A header: "Optional Add-Ons Checklist"
- Badge: "Optional"
- Each item as a checkbox row (local state only, not persisted)
- Back link to `/learn/quickstart`

**Routing:** Add route `/course/quickstart/addons` in `App.tsx`

**Sidebar link:** In `LearnPage.tsx`, after the modules list, add a link to this page when `course.subdomain === 'quickstart'`:
```
Optional Add-Ons Checklist (Optional) ->
```

### 6. Remove Module 0 labeling

The current `LearnPage.tsx` sidebar already uses `Module {mi + 1}` (line 508), so module numbering starts at 1. The `QuickstartLanding.tsx` curriculum section also uses `{idx + 1}`. No Module 0 exists anywhere. This is already correct.

### 7. Remove the add-ons checklist data from Module 4 Lesson 2

Update the canonical curriculum so Module 4, Lesson 2 (`m4l2`) no longer embeds the `checklist` and `templates` arrays. Those items move to the standalone page. The lesson description changes to: "Publish your course and start sharing it with your audience."

---

## Technical Details

### Edge function: `seed-quickstart`

```text
POST /seed-quickstart
Body: { force_reset?: boolean }

- Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
- Upserts to courses table with ON CONFLICT on subdomain
- Returns { success: true, course_id: "..." }
```

### CoursePage.tsx recovery flow (pseudocode)

```text
if (subdomain === 'quickstart' && courseNotFound) {
  setRecoveryState('seeding')
  call seed-quickstart edge function
  if (success) {
    re-fetch course
    setRecoveryState(null)
  } else {
    setRecoveryState('failed')
    show "Restoring... Refresh in 10 seconds" + Refresh button
  }
}
```

### Files changed summary

| File | Change |
|------|--------|
| `src/pages/CoursePage.tsx` | Slug references, auto-seed recovery logic |
| `src/pages/LearnPage.tsx` | Slug references, add-ons sidebar link |
| `src/pages/WebBuilderHome.tsx` | Slug references |
| `src/pages/QuickstartTemplates.tsx` | Slug references |
| `src/App.tsx` | Route paths for templates and addons |
| `src/pages/AdminCourses.tsx` | Admin reset button |
| `src/pages/QuickstartAddons.tsx` | New standalone checklist page |
| `supabase/functions/seed-quickstart/index.ts` | New edge function |
| `supabase/config.toml` | JWT config for seed function |

### Database change

One data update (not a schema migration):
```sql
UPDATE courses SET subdomain = 'quickstart' WHERE subdomain = 'excellion-quickstart';
```

