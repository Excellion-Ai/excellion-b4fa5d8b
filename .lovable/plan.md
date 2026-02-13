

## Premium Quickstart Course Landing Page

This plan transforms the `/course/excellion-quickstart` landing page from a generic course page into a premium, purpose-built experience that communicates "1 hour to complete, launch in 1 weekend."

---

### 1. Create a dedicated Quickstart Landing component

**New file: `src/components/course/QuickstartLanding.tsx`**

A self-contained component rendered by `CoursePage.tsx` when `subdomain === 'excellion-quickstart'`. This avoids changing the generic course page logic for other courses.

Sections in order:

1. **Hero** -- Course title, updated description ("Complete this in about 1 hour..."), metadata chips showing "1 hour" / "5 modules" / "22 lessons" / difficulty badge, primary CTA "Start Quickstart", secondary link "See the curriculum" that scrolls to curriculum, and "Free" pill. Replaces "Join 0 students" with "Most creators finish setup in 1 weekend."

2. **"What You'll Build This Weekend" tiles** -- 5 icon-driven cards in a responsive grid:
   - Sales page (with CTA) -- FileText icon
   - Client portal -- LayoutDashboard icon
   - Intake form -- ClipboardList icon
   - Weekly check-in form + workflow -- CalendarCheck icon
   - Domain connected + publish checklist -- Globe icon

3. **Course Preview media card** -- Large 16:9 dark card with a centered Play icon, text "Videos coming soon. Start with the written checklists now."

4. **Curriculum accordion** -- 5 Parts (not "Weeks"), each row showing:
   - Part number circle
   - Part title (e.g. "Offer + Pricing")
   - Time estimate badge (e.g. "10 min")
   - Deliverable label (e.g. "Your offer and price finalized")
   - Lesson count
   - Expanded state shows each lesson with: 1-2 sentence summary, video placeholder row (thumbnail + "Video: X:00"), and "Do this now" checklist (from existing JSONB data)
   - A callout card inside Part 4: "Default weekly check-in questions included. Customize later."

5. **Bottom CTA** -- "Ready to launch this weekend?" headline, "Start Quickstart" button, secondary "See the curriculum" link, "Free" pill, outcome microcopy.

**No instructor section. No reviews section (hidden when 0 reviews).**

---

### 2. Modify CoursePage.tsx to route to the new component

Add a conditional check: if `subdomain === 'excellion-quickstart'` and the course loaded successfully, render `<QuickstartLanding>` instead of the default generic layout. All enrollment logic, auth gating, and view tracking remain in `CoursePage.tsx` and are passed as props.

Changes to `CoursePage.tsx`:
- Import `QuickstartLanding`
- After the loading/error checks, add: if `subdomain === 'excellion-quickstart'`, render `<QuickstartLanding course={course} onEnroll={enrollInCourse} isEnrolled={isEnrolled} ... />`
- This replaces lines ~384-636 (the entire render body) for this specific course only

---

### 3. Update the database record (no schema migration needed)

The existing `modules` JSONB already contains `estimated_minutes`, `checklist`, `templates`, and `description` for every lesson. The part deliverables and time estimates will be computed from this data in the component (sum of `estimated_minutes` per module). No new database columns are required.

However, a small SQL update will:
- Change `duration_weeks` from `2` to `null` (since we no longer frame it as weeks)
- Remove `instructor_name` (set to `null`) to clean up the data
- Update `description` to the new copy

---

### 4. Visual and interaction details

- Dark theme: black/near-black background, gold (`#f59e0b`) primary buttons and accents
- Build tiles: dark cards with subtle gold-tinted borders, Lucide icons in gold
- Video placeholder: `bg-muted/20` card, 16:9 aspect ratio, centered Play circle icon with gold accent
- Curriculum accordion: existing Radix accordion, enhanced rows with time/deliverable badges
- Lesson video placeholder rows: small dark thumbnail rectangle with Play triangle + "Video: X:00" label
- "Do this now" checklist: checkbox-style list items (display only, not interactive on landing page)
- Callout card in Part 4: small bordered card with info icon and italic text
- Mobile responsive: tiles stack to 1 column, accordion full-width, hero text centered
- Smooth scroll from "See the curriculum" link to curriculum section via `id` anchor

---

### Technical Details

**Files created:**
- `src/components/course/QuickstartLanding.tsx` -- Full premium landing page component (~350 lines)

**Files modified:**
- `src/pages/CoursePage.tsx` -- Add import and conditional render for quickstart course (3-5 lines changed in the render section)

**Database update (SQL):**
- `UPDATE courses SET duration_weeks = NULL, instructor_name = NULL, description = 'Complete this in about 1 hour...' WHERE subdomain = 'excellion-quickstart'`

**No new dependencies.** Uses existing Lucide icons, Radix accordion, Badge, Card, Button components.

