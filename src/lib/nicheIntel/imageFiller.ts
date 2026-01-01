// ============= Safe Image Auto-Fill =============
// Fills images using legal sources (static, stock, AI) - NEVER competitor assets

import { SiteSpec, SiteSection } from '@/types/site-spec';
import { 
  BusinessBrief, 
  PatternPack, 
  ImageFillOptions, 
  FilledImage,
  ImageSlotBlueprint,
  NicheCategory,
} from './types';

// ============= STATIC IMAGE LIBRARY =============
// Curated placeholders by category (using gradient backgrounds and Unsplash)
const STATIC_IMAGES: Record<string, Record<string, string[]>> = {
  // Service businesses
  service_business: {
    hero: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&h=900&fit=crop', // professional tools
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop', // construction
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1600&h=900&fit=crop', // home service
    ],
    feature: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    ],
  },
  // Booking businesses
  booking_business: {
    hero: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&h=900&fit=crop', // spa/wellness
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=900&fit=crop', // gym
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop', // salon
    ],
    feature: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
    ],
  },
  // Product stores
  product_store: {
    hero: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop', // retail
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=900&fit=crop', // shopping
    ],
    product: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop',
    ],
  },
  // SaaS
  saas: {
    hero: [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&h=900&fit=crop', // office tech
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop', // dashboard
    ],
    feature: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    ],
  },
  // Portfolio
  portfolio: {
    hero: [
      'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1600&h=900&fit=crop', // creative
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1600&h=900&fit=crop', // design
    ],
    work: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop',
    ],
  },
  // Nonprofit
  nonprofit: {
    hero: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&h=900&fit=crop', // community
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&h=900&fit=crop', // helping
    ],
    feature: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop',
    ],
  },
};

// Niche-specific images
const NICHE_IMAGES: Partial<Record<NicheCategory, Record<string, string[]>>> = {
  plumber: {
    hero: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1600&h=900&fit=crop',
    ],
  },
  fitness_gym: {
    hero: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=900&fit=crop',
    ],
  },
  yoga_studio: {
    hero: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&h=900&fit=crop',
    ],
  },
  salon: {
    hero: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1600&h=900&fit=crop',
    ],
  },
  restaurant: {
    hero: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&h=900&fit=crop',
    ],
  },
  dental: {
    hero: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&h=900&fit=crop',
    ],
  },
  law_firm: {
    hero: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1600&h=900&fit=crop',
    ],
  },
  real_estate: {
    hero: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop',
    ],
  },
  photography: {
    hero: [
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&h=900&fit=crop',
    ],
  },
  jewelry_store: {
    hero: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&h=900&fit=crop',
    ],
  },
};

// Gradient backgrounds as fallback
const GRADIENT_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

// ============= IMAGE SELECTION =============

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getStaticImage(
  intent: string,
  imageRole: string,
  nicheCategory?: NicheCategory
): string {
  // Try niche-specific first
  if (nicheCategory && NICHE_IMAGES[nicheCategory]) {
    const nicheImages = NICHE_IMAGES[nicheCategory]!;
    const roleKey = imageRole === 'hero_background' ? 'hero' : imageRole;
    if (nicheImages[roleKey]?.length) {
      return getRandomItem(nicheImages[roleKey]);
    }
  }
  
  // Fall back to intent-based
  const intentImages = STATIC_IMAGES[intent];
  if (intentImages) {
    const roleKey = imageRole === 'hero_background' ? 'hero' : 
                    imageRole === 'product_image' ? 'product' :
                    imageRole === 'portfolio_item' ? 'work' :
                    'feature';
    if (intentImages[roleKey]?.length) {
      return getRandomItem(intentImages[roleKey]);
    }
    // Fallback to hero
    if (intentImages.hero?.length) {
      return getRandomItem(intentImages.hero);
    }
  }
  
  // Last resort: gradient
  return getRandomItem(GRADIENT_BACKGROUNDS);
}

// ============= MAIN FILL FUNCTION =============

