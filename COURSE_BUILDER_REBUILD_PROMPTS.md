# Course Builder Rebuild Prompts for Lovable

These prompts rebuild the Excellion course builder from scratch — data model first, then persistence, types, templates, builder UI, and finally the hub page. Paste them one at a time in order.

---

## Prompt 1 — Supabase Schema (Data Model)

```
Create the Supabase database schema for a course builder platform. Create these tables:

1. **courses** table:
   - id: UUID primary key (gen_random_uuid())
   - user_id: UUID references auth.users(id) ON DELETE CASCADE, NOT NULL
   - title: TEXT NOT NULL
   - description: TEXT
   - subdomain: TEXT UNIQUE (human-readable slug for public URL)
   - difficulty: TEXT DEFAULT 'beginner' (beginner | intermediate | advanced)
   - duration_weeks: INTEGER DEFAULT 6
   - status: TEXT DEFAULT 'draft' (draft | published)
   - published_url: TEXT
   - published_at: TIMESTAMPTZ
   - modules: JSONB DEFAULT '[]'::jsonb (array of module objects with lessons)
   - thumbnail_url: TEXT
   - price_cents: INTEGER DEFAULT 0
   - currency: TEXT DEFAULT 'USD'
   - total_students: INTEGER DEFAULT 0
   - offer_type: TEXT DEFAULT 'standard' (standard | challenge | webinar | lead_magnet | coach_portfolio)
   - builder_project_id: UUID REFERENCES builder_projects(id)
   - design_config: JSONB DEFAULT '{}'::jsonb (colors, fonts, spacing, borderRadius)
   - layout_template: TEXT DEFAULT 'suspended'
   - section_order: JSONB (array of section names for landing page)
   - page_sections: JSONB (landing page content configuration)
   - deleted_at: TIMESTAMPTZ DEFAULT NULL (soft-delete timestamp)
   - created_at: TIMESTAMPTZ DEFAULT now()
   - updated_at: TIMESTAMPTZ DEFAULT now()

2. **enrollments** table:
   - id: UUID primary key
   - course_id: UUID REFERENCES courses(id) ON DELETE CASCADE, NOT NULL
   - user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE, NOT NULL
   - enrolled_at: TIMESTAMPTZ DEFAULT now()
   - completed_at: TIMESTAMPTZ
   - progress_percent: INTEGER DEFAULT 0
   - UNIQUE(course_id, user_id)

3. **lesson_progress** table:
   - id: UUID primary key
   - enrollment_id: UUID REFERENCES enrollments(id) ON DELETE CASCADE, NOT NULL
   - lesson_id: TEXT NOT NULL
   - module_id: TEXT NOT NULL
   - completed: BOOLEAN DEFAULT false
   - completed_at: TIMESTAMPTZ
   - time_spent_seconds: INTEGER DEFAULT 0
   - created_at: TIMESTAMPTZ DEFAULT now()
   - UNIQUE(enrollment_id, lesson_id)

4. **custom_domains** table:
   - id: UUID primary key
   - domain: TEXT NOT NULL
   - status: TEXT DEFAULT 'pending'
   - verification_token: TEXT
   - is_verified: BOOLEAN DEFAULT false
   - ssl_provisioned: BOOLEAN DEFAULT false
   - project_id: UUID (nullable, for builder projects)
   - course_id: UUID REFERENCES courses(id)
   - user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE
   - created_at: TIMESTAMPTZ DEFAULT now()

Add RLS policies:
- Users can SELECT, INSERT, UPDATE, DELETE their own courses (WHERE user_id = auth.uid())
- Users can SELECT, INSERT their own enrollments
- Users can SELECT, INSERT, UPDATE their own lesson_progress (via enrollment ownership)
- Course owners can view enrollments for their courses

Create a Supabase storage bucket called "course-thumbnails" for course thumbnail and social images.
```

---

## Prompt 2 — TypeScript Types & Utility Functions

