import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseRequest {
  prompt: string;
  options?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration_weeks?: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  description?: string;
  content_markdown?: string;
  is_preview?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CoursePages {
  landing_sections: string[];
  included_bonuses?: string[];
  show_guarantee?: boolean;
  target_audience?: string;
  faq?: Array<{ question: string; answer: string }>;
}

interface GeneratedCourse {
  title: string;
  description: string;
  tagline?: string;
  difficulty: string;
  duration_weeks: number;
  modules: Module[];
  learningOutcomes: string[];
  pages?: CoursePages;
}

// Available landing sections to randomly select from
const OPTIONAL_SECTIONS = [
  'who_is_for',
  'course_includes',
  'instructor',
  'testimonials',
  'guarantee',
  'bonuses',
  'community'
];

// Randomly select 2-3 optional sections
function selectRandomSections(): string[] {
  const shuffled = [...OPTIONAL_SECTIONS].sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 2) + 2; // 2-3 sections
  return shuffled.slice(0, count);
}

// Select random bonuses
function selectRandomBonuses(): string[] {
  const bonuses = ['worksheet', 'template', 'checklist', 'resource_guide', 'community', 'certificate', 'ebook', 'cheatsheet'];
  const shuffled = bonuses.sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 bonuses
  return shuffled.slice(0, count);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, options = {} }: CourseRequest = await req.json();
    const difficulty = options.difficulty || 'beginner';
    const duration_weeks = options.duration_weeks || 6;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating course for prompt:', prompt);
    console.log('Options:', { difficulty, duration_weeks });

    // Pre-select random sections for variety
    const optionalSections = selectRandomSections();
    const baseSections = ['hero', 'outcomes', 'curriculum', 'pricing', 'faq'];
    const allLandingSections = [...baseSections.slice(0, 3), ...optionalSections, ...baseSections.slice(3)];
    const bonuses = selectRandomBonuses();
    const showGuarantee = Math.random() > 0.5;

    const systemPrompt = `You are an expert course curriculum designer. Create a comprehensive, well-structured course based on the user's description.

RULES:
- Generate 4-8 modules depending on course complexity
- Each module should have 3-6 lessons
- Lesson durations should be realistic (5-30 minutes)
- Include a mix of content types: video, text, quiz, assignment
- Learning outcomes should be specific and measurable
- Titles should be concise and descriptive
- Create a compelling tagline (1 short sentence hook)
- Mark first lesson of first module as free preview (is_preview: true)
- Include content_markdown for text lessons (2-3 paragraphs of actual lesson content)
- Create relevant FAQ questions and answers for the course
- Describe the target audience (who this course is for)

OUTPUT FORMAT (strict JSON):
{
  "title": "Course Title",
  "tagline": "Short compelling tagline (10 words max)",
  "description": "2-3 sentence course description",
  "difficulty": "${difficulty}",
  "duration_weeks": ${duration_weeks},
  "target_audience": "Description of ideal student (2 sentences)",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
  "faq": [
    { "question": "Common question about the course?", "answer": "Helpful answer" },
    { "question": "Another relevant question?", "answer": "Clear answer" },
    { "question": "Third question?", "answer": "Informative answer" }
  ],
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "description": "Brief module description",
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson Title",
          "duration": "15 min",
          "type": "video",
          "description": "What students will learn",
          "is_preview": true,
          "content_markdown": "## Lesson content here\\n\\nThis is the actual lesson content..."
        }
      ]
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a ${difficulty} level course (${duration_weeks} weeks) about: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please check your account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate course' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let rawCourse: GeneratedCourse & { target_audience?: string; faq?: Array<{ question: string; answer: string }> };
    try {
      rawCourse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse course JSON:', parseError);
      console.error('Raw content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated course' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add module position flags for layout variations
    const modulesWithFlags = rawCourse.modules.map((module, idx) => ({
      ...module,
      is_first: idx === 0,
      is_last: idx === rawCourse.modules.length - 1,
      has_quiz: module.lessons.some(l => l.type === 'quiz'),
      has_assignment: module.lessons.some(l => l.type === 'assignment'),
    }));

    // Build the final course with pages config
    const course: GeneratedCourse = {
      title: rawCourse.title,
      tagline: rawCourse.tagline || `Master ${rawCourse.title} in ${duration_weeks} weeks`,
      description: rawCourse.description,
      difficulty: rawCourse.difficulty || difficulty,
      duration_weeks: rawCourse.duration_weeks || duration_weeks,
      modules: modulesWithFlags,
      learningOutcomes: rawCourse.learningOutcomes || [],
      pages: {
        landing_sections: allLandingSections,
        included_bonuses: bonuses,
        show_guarantee: showGuarantee,
        target_audience: rawCourse.target_audience || 'Anyone interested in learning this topic.',
        faq: rawCourse.faq || [
          { question: 'How long do I have access?', answer: 'You have lifetime access to this course.' },
          { question: 'Is there a money-back guarantee?', answer: 'Yes, we offer a 30-day money-back guarantee.' },
          { question: 'Do I need any prior experience?', answer: `This course is designed for ${difficulty} level students.` }
        ],
      },
    };

    console.log('Course generated successfully:', course.title);
    console.log('Landing sections:', allLandingSections);

    return new Response(
      JSON.stringify({ course }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate course error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
