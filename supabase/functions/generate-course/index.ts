import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CourseTemplate = 'creator' | 'technical' | 'academic' | 'visual';

interface CourseRequest {
  prompt: string;
  options?: {
    difficulty?: string;
    duration_weeks?: number;
    includeQuizzes?: boolean;
    includeAssignments?: boolean;
    template?: CourseTemplate;
    separatePages?: boolean;
    includeBonusPage?: boolean;
    includeResourcesPage?: boolean;
    includeCommunityPage?: boolean;
    includeTestimonialsPage?: boolean;
  };
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  description: string;
  is_preview?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  is_first?: boolean;
  is_last?: boolean;
  has_quiz?: boolean;
  has_assignment?: boolean;
}

interface LandingPage {
  hero_headline: string;
  hero_subheadline: string;
  features: Array<{ title: string; description: string; icon: string }>;
  faqs: Array<{ question: string; answer: string }>;
  sections?: string[];
  instructor?: {
    name: string;
    bio: string;
    avatar?: string;
  };
  pricing?: {
    amount: number;
    currency: string;
    features: string[];
  };
}

interface Curriculum {
  modules: Module[];
  landing_page: LandingPage;
  learningOutcomes?: string[];
  difficulty?: string;
  duration_weeks?: number;
  brand_color?: string;
  template?: CourseTemplate;
}

interface CoursePage {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  isEnabled: boolean;
  order: number;
}

interface GeneratedCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  tagline: string;
  curriculum: Curriculum;
  status: string;
  thumbnail_url?: string;
  separatePages?: CoursePage[];
  isMultiPage?: boolean;
}

// Template-specific configurations
const TEMPLATE_CONFIG: Record<CourseTemplate, {
  brandColor: string;
  tone: string;
  contentStyle: string;
  lessonFormat: string;
  copyStyle: string;
  featureIcons: string[];
  pricingFeatures: string[];
}> = {
  creator: {
    brandColor: '#f59e0b',
    tone: 'warm, personal, and encouraging',
    contentStyle: 'story-driven with personal anecdotes and real-world examples',
    lessonFormat: 'conversational video lessons with personal stories and actionable takeaways',
    copyStyle: 'Use first-person, be authentic, share personal journey and transformation stories',
    featureIcons: ['Heart', 'Users', 'Sparkles', 'MessageCircle', 'Star'],
    pricingFeatures: ['Personal coaching support', 'Private community access', 'Lifetime updates', 'Bonus materials'],
  },
  technical: {
    brandColor: '#6366f1',
    tone: 'precise, structured, and professional',
    contentStyle: 'systematic with code examples, diagrams, and step-by-step tutorials',
    lessonFormat: 'hands-on coding tutorials with exercises and real project examples',
    copyStyle: 'Use technical terminology accurately, focus on practical skills and measurable outcomes',
    featureIcons: ['Code', 'Terminal', 'Laptop', 'Zap', 'Database'],
    pricingFeatures: ['Source code included', 'Certificate of completion', 'Project files', 'Code review sessions'],
  },
  academic: {
    brandColor: '#1e40af',
    tone: 'formal, scholarly, and authoritative',
    contentStyle: 'research-backed with citations, case studies, and theoretical frameworks',
    lessonFormat: 'structured lectures with readings, assessments, and academic rigor',
    copyStyle: 'Use formal language, cite research, emphasize credentials and methodology',
    featureIcons: ['GraduationCap', 'BookOpen', 'Award', 'FileText', 'Shield'],
    pricingFeatures: ['Accredited certificate', 'Academic support', 'Research materials', 'Professional credential'],
  },
  visual: {
    brandColor: '#f43f5e',
    tone: 'creative, inspiring, and visually-oriented',
    contentStyle: 'portfolio-focused with visual examples, before/after showcases, and creative exercises',
    lessonFormat: 'visual demonstrations with portfolio-building projects and creative challenges',
    copyStyle: 'Use evocative language, focus on creativity, inspiration, and visual transformation',
    featureIcons: ['Palette', 'Image', 'Brush', 'Eye', 'Sparkles'],
    pricingFeatures: ['Portfolio review', 'Creative feedback', 'Asset library', 'Gallery showcase'],
  },
};