```
Create the file src/types/course-pages.ts with all TypeScript types for the course builder:

1. **LandingSectionType** — union of: 'hero' | 'outcomes' | 'curriculum' | 'instructor' | 'pricing' | 'faq' | 'who_is_for' | 'course_includes' | 'testimonials' | 'guarantee' | 'bonuses' | 'community' | 'certificate'

2. **CourseLayoutStyle** — union of: 'creator' | 'technical' | 'academic' | 'visual'

3. **CoursePageType** — union of: 'landing' | 'curriculum' | 'bonuses' | 'community' | 'resources' | 'about' | 'testimonials' | 'faq'

4. **CoursePage** interface:
   - id: string, type: CoursePageType, title: string, slug: string
   - content: CoursePageContent, isEnabled: boolean, order: number

5. **CoursePageContent** interface:
   - hero_headline?, hero_subheadline?, sections?: LandingSectionType[]
   - bonuses?, resources?, communityDescription?, testimonials?, faqs?, instructorBio?

6. **CoursePages** interface:
   - landing_sections: LandingSectionType[]
   - included_bonuses?: string[], show_guarantee?: boolean, target_audience?: string
   - instructor?: { name: string; bio: string; avatar?: string }
   - pricing?: { price: number; currency: string; original_price?: number }
   - faq?: Array<{ question: string; answer: string }>
   - separatePages?: CoursePage[], isMultiPage?: boolean

7. **QuizQuestion** interface:
   - id: string, question: string, type: string
   - options: string[], correct_index: number, explanation: string

8. **LessonContent** interface:
   - id: string, title: string, duration: string
   - type: 'video' | 'text' | 'text_video' | 'quiz' | 'assignment'
   - description?, is_preview?: boolean, content_markdown?, video_url?
   - quiz_questions?: QuizQuestion[], passing_score?: number
   - assignment_brief?: string, resources?: Array<{ title: string; url: string }>

9. **ModuleWithContent** interface:
   - id: string, title: string, description: string, lessons: LessonContent[]
   - has_quiz?, has_assignment?, is_first?, is_last?: boolean
   - total_duration?: string
   - layout_variant?: 'video_heavy' | 'text_heavy' | 'mixed' | 'project_based'

10. **DesignConfig** interface:
    - colors?: { primary?, secondary?, accent?, background?, cardBackground?, text?, textMuted? } (all optional strings)
    - fonts?: { heading?: string; body?: string }
    - spacing?: 'compact' | 'normal' | 'spacious'
    - borderRadius?: 'none' | 'small' | 'medium' | 'large'
    - heroStyle?: string
    - backgrounds?: { hero?, curriculum?, cta? } (all optional strings)

11. **ExtendedCourse** interface:
    - id?: string, title: string, description: string, tagline?: string
    - difficulty: string, duration_weeks: number, modules: ModuleWithContent[]
    - learningOutcomes?: string[], thumbnail?: string, brand_color?: string
    - pages?: CoursePages, layout_style?: CourseLayoutStyle
    - design_config?: DesignConfig, layout_template?: string
    - section_order?: string[], separatePages?: CoursePage[], isMultiPage?: boolean

12. **LayoutStyleConfig** interface:
    - containerClass, cardClass, headingClass, accentColor, primaryHex: string
    - moduleLayout: 'timeline' | 'accordion' | 'numbered' | 'grid'
    - cardRadius, bgGradient, heroGradient: string
    - fontStyle?, headingFont?: string
    - showInstructorLarge?, showCertificate?, showTestimonials?, codeBlockStyle?, compactDensity?, imageHeavy?: boolean

Now add these exported utility functions:

**getLayoutStyleConfig(style: CourseLayoutStyle): LayoutStyleConfig** — returns config per style:
- 'creator': Amber #f59e0b, timeline layout, rounded-xl, warm gradient from-amber-500 to-orange-500, showInstructorLarge=true, showTestimonials=true
- 'technical': Indigo #6366f1, accordion layout, rounded, dark bg-slate-950, font-mono, codeBlockStyle=true, compactDensity=true
- 'academic': Navy #1e40af, numbered layout, rounded-sm, bg-stone-50, font-serif, showCertificate=true
- 'visual': Rose #f43f5e, grid layout, rounded-2xl, gradient violet-to-fuchsia, imageHeavy=true, backdrop-blur

**getModuleLayoutVariant(module: ModuleWithContent)**: Returns layout_variant based on lesson type distribution (count video vs text types).

**calculateModuleDuration(lessons: LessonContent[])**: Parse lesson durations and return formatted total like "2h 30m".

**formatSectionNumber(moduleIdx: number, lessonIdx?: number)**: Format as "1.0" for module or "1.1" for lesson (1-indexed).
```

---

## Prompt 3 — Course Persistence Layer

```
Create src/lib/coursePersistence.ts with three functions for Supabase course CRUD:

1. **saveCourseToDatabase(params: SaveCourseParams): Promise<{ id: string } | null>**

   SaveCourseParams interface:
   - userId: string (required)
   - title?: string (defaults to 'Untitled Course')
   - description?: string
   - modules?: any[] (defaults to [])
   - difficulty?: string (defaults to 'beginner')
   - durationWeeks?: number (defaults to 6)
   - designConfig?: object (defaults to {})
   - layoutTemplate?: string (defaults to 'suspended')
   - sectionOrder?: string[]
   - pageSections?: object
   - builderProjectId?: string
   - offerType?: string (defaults to 'standard')

   Implementation:
   - Generate subdomain from title: lowercase, remove non-alphanumeric (keep hyphens), truncate to 50 chars, append 6-char random alphanumeric suffix
   - Always use INSERT (never upsert)
   - Retry up to 3 times on subdomain unique constraint violations (regenerate suffix each retry)
   - Insert into courses table with all columns
   - Return { id } on success, null on failure
   - Log errors with console.error

2. **updateCourseInDatabase(courseId: string, updates: Record<string, unknown>): Promise<boolean>**
   - Auto-add updated_at: new Date().toISOString()
   - UPDATE courses table WHERE id = courseId
   - Return true on success, false on failure

3. **ensureCourseExists(params: { projectId: string; userId: string; title?: string; modules?: any[] }): Promise<string | null>**
   - First SELECT from courses WHERE builder_project_id = projectId
   - If found, return existing course id
   - If not found, call saveCourseToDatabase() with builderProjectId set
   - Return course id or null

Import supabase client from '@/integrations/supabase/client'.
```

