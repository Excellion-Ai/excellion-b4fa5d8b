// generate-course edge function
import { getPrebuiltCourse } from './prebuilt-templates.ts';
import {
  CourseTemplate, BaseTemplate,
  TEMPLATE_TO_BASE, TEMPLATE_CONFIG,
  detectMultiPageIntent, detectTemplate,
  generateUUID, slugify, selectRandomSections,
} from './template-config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  instructor?: { name: string; bio: string; avatar?: string };
  pricing?: { amount: number; currency: string; features: string[] };
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, options, use_preloaded } = await req.json();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Handle preloaded template request
    if (use_preloaded && options?.template) {
      console.log(`Loading prebuilt template: ${options.template}`);
      const prebuiltCourse = getPrebuiltCourse(options.template);
      
      if (!prebuiltCourse) {
        return new Response(
          JSON.stringify({ success: false, error: `Unknown template: ${options.template}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let userId: string | null = null;
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': authHeader },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.id;
          }
        } catch (e) {
          console.error('Failed to get user:', e);
        }
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Could not identify user' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const projectId = generateUUID();
      const courseId = generateUUID();

      const projectSpec = {
        courseSpec: {
          ...prebuiltCourse.curriculum,
          id: courseId,
          title: prebuiltCourse.title,
          description: prebuiltCourse.description,
          modules: prebuiltCourse.curriculum.modules,
        },
        messages: [],
      };

      let projectName = prebuiltCourse.title;
      let insertAttempts = 0;
      let projectInsertResponse: Response | null = null;
      
      while (insertAttempts < 10) {
        const nameToTry = insertAttempts === 0 ? projectName : `${projectName} (${insertAttempts})`;
        
        projectInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/builder_projects`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id: projectId, user_id: userId, name: nameToTry, idea: `${options.template} template`, spec: projectSpec,
          }),
        });

        if (projectInsertResponse.ok) break;
        
        const errText = await projectInsertResponse.text();
        if (errText.includes('23505') || errText.includes('duplicate key')) {
          insertAttempts++;
          continue;
        }
        
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to save project' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!projectInsertResponse?.ok) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to save project - too many duplicates' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const courseInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: courseId, user_id: userId, builder_project_id: projectId,
          title: prebuiltCourse.title, description: prebuiltCourse.description,
          difficulty: prebuiltCourse.curriculum.difficulty || 'beginner',
          duration_weeks: prebuiltCourse.curriculum.duration_weeks || 6,
          modules: prebuiltCourse.curriculum.modules, status: 'draft',
          offer_type: options.template,
        }),
      });

      if (!courseInsertResponse.ok) {
        const errText = await courseInsertResponse.text();
        console.error('Failed to create courses:', errText);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to save course' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          course: { ...prebuiltCourse, id: projectId, courseId },
          template: options.template, isMultiPage: false, separatePages: [],
          message: 'Template loaded successfully!',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const difficulty = options?.difficulty || 'beginner';
    const duration_weeks = options?.duration_weeks || 6;
    const includeQuizzes = options?.includeQuizzes ?? true;
    const includeAssignments = options?.includeAssignments ?? false;
    
    const multiPageDetection = detectMultiPageIntent(prompt);
    const separatePages = options?.separatePages ?? multiPageDetection.isMultiPage;
    const includeBonusPage = options?.includeBonusPage ?? multiPageDetection.includeBonusPage;
    const includeResourcesPage = options?.includeResourcesPage ?? multiPageDetection.includeResourcesPage;
    const includeCommunityPage = options?.includeCommunityPage ?? multiPageDetection.includeCommunityPage;
    const includeTestimonialsPage = options?.includeTestimonialsPage ?? multiPageDetection.includeTestimonialsPage;
    
    const template: CourseTemplate = options?.template || detectTemplate(prompt);
    const baseTemplate: BaseTemplate = TEMPLATE_TO_BASE[template] || 'creator';
    const templateConfig = TEMPLATE_CONFIG[baseTemplate];

    // Fetch global knowledge
    let globalKnowledgeContext = '';
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const globalResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/user_knowledge?name=eq.__global_instructions__&select=content`,
          { headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
        );
        if (globalResponse.ok) {
          const entries = await globalResponse.json();
          if (entries?.[0]?.content) {
            globalKnowledgeContext = `\nGLOBAL USER INSTRUCTIONS:\n${entries[0].content}\n`;
          }
        }
      } catch (e) {
        console.error('Error fetching global knowledge:', e);
      }
    }

    const systemPrompt = `You are an expert course curriculum designer specializing in ${template.toUpperCase()} style courses.

${globalKnowledgeContext}

TEMPLATE STYLE: ${template.toUpperCase()}
- Tone: ${templateConfig.tone}
- Content Style: ${templateConfig.contentStyle}
- Lesson Format: ${templateConfig.lessonFormat}
- Copy Guidelines: ${templateConfig.copyStyle}

OUTPUT FORMAT: Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Course Title",
  "description": "2-3 sentence description in ${templateConfig.tone} tone",
  "tagline": "Short tagline",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
  "modules": [{ "id": "module-1", "title": "...", "description": "...", "lessons": [{ "id": "lesson-1-1", "title": "...", "duration_minutes": 15, "content_type": "video", "description": "...", "is_preview": true }] }],
  "landing_page": {
    "hero_headline": "...", "hero_subheadline": "...",
    "features": [{ "title": "...", "description": "...", "icon": "${templateConfig.featureIcons[0]}" }],
    "faqs": [{ "question": "...?", "answer": "..." }],
    "instructor": { "name": "...", "bio": "..." },
    "pricing": { "amount": 199, "currency": "USD", "features": ${JSON.stringify(templateConfig.pricingFeatures)} }
  }${separatePages ? `, "separate_pages": [...]` : ''},
  "brand_color": "${templateConfig.brandColor}"
}

