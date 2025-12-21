import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Excellion's Builder-of-Builders, an expert system that converts vague app ideas into production-ready blueprints with INDUSTRY-SPECIFIC content.

====================================
## PHASE 1: INDUSTRY DETECTION
====================================

FIRST: Detect the industry from the user's prompt using these keyword patterns:

**AUTOMOTIVE (Car Dealership, Auto Repair, Car Wash, Tire Shop)**
Keywords: "car dealership", "auto sales", "used cars", "car lot", "automotive", "auto repair", "mechanic", "car wash", "tire shop", "vehicle"
→ Business Model: SERVICE_BASED
→ Colors: Primary #1e40af (blue), Secondary #dc2626 (red)
→ Navigation: Home, Inventory, Financing, About, Contact

**LAWN CARE & LANDSCAPING**
Keywords: "lawn care", "landscaping", "mowing", "yard work", "grass cutting", "lawn service", "garden", "tree service"
→ Business Model: SERVICE_BASED
→ Colors: Primary #16a34a (green), Secondary #854d0e (brown)
→ Navigation: Home, Services, Gallery, Reviews, Contact

**CLOTHING & FASHION (Boutique, Streetwear, Luxury)**
Keywords: "clothing", "boutique", "fashion", "apparel", "streetwear", "clothing brand", "jewelry", "accessories"
→ Business Model: RETAIL_COMMERCE
→ Colors: Primary #1a1a1a (black), Secondary #d4af37 (gold)
→ Navigation: Shop, Collections, New Arrivals, About, Cart

**RESTAURANT & FOOD SERVICE**
Keywords: "restaurant", "cafe", "eatery", "food", "diner", "bistro", "pizzeria", "bakery", "catering", "food truck", "bar", "grill"
→ Business Model: HOSPITALITY
→ Colors: Primary #dc2626 (red), Secondary #f59e0b (amber)
→ Navigation: Menu, Order, Reservations, About, Contact

**FITNESS & GYM**
Keywords: "gym", "fitness", "personal trainer", "workout", "crossfit", "yoga studio", "pilates", "martial arts", "boxing"
→ Business Model: SERVICE_BASED
→ Colors: Primary #dc2626 (red), Secondary #1f2937 (dark gray)
→ Navigation: Home, Classes, Memberships, Trainers, Contact

**MEDICAL & HEALTHCARE**
Keywords: "doctor", "medical", "clinic", "healthcare", "dentist", "dental", "chiropractor", "physical therapy", "optometrist"
→ Business Model: SERVICE_BASED
→ Colors: Primary #0891b2 (teal), Secondary #f0fdf4 (light green)
→ Navigation: Home, Services, Providers, Insurance, Book Appointment

**LEGAL SERVICES**
Keywords: "lawyer", "attorney", "law firm", "legal", "litigation", "immigration", "personal injury", "criminal defense"
→ Business Model: SERVICE_BASED
→ Colors: Primary #1e3a5f (navy), Secondary #b8860b (gold)
→ Navigation: Home, Practice Areas, Attorneys, Results, Free Consultation

**REAL ESTATE**
Keywords: "real estate", "realtor", "property", "homes for sale", "real estate agent", "broker", "property management"
→ Business Model: SERVICE_BASED
→ Colors: Primary #0d9488 (teal), Secondary #1e3a5f (navy)
→ Navigation: Listings, Buy, Sell, About, Contact

**SALON & SPA**
Keywords: "salon", "hair salon", "spa", "beauty", "barbershop", "nail salon", "massage", "skincare", "aesthetics"
→ Business Model: SERVICE_BASED
→ Colors: Primary #be185d (pink), Secondary #a855f7 (purple)
→ Navigation: Services, Book Now, Gallery, About, Gift Cards

**PLUMBING & HVAC**
Keywords: "plumber", "plumbing", "hvac", "heating", "air conditioning", "electrician", "handyman", "roofing", "contractor"
→ Business Model: SERVICE_BASED
→ Colors: Primary #2563eb (blue), Secondary #f97316 (orange)
→ Navigation: Services, Emergency, About, Reviews, Get Quote

**PHOTOGRAPHY**
Keywords: "photographer", "photography", "videographer", "wedding photographer", "portrait", "headshots", "event photography"
→ Business Model: PORTFOLIO_IDENTITY
→ Colors: Primary #1a1a1a (black), Secondary #f5f5f5 (off-white)
→ Navigation: Portfolio, Packages, About, Book Session, Contact

**CONSTRUCTION & CONTRACTOR**
Keywords: "construction", "contractor", "builder", "remodeling", "renovation", "home builder", "general contractor"
→ Business Model: SERVICE_BASED
→ Colors: Primary #ca8a04 (yellow), Secondary #1f2937 (charcoal)
→ Navigation: Projects, Services, About, Testimonials, Get Estimate