// Niche detection for auto-selecting template
const NICHE_KEYWORDS: Record<CourseTemplate, string[]> = {
  creator: [
    'coach', 'coaching', 'personal brand', 'influencer', 'creator', 'content',
    'social media', 'youtube', 'podcast', 'speaking', 'motivation', 'mindset',
    'life', 'wellness', 'self-help', 'productivity', 'habits', 'leadership',
    'business', 'entrepreneur', 'marketing', 'sales', 'communication',
    'relationship', 'parenting', 'fitness trainer', 'health coach'
  ],
  technical: [
    'programming', 'coding', 'developer', 'software', 'web', 'app', 'python',
    'javascript', 'react', 'data', 'machine learning', 'ai', 'artificial intelligence',
    'database', 'cloud', 'devops', 'cybersecurity', 'blockchain', 'crypto',
    'api', 'backend', 'frontend', 'fullstack', 'engineering', 'it', 'tech',
    'automation', 'excel', 'spreadsheet', 'sql', 'analytics'
  ],
  academic: [
    'certification', 'certificate', 'degree', 'accredited', 'professional',
    'medical', 'legal', 'law', 'healthcare', 'nursing', 'psychology',
    'research', 'science', 'biology', 'chemistry', 'physics', 'mathematics',
    'economics', 'finance', 'accounting', 'mba', 'management', 'hr',
    'compliance', 'regulatory', 'exam prep', 'cpa', 'pmp', 'six sigma'
  ],
  visual: [
    'design', 'photography', 'video', 'editing', 'photoshop', 'illustrator',
    'figma', 'ui', 'ux', 'graphic', 'art', 'drawing', 'painting', 'illustration',
    'animation', 'motion', '3d', 'cinema', 'film', 'creative', 'portfolio',
    'fashion', 'interior', 'architecture', 'branding', 'logo', 'visual'
  ],
};

function detectTemplate(prompt: string): CourseTemplate {
  const lowerPrompt = prompt.toLowerCase();
  
  const scores: Record<CourseTemplate, number> = {
    creator: 0,
    technical: 0,
    academic: 0,
    visual: 0,
  };
  
  for (const [template, keywords] of Object.entries(NICHE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        scores[template as CourseTemplate] += keyword.split(' ').length; // Weight multi-word matches higher
      }
    }
  }
  
  // Find highest scoring template
  let maxScore = 0;
  let selectedTemplate: CourseTemplate = 'creator'; // Default
  
  for (const [template, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedTemplate = template as CourseTemplate;
    }
  }
  
  return selectedTemplate;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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

const OPTIONAL_SECTIONS: Record<CourseTemplate, string[]> = {
  creator: [
    'who-is-this-for',
    'meet-your-instructor',
    'success-stories',
    'community-access',
    'transformation-journey',
  ],
  technical: [
    'who-is-this-for',
    'prerequisites',
    'tech-stack',
    'projects-portfolio',
    'career-outcomes',
  ],
  academic: [
    'who-is-this-for',
    'credentials',
    'research-methodology',
    'assessment-structure',
    'professional-outcomes',
  ],
  visual: [
    'who-is-this-for',
    'portfolio-showcase',
    'before-after-gallery',
    'creative-community',
    'tools-resources',
  ],
};