RULES:
1. Create ${Math.max(3, Math.ceil(duration_weeks / 2))} modules with 4-6 lessons each
2. Difficulty: ${difficulty}, Duration: ${duration_weeks} weeks
3. ${includeQuizzes ? 'Include quiz lessons at end of each module' : 'No quizzes'}
4. ${includeAssignments ? 'Include assignment lessons' : 'No assignments'}
5. First lesson of first module is preview (is_preview: true)
6. Lesson durations: 10-30 minutes
7. Create 4-6 learning outcomes, 3-5 features, 4-6 FAQs
8. Return ONLY the JSON object`;

    const userPrompt = `Create a complete ${template} style course curriculum for: ${prompt}`;

    console.log('Calling Anthropic API:', userPrompt.substring(0, 100));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402 || (response.status === 400 && errorText.includes('credit balance'))) {
        return new Response(
          JSON.stringify({ success: false, error: 'API quota exceeded. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate course. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let courseData;
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      courseData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse course JSON:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse generated course. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!courseData.title || !courseData.modules || !Array.isArray(courseData.modules)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid course structure generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enrichedModules = courseData.modules.map((module: Module, index: number) => ({
      ...module,
      is_first: index === 0,
      is_last: index === courseData.modules.length - 1,
      has_quiz: module.lessons?.some((l: Lesson) => l.content_type === 'quiz') || false,
      has_assignment: module.lessons?.some((l: Lesson) => l.content_type === 'assignment') || false,
    }));

    const courseId = generateUUID();
    const courseSlug = slugify(courseData.title);
    const selectedSections = selectRandomSections(baseTemplate);

    const generatedSeparatePages: CoursePage[] = [];
    if (separatePages && courseData.separate_pages && Array.isArray(courseData.separate_pages)) {
      for (const page of courseData.separate_pages) {
        generatedSeparatePages.push({
          id: page.id || generateUUID(),
          type: page.type, title: page.title,
          slug: page.slug || slugify(page.title),
          content: page.content || {},
          isEnabled: page.isEnabled ?? true,
          order: page.order || generatedSeparatePages.length + 2,
        });
      }
    }

    const course: GeneratedCourse = {
      id: courseId, title: courseData.title, slug: courseSlug,
      description: courseData.description || '', tagline: courseData.tagline || '',
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
        difficulty, duration_weeks,
        brand_color: courseData.brand_color || templateConfig.brandColor,
        template,
      },
      status: 'draft',
      separatePages: generatedSeparatePages.length > 0 ? generatedSeparatePages : undefined,
      isMultiPage: separatePages && generatedSeparatePages.length > 0,
    };

    console.log('Course generated:', course.title, 'Template:', template);

    return new Response(
      JSON.stringify({
        success: true, course, template,
        isMultiPage: course.isMultiPage,
        separatePages: course.separatePages,
        message: 'Course created successfully!',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate course error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