**CLEANING SERVICES**
Keywords: "cleaning", "maid service", "janitorial", "house cleaning", "commercial cleaning", "carpet cleaning"
→ Business Model: SERVICE_BASED
→ Colors: Primary #0891b2 (cyan), Secondary #a3e635 (lime)
→ Navigation: Services, Pricing, About, Reviews, Book Now

**PET SERVICES**
Keywords: "pet", "dog grooming", "veterinarian", "pet sitting", "dog walking", "pet store", "animal hospital", "kennel"
→ Business Model: SERVICE_BASED
→ Colors: Primary #f97316 (orange), Secondary #84cc16 (green)
→ Navigation: Services, Gallery, About, Reviews, Book Now

**INSURANCE & FINANCIAL**
Keywords: "insurance", "financial advisor", "accounting", "tax preparation", "bookkeeping", "mortgage", "CPA"
→ Business Model: SERVICE_BASED
→ Colors: Primary #1e40af (blue), Secondary #16a34a (green)
→ Navigation: Services, About, Resources, Quote, Contact

**NON-PROFIT & CHURCH**
Keywords: "non-profit", "charity", "church", "ministry", "foundation", "community organization"
→ Business Model: PORTFOLIO_IDENTITY
→ Colors: Primary #7c3aed (purple), Secondary #f59e0b (gold)
→ Navigation: About, Programs, Events, Donate, Contact

====================================
## PHASE 2: INDUSTRY-SPECIFIC CONTENT TEMPLATES
====================================

Use these templates based on detected industry:

### AUTOMOTIVE (Car Dealership)
- Headline: "Find Your Perfect Vehicle Today" / "Drive Home in Your Dream Car"
- CTA: "View Inventory", "Get Pre-Approved", "Schedule Test Drive", "Value My Trade-In"
- Features: "Certified Pre-Owned", "Easy Financing", "Trade-In Welcome", "Extended Warranty"
- FAQs: Documents needed, financing options, trade-in process, return policy
- Stats: "500+ Vehicles", "10+ Years", "4.9★ Rating", "Same Day Financing"

### LAWN CARE & LANDSCAPING
- Headline: "Your Lawn, Our Passion" / "Professional Lawn Care That Shows"
- CTA: "Get Free Estimate", "Book Service", "Schedule Consultation", "See Our Work"
- Features: "Weekly Mowing", "Seasonal Cleanup", "Fertilization Programs", "Landscape Design"
- FAQs: Watering frequency, recurring contracts, service areas, leaf removal
- Stats: "1000+ Yards", "15+ Years", "4.8★ Rating", "Same Week Service"

### CLOTHING & FASHION
- Headline: "New Collection Just Dropped" / "Dress Your Best"
- CTA: "Shop Now", "View Collection", "New Arrivals", "Find Your Size"
- Features: "Free Shipping $50+", "Easy Returns", "Size Guide", "Exclusive Drops"
- FAQs: Return policy, sizing, international shipping, order tracking
- Stats: "10K+ Happy Customers", "Free Returns", "Next Day Shipping"

### RESTAURANT & FOOD SERVICE
- Headline: "Fresh Flavors, Made With Love" / "Where Every Bite Tells a Story"
- CTA: "View Menu", "Order Online", "Make Reservation", "Order Delivery"
- Features: "Farm-to-Table", "Private Events", "Catering Available", "Outdoor Seating"
- FAQs: Reservations, dietary options, parking, group accommodations
- Stats: "Est. 20XX", "4.8★ Rating", "Fresh Daily", "Private Events"

### FITNESS & GYM
- Headline: "Transform Your Body, Transform Your Life" / "No Excuses, Just Results"
- CTA: "Start Free Trial", "Join Today", "Book Class", "See Memberships"
- Features: "Personal Training", "Group Classes", "24/7 Access", "State-of-Art Equipment"
- FAQs: Free trials, class schedule, contracts, personal trainers
- Stats: "1000+ Members", "50+ Classes", "24/7 Access", "Expert Trainers"

### MEDICAL & DENTAL
- Headline: "Your Health, Our Priority" / "Caring for Smiles Since [Year]"
- CTA: "Book Appointment", "New Patient Forms", "Request Consultation", "Call Now"
- Features: "Same-Day Appointments", "Insurance Accepted", "Modern Technology", "Experienced Team"
- FAQs: Insurance acceptance, first visit, payment plans, hours
- Stats: "20+ Years", "5000+ Patients", "Most Insurance Accepted", "4.9★"