function selectRandomSections(template: CourseTemplate): string[] {
  const sections = OPTIONAL_SECTIONS[template];
  const count = 2 + Math.floor(Math.random() * 2); // 2-3 sections
  const shuffled = [...sections].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, options } = await req.json() as CourseRequest;

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const difficulty = options?.difficulty || 'beginner';
    const duration_weeks = options?.duration_weeks || 6;
    const includeQuizzes = options?.includeQuizzes ?? true;
    const includeAssignments = options?.includeAssignments ?? false;
    const separatePages = options?.separatePages ?? false;
    const includeBonusPage = options?.includeBonusPage ?? false;
    const includeResourcesPage = options?.includeResourcesPage ?? false;
    const includeCommunityPage = options?.includeCommunityPage ?? false;
    const includeTestimonialsPage = options?.includeTestimonialsPage ?? false;
    
    // Auto-detect template from prompt if not provided
    const template: CourseTemplate = options?.template || detectTemplate(prompt);
    const templateConfig = TEMPLATE_CONFIG[template];

    console.log(`Detected/selected template: ${template}, separatePages: ${separatePages}`);

    // Build separate pages instructions if needed
    let separatePagesInstructions = '';
    if (separatePages) {
      const pagesToGenerate: string[] = [];
      if (includeBonusPage) pagesToGenerate.push('bonuses');
      if (includeResourcesPage) pagesToGenerate.push('resources');
      if (includeCommunityPage) pagesToGenerate.push('community');
      if (includeTestimonialsPage) pagesToGenerate.push('testimonials');
      
      if (pagesToGenerate.length > 0) {
        separatePagesInstructions = `

SEPARATE PAGES TO GENERATE: ${pagesToGenerate.join(', ')}

Include a "separate_pages" array in your JSON with these page types:
${includeBonusPage ? `
- bonuses: {
    "id": "page-bonuses",
    "type": "bonuses",
    "title": "Exclusive Bonuses",
    "slug": "bonuses",
    "content": {
      "bonuses": [
        {"title": "Bonus 1", "description": "Description of bonus", "value": "$197", "icon": "Gift"},
        {"title": "Bonus 2", "description": "Description of bonus", "value": "$97", "icon": "FileText"}
      ]
    },
    "isEnabled": true,
    "order": 2
  }` : ''}
${includeResourcesPage ? `
- resources: {
    "id": "page-resources",
    "type": "resources",
    "title": "Course Resources",
    "slug": "resources",
    "content": {
      "resources": [
        {"title": "Resource 1", "description": "Description", "type": "pdf"},
        {"title": "Resource 2", "description": "Description", "type": "template"}
      ]
    },
    "isEnabled": true,
    "order": 3
  }` : ''}
${includeCommunityPage ? `
- community: {
    "id": "page-community",
    "type": "community",
    "title": "Join Our Community",
    "slug": "community",
    "content": {
      "communityDescription": "Connect with fellow students...",
      "communityFeatures": ["Feature 1", "Feature 2", "Feature 3"],
      "communityPlatform": "Private Discord/Slack/Forum"
    },
    "isEnabled": true,
    "order": 4
  }` : ''}
${includeTestimonialsPage ? `
- testimonials: {
    "id": "page-testimonials",
    "type": "testimonials",
    "title": "Student Success Stories",
    "slug": "testimonials",
    "content": {
      "testimonials": [
        {"name": "Student Name", "role": "Their Role", "quote": "Amazing course...", "rating": 5},
        {"name": "Another Student", "role": "Their Role", "quote": "Transformed my skills...", "rating": 5}
      ]
    },
    "isEnabled": true,
    "order": 5
  }` : ''}

Make the content relevant to the course topic and ${template} style.`;
      }
    }

    const systemPrompt = `You are an expert course curriculum designer specializing in ${template.toUpperCase()} style courses.

TEMPLATE STYLE: ${template.toUpperCase()}
- Tone: ${templateConfig.tone}
- Content Style: ${templateConfig.contentStyle}
- Lesson Format: ${templateConfig.lessonFormat}
- Copy Guidelines: ${templateConfig.copyStyle}

OUTPUT FORMAT: Return ONLY valid JSON with this exact structure (no markdown, no code blocks):

{
  "title": "Course Title",
  "description": "2-3 sentence course description in ${templateConfig.tone} tone",
  "tagline": "Short compelling tagline",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "description": "Module description",
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson Title",
          "duration_minutes": 15,
          "content_type": "video",
          "description": "Lesson description",
          "is_preview": true
        }
      ]
    }
  ],
  "landing_page": {
    "hero_headline": "Transform Your Skills with This Course",
    "hero_subheadline": "Learn everything you need to know",
    "features": [
      {"title": "Feature 1", "description": "Description", "icon": "${templateConfig.featureIcons[0]}"},
      {"title": "Feature 2", "description": "Description", "icon": "${templateConfig.featureIcons[1]}"},
      {"title": "Feature 3", "description": "Description", "icon": "${templateConfig.featureIcons[2]}"}
    ],
    "faqs": [
      {"question": "Question 1?", "answer": "Answer 1"},
      {"question": "Question 2?", "answer": "Answer 2"}
    ],
    "instructor": {
      "name": "Instructor Name",
      "bio": "Expert bio here"
    },
    "pricing": {
      "amount": 199,
      "currency": "USD",
      "features": ${JSON.stringify(templateConfig.pricingFeatures)}
    }
  }${separatePages ? `,
  "separate_pages": []` : ''},
  "brand_color": "${templateConfig.brandColor}"
}
${separatePagesInstructions}

STYLE-SPECIFIC RULES FOR ${template.toUpperCase()}:
${template === 'creator' ? `
- Use warm, conversational language that connects emotionally
- Include personal transformation stories in module descriptions
- Focus on journey and personal growth outcomes
- Use relatable, everyday examples
- Emphasize community and support aspects` : ''}
${template === 'technical' ? `
- Use precise, technical terminology
- Structure content in logical, progressive steps
- Include hands-on exercises and coding challenges
- Reference tools, frameworks, and technologies
- Focus on practical, job-ready skills` : ''}
${template === 'academic' ? `
- Use formal, scholarly language
- Include references to research and methodology
- Structure content with clear learning objectives
- Emphasize assessments and certification value
- Focus on professional credentials and career advancement` : ''}
${template === 'visual' ? `
- Use evocative, creative language
- Focus on visual outcomes and portfolio pieces
- Include before/after transformation descriptions
- Reference creative tools and artistic techniques
- Emphasize inspiration and creative growth` : ''}

GENERAL RULES:
1. Create ${Math.max(3, Math.ceil(duration_weeks / 2))} modules with 4-6 lessons each
2. Difficulty level: ${difficulty}
3. Course duration: ${duration_weeks} weeks
4. ${includeQuizzes ? 'Include quiz lessons (content_type: "quiz") at end of each module' : 'Do not include quizzes'}
5. ${includeAssignments ? 'Include assignment lessons (content_type: "assignment") for practical exercises' : 'Do not include assignments'}
6. Make the first lesson of the first module a preview (is_preview: true)
7. Lesson durations: 10-30 minutes
8. Content types: "video", "text", "quiz", "assignment"
9. Create 4-6 learning outcomes that match the ${template} style
10. Create 3-5 features for landing page using icons: ${templateConfig.featureIcons.join(', ')}
11. Create 4-6 FAQs relevant to ${template} style courses
12. Return ONLY the JSON object, no additional text`;

    const userPrompt = `Create a complete ${template} style course curriculum for: ${prompt}`;

    console.log('Calling Claude API with prompt:', userPrompt.substring(0, 100));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      
      let errorMessage = 'Failed to generate course. Please try again.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Use default message
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 400 && errorMessage.includes('credit balance')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Anthropic API credits exhausted. Please add credits to your Anthropic account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'API quota exceeded. Please check your Anthropic account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Claude API response received');

    const content = data.content?.[0]?.text;
    if (!content) {
      console.error('No content in Claude response:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'No content generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response, handling potential markdown code blocks
    let courseData;
    try {
      let jsonStr = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();
      
      courseData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse course JSON:', parseError, 'Content:', content.substring(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse generated course. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!courseData.title || !courseData.modules || !Array.isArray(courseData.modules)) {
      console.error('Invalid course structure:', courseData);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid course structure generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enrich modules with metadata
    const enrichedModules = courseData.modules.map((module: Module, index: number) => ({
      ...module,
      is_first: index === 0,
      is_last: index === courseData.modules.length - 1,
      has_quiz: module.lessons?.some((l: Lesson) => l.content_type === 'quiz') || false,
      has_assignment: module.lessons?.some((l: Lesson) => l.content_type === 'assignment') || false,
    }));

    // Build the complete course object
    const courseId = generateUUID();
    const courseSlug = slugify(courseData.title);
    const selectedSections = selectRandomSections(template);

    // Process separate pages if they were generated
    const generatedSeparatePages: CoursePage[] = [];
    if (separatePages && courseData.separate_pages && Array.isArray(courseData.separate_pages)) {
      for (const page of courseData.separate_pages) {
        generatedSeparatePages.push({
          id: page.id || generateUUID(),
          type: page.type,
          title: page.title,
          slug: page.slug || slugify(page.title),
          content: page.content || {},
          isEnabled: page.isEnabled ?? true,
          order: page.order || generatedSeparatePages.length + 2,
        });
      }
    }

    const course: GeneratedCourse = {
      id: courseId,
      title: courseData.title,
      slug: courseSlug,
      description: courseData.description || '',
      tagline: courseData.tagline || '',
      curriculum: {
        modules: enrichedModules,
        landing_page: {
          hero_headline: courseData.landing_page?.hero_headline || courseData.title,
          hero_subheadline: courseData.landing_page?.hero_subheadline || courseData.description,
          features: courseData.landing_page?.features || [],
          faqs: courseData.landing_page?.faqs || [],
          sections: ['hero', 'curriculum', ...selectedSections, 'pricing', 'faq'],
          instructor: courseData.landing_page?.instructor,
          pricing: courseData.landing_page?.pricing,
        },
        learningOutcomes: courseData.learningOutcomes || [],
        difficulty: difficulty,
        duration_weeks: duration_weeks,
        brand_color: courseData.brand_color || templateConfig.brandColor,
        template: template,
      },
      status: 'draft',
      separatePages: generatedSeparatePages.length > 0 ? generatedSeparatePages : undefined,
      isMultiPage: separatePages && generatedSeparatePages.length > 0,
    };

    console.log('Course generated successfully:', course.title, 'Template:', template, 'Pages:', generatedSeparatePages.length);

    return new Response(
      JSON.stringify({
        success: true,
        course: course,
        template: template,
        isMultiPage: course.isMultiPage,
        separatePages: course.separatePages,
        message: 'Course created successfully!',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate course error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
