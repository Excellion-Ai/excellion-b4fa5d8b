import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseRequest {
  prompt: string;
  options?: {
    difficulty?: string;
    duration_weeks?: number;
    includeQuizzes?: boolean;
    includeAssignments?: boolean;
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

const OPTIONAL_SECTIONS = [
  'who-is-this-for',
  'money-back-guarantee',
  'meet-your-instructor',
  'success-stories',
  'bonus-content',
  'community-access',
];

function selectRandomSections(): string[] {
  const count = 2 + Math.floor(Math.random() * 2); // 2-3 sections
  const shuffled = [...OPTIONAL_SECTIONS].sort(() => Math.random() - 0.5);
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

    const systemPrompt = `You are an expert course curriculum designer. Create comprehensive, engaging online courses.

OUTPUT FORMAT: Return ONLY valid JSON with this exact structure (no markdown, no code blocks):

{
  "title": "Course Title",
  "description": "2-3 sentence course description",
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
      {"title": "Feature 1", "description": "Description", "icon": "Star"},
      {"title": "Feature 2", "description": "Description", "icon": "Trophy"},
      {"title": "Feature 3", "description": "Description", "icon": "Target"}
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
      "features": ["Lifetime access", "Certificate", "Community access"]
    }
  },
  "brand_color": "#6366f1"
}

RULES:
1. Create ${Math.max(3, Math.ceil(duration_weeks / 2))} modules with 4-6 lessons each
2. Difficulty level: ${difficulty}
3. Course duration: ${duration_weeks} weeks
4. ${includeQuizzes ? 'Include quiz lessons (content_type: "quiz") at end of each module' : 'Do not include quizzes'}
5. ${includeAssignments ? 'Include assignment lessons (content_type: "assignment") for practical exercises' : 'Do not include assignments'}
6. Make the first lesson of the first module a preview (is_preview: true)
7. Lesson durations: 10-30 minutes
8. Content types: "video", "text", "quiz", "assignment"
9. Create 4-6 learning outcomes
10. Create 3-5 features for landing page
11. Create 4-6 FAQs
12. Return ONLY the JSON object, no additional text`;

    const userPrompt = `Create a complete course curriculum for: ${prompt}`;

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
      
      // Parse Anthropic error for better messaging
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
    const selectedSections = selectRandomSections();

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
        brand_color: courseData.brand_color || '#6366f1',
      },
      status: 'draft',
    };

    console.log('Course generated successfully:', course.title);

    return new Response(
      JSON.stringify({
        success: true,
        course: course,
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
