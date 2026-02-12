

## Add "Course Preview" Section to Landing Page

### What Changes
A new "Course Preview" section will be inserted into `src/pages/WebBuilderHome.tsx` between the **Features section** ("Built for Fitness Coaches") and the **Pricing section**, at approximately line 468.

### Section Design
- Two-column layout on desktop (md breakpoint), stacked on mobile
- Left column: eyebrow badge, headline, subheadline, 3 bullet points, 5-item mini checklist, two buttons, and a small note
- Right column: 16:9 aspect-ratio placeholder card with a centered play icon and "Video coming soon" text
- Matches existing style: `bg-card` dark cards, `border-border` borders, `text-primary` gold accents, rounded corners

### Technical Details

**File modified:** `src/pages/WebBuilderHome.tsx`

**New section inserted at line 468** (between Features `</section>` and Pricing `<section>`):

- Uses an `id="course-preview"` anchor for the secondary button's scroll target
- Primary "Start for $19" button scrolls to `#pricing` using `document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })`
- Secondary "See what you'll build" button scrolls to `#course-preview` (same section)
- Video placeholder is a standalone `<div>` with `aspect-video` (16:9), containing only a play icon (`Play` from lucide-react) and label text -- swappable later by replacing just the inner content
- New icon import added: `Play` from lucide-react
- No other sections are modified
- Fully responsive using Tailwind's `md:grid-cols-2` for desktop, single column on mobile

