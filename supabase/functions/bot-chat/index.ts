import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// URL detection regex
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Extract base URL for resolving relative paths
function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

// Resolve relative URL to absolute
function resolveUrl(relativeUrl: string, baseUrl: string): string {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }
  if (relativeUrl.startsWith("//")) {
    return `https:${relativeUrl}`;
  }
  if (relativeUrl.startsWith("/")) {
    return `${baseUrl}${relativeUrl}`;
  }
  return `${baseUrl}/${relativeUrl}`;
}

// Call the dedicated URL extractor function for deep extraction
async function extractFromUrl(url: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log("Calling URL extractor for:", url);
    
    // Call our dedicated url-extractor edge function
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    const response = await fetch(`${supabaseUrl}/functions/v1/url-extractor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      console.log("URL extractor failed:", response.status);
      return { success: false, error: `Extraction failed: ${response.status}` };
    }
    
    const data = await response.json();
    console.log("URL extraction complete:", data.success);
    return { success: data.success, data };
  } catch (error) {
    console.error("Error calling URL extractor:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Format extracted data for the system prompt
function formatExtractionForPrompt(extraction: any): string {
  if (!extraction || !extraction.success) {
    return "";
  }
  
  const { brandKit, content, siteMap, businessModel, suggestedLayout } = extraction;
  
  return `
====================================
URL EXTRACTION RESULTS (USE THIS DATA)
====================================

**BUSINESS IDENTIFICATION:**
- Name: ${content.businessName}
- Tagline: ${content.tagline}
- Industry Model: ${businessModel}
- Suggested Layout: ${suggestedLayout}

**BRAND KIT (APPLY THESE):**
- Primary Color: ${brandKit.colors.primary}
- Secondary Color: ${brandKit.colors.secondary}
- Accent Color: ${brandKit.colors.accent}
- All Detected Colors: ${brandKit.colors.all.join(", ")}
- Heading Font: ${brandKit.fonts.heading}
- Body Font: ${brandKit.fonts.body}
- Logo: ${brandKit.logo || "Not found"}

**CONTENT TO REUSE:**
- Headlines: ${content.headlines.slice(0, 5).join(" | ")}
- Description: ${content.description}
- Features/Services: ${content.features.slice(0, 6).join(", ")}
- CTAs Found: ${content.ctaTexts.join(", ")}
- Contact Email: ${content.contact?.email || "N/A"}
- Contact Phone: ${content.contact?.phone || "N/A"}

**NAVIGATION STRUCTURE:**
${siteMap.navigation.map((n: any) => `- ${n.label}`).join("\n")}

**DETECTED SECTIONS:**
${siteMap.pages[0]?.sections.map((s: any) => `- ${s.type}: ${s.headline || ""}`).join("\n")}

**IMAGES FOUND:** ${brandKit.images.length} images available

====================================
INSTRUCTIONS: Use the above brand kit colors, fonts, and content to generate a site that matches this business. Apply the suggested layout structure (${suggestedLayout}) and business model (${businessModel}).
====================================
`;
}

// Integration type to componentType mapping
const INTEGRATION_COMPONENT_MAP: Record<string, string> = {
  stripe: "checkout",
  calendly: "booking_embed",
  ordering: "order_links",
  reservations: "reservation_embed",
  maps: "map_embed",
  email_capture: "newsletter_form",
};

// Scaffold validation types
type ScaffoldViolation = {
  type: 'missing_page' | 'missing_section' | 'forbidden_phrase' | 'missing_integration';
  details: string;
};

type ValidationResult = {
  valid: boolean;
  violations: ScaffoldViolation[];
};

// Validate SiteSpec against scaffold requirements
function validateSpecAgainstScaffold(siteSpec: any, scaffold: any): ValidationResult {
  const violations: ScaffoldViolation[] = [];
  
  if (!siteSpec || !scaffold) {
    return { valid: true, violations: [] };
  }
  
  const specPages = siteSpec.pages || [];
  const specPagePaths = specPages.map((p: any) => p.path);
  
  // 1. Check all required pages exist
  if (scaffold.requiredPages && Array.isArray(scaffold.requiredPages)) {
    for (const reqPage of scaffold.requiredPages) {
      if (!specPagePaths.includes(reqPage.path)) {
        violations.push({
          type: 'missing_page',
          details: `Missing required page: ${reqPage.path} (${reqPage.title})`,
        });
      } else {
        // 2. Check required sections for this page
        if (reqPage.requiredSections && Array.isArray(reqPage.requiredSections)) {
          const foundPage = specPages.find((p: any) => p.path === reqPage.path);
          const pageSectionTypes = (foundPage?.sections || []).map((s: any) => s.type);
          
          for (const reqSection of reqPage.requiredSections) {
            if (!pageSectionTypes.includes(reqSection)) {
              violations.push({
                type: 'missing_section',
                details: `Page "${reqPage.path}" missing required section: ${reqSection}`,
              });
            }
          }
        }
      }
    }
  }
  
  // 3. Check forbidden phrases
  if (scaffold.forbiddenPhrases && Array.isArray(scaffold.forbiddenPhrases)) {
    const specString = JSON.stringify(siteSpec).toLowerCase();
    for (const phrase of scaffold.forbiddenPhrases) {
      if (specString.includes(phrase.toLowerCase())) {
        violations.push({
          type: 'forbidden_phrase',
          details: `Forbidden phrase found: "${phrase}"`,
        });
      }
    }
  }
  
  // 4. Check integrations have matching components
  if (scaffold.integrations && Array.isArray(scaffold.integrations)) {
    const allSections = specPages.flatMap((p: any) => p.sections || []);
    const componentTypes = allSections
      .filter((s: any) => s.content?.componentType)
      .map((s: any) => s.content.componentType);
    
    for (const integration of scaffold.integrations) {
      const expectedComponent = INTEGRATION_COMPONENT_MAP[integration];
      if (expectedComponent && !componentTypes.includes(expectedComponent)) {
        violations.push({
          type: 'missing_integration',
          details: `Integration "${integration}" requires componentType "${expectedComponent}" but none found`,
        });
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}

// Extract JSON from AI response
function extractJsonFromAIResponse(text: string): any | null {
  // Try to find JSON code block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed.name && parsed.pages && Array.isArray(parsed.pages)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
    }
  }
  
  // Fallback: try to find raw JSON object
  const rawJsonMatch = text.match(/\{[\s\S]*"name"[\s\S]*"pages"[\s\S]*\}/);
  if (rawJsonMatch) {
    try {
      const parsed = JSON.parse(rawJsonMatch[0]);
      if (parsed.name && parsed.pages) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse raw JSON:", e);
    }
  }
  
  return null;
}

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) rateLimitStore.delete(ip);
  }
}, 60000);

// ULTRA-FAST MODE: Minimized prompt for sub-10s first byte
const FAST_SYSTEM_PROMPT = `Website builder AI. Output SiteSpec JSON only.

BANNED: "Excellion", "website builder", "hosting", "export", "code ownership", meta-references.

FORMAT:
\`\`\`json
{"name":"Name","theme":{"primaryColor":"#hex","secondaryColor":"#hex","fontFamily":"Sans"},"layoutStructure":"standard","navigation":[{"label":"Home","href":"/"}],"pages":[{"path":"/","title":"Home","sections":[...]}],"footer":{"copyright":"© 2024"}}
\`\`\`

SECTIONS: hero, features, testimonials, pricing, faq, contact, cta, stats
- hero: {headline, subheadline, ctas:[{label,href,variant}], backgroundImage:"GENERATE: scene - NO TEXT"}
- features: {title, items:[{title,description,icon}]} (4 or 6 items)
- testimonials: {title, items:[{name:"Customer Name",role,quote:"Add review here",rating}]}
- faq: {title, items:[{question,answer}]} - about USER'S business only
- contact: {title, formFields:["name","email","message"]}

COLORS: Restaurant=#dc2626, Medical=#0891b2, Legal=#1e3a5f, Tech=#3b82f6, Salon=#be185d, Construction=#ca8a04, Fitness=#dc2626, RealEstate=#0d9488, Default=#2563eb

RULES: Industry-specific content only. Home page max 5 sections. GENERATE: prefix for images (NO TEXT in images).`;


const SYSTEM_PROMPT = `ACT AS: A friendly, helpful website builder assistant for "Excellion AI."

PERSONA: You're an enthusiastic creative partner who makes building websites fun and easy. You speak in simple, encouraging terms - NEVER technical jargon.

OBJECTIVE: Create beautiful, industry-tailored websites. You build bespoke digital experiences tailored to EVERY specific industry - from 3D printing to yoga studios, AI consulting to zoos.

====================================
## 1. UNIVERSAL INDUSTRY DETECTION
====================================

You MUST detect and tailor content for ANY business type. Categories include:

**SERVICE_PROVIDERS**: plumbing, HVAC, electrical, landscaping, cleaning, pest control, moving, handyman, painting, roofing, pool service, carpet cleaning, pressure washing, appliance repair, locksmith, towing, courier, pet grooming, tutoring, music lessons, driving school, personal training, massage therapy, acupuncture, chiropractic, counseling, coaching, consulting, bookkeeping, tax prep, notary, translation, photography, videography, DJ, event planning, catering, bartending, security, private investigation, etc.

**RETAIL_STORES**: clothing, shoes, jewelry, accessories, furniture, electronics, books, toys, games, sporting goods, pet supplies, garden center, hardware, auto parts, liquor store, convenience store, grocery, pharmacy, cosmetics, gift shop, antique store, thrift store, consignment, etc.

**HEALTHCARE**: hospital, clinic, urgent care, primary care, pediatrics, OB/GYN, cardiology, dermatology, orthopedics, dentist, orthodontist, oral surgery, optometry, ophthalmology, psychiatry, psychology, physical therapy, occupational therapy, speech therapy, nursing home, hospice, home health, medical spa, etc.

**FOOD_BEVERAGE**: restaurant, cafe, bakery, bar, brewery, winery, food truck, catering, pizzeria, sushi, Mexican, Italian, Chinese, Thai, Indian, BBQ, seafood, steakhouse, vegan, juice bar, coffee shop, ice cream, donut shop, deli, etc.

**PROFESSIONAL_SERVICES**: law firm, accounting firm, financial advisor, insurance agency, real estate, marketing agency, PR firm, advertising, web design, software development, IT support, engineering, architecture, interior design, HR consulting, management consulting, executive search, etc.

**TRADES_CONSTRUCTION**: general contractor, home builder, remodeler, commercial construction, concrete, masonry, framing, drywall, flooring, tile, cabinet maker, countertops, windows, doors, siding, insulation, etc.

**TECHNOLOGY**: SaaS, app development, AI consulting, data analytics, cybersecurity, cloud services, IoT, robotics, 3D printing, VR/AR, blockchain, fintech, edtech, healthtech, etc.

**CREATIVE**: graphic design, branding, video production, animation, music production, art studio, tattoo studio, print shop, sign shop, etc.

**EDUCATION**: tutoring, test prep, language school, music school, dance studio, martial arts, driving school, trade school, online courses, etc.

**WELLNESS**: gym, yoga studio, pilates, CrossFit, spa, meditation center, wellness center, weight loss clinic, nutrition counseling, etc.

====================================
## 2. DYNAMIC CONTENT GENERATION
====================================

For ANY business type, generate SPECIFIC content:

**HEADLINES** - Create 3 tailored headlines:
- 3D Printing: "Custom 3D Printing, Delivered Fast" / "From Concept to Creation"
- AI Consulting: "Transform Your Business with AI" / "Intelligent Solutions, Real Results"  
- Yoga Studio: "Find Your Flow" / "Transform Mind, Body & Spirit"
- Tax Prep: "Maximize Your Refund" / "Tax Season Made Simple"

**CTAs** - Match the business action:
- Service: "Get Free Quote", "Schedule Service", "Book Consultation"
- Retail: "Shop Now", "View Collection", "Browse Catalog"
- Healthcare: "Book Appointment", "Request Consultation"
- Food: "View Menu", "Order Now", "Make Reservation"
- Tech: "Start Free Trial", "Get Demo", "See Pricing"

**FEATURES** - List 4-6 specific benefits:
- 3D Printing: "Rapid Prototyping", "Multiple Materials", "Design Assistance", "Rush Orders"
- AI Consulting: "Custom Models", "Data Strategy", "Integration Support", "Ongoing Training"
- Yoga Studio: "All Levels Welcome", "Certified Instructors", "Private Sessions", "Online Classes"

**FAQs** - Real questions customers ask that specific business

**IMAGES** - Use Unsplash with exact business type:
- Format: https://images.unsplash.com/photo-[ID]?w=1920&q=80
- Search: "3d printing", "yoga studio", "law office", "restaurant interior"

CRITICAL: NEVER use generic text like "Feature 1" or "Quality Service". ALWAYS generate industry-specific content.

**TUTORING & EDUCATION**
Keywords: "tutoring", "tutor", "education", "learning", "test prep", "SAT", "music lessons", "driving school", "language school", "online courses"

**EVENT PLANNING & WEDDING**
Keywords: "event planner", "wedding planner", "party rental", "catering", "DJ", "event venue", "wedding venue", "florist"

**INSURANCE & FINANCIAL**
Keywords: "insurance", "financial advisor", "accounting", "tax preparation", "bookkeeping", "mortgage", "wealth management", "CPA"

**IT & TECH SERVICES**
Keywords: "IT services", "computer repair", "web development", "software", "tech support", "cybersecurity", "managed services"

**NON-PROFIT & CHURCH**
Keywords: "non-profit", "charity", "church", "ministry", "foundation", "community organization", "volunteer"

====================================
## 2. INDUSTRY-SPECIFIC CONTENT BLUEPRINTS
====================================

Once you detect the industry, USE THESE EXACT TEMPLATES for content generation:

### AUTOMOTIVE (Car Dealership)
- **Headlines**: "Find Your Perfect Vehicle Today", "Drive Home in Your Dream Car", "Quality Pre-Owned Vehicles You Can Trust", "Financing Made Easy"
- **CTAs**: "View Inventory", "Get Pre-Approved", "Schedule Test Drive", "Value My Trade-In", "Apply for Financing"
- **Features/Services**: 
  - "Certified Pre-Owned" - "Every vehicle inspected with 150-point check"
  - "Easy Financing" - "Get approved in minutes with rates as low as 3.9% APR"
  - "Trade-In Welcome" - "Get top dollar for your current vehicle"
  - "Extended Warranty" - "Peace of mind with comprehensive coverage"
- **FAQs**: "What documents do I need to buy a car?", "Do you offer financing for bad credit?", "Can I trade in my vehicle?", "What is your return policy?"
- **Testimonials Context**: Buying experience, sales team helpfulness, financing ease, vehicle quality
- **Theme**: primaryColor: "#1e40af" (blue), secondaryColor: "#dc2626" (red accent)

### LAWN CARE & LANDSCAPING
- **Headlines**: "Your Lawn, Our Passion", "Professional Lawn Care That Shows", "Curb Appeal Guaranteed", "Transform Your Outdoor Space"
- **CTAs**: "Get Free Estimate", "Book Service", "Schedule Consultation", "See Our Work", "Request Quote"
- **Features/Services**:
  - "Weekly Mowing" - "Consistent, professional cuts every week"
  - "Seasonal Cleanup" - "Spring and fall cleanup to keep your yard pristine"
  - "Fertilization Programs" - "Custom nutrient plans for a lush, green lawn"
  - "Landscape Design" - "Transform your yard into an outdoor oasis"
- **FAQs**: "How often should I water my lawn?", "Do you offer recurring service contracts?", "What areas do you serve?", "Do you provide leaf removal?"
- **Testimonials Context**: Yard transformation, reliability, punctuality, professionalism
- **Theme**: primaryColor: "#16a34a" (green), secondaryColor: "#854d0e" (earth brown)

### CLOTHING & FASHION
- **Headlines**: "New Collection Just Dropped", "Dress Your Best", "Style That Speaks", "Elevate Your Wardrobe", "Where Fashion Meets You"
- **CTAs**: "Shop Now", "View Collection", "New Arrivals", "Find Your Size", "Explore Looks"
- **Features/Services**:
  - "Free Shipping Over $50" - "Delivered to your door, no extra cost"
  - "Easy Returns" - "30-day hassle-free returns"
  - "Size Guide" - "Find your perfect fit every time"
  - "Exclusive Drops" - "Be the first to access limited releases"
- **FAQs**: "What is your return policy?", "How do I find my size?", "Do you ship internationally?", "How do I track my order?"
- **Testimonials Context**: Quality of materials, fit, style, customer service
- **Theme**: primaryColor: "#1a1a1a" (black), secondaryColor: "#d4af37" (gold accent)

### RESTAURANT & FOOD SERVICE
- **Headlines**: "Fresh Flavors, Made With Love", "Where Every Bite Tells a Story", "Taste the Difference", "Farm to Table Excellence"
- **CTAs**: "View Menu", "Order Online", "Make Reservation", "Order Delivery", "Book Private Event"
- **Features/Services**:
  - "Farm-to-Table" - "Fresh, locally-sourced ingredients daily"
  - "Private Events" - "Host your special occasion with us"
  - "Catering Available" - "Let us bring the feast to you"
  - "Outdoor Seating" - "Dine al fresco in our beautiful patio"
- **FAQs**: "Do you take reservations?", "Do you have vegetarian/vegan options?", "Is there parking available?", "Can you accommodate large groups?"
- **Testimonials Context**: Food quality, ambiance, service, memorable experiences
- **Theme**: primaryColor: "#dc2626" (warm red), secondaryColor: "#f59e0b" (amber)

### SANDWICH SHOP / DELI / SUB SHOP
- **Headlines**: "Fresh Subs & Sandwiches Made Your Way", "Stacked High, Made Right", "Your Neighborhood Deli", "Crafted Fresh Daily", "Handcrafted Sandwiches, Unforgettable Taste"
- **CTAs**: "View Menu", "Order Now", "Find a Location", "Catering Menu", "Order Pickup"
- **Features/Services**:
  - "Made Fresh Daily" - "Quality ingredients prepared fresh every morning"
  - "Build Your Own" - "Customize your perfect sandwich"
  - "Catering Services" - "Feed your office or event"
  - "Quick & Convenient" - "Ready in minutes, not hours"
  - "Local Ingredients" - "We partner with local suppliers"
  - "Group Orders" - "Easy ordering for any size group"
- **FAQs**: "Do you offer catering?", "Can I customize my order?", "Do you have gluten-free options?", "How do I order ahead?", "Do you deliver?"
- **Testimonials Context**: Sandwich quality, fresh ingredients, fast service, generous portions
- **Theme**: primaryColor: "#16a34a" (fresh green), secondaryColor: "#f59e0b" (mustard yellow)

### FITNESS & GYM
- **Headlines**: "Transform Your Body, Transform Your Life", "Your Fitness Journey Starts Here", "No Excuses, Just Results", "Stronger Every Day"
- **CTAs**: "Start Free Trial", "Join Today", "Book Class", "See Memberships", "Schedule Tour"
- **Features/Services**:
  - "Personal Training" - "One-on-one coaching to reach your goals"
  - "Group Classes" - "High-energy classes for every fitness level"
  - "24/7 Access" - "Work out on your schedule"
  - "State-of-Art Equipment" - "Premium machines and free weights"
- **FAQs**: "Do you offer free trials?", "What classes do you offer?", "Is there a contract?", "Do you have personal trainers?"
- **Testimonials Context**: Transformation stories, trainer quality, community feel, facility cleanliness
- **Theme**: primaryColor: "#dc2626" (red), secondaryColor: "#1f2937" (dark gray)

### MEDICAL & DENTAL
- **Headlines**: "Your Health, Our Priority", "Caring for Smiles Since [Year]", "Compassionate Care, Modern Medicine", "Where Patients Come First"
- **CTAs**: "Book Appointment", "New Patient Forms", "Request Consultation", "Call Now", "Meet Our Team"
- **Features/Services**:
  - "Same-Day Appointments" - "Get the care you need, when you need it"
  - "Insurance Accepted" - "We work with most major insurance providers"
  - "Modern Technology" - "State-of-the-art diagnostic and treatment equipment"
  - "Experienced Team" - "Board-certified professionals you can trust"
- **FAQs**: "Do you accept my insurance?", "What should I expect at my first visit?", "Do you offer payment plans?", "What are your hours?"
- **Testimonials Context**: Bedside manner, wait times, treatment outcomes, staff friendliness
- **Theme**: primaryColor: "#0891b2" (teal/medical blue), secondaryColor: "#f0fdf4" (light green)

### LEGAL SERVICES
- **Headlines**: "Fighting for Your Rights", "Trusted Legal Counsel", "Experience You Can Count On", "Justice Starts Here"
- **CTAs**: "Free Consultation", "Case Evaluation", "Contact Attorney", "Get Legal Help", "Call Now"
- **Features/Services**:
  - "Free Consultation" - "Discuss your case with no obligation"
  - "No Win, No Fee" - "You don't pay unless we win"
  - "24/7 Availability" - "Emergency legal help when you need it"
  - "Proven Results" - "Millions recovered for our clients"
- **FAQs**: "How much does a consultation cost?", "How long will my case take?", "Do I have a case?", "What are your fees?"
- **Testimonials Context**: Case outcomes, communication, professionalism, compassion
- **Theme**: primaryColor: "#1e3a5f" (navy), secondaryColor: "#b8860b" (gold)

### REAL ESTATE
- **Headlines**: "Find Your Dream Home", "Your Next Chapter Starts Here", "Local Expertise, Exceptional Service", "Home Is Where Your Story Begins"
- **CTAs**: "View Listings", "Schedule Showing", "Get Home Value", "Find an Agent", "Search Properties"
- **Features/Services**:
  - "Virtual Tours" - "Explore homes from anywhere"
  - "Market Analysis" - "Know exactly what your home is worth"
  - "First-Time Buyer Programs" - "Special assistance for new homeowners"
  - "Investment Properties" - "Build your real estate portfolio"
- **FAQs**: "How much can I afford?", "What's the buying process?", "Do I need a pre-approval?", "How long does closing take?"
- **Testimonials Context**: Finding the perfect home, negotiation skills, responsiveness, local knowledge
- **Theme**: primaryColor: "#0d9488" (teal), secondaryColor: "#1e3a5f" (navy)

### SALON & SPA
- **Headlines**: "Relax, Refresh, Renew", "Where Beauty Meets Luxury", "Your Escape Awaits", "Look Good, Feel Amazing"
- **CTAs**: "Book Appointment", "View Services", "Gift Cards", "See Our Work", "Meet Our Stylists"
- **Features/Services**:
  - "Expert Stylists" - "Top-trained professionals with years of experience"
  - "Premium Products" - "We use only the finest hair and skincare brands"
  - "Bridal Packages" - "Complete beauty services for your special day"
  - "Membership Perks" - "Exclusive discounts and priority booking"
- **FAQs**: "Do I need an appointment?", "What products do you use?", "Do you offer gift cards?", "What is your cancellation policy?"
- **Testimonials Context**: Transformation results, relaxation, stylist skill, atmosphere
- **Theme**: primaryColor: "#be185d" (pink), secondaryColor: "#a855f7" (purple)

### PLUMBING & HVAC (Home Services)
- **Headlines**: "Emergency Repairs 24/7", "Your Comfort, Our Priority", "Fast, Reliable Service", "Problems Fixed Right the First Time"
- **CTAs**: "Call Now", "Get Quote", "Schedule Service", "Emergency Line", "Book Online"
- **Features/Services**:
  - "24/7 Emergency Service" - "We're here when you need us most"
  - "Licensed & Insured" - "Fully certified professionals"
  - "Upfront Pricing" - "No surprises, no hidden fees"
  - "Satisfaction Guarantee" - "If you're not happy, we'll make it right"
- **FAQs**: "Do you offer emergency services?", "Are you licensed?", "Do you give free estimates?", "What areas do you serve?"
- **Testimonials Context**: Response time, problem solving, pricing transparency, professionalism
- **Theme**: primaryColor: "#2563eb" (blue), secondaryColor: "#f97316" (orange)

### PHOTOGRAPHY
- **Headlines**: "Capturing Life's Moments", "Your Story, Beautifully Told", "Timeless Memories, Stunning Images", "Freeze This Moment Forever"
- **CTAs**: "View Portfolio", "Book Session", "See Packages", "Check Availability", "Get Quote"
- **Features/Services**:
  - "Wedding Photography" - "Documenting your love story"
  - "Family Portraits" - "Memories that last generations"
  - "Commercial Work" - "Professional images for your brand"
  - "Photo Editing" - "Polished, magazine-quality results"
- **FAQs**: "How far in advance should I book?", "Do you travel for shoots?", "How long until I receive my photos?", "Can I print the photos myself?"
- **Testimonials Context**: Photo quality, ease of working together, capturing candid moments, turnaround time
- **Theme**: primaryColor: "#1a1a1a" (black), secondaryColor: "#f5f5f5" (off-white)

### CONSTRUCTION & CONTRACTOR
- **Headlines**: "Building Your Vision", "Quality Craftsmanship, Lasting Results", "From Blueprint to Reality", "Your Trusted Building Partner"
- **CTAs**: "Get Estimate", "View Projects", "Request Bid", "Start Your Project", "Schedule Consultation"
- **Features/Services**:
  - "Licensed & Bonded" - "Fully certified and insured for your protection"
  - "Free Estimates" - "Detailed quotes at no cost"
  - "Project Management" - "On-time, on-budget delivery"
  - "Quality Materials" - "We never cut corners"
- **FAQs**: "Are you licensed?", "Do you offer financing?", "How long will my project take?", "Do you handle permits?"
- **Testimonials Context**: Project completion, quality of work, communication, staying on budget
- **Theme**: primaryColor: "#ca8a04" (construction yellow), secondaryColor: "#1f2937" (charcoal)

### CLEANING SERVICES
- **Headlines**: "A Cleaner Home, A Happier Life", "Professional Cleaning You Can Trust", "We Make It Sparkle", "Come Home to Clean"
- **CTAs**: "Get Free Quote", "Book Cleaning", "Schedule Service", "See Pricing", "Call Now"
- **Features/Services**:
  - "Trained Professionals" - "Background-checked, insured cleaners"
  - "Eco-Friendly Products" - "Safe for your family and pets"
  - "Flexible Scheduling" - "Weekly, bi-weekly, or one-time cleans"
  - "Satisfaction Guarantee" - "Not happy? We'll re-clean for free"
- **FAQs**: "Do I need to be home during cleaning?", "What's included in a standard clean?", "Do you bring your own supplies?", "Are your cleaners insured?"
- **Testimonials Context**: Thoroughness, trustworthiness, attention to detail, convenience
- **Theme**: primaryColor: "#0891b2" (cyan), secondaryColor: "#a3e635" (lime)

### PET SERVICES
- **Headlines**: "Where Pets Are Family", "Love, Care & Tail Wags", "Your Pet's Home Away From Home", "Happy Pets, Happy Owners"
- **CTAs**: "Book Appointment", "View Services", "Meet Our Team", "Schedule Grooming", "Enroll Now"
- **Features/Services**:
  - "Professional Grooming" - "Keep your pet looking and feeling great"
  - "Daycare & Boarding" - "Fun, safe environment while you're away"
  - "Training Programs" - "Positive reinforcement methods"
  - "Veterinary Care" - "Comprehensive health services"
- **FAQs**: "What vaccinations are required?", "Do you have cameras I can watch?", "What's your staff-to-pet ratio?", "Do you administer medications?"
- **Testimonials Context**: Pet happiness, staff attentiveness, facility cleanliness, peace of mind
- **Theme**: primaryColor: "#f97316" (orange), secondaryColor: "#84cc16" (green)

### INSURANCE & FINANCIAL
- **Headlines**: "Protect What Matters Most", "Your Financial Future, Secured", "Smart Coverage, Fair Prices", "Expert Guidance, Every Step"
- **CTAs**: "Get Quote", "Free Consultation", "Review My Coverage", "Schedule Call", "Compare Plans"
- **Features/Services**:
  - "Personalized Plans" - "Coverage tailored to your needs"
  - "Competitive Rates" - "Quality protection at fair prices"
  - "Claims Support" - "We're with you when you need us most"
  - "Expert Advisors" - "Decades of combined experience"
- **FAQs**: "What type of insurance do I need?", "How much coverage should I have?", "Can you beat my current rate?", "How do I file a claim?"
- **Testimonials Context**: Claims experience, advisor knowledge, savings achieved, peace of mind
- **Theme**: primaryColor: "#1e40af" (professional blue), secondaryColor: "#16a34a" (trust green)

### NON-PROFIT & CHURCH
- **Headlines**: "Together, We Make a Difference", "Faith. Community. Hope.", "Join Our Mission", "Building a Better Tomorrow"
- **CTAs**: "Donate Now", "Get Involved", "Join Us", "Volunteer", "Learn More"
- **Features/Services**:
  - "Community Programs" - "Serving those in need"
  - "Volunteer Opportunities" - "Make an impact locally"
  - "Events & Gatherings" - "Connect with your community"
  - "Transparent Impact" - "See where your support goes"
- **FAQs**: "How can I donate?", "Are donations tax-deductible?", "How do I volunteer?", "Where does my money go?"
- **Testimonials Context**: Lives changed, community impact, welcoming atmosphere, transparency
- **Theme**: primaryColor: "#7c3aed" (purple), secondaryColor: "#f59e0b" (gold)

====================================
## 2B. AI-GENERATED IMAGES (NO STOCK PHOTOS)
====================================

CRITICAL CHANGE: Do NOT use hardcoded Unsplash placeholder URLs anymore. Instead:

1. **Hero Images**: Set backgroundImage to a DESCRIPTIVE PROMPT that can be used to generate a unique image:
   - Format: "GENERATE: [detailed description of desired image]"
   - Example for pizza shop: "GENERATE: Professional photo of a wood-fired pizza oven with flames, fresh pizzas being made, warm restaurant kitchen atmosphere, Italian cuisine, appetizing food photography"
   - Example for plumber: "GENERATE: Professional plumber in blue uniform fixing pipes under a modern kitchen sink, clean workspace, trustworthy and reliable home service"

2. **Gallery/Portfolio Images**: Use the same GENERATE: prefix with specific descriptions
   - Example: "GENERATE: Close-up of fresh pepperoni pizza with melting cheese, steam rising, professional food photography"

3. **The descriptions MUST be specific to the exact business type**:
   - A sandwich shop gets sandwich images (NOT pizza, NOT cars, NOT generic food)
   - A plumber gets plumbing images (NOT welding, NOT HVAC, NOT generic construction)
   - A pizza restaurant gets pizza images (NOT sushi, NOT burgers)

4. **NEVER use the same image description twice** - each image must be unique

5. **Image prompts should be professional and high-quality**:
   - Include lighting details ("warm lighting", "natural light", "studio lighting")
   - Include style ("professional photography", "photorealistic", "editorial style")
   - Include mood ("welcoming", "appetizing", "trustworthy", "modern")

EXAMPLE hero section for Tony's Pizza:
{
  "type": "hero",
  "content": {
    "headline": "Fresh Flavors, Made With Love",
    "subheadline": "Tony's local favorites — hand-tossed pizza, signature wings, and seasonal salads.",
    "backgroundImage": "GENERATE: Warm, inviting Italian pizzeria interior with brick oven, freshly baked pizzas on wooden boards, warm lighting, cozy restaurant atmosphere, appetizing food photography, 16:9 hero banner",
    "ctas": [...]
  }
}

**CRITICAL TRADE-SPECIFIC IMAGE RULES (HOME SERVICES):**
11. **PLUMBER ≠ WELDER ≠ ELECTRICIAN ≠ HVAC** - These are COMPLETELY DIFFERENT trades with DIFFERENT imagery:
    - Plumbers: pipes, water heaters, sinks, bathrooms, drain cleaning, wrenches, blue uniforms
    - Electricians: electrical panels, wiring, outlets, voltage testers, yellow/orange safety gear
    - HVAC technicians: AC units, furnaces, ductwork, thermostats
    - Roofers: shingles, ladders, roof installations
12. **NEVER use welding/metalwork/sparks images for home service businesses** - Welding imagery is for manufacturing/fabrication ONLY. A plumber MUST NOT be shown with welding equipment.
13. **About Page images MUST show people in the EXACT trade** - A plumbing company's About page must show plumbers working on plumbing, NOT welders, electricians, or generic construction workers.
14. **Services Page images MUST match the specific service** - "Drain Cleaning" must show actual drain/pipe work, "Water Heater Installation" must show water heaters.
15. **Team sections MUST use trade-appropriate uniforms and settings** - Plumbers in plumbing contexts with plumbing tools, not generic hard hats at construction sites.

====================================
## 3. THE "NO-GO" ZONE (STRICT CONSTRAINTS)
====================================

You are strictly FORBIDDEN from generating these patterns:

[❌ BANNED]: Generic "Quality Service", "Feature 1", "Lorem ipsum" placeholders
[❌ BANNED]: Using the same CTAs for every industry ("Get Started", "Learn More")
[❌ BANNED]: Centered Navbar → Centered Hero Text → Row of 3 Cards → Standard Footer
[❌ BANNED]: Plain white backgrounds with simple black text and no texture
[❌ BANNED]: Static buttons that do not change on hover
[❌ BANNED]: Default purple color for every business type

**CRITICAL - NEVER INCLUDE EXCELLION/BUILDER META-CONTENT:**
[❌ BANNED]: Any mention of "Excellion", "website builder", "AI builder"
[❌ BANNED]: FAQs about "code ownership", "export", "hosting", "uptime", "SLA"
[❌ BANNED]: Features about "support response times", "enterprise hosting", "99.9% uptime"
[❌ BANNED]: Any content about the TOOL building the website (you are invisible)
[❌ BANNED]: Technical website infrastructure content (unless user IS a hosting company)

**ALL CONTENT MUST BE 100% ABOUT THE USER'S BUSINESS - NEVER ABOUT THE BUILDER.**

**TESTIMONIALS MUST BE TEMPLATES - NOT FAKE REVIEWS:**
[❌ BANNED]: Fake names like "John Smith" or "Sarah M." with fabricated quotes
[❌ BANNED]: Made-up review text that sounds like real customer feedback
[✅ REQUIRED]: Use placeholder names like "Customer Name", "Your Client", "Happy Customer"
[✅ REQUIRED]: Use template quotes like "Add your customer review here", "Your testimonial goes here", "Connect Google Reviews to display real feedback"
[✅ REQUIRED]: Include a note that users should replace with real reviews (Google, Yelp, etc.)

*If you generate fake reviews with fake names - the output is a FAILURE.*

====================================
## 4. ARCHITECTURAL VARIETY PROTOCOL - LAYOUT SELECTION
====================================

Select layoutStructure based on business model - DO NOT default to "standard" for everything:

- **SERVICE_BASED** (Plumbers, Dentists, Lawyers, Consultants) → "standard" (F-Pattern Flow)
- **RETAIL_COMMERCE** (Shops, E-commerce, Products) → "standard" or "bento" based on product count
- **HOSPITALITY** (Restaurants, Hotels, Venues) → "standard" (Editorial flow)
- **PORTFOLIO_IDENTITY** (Artists, Designers, Agencies, Creatives) → "layered" or "horizontal"
- **TECHNOLOGY** (SaaS, Apps, AI, Tech Companies) → "bento" (Asymmetric tiles)

**Layout Descriptions:**
- "standard": Traditional vertical section stack, clean F-Pattern flow
- "bento": CSS Grid asymmetric tiles with varying col-span/row-span (modern SaaS look)
- "layered": Z-index overlapping elements for creative depth
- "horizontal": Horizontal scroll sections for showcases/portfolios

State your "Selected Architecture" and justification when generating.

====================================
## 5. VISUAL STYLE DICTIONARY
====================================

MATCH COLORS TO INDUSTRY (from blueprints above), then apply style based on vibe:

**IF "Tech / SaaS / AI / Futuristic":**
- Backgrounds: Deep Slate (#0f172a, #020617) with radial gradient glows
- Effects: Glassmorphism (backdrop-blur, bg-white/5, border-white/10)
- Typography: Technical sans-serif (Inter, JetBrains Mono). Tight tracking
- Accents: Neon gradients (#3b82f6 to #8b5cf6, #14b8a6 to #06b6d4)

**IF "Luxury / Fashion / Minimalist / High-End":**
- Layout: Radical whitespace (py-32). Asymmetrical image placement
- Typography: Elegant Serif headers (Playfair Display, Cormorant) mixed with clean Sans body
- Font sizes: MASSIVE headlines (text-7xl equivalent)
- Borders: Sharp corners (rounded-none). Thin, distinct lines

**IF "Creative / Playful / Gen-Z / Bold":**
- Style: Neubrutalism - Hard shadows, thick black borders
- Colors: High saturation pastels (#f472b6, #a78bfa, #34d399)
- Shapes: Mix rounded-full buttons with sharp-cornered cards
- Typography: Bold, chunky, expressive

**IF "Traditional / Professional / Trust-Based":**
- Colors: Navy (#1e3a5a), Forest Green (#064e3b), Gold accents
- Typography: Clean, authoritative serif for headlines
- Layout: Structured, organized, ample whitespace
- Feel: Established, trustworthy, competent

====================================
## 6. INTERACTION & POLISH RULES
====================================

**The "Alive" Rule:** Every main element must feel interactive
- Buttons: Must have hover states (scale, color shift, or shadow lift)
- Cards: Should have subtle hover transformations
- Navigation: Active states clearly indicated

**Industry-Specific Data:**
- ALWAYS use the content blueprints above - never generic placeholders
- If user mentions location, incorporate it naturally
- Headlines should be outcome-focused, not feature-focused

**Grid Symmetry Rule:**
- All card grids MUST use EVEN numbers (2, 4, 6, 8)
- NEVER use 3 or 5 cards - it creates awkward layouts

====================================
## 7. PAGE STRUCTURE RULES
====================================

**HOME PAGE - KEEP IT LEAN (MAX 4-5 SECTIONS):**
Only include on home page:
1. Hero - Main headline and primary CTA
2. Features/Services Preview - MAX 4 items (tease content, full list goes on separate page)
3. Testimonials OR Stats (pick ONE, not both)
4. CTA - Final call to action

DO NOT put on home page: FAQ, Contact form, full service lists, team sections, pricing details
These go on SEPARATE dedicated pages.

**SMART PAGE SELECTION - CRITICAL:**
Pages MUST match the business type. DO NOT include irrelevant pages:

- **Restaurant/Food Business**: Home, Menu, Order/Reservations, Location, Contact
  - NEVER include: Cart, Checkout, Shop, Product pages (these are for e-commerce only!)
  
- **Local Service (plumber, electrician, etc.)**: Home, Services, About, Contact, Reviews
  - NEVER include: Cart, Checkout, Shop, Product, Menu pages
  
- **E-commerce/Retail**: Home, Shop, Product, Cart, Checkout, Contact
  - These businesses DO need cart/checkout pages
  
- **Portfolio/Agency**: Home, Work, Services, About, Contact
  - NEVER include: Cart, Checkout, Menu, Product pages

- **Coaching/Course**: Home, Services/Curriculum, About, Testimonials, Contact
  - NEVER include: Cart, Menu, Reservations pages

**NAVIGATION MUST USE PAGE PATHS:**
- "/" for Home
- "/services" or "/products" or "/menu" for main offering
- "/about" for About page
- "/contact" for Contact page
- NEVER use "#section" anchor links - they don't work for separate pages!

====================================
## 8. RESPONSE FORMAT - CRITICAL (RESPONSE CONTRACT)
====================================

You MUST respond with a STRUCTURED message followed by the JSON spec.

**RESPONSE CONTRACT FORMAT (REQUIRED):**
After generating a website, ALWAYS respond with this exact structure:

**Built:** [1-2 lines: what pages/sections were created and primary conversion goal]

**Next:** [ONE specific recommendation - the highest leverage action]

Then include the JSON code block.

**STRICT RULES:**
- NEVER say "All set" or other filler phrases
- Keep responses under 120 words (excluding JSON)
- Be direct and action-oriented
- No technical jargon, debug text, or JSON explanations in chat
- NEVER mention "JSON", "code", "devs", "developers", "paste", "spec"
- NEVER say "hand to devs" or suggest the user needs technical help
- Focus on what the USER can do next

**GOOD EXAMPLES:**

**Built:** 4-page car dealership site optimized for test drive bookings. Hero, inventory showcase, financing options, and contact form.

**Next:** Add your logo to build brand recognition.

---

**Built:** Sandwich shop with menu, online ordering, and catering page. Conversion goal: drive online orders.

**Next:** Add customer photos to boost trust.

**BAD EXAMPLES (NEVER DO THIS):**
- "All set! I've created a beautiful..." ❌
- "Paste this JSON into your site generator" ❌
- "Hand to devs" ❌
- "Here's the spec" ❌
- Long paragraphs describing every detail ❌
- Suggested actions (handled by UI) ❌

Format:
**Built:** [summary]

**Next:** [one action]

\`\`\`json
{
  "name": "Business Name",
  "description": "Brief description",
  "businessModel": "SERVICE_BASED|RETAIL_COMMERCE|HOSPITALITY|PORTFOLIO_IDENTITY",
  "layoutStructure": "standard|bento|layered|horizontal (based on ARCHITECTURAL VARIETY PROTOCOL)",
  "theme": {
    "primaryColor": "#hex from industry blueprint",
    "secondaryColor": "#hex from industry blueprint",
    "accentColor": "#hex",
    "backgroundColor": "#0a0a0a",
    "textColor": "#f3f4f6",
    "darkMode": true,
    "fontHeading": "Inter",
    "fontBody": "Inter"
  },
  "navigation": [
    { "label": "Home", "href": "/" },
    { "label": "Services", "href": "/services" },
    { "label": "About", "href": "/about" },
    { "label": "Contact", "href": "/contact" }
  ],
  "pages": [{
    "path": "/",
    "title": "Home",
    "sections": [
      {
        "id": "hero",
        "type": "hero",
        "label": "Hero",
        "content": {
          "headline": "Industry-specific headline from blueprint",
          "subheadline": "Supporting text tailored to this business",
          "ctas": [
            { "label": "Industry-specific CTA", "href": "/contact", "variant": "primary" }
          ]
        }
      },
      {"id": "features-preview", "type": "features", "label": "Features", "content": {"title": "What We Offer", "items": [{"title": "Feature 1", "description": "Brief description", "icon": "Star"}, {"title": "Feature 2", "description": "Brief description", "icon": "Zap"}, {"title": "Feature 3", "description": "Brief description", "icon": "Shield"}, {"title": "Feature 4", "description": "Brief description", "icon": "Heart"}]}},
      {"id": "testimonials", "type": "testimonials", "label": "Reviews", "content": {"title": "What Customers Say", "items": [{"name": "John D.", "role": "Customer", "quote": "Great service!", "rating": 5}]}},
      {"id": "cta", "type": "cta", "label": "CTA", "content": {"headline": "Ready to get started?", "ctaText": "Contact Us", "ctaLink": "/contact"}}
    ]
  }],
  "footer": {
    "copyright": "© 2024 Business Name"
  }
}
\`\`\`

====================================
## 8. USER-UPLOADED IMAGES
====================================

When users attach images (logos, photos, etc.), they will be provided as URLs in the format:
[USER UPLOADED LOGO - USE THIS URL: https://...]
[USER UPLOADED IMAGE "filename" - USE THIS URL: https://...]

**CRITICAL**: When you see these URLs, you MUST use them in the site spec:

For LOGOS:
- Add to hero section: "logo": "THE_PROVIDED_URL"
- Add to navigation: "logo": "THE_PROVIDED_URL"
- Add to footer if appropriate

For IMAGES:
- Use as hero background: "backgroundImage": "THE_PROVIDED_URL"
- Use in feature cards: "image": "THE_PROVIDED_URL"
- Use wherever the user indicates

Example when user provides a logo:
\`\`\`json
{
  "navigation": [
    { "logo": "https://user-provided-url.com/logo.png" },
    { "label": "Home", "href": "#" }
  ],
  "pages": [{
    "sections": [{
      "type": "hero",
      "content": {
        "logo": "https://user-provided-url.com/logo.png",
        "headline": "..."
      }
    }]
  }]
}
\`\`\`

DO NOT ignore user-uploaded images. They are specifically requesting their images be used.

====================================
## 9. SECTION TYPES & CONTENT
====================================

**hero** (required):
{
  "headline": "Industry-specific bold headline",
  "subheadline": "Supporting value prop for this industry",
  "ctas": [{ "label": "Industry CTA", "href": "#target", "variant": "primary|secondary" }],
  "image": "optional image URL"
}

**features**:
{
  "title": "Industry-Appropriate Title",
  "subtitle": "Optional subtitle",
  "items": [
    { "title": "Industry Feature", "description": "Specific description", "icon": "Star|Zap|Users|Clock|Shield|Check|Heart|Award|Wrench|Car|Scissors|Camera|Home|Leaf" }
  ]
}
Use 4 or 6 items (NEVER 3 or 5)

**testimonials**:
{
  "title": "What [Industry-Specific Term] Say",
  "items": [
    { "name": "Person Name", "role": "Industry-relevant role", "quote": "Industry-relevant testimonial", "rating": 5 }
  ]
}
Use 2 or 4 testimonials

**pricing**:
{
  "title": "Industry-Appropriate Pricing Title",
  "subtitle": "Subtitle",
  "items": [
    { "name": "Plan Name", "price": "$XX/mo or one-time", "features": ["Industry features"], "ctaText": "Industry CTA", "highlighted": false }
  ]
}

**faq**:
{
  "title": "Frequently Asked Questions",
  "items": [
    { "question": "Industry-specific question?", "answer": "Helpful answer." }
  ]
}
Use 4-6 FAQs from the industry blueprint

**contact**:
{
  "title": "Industry-Appropriate Contact Title",
  "subtitle": "Industry-specific subtitle",
  "email": "industry@example.com",
  "phone": "(555) 123-4567",
  "formFields": ["name", "email", "message"]
}

**cta**:
{
  "headline": "Industry-specific call to action",
  "subheadline": "Supporting text",
  "ctas": [{ "label": "Industry CTA", "href": "#contact", "variant": "primary" }]
}

**stats**:
{
  "items": [
    { "value": "Industry Stat", "label": "Industry Metric" },
    { "value": "Another Stat", "label": "Relevant Label" }
  ]
}

====================================
## 10. FINAL EXECUTION PROTOCOL
====================================

Before outputting, run this silent checklist:

1. Did I detect the industry correctly? → Apply the correct blueprint
2. Did I use industry-specific headlines and CTAs? → MUST match blueprint
3. Did I use the correct primary/secondary colors for this industry? → Check blueprint
4. Did I select the correct layoutStructure based on ARCHITECTURAL VARIETY PROTOCOL? → Check business model
5. Are the buttons using industry-appropriate text? → NOT generic "Get Started"
6. Did I use 3 or 5 cards? → If YES, change to 4 or 6
7. Did I include industry-specific FAQs? → Use from blueprint
8. Are testimonials realistic for this industry? → Match context from blueprint
9. Does the HOME page have only 4-5 sections? → If more, move to separate pages
10. Do all navigation links use page paths (/, /services, /about, /contact)? → NO anchor links like #section

====================================
## EXCELLION SERVICE CONTEXT
====================================

If users ask about Excellion services:

**AI Website Builder (DIY):**
- Free: 1 draft project, subdomain publishing
- Starter ($15/mo): 1 published site, custom domain
- Pro ($29/mo): Unlimited drafts, integrations
- Agency ($129/mo): 10 sites, white-label

Only mention pricing if relevant. Focus on building their site.`;

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  
  console.log(`[BOT-CHAT:${requestId}] ========== REQUEST START ==========`);
  console.log(`[BOT-CHAT:${requestId}] Method: ${req.method}`);
  console.log(`[BOT-CHAT:${requestId}] Timestamp: ${new Date().toISOString()}`);

  if (req.method === "OPTIONS") {
    console.log(`[BOT-CHAT:${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log(`[BOT-CHAT:${requestId}] ERROR: No auth header provided`);
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`[BOT-CHAT:${requestId}] Auth header present`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Extract token from Bearer header
    const token = authHeader.replace("Bearer ", "");
    
    // Use service role key to verify the user token server-side
    const authClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      console.log(`[BOT-CHAT:${requestId}] ERROR: Auth failed -`, authError?.message || "No user");
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BOT-CHAT:${requestId}] User authenticated: ${user.id}`);
    console.log(`[BOT-CHAT:${requestId}] User email: ${user.email}`);

    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || "unknown";
    console.log(`[BOT-CHAT:${requestId}] Client IP: ${clientIP}`);
    
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      console.log(`[BOT-CHAT:${requestId}] ERROR: Rate limit exceeded - retry after ${rateLimitResult.retryAfter}s`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }
    console.log(`[BOT-CHAT:${requestId}] Rate limit check passed`);

    const body = await req.json();
    const { messages, context, modelMode, projectId, scaffold, speedMode } = body;
    
    // SPEED OPTIMIZATION: Fast mode for initial generation
    const isFastMode = speedMode === 'fast' || (!projectId && messages?.length === 1);
    
    console.log(`[BOT-CHAT:${requestId}] Request body parsed:`);
    console.log(`[BOT-CHAT:${requestId}]   - Messages count: ${messages?.length || 0}`);
    console.log(`[BOT-CHAT:${requestId}]   - Model mode: ${modelMode || 'default'}`);
    console.log(`[BOT-CHAT:${requestId}]   - Speed mode: ${isFastMode ? 'FAST' : 'normal'}`);
    console.log(`[BOT-CHAT:${requestId}]   - Project ID: ${projectId || 'none'}`);
    console.log(`[BOT-CHAT:${requestId}]   - Has context: ${!!context}`);
    console.log(`[BOT-CHAT:${requestId}]   - Has scaffold: ${!!scaffold}`);
    
    // Log scaffold details if present
    if (scaffold) {
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] Category: ${scaffold.category}`);
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] Goal: ${scaffold.goal}`);
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] Archetype: ${scaffold.archetypeId}`);
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] Required Pages: ${JSON.stringify(scaffold.requiredPages?.map((p: any) => p.path) || [])}`);
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] CTA Rules: ${JSON.stringify(scaffold.ctaRules || {})}`);
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] Forbidden Phrases: ${JSON.stringify(scaffold.forbiddenPhrases || [])}`);
      console.log(`[BOT-CHAT:${requestId}] [SCAFFOLD] Integrations: ${JSON.stringify(scaffold.integrations || [])}`);
    }
    
    // Log first user message for debugging
    const firstUserMsg = messages?.find((m: any) => m.role === 'user');
    if (firstUserMsg) {
      const content = typeof firstUserMsg.content === 'string' 
        ? firstUserMsg.content.slice(0, 100) 
        : '[multimodal content]';
      console.log(`[BOT-CHAT:${requestId}]   - First user message: "${content}${content.length >= 100 ? '...' : ''}"`);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log(`[BOT-CHAT:${requestId}] Environment check:`);
    console.log(`[BOT-CHAT:${requestId}]   - LOVABLE_API_KEY: ${LOVABLE_API_KEY ? 'SET' : 'MISSING'}`);
    console.log(`[BOT-CHAT:${requestId}]   - SUPABASE_URL: ${SUPABASE_URL ? 'SET' : 'MISSING'}`);
    console.log(`[BOT-CHAT:${requestId}]   - SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'}`);
    
    if (!LOVABLE_API_KEY) {
      console.log(`[BOT-CHAT:${requestId}] ERROR: LOVABLE_API_KEY not configured`);
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch knowledge base entries - SKIP in fast mode for speed
    let knowledgeContext = "";
    if (!isFastMode && projectId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        console.log(`[BOT-CHAT:${requestId}] Fetching knowledge base for project: ${projectId}`);
        const kbResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/knowledge_base?project_id=eq.${projectId}&select=name,content`,
          {
            headers: {
              "apikey": SUPABASE_SERVICE_ROLE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }
        );
        
        if (kbResponse.ok) {
          const kbEntries = await kbResponse.json();
          console.log(`[BOT-CHAT:${requestId}] Knowledge base entries found: ${kbEntries?.length || 0}`);
          if (kbEntries && kbEntries.length > 0) {
            knowledgeContext = `
## PROJECT KNOWLEDGE BASE
${kbEntries.map((entry: { name: string; content: string }) => `### ${entry.name}\n${entry.content}`).join('\n---\n')}
`;
          }
        } else {
          console.log(`[BOT-CHAT:${requestId}] Knowledge base fetch failed: ${kbResponse.status}`);
        }
      } catch (kbError) {
        console.error(`[BOT-CHAT:${requestId}] Error fetching knowledge base:`, kbError);
      }
    } else if (isFastMode) {
      console.log(`[BOT-CHAT:${requestId}] Skipping knowledge base fetch (fast mode)`);
    } else {
      console.log(`[BOT-CHAT:${requestId}] Skipping knowledge base fetch (no projectId or missing env vars)`);
    }

    // Check for URLs - SKIP in fast mode for speed (reduces 5+ seconds)
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    let urlContext = "";
    
    if (!isFastMode && lastUserMessage?.content) {
      let textContent = "";
      if (typeof lastUserMessage.content === "string") {
        textContent = lastUserMessage.content;
      } else if (Array.isArray(lastUserMessage.content)) {
        const textPart = lastUserMessage.content.find((part: any) => part.type === "text");
        textContent = textPart?.text || "";
      }
      
      const urls = textContent.match(URL_REGEX);
      if (urls && urls.length > 0) {
        console.log(`[BOT-CHAT:${requestId}] Found URL, extracting (2s timeout): ${urls[0]}`);
        const extractionPromise = extractFromUrl(urls[0]);
        const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) => 
          setTimeout(() => resolve({ success: false, error: 'URL extraction timeout' }), 2000)
        );
        const extraction = await Promise.race([extractionPromise, timeoutPromise]);
        if (extraction.success && extraction.data) {
          urlContext = formatExtractionForPrompt(extraction.data);
        } else {
          console.log(`[BOT-CHAT:${requestId}] URL extraction skipped: ${extraction.error || 'timeout'}`);
        }
      }
    } else if (isFastMode) {
      console.log(`[BOT-CHAT:${requestId}] Skipping URL extraction (fast mode)`);
    }

    // Select base prompt based on mode
    let enhancedPrompt = isFastMode ? FAST_SYSTEM_PROMPT : SYSTEM_PROMPT;
    
    // Add knowledge base context first (higher priority)
    if (knowledgeContext) {
      enhancedPrompt += `\n${knowledgeContext}`;
      console.log(`[BOT-CHAT:${requestId}] Added knowledge base context to prompt`);
    }
    
    if (urlContext) {
      enhancedPrompt += `\n${urlContext}`;
      console.log(`[BOT-CHAT:${requestId}] Added URL extraction context to prompt`);
    }
    
    if (context?.businessName || context?.industry) {
      enhancedPrompt += `\n\nProject Context:`;
      if (context.businessName) enhancedPrompt += `\n- Business Name: ${context.businessName}`;
      if (context.industry) enhancedPrompt += `\n- Industry: ${context.industry}`;
      console.log(`[BOT-CHAT:${requestId}] Added business context: ${context.businessName || ''} / ${context.industry || ''}`);
    }

    // SCAFFOLD ENFORCEMENT: Inject scaffold constraints as hard requirements
    if (scaffold) {
      console.log(`[BOT-CHAT:${requestId}] Injecting scaffold constraints into prompt`);
      
      let scaffoldPrompt = `

====================================
## GENERATION SCAFFOLD - MANDATORY REQUIREMENTS
====================================

You MUST follow these requirements exactly. The output SiteSpec MUST conform to this scaffold.

**DETECTED CATEGORY:** ${scaffold.category}
**CONVERSION GOAL:** ${scaffold.goal}
**ARCHETYPE:** ${scaffold.archetypeId}
**LAYOUT SIGNATURE:** ${scaffold.layoutSignature || 'standard'}

### REQUIRED PAGES (MUST ALL EXIST IN OUTPUT):
`;
      
      if (scaffold.requiredPages && scaffold.requiredPages.length > 0) {
        scaffold.requiredPages.forEach((page: { path: string; title: string; requiredSections?: string[] }) => {
          scaffoldPrompt += `
- Path: "${page.path}" | Title: "${page.title}"`;
          if (page.requiredSections && page.requiredSections.length > 0) {
            scaffoldPrompt += `
  Required Sections: ${page.requiredSections.join(', ')}`;
          }
        });
      }

      if (scaffold.ctaRules) {
        scaffoldPrompt += `

### CTA RULES (MUST BE FOLLOWED):
- Primary CTA Label: "${scaffold.ctaRules.primaryLabel || 'Get Started'}"
- Primary CTA Action: "${scaffold.ctaRules.primaryAction || 'contact'}"`;
        if (scaffold.ctaRules.secondaryLabel) {
          scaffoldPrompt += `
- Secondary CTA Label: "${scaffold.ctaRules.secondaryLabel}"`;
        }
      }

      if (scaffold.forbiddenPhrases && scaffold.forbiddenPhrases.length > 0) {
        scaffoldPrompt += `

### FORBIDDEN PHRASES (MUST NOT APPEAR IN ANY TEXT):
${scaffold.forbiddenPhrases.map((phrase: string) => `- "${phrase}"`).join('\n')}`;
      }

      if (scaffold.integrations && scaffold.integrations.length > 0) {
        scaffoldPrompt += `

### REQUIRED INTEGRATIONS (INCLUDE AS CUSTOM SECTIONS):
${scaffold.integrations.map((int: string) => `- ${int}`).join('\n')}

For each integration, include a custom section with:
- type: "custom"
- content.componentType: "[integration_name]_embed" or "[integration_name]_form"
- content.props: { relevant configuration }`;
      }

      // Handle custom theme from Build Assist interview
      if (scaffold.customTheme) {
        scaffoldPrompt += `

### CUSTOM COLOR THEME (MANDATORY - USE THESE EXACT COLORS):
**PRIMARY COLOR:** ${scaffold.customTheme.primaryColor} - Use for buttons, CTAs, headlines, navigation highlights
**ACCENT COLOR:** ${scaffold.customTheme.accentColor} - Use for secondary elements, hover states, icons
**BACKGROUND MODE:** ${scaffold.customTheme.backgroundMode} (dark = use dark backgrounds like #0a0a0a, light = use light backgrounds like #ffffff)

CRITICAL: Do NOT use the default industry colors (blue, green, etc.). 
The user has explicitly chosen these colors: PRIMARY=${scaffold.customTheme.primaryColor}, ACCENT=${scaffold.customTheme.accentColor}.
Your theme object MUST use these exact hex values.`;
      }

      scaffoldPrompt += `

====================================
CRITICAL: Your SiteSpec output MUST include:
1. ALL required pages with their exact paths
2. ALL required sections for each page
3. CTA labels matching the rules above
4. NO forbidden phrases anywhere in the content
5. Integration sections for any listed integrations${scaffold.customTheme ? '\n6. EXACT custom theme colors specified above' : ''}

If you cannot fulfill these requirements, explain why in your conversational response.
====================================
`;
      
      enhancedPrompt += scaffoldPrompt;
      console.log(`[BOT-CHAT:${requestId}] Scaffold prompt added (${scaffoldPrompt.length} chars)`);
      if (scaffold.customTheme) {
        console.log(`[BOT-CHAT:${requestId}] Custom theme: primary=${scaffold.customTheme.primaryColor}, accent=${scaffold.customTheme.accentColor}`);
      }
    }

    console.log(`[BOT-CHAT:${requestId}] System prompt length: ${enhancedPrompt.length} chars`);
    console.log(`[BOT-CHAT:${requestId}] Total messages to send: ${messages.length + 1}`);

    // Model selection: gemini-2.5-flash for all generation (balanced speed + quality)
    // flash-lite was too low quality, flash provides 10-20s generation with better output
    const selectedModel = 'google/gemini-2.5-flash';
    
    // Token limits: 3500 for fast mode (compact but complete), 6000 for refinements
    const maxTokens = isFastMode ? 3500 : 6000;
    
    console.log(`[BOT-CHAT:${requestId}] Model: ${selectedModel}, Max tokens: ${maxTokens}`);

    const aiStartTime = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: enhancedPrompt },
          ...messages,
        ],
        stream: true,
        // Use max_completion_tokens for OpenAI models, max_tokens for Gemini
        ...(selectedModel.startsWith('openai/') 
          ? { max_completion_tokens: maxTokens } 
          : { max_tokens: maxTokens }),
      }),
    });

    const aiResponseTime = Date.now() - aiStartTime;
    console.log(`[BOT-CHAT:${requestId}] AI Gateway response: ${response.status} (${aiResponseTime}ms to first byte)`);

    if (!response.ok) {
      if (response.status === 429) {
        console.log(`[BOT-CHAT:${requestId}] ERROR: AI Gateway rate limit (429)`);
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.log(`[BOT-CHAT:${requestId}] ERROR: AI Gateway payment required (402)`);
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error(`[BOT-CHAT:${requestId}] ERROR: AI gateway error ${response.status}:`, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`[BOT-CHAT:${requestId}] SUCCESS: Streaming response started`);
    console.log(`[BOT-CHAT:${requestId}] Total processing time: ${totalTime}ms`);
    console.log(`[BOT-CHAT:${requestId}] ========== REQUEST STREAMING ==========`);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[BOT-CHAT] ERROR: Unhandled exception:`, errorMessage);
    console.error(`[BOT-CHAT] Stack:`, error instanceof Error ? error.stack : 'N/A');
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
