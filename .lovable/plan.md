

## Landing Page Copy Rewrite

Copy-only changes across 3 files. No layout, styling, or UI changes.

### Files to edit

**1. `src/pages/WebBuilderHome.tsx`** (all landing page sections)

**Hero Section (lines 43-115, 247-377)**
- Badge: "AI Course Builder for Fitness Creators"
- Headline: `Launch your fitness course in 1 weekend.`
- Subhead: `Excellion generates your course outline, lesson plan, sales page copy, and student portal from 1 prompt. Spend the weekend polishing, filming, and publishing.`
- Placeholder text: `Help [AUDIENCE] achieve [RESULT] in [TIMEFRAME]`
- Suggestion chips: "6-week fat loss course", "Beginner strength course", "Home workout fundamentals course"
- Primary CTA: "Generate my course" (replace "Generate Course")
- Secondary CTA: "See an example" (replace "Build Assist")
- Schema markup description updated to fitness influencer / course builder language

**How It Works (lines 381-433)**
- Subhead: "3 steps to launch your course this weekend"
- Step 1 title: "Describe your audience + outcome"
- Step 1 body: keep niche examples
- Step 2 title: "Excellion generates your course + sales page"
- Step 2 body: "Get a ready-to-edit course with your outline, lesson structure, sales page copy, and student portal."
- Step 3 title: "Customize, connect your domain, and publish"
- Step 3 body: "Edit anything, connect your domain, and go live when you're ready."

**Features Grid (lines 49-80, 437-468)**
- Section title: "Built for fitness influencers"
- Subhead: "Create, sell, and deliver a course in one place."
- 6 cards rewritten:
  1. "Course Sales Page (Drafted for You)" -- "A ready-to-edit sales page that explains who the course is for, the outcome, what's included, and how to enroll."
  2. "Student Portal Included" -- "Give students a clean place to access lessons, follow the plan, and stay on track."
  3. "Publish on Your Link or Domain" -- "Go live on your link or your own domain when you're ready."
  4. "Student Intake + Check-ins" -- "Collect goals, starting point, preferences, and ongoing updates without chasing messages."
  5. "Built for Real Fitness Niches" -- same body copy
  6. "Built-in Analytics" -- "See visits, clicks, and signups so you know what's working and what to improve."

**Course Preview Section (lines 470-550)**
- NOT edited per your instructions (Quickstart course preview stays as-is)

**Pricing Section (lines 552-614)**
- Price line: `$19` for first month, then `$79/month`
- Annual: `or $790/year (save $158)` (unchanged)
- Subhead: "One plan for fitness course creators."
- Bullets: "Up to 3 active courses" (was "offers"), "Student portal" (was "Client portal"), rest unchanged
- CTA button: "Start for $19"
- Footer: "No hidden fees. Just build and sell your course."

**FAQ Section (lines 82-103)**
Replace all 5 questions:
1. "Can I really launch in 1 weekend?" -- "Yes. Excellion generates your course outline, lesson structure, and sales page copy in minutes. The '1 weekend' promise includes your time to review, film any video content, and publish."
2. "What types of fitness courses can I create?" -- "Any type -- fat loss, strength, muscle gain, home workouts, postpartum, running programs, or beginner fitness. Excellion adapts to your niche and audience."
3. "Do I need technical skills?" -- "No. Describe your course idea in plain language and Excellion generates everything. Edit with simple clicks, not code."
4. "Can I use my own domain?" -- "Yes. Connect any custom domain you own. Your course will be accessible at yourdomain.com with SSL included."
5. "How does pricing work?" -- "Your first month is $19, then $79/month (or $790/year to save $158). One plan, everything included. An active course is any published course currently available to students. You can have up to 3 at once. Cancel anytime."

**Bottom CTA Section (lines 646-674)**
- Headline: "Ready to launch your course this weekend?"
- Subhead: "Generate the outline and sales page now. Film and publish when you're ready."
- Primary CTA: "Get Started for $19"
- Secondary CTA: "Login" (unchanged)

**Helmet meta (lines 249-256)**
- Title: "Excellion -- AI Course Builder for Fitness Creators"
- Meta description updated to match new positioning

**2. `src/components/Footer.tsx`**
- Tagline: "AI Course Builder for Fitness Influencers"
- Product links: keep "Create Course" and "Pricing", keep "Browse Courses" (route exists)

**3. `src/components/Hero.tsx`** (secondary hero, used on Index.tsx)
- Badge: "AI Course Builder for Fitness Creators"
- Headline: `Launch your fitness course in 1 weekend.`
- Subhead: updated to match new positioning
- CTA buttons: "Generate My Course" and "See an Example"

### What stays unchanged
- All layout, styling, section order, and component structure
- The Quickstart Course Preview section (lines 470-550)
- The Build Assist dialog and InterviewStepper logic
- Footer link structure (Create Course, Browse Courses, Pricing remain)

### Technical notes
- All changes are string literal replacements in JSX and const arrays
- No new imports, components, or dependencies
- The `schemaMarkup` JSON-LD object will be updated to reflect "AI course builder for fitness influencers"
