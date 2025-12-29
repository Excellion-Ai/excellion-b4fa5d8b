import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Niche-specific prompt enhancers
const NICHE_PROMPT_STYLES: Record<string, string> = {
  HOME_SERVICES: "Professional trade/construction/home services photography style. Show real workers, tools, equipment, or completed work. Clean, trustworthy, reliable aesthetic.",
  AGRICULTURE: "Natural, organic, farm-fresh photography. Golden hour lighting, fields, fresh produce, farmers at work. Warm, earthy tones.",
  FITNESS: "High-energy, dynamic fitness photography. Action shots, gym equipment, athletic poses. Motivating, powerful, strong contrast.",
  RESTAURANT: "Appetizing food photography with professional styling. Warm lighting, steam, fresh ingredients. Delicious, inviting, high-end.",
  REAL_ESTATE: "Bright, spacious interior/exterior photography. Natural light, staged homes, architectural details. Luxurious, aspirational.",
  HEALTH: "Clean, professional medical/wellness imagery. Calming colors, modern facilities, caring staff. Trustworthy, sterile but welcoming.",
  LEGAL: "Professional, authoritative legal imagery. Law office, courtroom elements, professional attire. Serious, trustworthy, established.",
  CREATIVE: "Artistic, visually striking photography. Unique angles, creative lighting, artistic composition. Bold, innovative, expressive.",
  SAAS: "Modern tech/software imagery. Clean interfaces, digital elements, professional office. Sleek, innovative, cutting-edge.",
  RETAIL: "Attractive product photography. Well-lit, styled products, lifestyle shots. Aspirational, desirable, premium quality.",
  EDUCATION: "Welcoming educational environment. Students learning, classrooms, books, growth imagery. Inspiring, nurturing, progressive.",
  AUTOMOTIVE: "Dynamic vehicle photography. Showroom quality, motion blur, detailed shots. Powerful, sleek, desirable.",
  BEAUTY: "Elegant beauty/spa photography. Soft lighting, luxurious products, relaxation. Sophisticated, calming, premium.",
  GENERIC: "Professional business photography. Clean, modern, trustworthy aesthetic.",
};

const IMAGE_TYPE_PROMPTS: Record<string, string> = {
  hero: "A stunning hero banner image suitable for the top of a website. Wide 16:9 aspect ratio. ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO TYPOGRAPHY OF ANY KIND.",
  service: "A clean image representing a professional service offering. Square or slightly rectangular format. ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS.",
  team: "Professional team/staff photo placeholder. Show diverse, professional-looking people. NO TEXT OR NAMES.",
  gallery: "High-quality portfolio/gallery image showcasing work or products. NO TEXT, NO LABELS, NO WATERMARKS.",
  testimonial: "Background image suitable for testimonials section. Subtle, not distracting. NO TEXT.",
  about: "Warm, inviting image representing the company story or values. NO TEXT, NO WORDS.",
  contact: "Professional image suitable for a contact page. Office, location, or welcoming imagery. NO TEXT.",
  product: "Clean product photography with good lighting and neutral background. NO TEXT, NO LABELS.",
  feature: "Icon-style or representative image for a feature/benefit. Simple, clear concept. NO TEXT, NO WORDS.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      businessName, 
      businessDescription, 
      niche,
      imageType = 'hero',
      customPrompt,
      count = 1
    } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: 'Business name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Determine niche style
    const nicheStyle = NICHE_PROMPT_STYLES[niche] || NICHE_PROMPT_STYLES.GENERIC;
    const typePrompt = IMAGE_TYPE_PROMPTS[imageType] || IMAGE_TYPE_PROMPTS.hero;

    // Build the prompt
    const basePrompt = customPrompt || `A ${imageType} image for "${businessName}"${businessDescription ? `. ${businessDescription}` : ''}`;
    
    const fullPrompt = `Generate a unique, high-quality, professional photograph for a ${niche || 'business'} website.

Business: ${businessName}
${businessDescription ? `Description: ${businessDescription}` : ''}

CRITICAL - VISUALS ONLY:
- ABSOLUTELY NO TEXT IN THE IMAGE - no words, letters, numbers, typography, titles, captions, labels, or any readable characters
- NO logos, watermarks, or branding
- Text will be added separately as HTML overlays - the image must be pure visual content only

Image requirements:
- ${typePrompt}
- ${nicheStyle}
- Ultra high resolution, photorealistic
- Professional lighting and composition
- Must look like a real photograph, not AI-generated
- Unique and specific to this business type

Specific request: ${basePrompt}`;

    console.log(`Generating ${imageType} image for ${businessName} (${niche || 'generic'} niche)`);

    const images: string[] = [];
    
    // Generate requested number of images
    for (let i = 0; i < Math.min(count, 4); i++) {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: fullPrompt + (count > 1 ? ` (Variation ${i + 1} of ${count})` : '')
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        images.push(imageUrl);
        console.log(`Generated image ${i + 1}/${count} successfully`);
      }
    }

    if (images.length === 0) {
      throw new Error('No images generated');
    }

    return new Response(
      JSON.stringify({ 
        images,
        imageUrl: images[0], // For backwards compatibility
        count: images.length,
        niche,
        imageType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate niche image error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