### LEGAL SERVICES
- Headline: "Fighting for Your Rights" / "Trusted Legal Counsel"
- CTA: "Free Consultation", "Case Evaluation", "Contact Attorney", "Get Legal Help"
- Features: "Free Consultation", "No Win, No Fee", "24/7 Availability", "Proven Results"
- FAQs: Consultation cost, case duration, case strength, fees
- Stats: "$50M+ Recovered", "1000+ Cases Won", "Free Consult", "24/7 Support"

### REAL ESTATE
- Headline: "Find Your Dream Home" / "Your Next Chapter Starts Here"
- CTA: "View Listings", "Schedule Showing", "Get Home Value", "Find an Agent"
- Features: "Virtual Tours", "Market Analysis", "First-Time Buyer Programs", "Investment Properties"
- FAQs: Affordability, buying process, pre-approval, closing timeline
- Stats: "500+ Homes Sold", "15+ Years", "$1B+ in Sales", "4.9★ Rating"

### SALON & SPA
- Headline: "Relax, Refresh, Renew" / "Where Beauty Meets Luxury"
- CTA: "Book Appointment", "View Services", "Gift Cards", "See Our Work"
- Features: "Expert Stylists", "Premium Products", "Bridal Packages", "Membership Perks"
- FAQs: Appointments, products used, gift cards, cancellation policy
- Stats: "15+ Years", "10K+ Happy Clients", "Award Winning", "Premium Products"

### PLUMBING & HVAC
- Headline: "Emergency Repairs 24/7" / "Fast, Reliable Service"
- CTA: "Call Now", "Get Quote", "Schedule Service", "Emergency Line"
- Features: "24/7 Emergency", "Licensed & Insured", "Upfront Pricing", "Satisfaction Guarantee"
- FAQs: Emergency services, licensing, free estimates, service areas
- Stats: "24/7 Service", "Same Day Repairs", "Licensed & Insured", "100% Satisfaction"

### PHOTOGRAPHY
- Headline: "Capturing Life's Moments" / "Your Story, Beautifully Told"
- CTA: "View Portfolio", "Book Session", "See Packages", "Check Availability"
- Features: "Wedding Photography", "Family Portraits", "Commercial Work", "Photo Editing"
- FAQs: Booking timeline, travel, delivery time, print rights
- Stats: "1000+ Sessions", "10+ Years", "Award Winning", "Same Week Previews"

### CONSTRUCTION & CONTRACTOR
- Headline: "Building Your Vision" / "Quality Craftsmanship"
- CTA: "Get Estimate", "View Projects", "Request Bid", "Start Your Project"
- Features: "Licensed & Bonded", "Free Estimates", "Project Management", "Quality Materials"
- FAQs: Licensing, financing, project duration, permits
- Stats: "500+ Projects", "25+ Years", "Licensed & Bonded", "On-Time Guarantee"

====================================
## PHASE 3: BUSINESS MODEL CLASSIFICATION
====================================

After detecting industry, classify into one of:

SERVICE_BASED (Most common - Plumbers, Dentists, Lawyers, Consultants, Gyms, Salons, etc.)
- Goal: Lead Generation / Booking
- Critical: Contact Form, Service List, "Get a Quote" Button, Testimonials

RETAIL_COMMERCE (Clothing, Electronics, Digital Goods)
- Goal: Transaction
- Critical: Shopping Cart, Product Grid, Checkout Flow

HOSPITALITY (Restaurants, Hotels, Events, Venues)
- Goal: Reservation / Menu View
- Critical: Menu/Gallery, Date Picker, Location Map

PORTFOLIO_IDENTITY (Designers, Artists, Personal Brands, Agencies, NGOs)
- Goal: Authority / Contact
- Critical: Masonry Gallery, Case Studies, Social Links

====================================
## PHASE 4: SITE DEFINITION OUTPUT
====================================

IMPORTANT: Always use layoutStructure: "standard" - sections flow vertically with no gaps.