---

## Prompt 4 — Course Template: Standard

```
Create src/components/course-templates/StandardCourseTemplate.tsx — the default full-curriculum course template.

Props:
- course: ExtendedCourse
- isPreview?: boolean
- onUpdate?: (course: ExtendedCourse) => void
- onEnroll?: () => void
- isEnrolled?: boolean
- isEnrolling?: boolean

The component renders a full course landing page:

1. **Hero Section** (py-16 px-4, gradient background from getLayoutStyleConfig):
   - Course title (text-4xl font-bold)
   - Tagline (text-xl, muted)
   - Description paragraph
   - Stats badges row: "{N} Modules" (BookOpen icon), "{N} Lessons" (Clock icon), "{N} Weeks" (GraduationCap icon)
   - If not preview: "Enroll Now" or "Continue Learning" button (based on isEnrolled)

2. **Main Content** (max-w-4xl mx-auto px-4 py-12):
   - **Learning Outcomes Card** (if learningOutcomes exist):
     - Title: "What You'll Learn"
     - 2-column grid of outcomes with green Check icons
   - **Curriculum Card**:
     - Title: "Course Curriculum"
     - Accordion with collapsible modules
     - Each module header: formatted number, title, lesson count badge
     - Module content: description, lesson list with type icons and duration badges
   - **Bottom CTA** (if not preview): centered "Enroll Now" button

Apply theme styling from getLayoutStyleConfig(course.layout_style) — use containerClass, cardClass, headingClass, accentColor throughout.

Use shadcn/ui components: Card, Badge, Button, Accordion (AccordionItem, AccordionTrigger, AccordionContent).
Use lucide-react icons: Clock, BookOpen, GraduationCap, Check, Users, ChevronRight.
```

---

## Prompt 5 — Course Templates: Challenge, Webinar, Lead Magnet, Coach Portfolio

```
Create four additional course template components in src/components/course-templates/:

### A. ChallengeTemplate.tsx
Same props as StandardCourseTemplate. Renders a day-by-day challenge format:
- Hero with orange/red gradient, "Challenge" badge, title, description
- Challenge stats: number of days, daily tasks count, completion badge
- If enrolled: Progress tracker with flame icon, day counter, progress bar
- Daily schedule: Grid of day cards showing day number, lesson title, module name (map modules/lessons as sequential days)
- "By the End" section: Learning outcomes grid with check icons
- Bottom CTA: "Start Challenge" or "Continue Challenge" button
- Theme: Orange/red gradients throughout

### B. WebinarTemplate.tsx
Same props plus local state: email (string).
- Hero with indigo/purple gradient, "Free Webinar" video badge, title, tagline
- Video player placeholder area (or actual player if enrolled)
- Info badges: Duration, "On Demand", "Free Registration"
- Description section
- "In This Webinar, You'll Discover" section: Learning outcomes with arrow icons
- Registration form (if not enrolled): Email input + "Watch Now" button
- Trusted statement and privacy note at bottom
- Theme: Indigo/purple gradients

### C. LeadMagnetTemplate.tsx
Same props plus local state: email (string), name (string).
- Two-column layout: content left, download form right
- Left: Title, tagline, description, "What's Inside" section listing up to 5 learning outcomes with checkmarks
- Right: Download form card with file icon, name input, email input, "Get Instant Access" button, lock icon + privacy note
- Trust badges below form: "10k+ Downloads", "4.9 Rating", "Free Forever"
- Theme: Emerald/teal gradients

### D. CoachPortfolioTemplate.tsx
Same props. No local state.
- Hero: Large avatar circle (initials if no image), "Certified Coach" badge, title, tagline, description
- CTA buttons: "Book a Call", "Get in Touch"
- About Me section: Instructor bio from course.pages.instructor.bio
- Services & Packages: Grid of cards built from modules — each shows title, description, first 4 lesson titles as features, "Learn More" button
- Credentials & Expertise: Learning outcomes list with award icons
- Client Testimonials: 3-column grid with 5-star ratings and quotes
- Contact CTA: "Book Free Call" button
- Theme: Rose/pink gradients

All templates use shadcn/ui Card, Badge, Button, Progress. Use lucide-react icons.
```

---

## Prompt 6 — CourseRenderer (Template Router)

```
Create src/components/course-templates/CourseRenderer.tsx — a router component that renders the correct template based on offer_type.

Define:
- OfferType = 'standard' | 'challenge' | 'webinar' | 'lead_magnet' | 'coach_portfolio'
- CourseWithOfferType extends ExtendedCourse with offer_type?: OfferType

Props:
- course: CourseWithOfferType
- isPreview?: boolean
- onUpdate?: (course: ExtendedCourse) => void
- onEnroll?: () => void
- isEnrolled?: boolean
- isEnrolling?: boolean

Implementation: Switch on course.offer_type:
- 'challenge' → ChallengeTemplate
- 'webinar' → WebinarTemplate
- 'lead_magnet' → LeadMagnetTemplate
- 'coach_portfolio' → CoachPortfolioTemplate
- default → StandardCourseTemplate

Pass all props through to the selected template. Export both CourseRenderer and CourseWithOfferType.
```

---

