// Pre-built course content for instant template loading
// Each template has a complete course structure ready to use

import type { GeneratedCourse, Module, LandingPage, CoursePage } from './types.ts';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

// Standard Course Template - Full Online Course
const STANDARD_MODULES: Module[] = [
  {
    id: generateUUID(),
    title: 'Getting Started',
    description: 'Set up your environment and understand the fundamentals',
    is_first: true,
    is_last: false,
    has_quiz: true,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Welcome to the Course', duration_minutes: 5, content_type: 'video', description: 'Introduction and what you will learn', is_preview: true },
      { id: generateUUID(), title: 'Setting Up Your Workspace', duration_minutes: 15, content_type: 'video', description: 'Get everything ready to start learning' },
      { id: generateUUID(), title: 'Core Concepts Overview', duration_minutes: 20, content_type: 'video', description: 'Understanding the fundamental principles' },
      { id: generateUUID(), title: 'Module 1 Quiz', duration_minutes: 10, content_type: 'quiz', description: 'Test your understanding of the basics' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Building Your Foundation',
    description: 'Master the essential skills and techniques',
    is_first: false,
    is_last: false,
    has_quiz: true,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Essential Skill #1', duration_minutes: 25, content_type: 'video', description: 'Deep dive into the first core skill' },
      { id: generateUUID(), title: 'Essential Skill #2', duration_minutes: 25, content_type: 'video', description: 'Master the second key technique' },
      { id: generateUUID(), title: 'Practical Application', duration_minutes: 30, content_type: 'video', description: 'Apply what you learned in real scenarios' },
      { id: generateUUID(), title: 'Foundation Quiz', duration_minutes: 15, content_type: 'quiz', description: 'Verify your foundational knowledge' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Advanced Techniques',
    description: 'Take your skills to the next level',
    is_first: false,
    is_last: false,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Advanced Strategy #1', duration_minutes: 30, content_type: 'video', description: 'Learn professional-level techniques' },
      { id: generateUUID(), title: 'Advanced Strategy #2', duration_minutes: 30, content_type: 'video', description: 'Master complex scenarios' },
      { id: generateUUID(), title: 'Case Study Analysis', duration_minutes: 25, content_type: 'video', description: 'Learn from real-world examples' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Putting It All Together',
    description: 'Complete your transformation and plan next steps',
    is_first: false,
    is_last: true,
    has_quiz: true,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Integration Workshop', duration_minutes: 35, content_type: 'video', description: 'Combine everything into a cohesive system' },
      { id: generateUUID(), title: 'Your Action Plan', duration_minutes: 20, content_type: 'video', description: 'Create your personalized roadmap' },
      { id: generateUUID(), title: 'Final Assessment', duration_minutes: 20, content_type: 'quiz', description: 'Comprehensive course completion quiz' },
      { id: generateUUID(), title: 'Next Steps & Resources', duration_minutes: 10, content_type: 'text', description: 'Continue your learning journey' },
    ],
  },
];

// Challenge Template - Day-by-Day Program
const CHALLENGE_MODULES: Module[] = [
  {
    id: generateUUID(),
    title: 'Days 1-3: Foundation',
    description: 'Build your foundation and set yourself up for success',
    is_first: true,
    is_last: false,
    has_quiz: false,
    has_assignment: true,
    lessons: [
      { id: generateUUID(), title: 'Day 1: Your Starting Point', duration_minutes: 15, content_type: 'video', description: 'Assess where you are and set your goals', is_preview: true },
      { id: generateUUID(), title: 'Day 1 Action', duration_minutes: 30, content_type: 'assignment', description: 'Complete your baseline assessment' },
      { id: generateUUID(), title: 'Day 2: Core Principles', duration_minutes: 15, content_type: 'video', description: 'Learn the key principles that drive results' },
      { id: generateUUID(), title: 'Day 2 Action', duration_minutes: 30, content_type: 'assignment', description: 'Apply the core principles' },
      { id: generateUUID(), title: 'Day 3: Building Momentum', duration_minutes: 15, content_type: 'video', description: 'Create systems for consistent progress' },
      { id: generateUUID(), title: 'Day 3 Action', duration_minutes: 30, content_type: 'assignment', description: 'Set up your daily routine' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Days 4-7: Implementation',
    description: 'Put your knowledge into action with daily challenges',
    is_first: false,
    is_last: false,
    has_quiz: false,
    has_assignment: true,
    lessons: [
      { id: generateUUID(), title: 'Day 4: Deep Dive', duration_minutes: 20, content_type: 'video', description: 'Master the key technique' },
      { id: generateUUID(), title: 'Day 4 Challenge', duration_minutes: 45, content_type: 'assignment', description: 'Complete today\'s challenge' },
      { id: generateUUID(), title: 'Day 5: Level Up', duration_minutes: 20, content_type: 'video', description: 'Take it to the next level' },
      { id: generateUUID(), title: 'Day 5 Challenge', duration_minutes: 45, content_type: 'assignment', description: 'Push beyond your comfort zone' },
      { id: generateUUID(), title: 'Day 6: Integration', duration_minutes: 15, content_type: 'video', description: 'Combine what you\'ve learned' },
      { id: generateUUID(), title: 'Day 6 Challenge', duration_minutes: 45, content_type: 'assignment', description: 'Integration challenge' },
      { id: generateUUID(), title: 'Day 7: Rest & Reflect', duration_minutes: 10, content_type: 'video', description: 'Review your progress' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Days 8-14: Transformation',
    description: 'Solidify your new habits and see real results',
    is_first: false,
    is_last: true,
    has_quiz: false,
    has_assignment: true,
    lessons: [
      { id: generateUUID(), title: 'Week 2 Overview', duration_minutes: 10, content_type: 'video', description: 'What to expect in the final week' },
      { id: generateUUID(), title: 'Days 8-10: Intensify', duration_minutes: 20, content_type: 'video', description: 'Increase the intensity' },
      { id: generateUUID(), title: 'Daily Challenges 8-10', duration_minutes: 60, content_type: 'assignment', description: 'Three days of focused challenges' },
      { id: generateUUID(), title: 'Days 11-13: Mastery', duration_minutes: 20, content_type: 'video', description: 'Achieve mastery level' },
      { id: generateUUID(), title: 'Daily Challenges 11-13', duration_minutes: 60, content_type: 'assignment', description: 'Push to mastery' },
      { id: generateUUID(), title: 'Day 14: Celebration', duration_minutes: 15, content_type: 'video', description: 'Celebrate your transformation!' },
      { id: generateUUID(), title: 'Your Results & Next Steps', duration_minutes: 10, content_type: 'text', description: 'Document your results and plan ahead' },
    ],
  },
];

// Lead Magnet Template - Free Mini-Course
const LEADMAGNET_MODULES: Module[] = [
  {
    id: generateUUID(),
    title: 'Quick Start Guide',
    description: 'Everything you need to get started in under 30 minutes',
    is_first: true,
    is_last: true,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Welcome & What You\'ll Learn', duration_minutes: 3, content_type: 'video', description: 'Quick overview of what\'s inside', is_preview: true },
      { id: generateUUID(), title: 'The #1 Mistake to Avoid', duration_minutes: 5, content_type: 'video', description: 'Save yourself time and frustration' },
      { id: generateUUID(), title: 'The Simple 3-Step System', duration_minutes: 8, content_type: 'video', description: 'The proven framework for success' },
      { id: generateUUID(), title: 'Quick Win Exercise', duration_minutes: 10, content_type: 'text', description: 'Get your first result today' },
      { id: generateUUID(), title: 'Your Free Resources', duration_minutes: 5, content_type: 'text', description: 'Download your templates and checklists' },
    ],
  },
];

// Webinar Template - Live Training/Workshop
const WEBINAR_MODULES: Module[] = [
  {
    id: generateUUID(),
    title: 'Pre-Training Materials',
    description: 'Prepare for the live training',
    is_first: true,
    is_last: false,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Welcome & How to Prepare', duration_minutes: 5, content_type: 'video', description: 'Get the most from this training', is_preview: true },
      { id: generateUUID(), title: 'Pre-Training Worksheet', duration_minutes: 10, content_type: 'text', description: 'Complete before the live session' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Live Training Session',
    description: 'The main training content',
    is_first: false,
    is_last: false,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Training Recording', duration_minutes: 60, content_type: 'video', description: 'Full training session replay' },
      { id: generateUUID(), title: 'Training Slides & Notes', duration_minutes: 5, content_type: 'text', description: 'Download the presentation' },
      { id: generateUUID(), title: 'Q&A Session', duration_minutes: 30, content_type: 'video', description: 'Answers to common questions' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Implementation',
    description: 'Put what you learned into action',
    is_first: false,
    is_last: true,
    has_quiz: false,
    has_assignment: true,
    lessons: [
      { id: generateUUID(), title: 'Action Plan Template', duration_minutes: 15, content_type: 'text', description: 'Your step-by-step implementation guide' },
      { id: generateUUID(), title: 'Implementation Checklist', duration_minutes: 10, content_type: 'assignment', description: 'Track your progress' },
      { id: generateUUID(), title: 'Next Steps & Special Offer', duration_minutes: 5, content_type: 'video', description: 'Continue your journey with us' },
    ],
  },
];

// Coach Portfolio Template - Services Showcase
const COACH_MODULES: Module[] = [
  {
    id: generateUUID(),
    title: 'About My Coaching',
    description: 'Learn about my approach and philosophy',
    is_first: true,
    is_last: false,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'My Story & Philosophy', duration_minutes: 10, content_type: 'video', description: 'How I can help you transform', is_preview: true },
      { id: generateUUID(), title: 'My Coaching Method', duration_minutes: 8, content_type: 'video', description: 'The proven system I use with clients' },
      { id: generateUUID(), title: 'Client Success Stories', duration_minutes: 5, content_type: 'text', description: 'Real results from real clients' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Free Training',
    description: 'Sample my coaching style with this free content',
    is_first: false,
    is_last: false,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: 'Quick Win Training', duration_minutes: 15, content_type: 'video', description: 'Get a taste of my coaching style' },
      { id: generateUUID(), title: 'Self-Assessment Tool', duration_minutes: 10, content_type: 'text', description: 'Discover where you are now' },
      { id: generateUUID(), title: 'Free Resources', duration_minutes: 5, content_type: 'text', description: 'Templates and guides to get started' },
    ],
  },
  {
    id: generateUUID(),
    title: 'Work With Me',
    description: 'Explore coaching options',
    is_first: false,
    is_last: true,
    has_quiz: false,
    has_assignment: false,
    lessons: [
      { id: generateUUID(), title: '1:1 Coaching Program', duration_minutes: 5, content_type: 'text', description: 'Personalized transformation coaching' },
      { id: generateUUID(), title: 'Group Coaching', duration_minutes: 5, content_type: 'text', description: 'Learn with a supportive community' },
      { id: generateUUID(), title: 'Book Your Free Call', duration_minutes: 3, content_type: 'text', description: 'Schedule a discovery session' },
    ],
  },
];

// Template configurations
const PREBUILT_TEMPLATES: Record<string, {
  title: string;
  description: string;
  tagline: string;
  modules: Module[];
  landingPage: LandingPage;
  brandColor: string;
  difficulty: string;
  durationWeeks: number;
}> = {
  standard: {
    title: 'Complete Online Course',
    description: 'A comprehensive self-paced online course with video lessons, quizzes, and practical exercises to help you master new skills.',
    tagline: 'Master new skills at your own pace',
    modules: STANDARD_MODULES,
    brandColor: '#6366f1',
    difficulty: 'beginner',
    durationWeeks: 6,
    landingPage: {
      hero_headline: 'Master New Skills with Structured Learning',
      hero_subheadline: 'A comprehensive course designed to take you from beginner to confident practitioner with video lessons, quizzes, and hands-on exercises.',
      features: [
        { title: 'Self-Paced Learning', description: 'Study on your schedule with lifetime access', icon: 'Clock' },
        { title: 'Video Lessons', description: 'High-quality video content you can watch anywhere', icon: 'PlayCircle' },
        { title: 'Quizzes & Assessments', description: 'Test your knowledge and track progress', icon: 'CheckCircle' },
        { title: 'Certificate of Completion', description: 'Earn a certificate when you finish', icon: 'Award' },
      ],
      faqs: [
        { question: 'How long do I have access?', answer: 'You get lifetime access to all course materials, including future updates.' },
        { question: 'Is this course for beginners?', answer: 'Yes! This course is designed for beginners and takes you step-by-step through everything you need to know.' },
        { question: 'What if I get stuck?', answer: 'You can reach out anytime with questions, and we have a supportive community to help.' },
      ],
      sections: ['hero', 'curriculum', 'who-is-this-for', 'meet-your-instructor', 'pricing', 'faq'],
    },
  },
  challenge: {
    title: '14-Day Transformation Challenge',
    description: 'An intensive 2-week program with daily action steps designed to create real, lasting change through consistent action.',
    tagline: 'Transform your life in 14 days',
    modules: CHALLENGE_MODULES,
    brandColor: '#10b981',
    difficulty: 'intermediate',
    durationWeeks: 2,
    landingPage: {
      hero_headline: 'Transform Your Life in Just 14 Days',
      hero_subheadline: 'Join thousands who have completed this challenge and achieved breakthrough results. Daily videos, action steps, and community support.',
      features: [
        { title: 'Daily Action Steps', description: 'Clear, focused tasks each day for consistent progress', icon: 'Target' },
        { title: 'Accountability', description: 'Built-in tracking to keep you on course', icon: 'CheckSquare' },
        { title: 'Community Support', description: 'Connect with others on the same journey', icon: 'Users' },
        { title: 'Real Results', description: 'See measurable changes in just 2 weeks', icon: 'TrendingUp' },
      ],
      faqs: [
        { question: 'How much time do I need each day?', answer: 'Plan for about 30-45 minutes per day to watch the video and complete your action step.' },
        { question: 'What if I miss a day?', answer: 'Life happens! You can catch up at your own pace, though we recommend staying on schedule for best results.' },
        { question: 'Is there a community?', answer: 'Yes! You\'ll join a private group of fellow challengers for support and accountability.' },
      ],
      sections: ['hero', 'curriculum', 'success-stories', 'challenge-calendar', 'pricing', 'faq'],
    },
  },
  leadmagnet: {
    title: 'Free Quick Start Guide',
    description: 'A free mini-course that delivers quick wins and introduces you to powerful strategies you can implement today.',
    tagline: 'Get results in under 30 minutes',
    modules: LEADMAGNET_MODULES,
    brandColor: '#f59e0b',
    difficulty: 'beginner',
    durationWeeks: 1,
    landingPage: {
      hero_headline: 'Get Your First Quick Win Today',
      hero_subheadline: 'This free guide shows you exactly how to get started. No fluff, just actionable steps you can implement in under 30 minutes.',
      features: [
        { title: 'Instant Access', description: 'Start learning immediately after signup', icon: 'Zap' },
        { title: 'Quick Implementation', description: 'See results in under 30 minutes', icon: 'Clock' },
        { title: 'Free Templates', description: 'Download ready-to-use resources', icon: 'FileText' },
        { title: 'No Strings Attached', description: 'Completely free, no credit card required', icon: 'Gift' },
      ],
      faqs: [
        { question: 'Is this really free?', answer: 'Yes! This is completely free with no hidden costs or credit card required.' },
        { question: 'How long will this take?', answer: 'You can complete the entire guide in about 30 minutes and start seeing results today.' },
        { question: 'What do I get?', answer: 'You get video training, downloadable templates, and a step-by-step action plan.' },
      ],
      sections: ['hero', 'curriculum', 'what-you-get', 'faq'],
    },
  },
  webinar: {
    title: 'Live Training Workshop',
    description: 'A professional training session with pre-work, live content, Q&A, and implementation guides to help you take action.',
    tagline: 'Expert training you can implement immediately',
    modules: WEBINAR_MODULES,
    brandColor: '#8b5cf6',
    difficulty: 'intermediate',
    durationWeeks: 1,
    landingPage: {
      hero_headline: 'Join This Exclusive Live Training',
      hero_subheadline: 'Learn from an expert in this comprehensive training session. Get your questions answered and leave with a complete action plan.',
      features: [
        { title: 'Live Training', description: 'Interactive session with real-time Q&A', icon: 'Video' },
        { title: 'Expert Instruction', description: 'Learn from someone who\'s been there', icon: 'Award' },
        { title: 'Replay Access', description: 'Can\'t make it live? Watch the recording', icon: 'PlayCircle' },
        { title: 'Action Plan', description: 'Leave with clear next steps', icon: 'Map' },
      ],
      faqs: [
        { question: 'What if I can\'t attend live?', answer: 'No problem! You\'ll get full access to the replay and all materials.' },
        { question: 'Can I ask questions?', answer: 'Absolutely! There\'s dedicated Q&A time during the live session.' },
        { question: 'How long is the training?', answer: 'The main training is about 60 minutes, plus 30 minutes of Q&A.' },
      ],
      sections: ['hero', 'curriculum', 'what-you-will-learn', 'about-the-trainer', 'pricing', 'faq'],
    },
  },
  coach: {
    title: 'Coaching Services',
    description: 'A professional coach portfolio showcasing your methodology, free training samples, and coaching programs.',
    tagline: 'Transform with personalized coaching',
    modules: COACH_MODULES,
    brandColor: '#ec4899',
    difficulty: 'beginner',
    durationWeeks: 12,
    landingPage: {
      hero_headline: 'Ready to Transform Your Life?',
      hero_subheadline: 'I help ambitious individuals break through barriers and achieve their biggest goals. Let\'s work together to create the life you deserve.',
      features: [
        { title: 'Personalized Approach', description: 'Coaching tailored to your unique situation', icon: 'User' },
        { title: 'Proven Methods', description: 'Strategies that have helped hundreds', icon: 'Award' },
        { title: 'Ongoing Support', description: 'I\'m with you every step of the way', icon: 'MessageCircle' },
        { title: 'Real Results', description: 'Clients achieve breakthrough outcomes', icon: 'TrendingUp' },
      ],
      faqs: [
        { question: 'How does coaching work?', answer: 'We meet regularly (weekly or bi-weekly) via video call, with support between sessions.' },
        { question: 'How long is the program?', answer: 'Most clients work with me for 3-6 months, depending on their goals.' },
        { question: 'Do you offer a free consultation?', answer: 'Yes! Book a free discovery call to see if we\'re a good fit.' },
      ],
      sections: ['hero', 'curriculum', 'meet-your-coach', 'success-stories', 'pricing', 'faq'],
    },
  },
};

export function getPrebuiltCourse(templateId: string): GeneratedCourse | null {
  const template = PREBUILT_TEMPLATES[templateId];
  if (!template) return null;

  const courseId = generateUUID();
  const courseSlug = slugify(template.title);

  return {
    id: courseId,
    title: template.title,
    slug: courseSlug,
    description: template.description,
    tagline: template.tagline,
    curriculum: {
      modules: template.modules,
      landing_page: template.landingPage,
      learningOutcomes: [
        'Master the core concepts and fundamentals',
        'Apply practical techniques in real-world scenarios',
        'Build confidence through hands-on practice',
        'Create a personalized action plan for continued growth',
      ],
      difficulty: template.difficulty,
      duration_weeks: template.durationWeeks,
      brand_color: template.brandColor,
      template: templateId as any,
    },
    status: 'draft',
    separatePages: undefined,
    isMultiPage: false,
  };
}

export { PREBUILT_TEMPLATES };