export function fillImages(
  spec: SiteSpec,
  brief: BusinessBrief,
  pack: PatternPack,
  options: ImageFillOptions = { mode: 'static' }
): { filledSpec: SiteSpec; filledImages: FilledImage[] } {
  const filledImages: FilledImage[] = [];
  const filledSpec = JSON.parse(JSON.stringify(spec)) as SiteSpec;
  
  for (const page of filledSpec.pages || []) {
    for (const section of page.sections || []) {
      const content = section.content as any;
      
      // Fill hero background
      if (section.type === 'hero') {
        if (!content?.backgroundImage || isPlaceholderUrl(content.backgroundImage)) {
          const imageUrl = getStaticImage(brief.intent, 'hero_background', brief.nicheCategory);
          if (content) {
            content.backgroundImage = imageUrl;
          }
          filledImages.push({
            slotId: `${page.path}_hero_bg`,
            url: imageUrl,
            source: imageUrl.startsWith('linear-gradient') ? 'gradient' : 'static',
            alt: `${brief.businessName || brief.industry} hero image`,
          });
        }
      }
      
      // Fill gallery/portfolio items
      if (['gallery', 'portfolio'].includes(section.type)) {
        if (content?.items && Array.isArray(content.items)) {
          content.items = content.items.map((item: any, idx: number) => {
            if (!item.image || isPlaceholderUrl(item.image)) {
              const imageUrl = getStaticImage(
                brief.intent, 
                section.type === 'portfolio' ? 'portfolio_item' : 'gallery_item',
                brief.nicheCategory
              );
              filledImages.push({
                slotId: `${page.path}_${section.type}_${idx}`,
                url: imageUrl,
                source: 'static',
                alt: item.title || `${brief.industry} image ${idx + 1}`,
              });
              return { ...item, image: imageUrl };
            }
            return item;
          });
        }
      }
      
      // Fill team photos with placeholder avatars
      if (section.type === 'team') {
        if (content?.items && Array.isArray(content.items)) {
          content.items = content.items.map((item: any, idx: number) => {
            if (!item.image || isPlaceholderUrl(item.image)) {
              // Use UI avatars API for placeholder team photos
              const initial = (item.name || `Team ${idx + 1}`).charAt(0).toUpperCase();
              const colors = ['5D5FEF', '7C3AED', 'EC4899', '06B6D4', '10B981', 'F59E0B'];
              const color = colors[idx % colors.length];
              const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || `T${idx}`)}&size=200&background=${color}&color=fff&bold=true`;
              filledImages.push({
                slotId: `${page.path}_team_${idx}`,
                url: imageUrl,
                source: 'static',
                alt: item.name || `Team member ${idx + 1}`,
              });
              return { ...item, image: imageUrl };
            }
            return item;
          });
        }
      }
      
      // Fill service images
      if (section.type === 'services') {
        if (content?.items && Array.isArray(content.items)) {
          content.items = content.items.map((item: any, idx: number) => {
            if (item.image !== undefined && (!item.image || isPlaceholderUrl(item.image))) {
              const imageUrl = getStaticImage(brief.intent, 'service_image', brief.nicheCategory);
              filledImages.push({
                slotId: `${page.path}_service_${idx}`,
                url: imageUrl,
                source: 'static',
                alt: item.title || `Service ${idx + 1}`,
              });
              return { ...item, image: imageUrl };
            }
            return item;
          });
        }
      }
    }
  }
  
  return { filledSpec, filledImages };
}

// ============= HELPER FUNCTIONS =============

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  if (url.startsWith('GENERATE:')) return true;
  if (url.includes('placeholder')) return true;
  if (url.includes('via.placeholder')) return true;
  if (url.includes('placehold.co')) return true;
  return false;
}

// ============= STOCK API STUB =============
// This would integrate with a stock photo API if configured

export async function fillImagesFromStock(
  spec: SiteSpec,
  brief: BusinessBrief,
  pack: PatternPack,
  apiKey?: string
): Promise<{ filledSpec: SiteSpec; filledImages: FilledImage[] }> {
  // Stub: Fall back to static if no API key
  if (!apiKey) {
    console.log('[ImageFiller] No stock API key, falling back to static');
    return fillImages(spec, brief, pack, { mode: 'static' });
  }
  
  // TODO: Implement actual stock API integration
  // This would call Unsplash API, Pexels API, etc.
  console.log('[ImageFiller] Stock API integration not yet implemented');
  return fillImages(spec, brief, pack, { mode: 'static' });
}

// ============= AI IMAGE STUB =============
// This would integrate with AI image generation if configured

export async function fillImagesFromAI(
  spec: SiteSpec,
  brief: BusinessBrief,
  pack: PatternPack,
  generateFn?: (prompt: string) => Promise<string>
): Promise<{ filledSpec: SiteSpec; filledImages: FilledImage[] }> {
  // Stub: Fall back to static if no generator
  if (!generateFn) {
    console.log('[ImageFiller] No AI generator, falling back to static');
    return fillImages(spec, brief, pack, { mode: 'static' });
  }
  
  // TODO: Implement AI image generation
  console.log('[ImageFiller] AI image generation not yet implemented');
  return fillImages(spec, brief, pack, { mode: 'static' });
}
