import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

/**
 * Generate a unique slug for a course subdomain.
 * Appends a random suffix to avoid unique constraint violations.
 */
function generateUniqueSlug(title: string): string {
  const base = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  const suffix = Math.random().toString(36).substring(2, 8);
  return base ? `${base}-${suffix}` : `course-${suffix}`;
}

export interface SaveCourseParams {
  userId: string;
  title: string;
  description?: string;
  tagline?: string;
  originalPrompt?: string;
  modules: unknown[];
  difficulty?: string;
  durationWeeks?: number;
  builderProjectId?: string;
  brandColor?: string;
  layoutStyle?: string;
  landingPage?: {
    hero_headline?: string;
    hero_subheadline?: string;
    hero_image?: string;
    tagline?: string;
    cta_text?: string;
    sections?: string[];
    features?: unknown[];
    faqs?: unknown[];
    instructor?: { name?: string; bio?: string };
    pricing?: unknown;
  };
  learningOutcomes?: string[];
  offerType?: string;
}

/**
 * Save a NEW course to the courses table.
 * Always uses INSERT (never upsert) — Postgres generates the UUID.
 * Retries up to 3 times on subdomain conflicts.
 * Returns the saved course row or null on failure.
 */
export async function saveCourseToDatabase(params: SaveCourseParams): Promise<{ id: string } | null> {
  let subdomain = generateUniqueSlug(params.title);

  const coursePayload: Record<string, unknown> = {
    user_id: params.userId,
    title: params.title || 'Untitled Course',
    description: params.description || '',
    subdomain,
    modules: params.modules as Json,
    difficulty: params.difficulty || 'beginner',
    duration_weeks: params.durationWeeks || 6,
    status: 'draft',
    offer_type: params.offerType || 'standard',
    design_config: {
      colors: {
        primary: params.brandColor || '#d4a853',
        secondary: '#1a1a1a',
        accent: '#f59e0b',
        background: '#0a0a0a',
        cardBackground: '#111111',
        text: '#ffffff',
        textMuted: '#9ca3af',
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      spacing: 'normal',
      borderRadius: 'medium',
    } as Json,
    layout_template: params.layoutStyle || 'suspended',
    section_order: (params.landingPage?.sections || ['hero', 'outcomes', 'curriculum', 'faq', 'cta']) as Json,
    page_sections: {
      landing: {
        hero_headline: params.landingPage?.hero_headline || params.title,
        hero_subheadline: params.landingPage?.hero_subheadline || params.description,
        hero_image: params.landingPage?.hero_image,
        tagline: params.landingPage?.tagline || params.tagline,
        cta_text: params.landingPage?.cta_text || 'Enroll Now',
        features: params.landingPage?.features,
        faqs: params.landingPage?.faqs,
        instructor: params.landingPage?.instructor,
        pricing: params.landingPage?.pricing,
        learning_outcomes: params.learningOutcomes,
      },
    } as Json,
  };

  if (params.builderProjectId) {
    coursePayload.builder_project_id = params.builderProjectId;
  }

  console.log('🔵 SAVING TO DATABASE:', { 
    table: 'courses', 
    action: 'insert', 
    userId: params.userId,
    title: params.title,
    subdomain,
    builderProjectId: params.builderProjectId,
    payload: coursePayload 
  });

  // Always INSERT — never upsert for new courses. Retry on subdomain conflicts.
  let attempts = 0;
  while (attempts < 3) {
    coursePayload.subdomain = subdomain;

    const { data, error } = await supabase
      .from('courses')
      .insert(coursePayload as any)
      .select('id')
      .maybeSingle();

    console.log('🔵 DATABASE INSERT RESULT:', { data, error, attempt: attempts + 1 });

    if (!error && data) {
      console.log('✅ Course saved to database:', data.id, params.title);
      toast.success('Course saved!');
      return data;
    }

    // Check if it's a subdomain uniqueness error — retry with new slug
    const errMsg = error?.message || '';
    const isSubdomainConflict = errMsg.includes('courses_subdomain') || errMsg.includes('duplicate key') || errMsg.includes('23505');

    if (isSubdomainConflict) {
      attempts++;
      subdomain = generateUniqueSlug(params.title);
      console.warn(`Subdomain conflict, retrying with "${subdomain}" (attempt ${attempts})...`);
      continue;
    }

    // Non-subdomain error — show toast and bail
    console.error('❌ Failed to save course to database:', error);
    toast.error('Failed to save course. ' + (error?.message || 'Unknown error'));
    return null;
  }

  console.error('❌ Failed to save course after 3 attempts (subdomain conflicts)');
  toast.error('Failed to save course after multiple attempts. Please try again.');
  return null;
}

/**
 * Update an existing course in the database.
 * Shows toast on failure so the user knows.
 */
export async function updateCourseInDatabase(courseId: string, updates: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase
    .from('courses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', courseId);

  if (error) {
    console.error('❌ Failed to update course:', error);
    toast.error('Failed to sync course changes.');
    return false;
  }
  console.log('✅ Course updated:', courseId);
  return true;
}

/**
 * Safety-net: checks if a course row exists for the given builder_project_id.
 * If not, creates one. Returns the course id.
 * Used by auto-save when courseId is null but we have courseSpec + projectId.
 */
export async function ensureCourseExists(params: SaveCourseParams & { builderProjectId: string }): Promise<string | null> {
  // Check if course already exists for this builder project
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('builder_project_id', params.builderProjectId)
    .maybeSingle();

  if (existing?.id) {
    console.log('✅ Course already exists for project:', existing.id);
    return existing.id;
  }

  // Doesn't exist — create it
  const result = await saveCourseToDatabase(params);
  return result?.id || null;
}
