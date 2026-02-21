import { supabase } from '@/integrations/supabase/client';
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
  existingId?: string; // Pass existing course UUID to upsert
}

/**
 * Save a course to the courses table with unique slug handling.
 * Returns the saved course row or null on failure.
 */
export async function saveCourseToDatabase(params: SaveCourseParams) {
  const subdomain = generateUniqueSlug(params.title);

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

  // If we have a valid existing UUID, include it for upsert
  if (params.existingId && params.existingId.length === 36) {
    coursePayload.id = params.existingId;
  }

  // Try insert first; if subdomain conflicts, retry with new slug
  let attempts = 0;
  while (attempts < 3) {
    const { data, error } = params.existingId && params.existingId.length === 36
      ? await supabase
          .from('courses')
          .upsert(coursePayload as any, { onConflict: 'id' })
          .select('id')
          .maybeSingle()
      : await supabase
          .from('courses')
          .insert(coursePayload as any)
          .select('id')
          .maybeSingle();

    if (!error && data) {
      console.log('✅ Course saved to database:', data.id, params.title);
      return data;
    }

    // Check if it's a subdomain uniqueness error
    const errMsg = error?.message || '';
    if (errMsg.includes('courses_subdomain') || errMsg.includes('duplicate key') || errMsg.includes('23505')) {
      attempts++;
      coursePayload.subdomain = generateUniqueSlug(params.title);
      console.warn(`Subdomain conflict, retrying (attempt ${attempts})...`);
      continue;
    }

    // Other error - log and bail
    console.error('❌ Failed to save course to database:', error);
    return null;
  }

  console.error('❌ Failed to save course after 3 attempts (subdomain conflicts)');
  return null;
}

/**
 * Update an existing course in the database.
 */
export async function updateCourseInDatabase(courseId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('courses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', courseId);

  if (error) {
    console.error('❌ Failed to update course:', error);
    return false;
  }
  console.log('✅ Course updated:', courseId);
  return true;
}