## Prompt 7 — EditableText Component

```
Create src/components/secret-builder/EditableText.tsx — a click-to-edit inline text component.

Props:
- value: string — current text
- onSave: (newValue: string) => void — save handler
- className?: string — optional CSS classes
- style?: React.CSSProperties — optional inline styles
- as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' — HTML tag to render (default: 'span')
- multiline?: boolean — allow multiline editing (default: false)
- placeholder?: string — placeholder text

State: isEditing (boolean), editValue (string)

Behavior:
- When NOT editing: Render value as the specified tag. Show hover ring effect (ring-2 ring-primary/30 cursor-pointer). Click to enter edit mode.
- When editing: Show an Input (single line) or Textarea (multiline). Auto-focus and select all text on mount. Enter saves (Cmd+Enter for multiline). Escape cancels. Blur saves. Only save if value changed and non-empty.
```

---

## Prompt 8 — PricingTab Component

```
Create src/components/secret-builder/PricingTab.tsx for course pricing configuration.

Props:
- courseId: string | undefined
- priceCents: number | null — price in cents
- currency: string | null — currency code
- onUpdate: (updates: { price_cents: number | null }) => void

State: isFree (boolean), price (number in dollars), isSaving (boolean)

UI Layout:
1. Free toggle switch at top — when ON, price is $0
2. Price input field in USD (number input, disabled when free)
3. Payment breakdown card showing:
   - "Student pays: $X.XX"
   - "Stripe fee: ~$X.XX" (calculate as 2.9% + $0.30)
   - "Excellion fee: $X.XX" (calculate as 2% of price)
   - Separator line
   - "You receive: $X.XX" with green percentage badge showing creator's take
4. Save button that calls supabase courses.update({ price_cents }) and then onUpdate callback
5. Toast notification on save success/failure

Use shadcn/ui Card, Input, Label, Switch, Button. Import supabase client.
```

---

## Prompt 9 — RefineChat Component

```
Create src/components/secret-builder/RefineChat.tsx — a right-side Sheet panel for AI-powered course refinement.

Props:
- open: boolean
- onOpenChange: (open: boolean) => void
- onRefine: (prompt: string) => Promise<void> — handler that sends refinement to AI
- isRefining: boolean

State: input (string), messages (ChatMessage[] with role: 'user'|'assistant', content: string)

UI Layout:
- Sheet component (side="right", className w-[400px])
- Header: "Refine Your Course" title, close button
- ScrollArea for message history:
  - User messages: right-aligned, primary-colored bubbles
  - Assistant messages: left-aligned, muted background bubbles
- When no messages: Show 6 clickable suggestion pills:
  - "Make week 2 more advanced"
  - "Add a quiz to module 3"
  - "Rewrite the course description"
  - "Add more practical exercises"
  - "Include downloadable resources"
  - "Make lessons shorter and more focused"
- Clicking a suggestion fills the input
- Bottom: Input field + Send button (disabled when refining or empty input)
- Auto-scroll to bottom on new messages
- When user sends, add user message to history, call onRefine, add "Changes applied!" assistant message on success
```

---

## Prompt 10 — CourseSettingsDialog

```
Create src/components/secret-builder/CourseSettingsDialog.tsx — a dialog for course metadata and settings.

Props:
- open: boolean, onOpenChange: (open: boolean) => void
- settings: CourseSettings — object with: price, currency, customDomain, seoTitle, seoDescription, enrollmentOpen, maxStudents, thumbnail, instructorName, instructorBio, offerType
- onUpdateSettings: (settings: CourseSettings) => void
- courseId?: string | null
- userId?: string

State: localSettings (CourseSettings copy), isUploadingThumbnail (boolean)

UI Layout — Dialog with 5 tabs:

1. **Type Tab**: Offer type selector with 5 radio cards:
   - standard: "Full Course" — standard curriculum with modules and lessons
   - challenge: "Challenge" — day-by-day challenge format
   - webinar: "Webinar" — single video with registration
   - lead_magnet: "Lead Magnet" — free download with email capture
   - coach_portfolio: "Coach Portfolio" — coach profile with services

2. **Pricing Tab**: Thumbnail upload area (uploads to Supabase storage bucket "course-thumbnails" at path {userId}/{courseId}/thumbnail.{ext}), price input (number), currency selector dropdown

3. **Instructor Tab**: Name input, bio textarea

4. **SEO Tab**: SEO title input (with character counter), meta description textarea (with character counter)

5. **Enrollment Tab**: Open enrollment toggle switch, max students number input

Footer: Cancel and Save buttons. Save calls onUpdateSettings with localSettings.
```

---

## Prompt 11 — CoursePublishDialog & CoursePublishSettingsDialog

