

## Quickstart Course: 4-Module Structure (COMPLETED)

The quickstart course has been restructured from 6 modules (0–5) to 4 modules (1–4) with 15 total lessons.

### Final Module Structure

| Module | Title | Lessons | Time |
|--------|-------|---------|------|
| 1 | Prompt Call | 4 | ~10 min |
| 2 | Generate + Review | 3 | ~10 min |
| 3 | Regenerate Anything | 6 | ~25 min |
| 4 | Publish + Go Live | 2 | ~10 min |

**Optional Add-Ons**: Embedded as a checklist in Module 4's final lesson (not a separate module).

### Changes Made

1. **Database**: Updated `modules` JSONB for `excellion-quickstart` to 4 modules, 15 lessons.
2. **QuickstartLanding.tsx**: Updated `MODULE_DELIVERABLES` (m1–m4), fixed module numbering to start at 1, removed Module 4 "optional" callout.
3. **LearnPage.tsx**: Already uses `mi + 1` for sidebar — no change needed.
4. **Hero badges**: Dynamically computed from `course.modules` — auto-updated.
