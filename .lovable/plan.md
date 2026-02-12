

## Build the Excellion Quickstart Course

This plan creates a complete, seeded Quickstart Course inside the app so that `/course/excellion-quickstart` resolves to a working course player instead of "Course Not Found."

---

### 1. Seed the course into the database (migration)

Run a SQL migration that INSERTs the full Excellion Quickstart Course record into the `courses` table with:

- `subdomain`: `'excellion-quickstart'`
- `status`: `'published'`
- `published_at`: `now()`
- `title`: "Excellion Quickstart Course"
- `description`, `difficulty` ("beginner"), `duration_weeks` (2)
- `modules` JSONB containing all 5 modules and their lessons (detailed below), where each lesson includes: `id`, `title`, `content_type` ("text"), `description` (3-6 sentence summary), a `checklist` array (3-7 "Do this now" items), and a `templates` array (placeholder template names)
- `user_id` set to `'00000000-0000-0000-0000-000000000000'` as a system-owned course (no real user owns it, but RLS already allows viewing published courses)

The 5 modules and their lessons match the outline exactly:

- **Module 1 -- Offer + Pricing** (5 lessons): Welcome, Choose your program type, Define your ideal client, Price your program, Offer stack
- **Module 2 -- Offer Page + CTA** (5 lessons): Anatomy of a page, Write your headline, Choose your CTA, Add social proof/FAQs, Publish checklist
- **Module 3 -- Client Portal Setup** (4 lessons): Portal structure, Create portal sections, Upload starter resources, Set client access
- **Module 4 -- Intake + Check-ins** (4 lessons): Intake form, Weekly check-in form, Automations, Review workflow
- **Module 5 -- Publish + Domain** (4 lessons): Final review, Connect domain, Test full flow, Launch plan

Each lesson will have a generated `id` (e.g. `m1-l1`), written summary, checklist, and template references baked into the JSONB.

---

### 2. Fix CoursePage.tsx -- eliminate "Course Not Found" for this slug

Update `CoursePage.tsx` so that:

- The existing RLS query already returns published courses to anyone. Since the course will be `status: 'published'`, the existing flow should resolve it. No code change needed for the happy path.
- For admins: if `subdomain === 'excellion-quickstart'` and the course is NOT found (e.g., accidentally deleted), check if the user is admin via `user_roles`. If admin, show a "Seed/Publish Course" panel instead of "Course Not Found." This is a small conditional in the error-state JSX.

---

### 3. New page: Course Templates (`/course/excellion-quickstart/templates`)

Create `src/pages/QuickstartTemplates.tsx`:

- Protected route (redirect to `/auth` if not logged in)
- Displays 5 template sections, each with copy-to-clipboard:
  1. Offer page copy template (headline, bullets, sections)
  2. FAQ templates (10 Q and A starters)
  3. Intake form question bank (20 questions grouped by category)
  4. Weekly check-in question bank (12 questions)
  5. Client portal section blueprint
- Each section is a card with a "Copy" button using `navigator.clipboard.writeText()`
- Dark background, gold accents, matching existing style

Add route in `App.tsx`:
```
<Route path="/course/excellion-quickstart/templates" element={<QuickstartTemplates />} />
```
Place this ABOVE the `/course/:subdomain` catch-all route.

---

### 4. Enhanced LearnPage sidebar for the quickstart course

The existing `LearnPage.tsx` already has:
- Left sidebar with modules/lessons
- Progress tracking
- Mark complete
- Next/previous navigation

Enhancements to add:
- **Search input** at top of sidebar: filters lessons by title match, highlights results
- **"Download Templates" button** in the header bar that links to `/course/excellion-quickstart/templates`
- **"Resume" button** in the header that jumps to the first incomplete lesson
- **Lesson content area**: render the `description` (summary), `checklist` (as checkable list items), and `templates` (as linked badges) from the lesson JSONB alongside the existing `content_markdown`

---

### 5. Admin course management page

Create `src/pages/AdminCourses.tsx`:

- Admin-only (uses `useAdmin` hook, redirects non-admins)
- Lists all courses from the `courses` table
- For each course: title, status badge, publish/unpublish toggle, student count
- Click a course to expand and see modules/lessons with inline edit (title and description text)
- Drag-to-reorder modules and lessons using existing `@dnd-kit` dependency
- "Create Course" button (simple form: title, description, template)

Add route in `App.tsx`:
```
<Route path="/admin/courses" element={<AdminCourses />} />
```

Also add a "Courses" tab to the existing Admin.tsx TabsList so it's accessible from the main admin dashboard.

---

### 6. Analytics event tracking

Create a lightweight analytics helper `src/lib/courseAnalytics.ts`:

```typescript
export const trackCourseEvent = async (event: string, data: Record<string, any>) => {
  // Insert into course_views or a lightweight approach using existing tables
  console.log(`[analytics] ${event}`, data);
  // For MVP, log to lesson_views with metadata
};
```

Track these events at the appropriate points:
- `course_viewed` -- already tracked in CoursePage.tsx via `course_views` table
- `lesson_started` -- already tracked in LearnPage.tsx via `lesson_views` table
- `lesson_completed` -- already tracked via `lesson_progress` table
- `templates_copied` -- track in QuickstartTemplates.tsx (toast + console for MVP)
- `course_completed` -- already tracked via enrollment `completed_at`

No new database table needed; existing tables cover it.

---

### 7. Routing changes summary (App.tsx)

Add these routes (before the catch-all):
```
<Route path="/course/excellion-quickstart/templates" element={<QuickstartTemplates />} />
<Route path="/admin/courses" element={<AdminCourses />} />
```

---

### Technical Details

**Files created:**
- `src/pages/QuickstartTemplates.tsx` -- Templates page with copy-to-clipboard
- `src/pages/AdminCourses.tsx` -- Admin course management
- `src/lib/courseAnalytics.ts` -- Lightweight event tracker
- `supabase/migrations/XXXX_seed_quickstart_course.sql` -- Database seed

**Files modified:**
- `src/App.tsx` -- Add 2 new routes
- `src/pages/CoursePage.tsx` -- Add admin fallback panel when course missing
- `src/pages/LearnPage.tsx` -- Add search, resume, templates button, render lesson checklists/templates
- `src/pages/Admin.tsx` -- Add "Courses" tab linking to `/admin/courses`

**No changes to:**
- Supabase client, types, or config files
- Existing RLS policies (published courses are already publicly viewable)
- Any styling outside the new/modified files

