// Metadata for each quickstart lesson: goal, steps, output, visual type, example blocks, key takeaways

export interface LessonMeta {
  goal: string;
  steps: string[];
  output: string;
  visualType: 'screenshot' | 'before-after' | 'preview' | 'checklist' | 'none';
  visualCaption?: string;
  exampleBlock?: {
    type: 'prompt' | 'outline' | 'sales-page' | 'command' | 'download-list';
    title: string;
    content: string;
    afterContent?: string; // for before/after
  };
  takeaways: string[];
  whyItMatters?: string;
  troubleshooting?: string;
}

// Map lesson IDs to their metadata. Lesson IDs are formatted as "m{module}-l{lesson}"
// Module 1: Prompt Call (Start Here) — 4 lessons
// Module 2: Generate + Review Your Draft — 4 lessons
// Module 3: Regenerate Anything — 4 lessons
// Module 4: Publish + Go Live — 3 lessons
export const quickstartLessonMeta: Record<string, LessonMeta> = {
  // ── Module 1 ──
  'start-here': {
    goal: 'See the full 4-step path from idea to published course.',
    steps: [
      'Review the 4-step checklist below',
      'Click "Start Step 1: Prompt Call"',
    ],
    output: 'A clear roadmap you can complete in 60 minutes.',
    visualType: 'checklist',
    takeaways: [
      'Every course follows the same 4 steps: Prompt → Generate → Regenerate → Publish.',
      'You don\'t need content ready — the AI writes it for you.',
      'The whole process takes about 60 minutes.',
    ],
  },
  'm1-l2': {
    goal: 'Describe your course idea so the AI can build a complete prompt.',
    steps: [
      'Open the Prompt Call page',
      'Answer the 5 questions about your audience, topic, and outcome',
      'Review the generated prompt',
    ],
    output: 'A ready-to-use AI prompt (text block you can copy).',
    visualType: 'preview',
    visualCaption: 'Your generated prompt will look like this',
    exampleBlock: {
      type: 'prompt',
      title: 'Example Generated Prompt',
      content: `Create a 6-week online course titled "30-Day Fat Loss Blueprint" for busy professionals aged 25-45 who want to lose 10-20 lbs without giving up their favorite foods.

Include 4 modules:
1. Nutrition Foundations (calories, macros, meal timing)
2. Workout Programming (3x/week, 45 min sessions)
3. Habit Building & Accountability
4. Advanced Strategies & Plateaus

Each module should have 3-4 lessons with actionable steps. 
Tone: motivational but no-BS. Include downloadable meal plans and workout templates.`,
    },
    takeaways: [
      'Answer in plain language — the AI handles formatting.',
      'Be specific about your audience (age, goal, pain point).',
      'You can always regenerate the prompt later.',
    ],
  },
  'm1-l3': {
    goal: 'Pick the template that matches your course style.',
    steps: [
      'Browse the Templates Gallery',
      'Click "Use this template" on the one that fits',
      'Confirm it loads into your builder',
    ],
    output: 'A selected template pre-loaded into your course builder.',
    visualType: 'screenshot',
    visualCaption: 'Templates Gallery — pick the layout that fits your niche',
    takeaways: [
      'Templates set the layout, colors, and section order — not your content.',
      'You can switch templates later without losing lessons.',
      'Each template is optimized for a different course style.',
    ],
  },
  'm1-l4': {
    goal: 'Understand the 3 course formats you can create.',
    steps: [
      'Read the comparison of Standard Course, Challenge, and Lead Magnet',
      'Decide which format fits your audience',
      'Note your choice for Step 2',
    ],
    output: 'A clear decision on your course format.',
    visualType: 'preview',
    visualCaption: 'Course format comparison',
    exampleBlock: {
      type: 'outline',
      title: 'Format Comparison',
      content: `• Standard Course — 4-8 modules, self-paced, best for comprehensive topics
• Challenge — 5-30 days, daily lessons, best for transformation goals  
• Lead Magnet — 1-3 lessons, free, best for building your email list`,
    },
    takeaways: [
      'Challenges convert best for fitness creators.',
      'Lead magnets are great for growing your audience before selling.',
      'You can always add modules to change format later.',
    ],
  },

  // ── Module 2 ──
  'm2-l1': {
    goal: 'Generate your complete course draft with one click.',
    steps: [
      'Paste your prompt into the builder',
      'Click "Generate Course"',
      'Wait 30-60 seconds for your draft to appear',
    ],
    output: 'A full course draft with modules, lessons, and content.',
    visualType: 'preview',
    visualCaption: 'Your generated course outline will look like this',
    exampleBlock: {
      type: 'outline',
      title: 'Example Generated Outline',
      content: `Module 1: Nutrition Foundations
  • Lesson 1: Understanding Calories & Energy Balance (text, 8 min)
  • Lesson 2: Macro Breakdown for Fat Loss (text, 10 min)
  • Lesson 3: Meal Timing & Frequency (text, 7 min)
  • Lesson 4: Module 1 Quiz (quiz, 5 min)

Module 2: Workout Programming
  • Lesson 1: The 3x/Week Training Split (text, 12 min)
  • Lesson 2: Exercise Selection & Form (text, 10 min)
  • Lesson 3: Progressive Overload Simplified (text, 8 min)

Module 3: Habit Building
  • Lesson 1: The 3 Habit Anchors (text, 6 min)
  • Lesson 2: Accountability Systems (text, 8 min)
  • Lesson 3: Hands-on: Build Your Habit Stack (assignment, 15 min)`,
    },
    takeaways: [
      'The AI generates real lesson content, not just titles.',
      'You\'ll get a sales page draft too — check the Landing tab.',
      'Don\'t worry about perfection — Module 3 covers editing.',
    ],
    whyItMatters: 'Most creators spend weeks writing course content. AI generation gives you a complete first draft in under a minute, so you can focus on refining rather than creating from scratch.',
  },
  'm2-l2': {
    goal: 'Review your generated sales page and landing sections.',
    steps: [
      'Click the "Landing" tab in your builder',
      'Read the hero headline, features, and CTA',
      'Note anything you want to change',
    ],
    output: 'A reviewed sales page with notes on what to improve.',
    visualType: 'preview',
    visualCaption: 'Your generated sales page sections',
    exampleBlock: {
      type: 'sales-page',
      title: 'Example Sales Page Preview',
      content: `HEADLINE: Transform Your Body in 30 Days — No Gym Required

SUBHEADLINE: A step-by-step fat loss program designed for busy professionals who want real results without extreme diets.

FEATURES:
✓ 4 structured modules with 15 actionable lessons
✓ Downloadable meal plans and workout templates  
✓ Built-in quizzes to track your understanding
✓ Certificate of completion

CTA: Enroll Now — Start Your Transformation`,
    },
    takeaways: [
      'The headline is the most important element — make it specific.',
      'Features should list concrete deliverables, not vague benefits.',
      'You can regenerate any section independently.',
    ],
  },
  'm2-l3': {
    goal: 'Check your lesson content for accuracy and tone.',
    steps: [
      'Open 2-3 lessons in the Curriculum tab',
      'Read through the generated content',
      'Flag any sections that need more detail or a different tone',
    ],
    output: 'A list of lessons that need editing (if any).',
    visualType: 'screenshot',
    visualCaption: 'Reviewing lesson content in the builder',
    takeaways: [
      'Focus on accuracy first, polish second.',
      'The AI may use generic examples — replace with your real client stories.',
      'Mark lessons as "needs edit" so you can batch-fix them in Module 3.',
    ],
  },
  'm2-l4': {
    goal: 'Review your downloads, quizzes, and bonus materials.',
    steps: [
      'Check the Resources tab for generated downloads',
      'Preview any quiz questions for accuracy',
      'Note missing resources you want to add',
    ],
    output: 'A verified list of course resources and quizzes.',
    visualType: 'preview',
    visualCaption: 'Example downloads and resources',
    exampleBlock: {
      type: 'download-list',
      title: 'Example Generated Resources',
      content: `📄 Week 1 Meal Plan Template (PDF)
📄 Workout Log Spreadsheet (Google Sheets)
📄 Grocery Shopping Checklist (PDF)
📄 Progress Tracking Worksheet (PDF)
📋 Module 1 Quiz — 10 questions, 80% pass score
📋 Module 3 Assignment — Build Your Habit Stack`,
    },
    takeaways: [
      'Downloads increase perceived value — include at least 2-3.',
      'Quiz questions test understanding, not memorization.',
      'You can upload your own files to replace generated ones.',
    ],
  },

  // ── Module 3 ──
  'm3-l1': {
    goal: 'Learn the regenerate command to rewrite any section.',
    steps: [
      'Open the AI command panel in the builder',
      'Type a regenerate command (example below)',
      'Review the improved output',
    ],
    output: 'A regenerated section that matches your voice.',
    visualType: 'before-after',
    visualCaption: 'Before and after a regenerate command',
    exampleBlock: {
      type: 'command',
      title: 'Example Regenerate Command',
      content: `COMMAND: "Rewrite the Module 1 intro to sound more motivational and less clinical. Use second person (you/your). Add a real-world example of a client who lost 15 lbs."`,
      afterContent: `BEFORE:
"This module covers the fundamentals of nutrition science including caloric balance, macronutrient distribution, and meal timing strategies."

AFTER:
"You're about to learn the exact nutrition framework that helped Sarah, a 34-year-old marketing manager, drop 15 lbs in 6 weeks — while still eating pasta on Fridays. No food groups are off limits. Let's dive in."`,
    },
    takeaways: [
      'Be specific about what you want changed (tone, length, examples).',
      'You can regenerate individual lessons, entire modules, or just the headline.',
      'Each regeneration keeps your other content intact.',
    ],
    whyItMatters: 'The regenerate command is the most powerful feature in the builder. Instead of rewriting from scratch, you give the AI a direction and it produces a new version instantly.',
    troubleshooting: 'If the output doesn\'t match what you wanted, try being more specific. Instead of "make it better," say "make it shorter, add bullet points, and include a client success story."',
  },
  'm3-l2': {
    goal: 'Rewrite your sales page headline and CTA for higher conversions.',
    steps: [
      'Navigate to your Landing page in the builder',
      'Use the regenerate command on the hero section',
      'Compare 2-3 variations and pick the best one',
    ],
    output: 'An improved headline and CTA on your sales page.',
    visualType: 'before-after',
    exampleBlock: {
      type: 'command',
      title: 'Headline Regeneration',
      content: `COMMAND: "Give me 3 headline options that lead with the transformation, not the method."`,
      afterContent: `Option 1: "Lose 20 lbs in 30 Days Without Counting a Single Calorie"
Option 2: "The Busy Professional's Shortcut to a Leaner Body"  
Option 3: "Finally Fit — A No-Gym Fat Loss System That Works Around Your Schedule"`,
    },
    takeaways: [
      'Headlines that lead with the outcome convert 2-3x better.',
      'Always generate multiple options and pick the strongest.',
      'Your CTA button should repeat the main benefit.',
    ],
  },
  'm3-l3': {
    goal: 'Add, remove, or reorder lessons and modules.',
    steps: [
      'Use the command panel to add a new lesson or module',
      'Drag to reorder if needed',
      'Delete any filler content the AI added',
    ],
    output: 'A cleaned-up course structure with only the lessons you need.',
    visualType: 'preview',
    visualCaption: 'Reorganized course structure',
    exampleBlock: {
      type: 'command',
      title: 'Structure Commands',
      content: `"Add a bonus lesson about supplement recommendations to Module 1"
"Remove the Module 4 quiz — I'll add my own later"
"Move the Habit Building module before Workout Programming"`,
    },
    takeaways: [
      'Fewer, focused lessons beat more, shallow ones.',
      'Put your most valuable content in Module 1 to hook students.',
      'End with an action-oriented lesson, not a summary.',
    ],
  },
  'm3-l4': {
    goal: 'Fine-tune individual lesson content for your voice.',
    steps: [
      'Pick 2-3 key lessons to personalize',
      'Use regenerate to match your speaking style',
      'Add your own examples, stories, or data',
    ],
    output: 'Personalized lesson content that sounds like you.',
    visualType: 'before-after',
    exampleBlock: {
      type: 'command',
      title: 'Voice Tuning',
      content: `COMMAND: "Rewrite this lesson in a casual, coach-to-client tone. Use 'we' and 'let\'s' instead of formal language. Add humor."`,
      afterContent: `BEFORE:
"Progressive overload is the systematic increase of training stimulus over time to drive continued adaptation."

AFTER:  
"Here's the secret most programs won't tell you: doing the same workout forever is a fast track to Plateau City. Let's fix that. Progressive overload just means doing a little more each week — one extra rep, five more pounds, or ten fewer seconds of rest. That's it. Let's map out your progression plan."`,
    },
    takeaways: [
      'Your unique voice is what makes students stay — don\'t sound like a textbook.',
      'Add 1-2 personal stories per module for connection.',
      'Read your content out loud — if it sounds stiff, regenerate it.',
    ],
  },

  // ── Module 4 ──
  'm4-l1': {
    goal: 'Set your course price and enrollment settings.',
    steps: [
      'Open Course Settings in the builder',
      'Set price (or free) and currency',
      'Configure enrollment (open, closed, or date-based)',
    ],
    output: 'Configured pricing and enrollment settings.',
    visualType: 'screenshot',
    visualCaption: 'Course settings panel',
    takeaways: [
      'Free courses grow your list; paid courses ($27-$197) validate your offer.',
      'Start with a lower price and increase as you add testimonials.',
      'Consider a "founding member" discount for your first 10 students.',
    ],
  },
  'm4-l2': {
    goal: 'Publish your course and get a shareable link.',
    steps: [
      'Click "Publish" in the top-right corner',
      'Confirm your course title and URL',
      'Copy the published link',
    ],
    output: 'A live, published course URL you can share.',
    visualType: 'screenshot',
    visualCaption: 'Publish confirmation with your live URL',
    takeaways: [
      'Your course is live immediately after publishing.',
      'You can unpublish or edit anytime without losing student data.',
      'Share the link on social media, email, or your website.',
    ],
  },
  'm4-l3': {
    goal: 'Share your course and enroll your first students.',
    steps: [
      'Copy your course link from the dashboard',
      'Share it in 2-3 places (social, email, DMs)',
      'Check your enrollment dashboard for sign-ups',
    ],
    output: 'Your first enrolled students.',
    visualType: 'preview',
    visualCaption: 'Your enrollment dashboard',
    exampleBlock: {
      type: 'outline',
      title: 'Launch Checklist',
      content: `✅ Post your course link on Instagram/TikTok bio
✅ Send an email to your list with the enrollment link
✅ DM 5-10 ideal clients with a personal invite
✅ Share a behind-the-scenes story of building the course
✅ Ask 2-3 beta students for testimonials after completion`,
    },
    takeaways: [
      'Personal DMs convert 5x better than broadcast posts.',
      'Ask for feedback from your first 5 students — it\'s gold.',
      'Celebrate your launch — you built a course in 60 minutes! 🎉',
    ],
  },
};

// Helper to find lesson meta by various ID formats
export function getLessonMeta(lessonId: string, moduleIndex: number, lessonIndex: number): LessonMeta | null {
  // Try direct ID match first
  if (quickstartLessonMeta[lessonId]) return quickstartLessonMeta[lessonId];
  
  // Try module-lesson format
  const key = `m${moduleIndex + 1}-l${lessonIndex + 1}`;
  if (quickstartLessonMeta[key]) return quickstartLessonMeta[key];
  
  // Special case: first lesson of first module is always "start-here"
  if (moduleIndex === 0 && lessonIndex === 0) return quickstartLessonMeta['start-here'];
  
  return null;
}