```
Create two publish-related dialogs:

### A. CoursePublishDialog.tsx
Simple celebration dialog shown after successful publish.

Props: open, onOpenChange, courseUrl (string), courseTitle (string)

State: copied (boolean)

UI:
- PartyPopper icon (large, centered)
- "Your course is live!" heading
- Course title in muted text
- Course URL display with Copy button (copies to clipboard, shows "Copied!" feedback)
- "View Live Page" button (opens URL in new tab)
- "Done" button to close dialog

### B. CoursePublishSettingsDialog.tsx
Pre-publish settings dialog with 4 tabs.

Props: open, onOpenChange, courseId (string|null), courseTitle, courseSubdomain, onStatusChange? callback

State: activeTab, settings (PublishSettings with seoTitle, seoDescription, status, socialImageUrl), isLoading, isSaving, copied, isUploadingImage, domainRecord, newDomainInput, domain operation booleans

Supabase operations:
- Load settings: SELECT from courses (status, seo_title, seo_description, custom_domain, social_image_url, published_url, subdomain)
- Save settings: UPDATE courses (status, seo_title, seo_description, social_image_url, published_at)
- Upload social image: storage.from('course-thumbnails').upload(), then getPublicUrl()
- Custom domains: SELECT/INSERT/DELETE from custom_domains table
- Domain verification: invoke 'verify-domain-dns' edge function

Tabs:
1. **General**: Course URL display with copy button, publication status toggle
2. **SEO**: SEO title input, meta description textarea, Google search preview mock
3. **Domain**: Default URL display, custom domain input with Add button, DNS instruction table (A records pointing to IP, TXT record for verification), verify/remove domain buttons
4. **Social**: OG image upload area, social card preview showing how it looks when shared
```

---

## Prompt 12 — CourseCardPreview Component

```
Create src/components/secret-builder/CourseCardPreview.tsx — a compact card showing a course summary.

Props:
- title: string
- modules: Array<{ title: string; lessons: Array<{ title: string; type: string }> }>
- difficulty?: string | null
- durationWeeks?: number | null

No state. Pure presentational component.

UI:
- Dark gradient background card (small, compact)
- Course title (font-semibold, truncated)
- Mini curriculum outline showing first 3 modules with bullet points
- Stats footer row:
  - Module count with BookOpen icon
  - Total lesson count (calculated from all modules) with Play icon
  - Duration in weeks with Clock icon
  - Difficulty badge
- Use small typography throughout (text-xs, text-sm)
- Use shadcn/ui Card and Badge components
```

---

## Prompt 13 — CourseStudentView Component

```
Create src/components/secret-builder/CourseStudentView.tsx — a mock student dashboard with three navigation views.

Props:
- course: ExtendedCourse
- selectedModuleId: string | null
- selectedLessonId: string | null
- onSelectModule: (moduleId: string | null) => void
- onSelectLesson: (moduleId: string, lessonId: string) => void
- onBack: () => void

Three-view navigation system (determined by which IDs are selected):

### View 1 — Course Overview (no module or lesson selected):
- Course title and description
- Overall progress bar
- Module list: Each module card shows title, description, lesson count, clickable to select module
- Module badges: "Start Here" on first module, "Final Module" on last

### View 2 — Module Overview (module selected, no lesson):
- Back button to course overview
- Module title with badges
- Module stats (lesson count, total duration from calculateModuleDuration)
- Lesson list: Each lesson shows type icon, title, duration badge
  - Video lessons: Play icon
  - Text lessons: FileText icon
  - Quiz lessons: HelpCircle icon
  - Assignment lessons: ClipboardCheck icon
- Click any lesson to enter lesson view
- Navigation: Previous/Next module buttons

### View 3 — Lesson View (both module and lesson selected):
- Two-column layout:
  - **Left sidebar**: Module outline with all lessons, current lesson highlighted, checkmarks for completed
  - **Right main area**: Lesson content varies by type:
    - Video: Video player placeholder, description, resources list
    - Text: Read time estimate, content markdown, key takeaways section
    - Quiz: Quiz info card with question count, pass score, "Start Quiz" button
    - Assignment: Assignment brief, requirements list, "Submit Assignment" button
- Bottom: "Mark Complete" button, Previous/Next lesson navigation
```

---

## Prompt 14 — CourseBuilderPanel (Input & Generation)

```
Create src/components/secret-builder/CourseBuilderPanel.tsx — the left panel where users describe and generate courses.

Props:
- idea: string — current course idea text
- onIdeaChange: (idea: string) => void
- onGenerate: (options: CourseOptions) => void — trigger generation with options
- isGenerating: boolean
- steps: GenerationStep[] — array of { id, label, status: 'pending'|'in_progress'|'complete'|'error' }
- messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>
- attachments: AttachmentItem[]
- onAddAttachment: (item: AttachmentItem) => void
- onRemoveAttachment: (id: string) => void

CourseOptions interface:
- difficulty: 'beginner' | 'intermediate' | 'advanced'
- duration_weeks: number
- includeQuizzes: boolean
- includeAssignments: boolean
- template: 'creator' | 'technical' | 'academic' | 'visual'

State: showOptions (boolean), courseOptions (CourseOptions with defaults)

**Template Auto-Detection** — when idea text changes, auto-detect best template based on keywords:
- 'creator': coach, coaching, personal brand, influencer, creator, marketing, fitness trainer, life, mindset, wellness
- 'technical': programming, coding, developer, python, javascript, data, ML, API, software, engineering, database, devops
- 'academic': certification, degree, professional, legal, medical, research, MBA, accounting, compliance, thesis
- 'visual': design, photography, video, UI, UX, figma, animation, fashion, illustration, 3D, creative

UI Layout:
1. **ScrollArea** for message history (if messages exist)
2. **Generation progress** (if isGenerating): StepsTimeline showing each step with spinner/check/x icons
3. **Example prompts** (if no messages): 4 clickable prompt cards:
   - "Build a 6-week Python bootcamp with weekly projects"
   - "Create a personal branding masterclass for coaches"
   - "Design a UX certification course with quizzes"
   - "Make a 30-day fitness challenge with daily videos"
4. **Collapsible course options section** (Collapsible component):
   - Difficulty radio group (beginner/intermediate/advanced)
   - Duration weeks slider (1-12)
   - Include Quizzes toggle
   - Include Assignments toggle
   - Template selector: 4 cards showing layout style name, icon, description, auto-selected based on detection
5. **Main textarea**: Large textarea for course description/prompt
6. **Bottom row**: Attachment chips display, Generate button (with loading spinner when generating, disabled when empty or generating)
```