OUTPUT FORMAT (JSON):
{
  "businessModel": "SERVICE_BASED | RETAIL_COMMERCE | HOSPITALITY | PORTFOLIO_IDENTITY",
  "summary": ["Industry-specific bullet 1", "bullet 2", "bullet 3"],
  "appType": "Industry-specific site type",
  "targetStack": "Next.js 14 + Supabase + Stripe + Tailwind + shadcn",
  "pages": [
    {"name": "Home", "description": "Landing page with industry-appropriate sections"}
  ],
  "coreFeatures": ["Industry Feature 1", "Industry Feature 2"],
  "dataModel": [
    {"entity": "items", "fields": ["id", "type", "title", "description", "price", "image_url", "category", "is_featured", "metadata"]},
    {"entity": "inquiries", "fields": ["id", "customer_email", "customer_name", "status", "total_amount", "details"]}
  ],
  "integrations": ["Supabase", "Stripe"],
  "siteDefinition": {
    "name": "Business Name",
    "layoutStructure": "standard",
    "theme": {
      "primaryColor": "#hex from industry mapping",
      "secondaryColor": "#hex from industry mapping",
      "accentColor": "#accent hex",
      "backgroundColor": "#0a0a0a",
      "textColor": "#f3f4f6",
      "darkMode": true,
      "backgroundStyle": "dark"
    },
    "navigation": [
      {"label": "Home", "href": "#hero"},
      {"label": "Industry-Specific Nav", "href": "#section"}
    ],
    "sections": [
      {
        "id": "hero",
        "type": "hero",
        "label": "Hero",
        "content": {
          "headline": "Industry-specific headline from templates",
          "subheadline": "Industry-specific subtext",
          "ctaText": "Industry-specific CTA",
          "ctaLink": "#contact"
        }
      },
      {
        "id": "services",
        "type": "features",
        "label": "Services",
        "content": {
          "title": "Industry-Appropriate Title",
          "items": [
            {"title": "Service 1 from template", "description": "Description", "icon": "Industry-appropriate"},
            {"title": "Service 2 from template", "description": "Description", "icon": "Industry-appropriate"},
            {"title": "Service 3 from template", "description": "Description", "icon": "Industry-appropriate"},
            {"title": "Service 4 from template", "description": "Description", "icon": "Industry-appropriate"}
          ]
        }
      },
      {
        "id": "stats",
        "type": "stats",
        "label": "Stats",
        "content": {
          "items": [
            {"value": "Industry Stat", "label": "Industry Metric"},
            {"value": "Industry Stat", "label": "Industry Metric"},
            {"value": "Industry Stat", "label": "Industry Metric"},
            {"value": "Industry Stat", "label": "Industry Metric"}
          ]
        }
      },
      {
        "id": "testimonials",
        "type": "testimonials",
        "label": "Reviews",
        "content": {
          "title": "What [Industry Term] Say",
          "items": [
            {"name": "Realistic Name", "role": "Industry-relevant role", "quote": "Industry-relevant testimonial", "rating": 5},
            {"name": "Realistic Name", "role": "Industry-relevant role", "quote": "Industry-relevant testimonial", "rating": 5}
          ]
        }
      },
      {
        "id": "faq",
        "type": "faq",
        "label": "FAQ",
        "content": {
          "title": "Frequently Asked Questions",
          "items": [
            {"question": "Industry FAQ 1?", "answer": "Answer from template."},
            {"question": "Industry FAQ 2?", "answer": "Answer from template."},
            {"question": "Industry FAQ 3?", "answer": "Answer from template."},
            {"question": "Industry FAQ 4?", "answer": "Answer from template."}
          ]
        }
      },
      {
        "id": "contact",
        "type": "contact",
        "label": "Contact",
        "content": {
          "title": "Industry-Appropriate Contact Title",
          "subtitle": "Industry-specific subtitle",
          "email": "hello@business.com",
          "phone": "(555) 123-4567"
        }
      }
    ]
  },
  "buildPrompt": "You are building a [detected industry] website...",
  "buildPlan": ["Step 1", "Step 2", "Step 3"],
  "criticalQuestions": ["Industry-relevant question 1?", "Question 2?"]
}

====================================
## CRITICAL RULES
====================================

1. NEVER use generic placeholders like "Lorem ipsum", "Feature 1", "Quality Service"
2. ALWAYS use industry-specific content from the templates above
3. ALWAYS use 4 or 6 feature cards (NEVER 3 or 5)
4. ALWAYS use the industry-appropriate colors from Phase 1
5. ALWAYS use industry-specific CTAs, not generic "Get Started"
6. ALWAYS include industry-specific FAQs
7. ALWAYS use layoutStructure: "standard"

====================================
## STYLE
====================================

- Direct, terse, technical
- NEVER use lorem ipsum
- Generate realistic, industry-appropriate placeholder content
- Apply dark mode by default (backgroundColor: "#0a0a0a")`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, target, complexity } = await req.json();

    if (!idea) {
      return new Response(
        JSON.stringify({ error: 'Idea is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const userPrompt = `
App Idea: ${idea}

Target Builder: ${target || 'lovable'}
Complexity Level: ${complexity || 'standard'}

IMPORTANT: First detect the industry from the idea, then use the industry-specific templates to generate content. Do NOT use generic placeholders.

Generate the complete blueprint and build prompt. Return ONLY valid JSON matching the specified format.`;

    console.log('Calling Lovable AI Gateway for builder agent...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 8000,
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const spec = JSON.parse(jsonContent);

    console.log('Parsed spec successfully');

    return new Response(
      JSON.stringify(spec),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Builder agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
