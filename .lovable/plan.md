

## Reposition Quickstart Course: AI-First Draft + Prompt-Based Refinement

This plan updates the landing page copy and the underlying course data to reflect the new workflow: one voice call generates an initial prompt, the platform produces a complete draft, and typed prompts refine individual sections.

---

### A. Updated Subtitle

Current: "Complete this in about 1 hour. By the end of the weekend, you'll have a live sales page, client portal, intake form, weekly check-in flow, and a connected domain."

New: "One voice call creates your prompt. One click generates a complete draft -- course, scripts, downloads, and sales page. Then refine any section with a typed command. No manual building."

---

### B. Updated 3 Bullets (the "What You'll Build" tiles become 3 key value props)

Replace the 5-tile grid with 3 larger tiles:

1. **Generate a full draft in one click** -- Course modules, lesson scripts, downloadable resources, and a sales page, all from a single AI-generated prompt.
2. **Refine any section by typing a prompt** -- Rewrite a lesson, swap a module intro, update your FAQ, or change your sales headline without rebuilding the page.
3. **Publish when you are ready** -- Connect your domain, toggle sections on or off, and go live on your schedule.

---

### C. Updated Course Outline (Modules 0--5)

| Module | Title |
|--------|-------|
| 0 | Your Prompt Call |
| 1 | Review Your Draft |
| 2 | Regenerate Course Sections |
| 3 | Regenerate Sales Page Sections |
| 4 | Optional Add-Ons (Check-Ins, Resources, Community) |
| 5 | Publish + Go Live |

---

### D. Expanded Modules with Goal, Lessons, Deliverables

**Module 0 -- Your Prompt Call**
Goal: Complete a guided voice call that produces the prompt used to generate your entire draft.
Lessons:
1. What the call covers and how long it takes
2. Preparing your answers (offer, audience, pricing)
3. Start the ElevenLabs call agent
4. Review the generated prompt

Deliverable: A finalized prompt ready to generate your draft.

**Module 1 -- Review Your Draft**
Goal: Understand every section the AI produced so you know what to keep and what to regenerate.
Lessons:
1. Course structure walkthrough (modules, lessons, scripts)
2. Downloads and resource files
3. Sales page sections (hero, bullets, FAQ, CTA)
4. Pricing and checkout settings
5. Identifying sections to regenerate

Deliverable: A prioritized list of sections you want to improve.

**Module 2 -- Regenerate Course Sections**
Goal: Use typed prompts to regenerate individual course sections until they match your voice.
Lessons:
1. How the command prompt works
2. Regenerating a single lesson script
3. Regenerating a module intro or description
4. Regenerating downloadable resources
5. Batch prompts: regenerating multiple sections at once

Deliverable: All course content finalized.

**Module 3 -- Regenerate Sales Page Sections**
Goal: Use typed prompts to regenerate individual sales page sections.
Lessons:
1. Regenerating the hero headline and subheadline
2. Rewriting benefit bullets and feature lists
3. Updating the FAQ section
4. Changing the CTA text and pricing display
5. Previewing the full sales page

Deliverable: A sales page you are ready to publish.

**Module 4 -- Optional Add-Ons**
Goal: Enable optional features only if they fit your program.
Lessons:
1. Adding weekly check-in forms
2. Adding a resource library page
3. Adding a community or discussion link
4. Customizing email notifications

Deliverable: Any optional features configured (or skipped).

**Module 5 -- Publish + Go Live**
Goal: Connect your domain, run the go-live checklist, and publish.
Lessons:
1. Connecting a custom domain
2. Final preview on desktop and mobile
3. Publishing your course
4. Sharing your live link
5. What to do after launch

Deliverable: A live, shareable URL with your course and sales page.

---

### E. Updated CTA Footnote

Current: "Most creators finish setup in 1 weekend."

New: "Most coaches generate their full draft in under 10 minutes and publish the same day."

---

### File Changes

**1. `src/components/course/QuickstartLanding.tsx`** (rewrite)

- Replace subtitle text (line 106) with the new copy.
- Replace the 5-tile `BUILD_TILES` grid with 3 larger value-prop cards using the new bullets.
- Replace `MODULE_DELIVERABLES` map to use keys `m0`--`m5` with the new deliverables and time estimates.
- Update the curriculum accordion:
  - Labels change from "Part 1" to "Module 0", "Module 1", etc.
  - Module numbering starts at 0.
  - The Part 4 weekly-check-in callout moves to Module 4 with updated text: "These add-ons are optional. Skip any that do not fit your program."
- Update bottom CTA headline to "Ready to generate your draft?" and paragraph to new footnote copy.
- Update `displayTime` to `'10 minutes'` for the generation step, keep `'1 hour'` for total course completion.
- Update metadata chips to show 6 modules and new lesson count.

**2. Database update (SQL)**

Update the `modules` JSONB column for the quickstart course to contain the new 6-module structure (Modules 0--5) with the lesson titles, descriptions, and deliverables listed above. Also update the `description` column to match the new subtitle.

```sql
UPDATE courses
SET
  description = 'One voice call creates your prompt. One click generates a complete draft. Then refine any section with a typed command. No manual building.',
  modules = '[...new module JSON...]'::jsonb
WHERE subdomain = 'excellion-quickstart';
```

The full JSON will include all 6 modules with their lesson arrays (id, title, description, estimated_minutes, content_type, checklist, is_preview fields).

---

### What Does Not Change

- Page layout structure (hero, tiles, video placeholder, accordion, bottom CTA) stays the same.
- Enrollment logic, auth gating, and view tracking in `CoursePage.tsx` stay untouched.
- No new files or dependencies needed.
- The "Videos coming soon" placeholder remains.