---

## Prompt 15 — CoursePreviewTabs (Main Preview Interface)

```
Create src/components/secret-builder/CoursePreviewTabs.tsx — the central multi-tab preview and editing interface. This is the largest component.

Props:
- course: ExtendedCourse
- onUpdate?: (course: ExtendedCourse) => void
- onPublish?, onUnpublish?, onRefine?, onOpenSettings?, onOpenPublishSettings?, onPreviewAsStudent?, onDuplicate?, onUploadThumbnail?: () => void
- isPublishing?, isPublished?, isVisualEditMode?: boolean
- logoUrl?: string, onUpdateLogo?: (url: string | undefined) => void
- isCreatorView?: boolean, onSignIn?: () => void

State: activeTab (landing|curriculum|lesson|dashboard|pricing|bonuses|resources|community|testimonials), selectedModuleIdx/selectedLessonIdx (numbers), editing states for lessons, inlineEditTarget, isEditMode, landingSections (string[]), isSavingLayout

**Navigation Bar** (rendered at top):
- Desktop: Logo | Center nav links (Landing, Curriculum, Lesson, Dashboard + any enabled separate pages) | Right: Pricing button, Sign In / Unpublish button
- Mobile: Condensed with tab selector dropdown
- Active tab has underline indicator
- Design config colors applied to navbar background and text

**Tab: Landing Page**
When isEditMode=true: Section manager with drag handles to reorder sections, add/remove section buttons, save layout button (saves to Supabase courses.update with page_sections)
When not editing: Render sections in order from landingSections array:
- hero: Title, tagline, description, enroll CTA with EditableText overlays
- outcomes: "What You'll Learn" grid with check icons
- curriculum: Module list rendered by layout style (timeline/accordion/numbered/grid using getLayoutStyleConfig)
- instructor: Instructor name, bio, avatar
- testimonials: Testimonial cards with star ratings
- faq: Accordion Q&A items
- guarantee, bonuses, community, pricing sections
- Apply DesignConfig as CSS custom properties (--course-primary, --course-bg, etc.)

**Tab: Curriculum**
- Course stats header (duration, total lessons, progress)
- Module renderer selected by layout style config:
  - Timeline (creator): Vertical line with numbered dots, cards branching off
  - Accordion (technical): Collapsible sections, monospace font, dark theme
  - Numbered (academic): Section numbers like "1.0", "1.1", serif font, formal cards
  - Grid (visual): 2-column card grid with gradient headers

**Tab: Lesson Preview**
- Two-column layout: Left sidebar with module/lesson tree, Right main area
- Lesson type selector (text, video, text_video, quiz)
- Content editor: Textarea for markdown, video URL input, quiz builder
- Quiz builder: Add/remove questions, options editor, correct answer selector, explanation field, passing score slider
- Edit/Save/Cancel buttons for lesson content
- Inline lesson title editing via EditableText
- Previous/Next lesson navigation, Mark Complete button

**Tab: Student Dashboard**
- Welcome message
- Overall progress bar with percentage
- "Continue Learning" card showing next incomplete lesson
- Course Complete celebration card (if 100%)
- Stats grid: Lessons complete, total lessons, modules, estimated hours
- Module progress breakdown with individual progress bars

**Separate Page Tabs** (bonuses, resources, community, testimonials):
- Bonuses: Card grid with gift icons showing bonus items
- Resources: Download list with file icons
- Community: Community features card
- Testimonials: Star ratings and quote cards
```

---

## Prompt 16 — BuilderShell (Main Container)

```
Create src/components/secret-builder/BuilderShell.tsx — the main layout container that orchestrates the entire course builder.

This is the top-level component rendered by the SecretBuilder page. It manages all state and coordinates child components.

**Key State:**
- courseSpec: ExtendedCourse | null — the current course being built/edited
- courseId: string | null — database ID
- projectId: string | null — builder project ID
- isGenerating, isPublishing, isUnpublishing: boolean
- messages: Message[] — chat history
- steps: GenerationStep[] — generation progress steps
- attachments: AttachmentItem[]
- previewMode: 'desktop' | 'tablet' | 'mobile'
- courseSettings: { price, currency, customDomain, seoTitle, seoDescription, enrollmentOpen, maxStudents, thumbnail, instructorName, instructorBio, offerType }
- saveStatus: 'saved' | 'saving' | 'unsaved'
- UI dialog toggles: showRefineChat, showCourseSettings, showPublishSettings, showPublishDialog, etc.

**Layout:**
- Full-height flex layout
- Header bar: Project name (editable), preview mode toggle (desktop/tablet/mobile), Publish button, Settings gear dropdown
- Resizable three-panel layout using ResizablePanel:
  - Left panel: CourseBuilderPanel (input/generation)
  - Center panel: CoursePreviewTabs (preview/editing)
  - Right panel: RefineChat (when open)

**Key Workflows:**

1. **handleGenerateCourse(idea, courseOptions)**:
   - Set isGenerating=true, show generation steps
   - Call AI service to generate course from prompt
   - Build ExtendedCourse object from AI response
   - Call saveCourseToDatabase() to persist
   - Set courseSpec and courseId
   - Set isGenerating=false

2. **Auto-save effect** (useEffect with 1.5s debounce):
   - When courseSpec changes and courseId exists, call updateCourseInDatabase()
   - If courseId is null but projectId exists, call ensureCourseExists() first
   - Update saveStatus indicator

3. **loadProjectAndMaybeGenerate(projectId)**:
   - SELECT from builder_projects WHERE id = projectId
   - SELECT from courses WHERE builder_project_id = projectId
   - Restore courseSpec, messages, settings from database
   - If no course exists and initial idea present, auto-generate

4. **handlePublish()**:
   - Open CoursePublishSettingsDialog
   - On confirm: UPDATE course status='published', published_at=now()
   - Call publish-site edge function
   - Show CoursePublishDialog with URL

5. **Settings integration**: CourseSettingsDialog updates courseSettings, which flow into courseSpec and auto-save

**Dialog Rendering:**
Render these dialogs at the bottom of the component:
- CourseSettingsDialog (controlled by showCourseSettings)
- CoursePublishDialog (controlled by showPublishDialog)
- CoursePublishSettingsDialog (controlled by showPublishSettings)
- RefineChat Sheet (controlled by showRefineChat)
```

---

## Prompt 17 — SecretBuilderHub (Course Listing & Creation Page)

```
Create src/pages/SecretBuilderHub.tsx — the landing page for the course builder with course listing and creation.

**State:**
- idea: string — user's course prompt
- projects: BuilderProject[] — user's builder projects
- courses: CourseItem[] — user's active courses
- trashedCourses: CourseItem[] — soft-deleted courses
- isGenerating, isLoading: boolean
- attachments: AttachmentItem[] (up to 10)
- selectedTemplate: string
- isDarkMode: boolean (persisted to localStorage)

**Supabase Queries on mount (useEffect):**
1. Fetch builder projects: SELECT id, name, idea, created_at, updated_at, spec, published_url, published_at FROM builder_projects WHERE user_id = currentUser ORDER BY updated_at DESC LIMIT 20
2. Fetch active courses: SELECT * FROM courses WHERE user_id = currentUser AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 50
3. Fetch trashed courses: SELECT * FROM courses WHERE user_id = currentUser AND deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 50

**UI Layout:**

1. **Header**: Logo (left), search button with Cmd+K shortcut (center-right), settings dropdown, dark mode toggle
2. **Desktop Sidebar** (left, w-64):
   - Workspace header with user avatar
   - Navigation: Dashboard, Courses, Templates, Settings
   - "Your Courses" list showing course titles (clickable, navigates to /studio/:projectId)
   - Trash section (expandable)
3. **Main Content Area**:
   a. **Hero section**: "Let's build your next course" heading
   b. **Input card**: Large textarea for course idea, attachment menu button (supports up to 10 files), "Build with AI" generate button
   c. **Quick prompts** row: 4 clickable preset course ideas that fill the textarea:
      - "Build a 6-week Python bootcamp with projects"
      - "Create a personal branding masterclass"
      - "Design a UX certification program"
      - "Make a 30-day fitness challenge"
   d. **Stripe Connect banner** (if user hasn't connected Stripe): Informational card about accepting payments
   e. **"Your Courses" section**: Grid of course cards (max 6 visible, "View all" toggle to show rest):
      - Each card shows: thumbnail, title, status badge (draft/published), module/lesson counts, last updated date
      - Card actions dropdown: Edit, Duplicate, Unpublish, Delete (soft-delete)
      - Click card body navigates to builder
   f. **Trash section** (if trashedCourses.length > 0):
      - Shows soft-deleted courses with deleted date
      - "Restore" button: clears deleted_at timestamp
      - "Delete Permanently" button: hard deletes course and associated builder_project
      - Note: "Courses in trash are permanently deleted after 30 days"

**Key Handlers:**
- handleGenerate(): Create builder_project in Supabase, save idea to localStorage, navigate to /studio/:newProjectId
- handleDeleteCourse(id): UPDATE courses SET deleted_at = now() WHERE id
- handleRestoreCourse(id): UPDATE courses SET deleted_at = NULL WHERE id
- handlePermanentDelete(id): DELETE FROM courses WHERE id, also DELETE associated builder_project
- handleUnpublishCourse(id): Invoke 'unpublish-site' edge function, UPDATE status='draft'
```

---

## Prompt 18 — SecretBuilder Page & Routes

```
Create src/pages/SecretBuilder.tsx — the page component that wraps BuilderShell.

This page:
1. Reads navigation state from useLocation(): initialIdea, projectId, templateSpec, courseMode, courseId
2. Also reads projectId from useParams() (for /studio/:projectId route)
3. Passes these as initial values to BuilderShell
4. Renders BuilderShell as a full-page component (min-h-screen)

Now add the routes to your router configuration (App.tsx or routes file):

- /secret-builder-hub → SecretBuilderHub (course listing & creation)
- /secret-builder → SecretBuilder (builder without project)
- /secret-builder/:projectId → SecretBuilder (builder with specific project)
- /studio/:projectId → SecretBuilder (alternative path, same component)

All routes should require authentication (redirect to login if not signed in). Wrap with your auth provider/guard as needed.
```

---

## Prompt 19 — CourseLandingPreview (Public Course Page)

```
Create src/components/secret-builder/CourseLandingPreview.tsx — a read-only landing page preview used for the public /course/:subdomain route.

Props:
- course: ExtendedCourse
- onUpdate?: (course: ExtendedCourse) => void
- onEnrollClick?: () => void

No state. Pure presentational component.

Renders sections dynamically based on course.pages.landing_sections array. For each section type in the array, render the corresponding section:

- **hero**: Course title (text-4xl bold), tagline, description, stats badges (modules, lessons, duration), "Enroll Now" CTA button
- **outcomes**: "What You'll Learn" heading, grid of learning outcomes with green check icons
- **curriculum**: Module list rendered based on layout_style:
  - creator → timeline with vertical line and colored dots
  - academic → numbered sections with serif font
  - visual → 2-column grid cards
  - technical/default → accordion with collapsible modules
- **instructor**: Instructor name, bio, avatar image
- **testimonials**: Testimonial cards with star ratings
- **pricing**: Price display with "Enroll Now" button
- **faq**: Accordion-style Q&A
- **who_is_for**: Target audience description
- **course_includes**: Feature list of what's included
- **guarantee**: Money-back guarantee section
- **bonuses**: Bonus materials cards
- **community**: Community access section
- **certificate**: Certificate of completion section

Apply theme from getLayoutStyleConfig(course.layout_style) for consistent styling. End with a final CTA button.

Also create a route /course/:subdomain that:
1. Fetches course from Supabase: SELECT * FROM courses WHERE subdomain = :subdomain AND status = 'published'
2. Renders CourseLandingPreview with the fetched course data
3. Shows 404 if course not found or not published
```

---

## Prompt 20 — Builder Components (Legacy/Alternative)

```
Create three components in src/components/builder/ for the legacy/alternative builder interface:

### A. BuilderChat.tsx
Chat interface for the non-course website builder.

Props: messages (Message[]), state (BuilderState), isLoading, inputs (SmartDefaults with businessType, goal, style, ctaText, referenceUrl), onInputsChange, onSendMessage, onQuickAction

UI:
- Build brief card (shows project summary when content exists)
- Project setup accordion (before first build): Business type dropdown, Goal selector (leads/bookings/ecommerce/info), Style buttons (modern/luxury/playful/minimal/bold), CTA text input, Reference URL input
- Message history with bold headers and bullet formatting
- Quick actions after first build
- Message input with send button

### B. BuilderPreviewPanel.tsx
Preview panel for generated websites.

Props: generatedCode, isLoading, error, onRefresh, onExport, onBuildFromBrief

State: activeTab (preview/sections/styles/seo/export), deviceMode (desktop/tablet/mobile), copied, SEO inputs, sections list

Tabs:
- Preview: iframe/component preview with device mode toggle
- Sections: Draggable section list with enable/disable
- Styles: Color and typography display
- SEO: Page title, meta description, keywords inputs
- Export: Copy code, download .tsx, publish buttons

### C. BuilderSidebar.tsx
Sidebar for project management.

Props: projectName, onProjectNameChange, state, onNewProject, history, onSelectHistory

UI:
- Editable project name with status pill (loading/success/alert)
- Action buttons: New Project, Templates, Brand Kit
- Recent projects scrollable list
- Templates dialog: 6 preset templates (restaurant, portfolio, agency, saas, ecommerce, coach)
- Brand Kit dialog: 6 color presets, 4 font style options
```

---

## Notes

**Key architectural patterns used throughout:**
- All Supabase queries use the client from `@/integrations/supabase/client`
- RLS policies enforce user-scoped access — no manual user_id filtering needed for security, but queries still filter by user_id for correctness
- Course content (modules, lessons, quizzes) is stored as JSONB in the courses.modules column, not in separate tables
- Design customization (colors, fonts) is stored as JSONB in courses.design_config
- Landing page section order is stored in courses.section_order and courses.page_sections
- Soft delete uses a deleted_at timestamp column (NULL = active, non-NULL = trashed)
- The 4 layout styles (creator, technical, academic, visual) control the entire visual presentation via getLayoutStyleConfig()
- The 5 offer types (standard, challenge, webinar, lead_magnet, coach_portfolio) each have dedicated template components routed via CourseRenderer
