# Excellion Design Rules (v2.0)
# This file is automatically injected into AI generation prompts

## IMAGE REQUIREMENTS (CRITICAL - HIGHEST PRIORITY)

### Hero Section Images
- **ALWAYS** include `backgroundImage` with a real Unsplash URL
- Format: `https://images.unsplash.com/photo-[ID]?w=1600&h=900&fit=crop`
- Match image to the business type (restaurant = food images, gym = fitness images)
- NEVER use placeholder text or empty strings
- Prefer `split` hero variant for visual businesses (shows image prominently)

### Gallery/Portfolio Section Images
- EVERY item MUST have an `image` field with Unsplash URL
- Use relevant keywords matching the business niche

### Team Section Avatars
- Include `avatar` URLs using: `https://images.unsplash.com/photo-[ID]?w=200&h=200&fit=crop&facepad=2`
- Use professional headshot-style photos

### Services Section Images
- Include `image` fields for visual service cards
- Match images to specific service offerings

### Stock Photo Keywords by Industry
| Industry | Unsplash Keywords |
|----------|------------------|
| Restaurant | restaurant interior, chef cooking, fine dining, food plating |
| Fitness | gym equipment, workout, personal training, fitness class |
| Salon | hair salon, beauty treatment, stylist, spa |
| Contractor | construction worker, renovation, tools, home improvement |
| Dental | dental office, dentist, smile, dental care |
| Real Estate | modern home, house exterior, luxury interior, architecture |
| Legal | law office, legal documents, courthouse, professional meeting |
| Medical | medical office, healthcare, doctor patient, clinic |
| Automotive | car dealership, auto repair, mechanic, vehicle |
| Photography | camera, studio, portrait session, photography equipment |
| Pet Services | dog grooming, pet care, veterinary, happy pets |
| Landscaping | garden design, lawn care, outdoor living, landscaping |

## TYPOGRAPHY RULES (MANDATORY)

### Headlines
- **MAXIMUM 8 WORDS** for hero headlines
- **MAXIMUM 15 WORDS** for any subheadline
- Use active voice, not passive
- Lead with benefit, not feature
- NO sentences in headlines - use punchy fragments

### Body Copy
- Keep paragraphs to 2-3 sentences MAX
- Use short, declarative sentences
- Front-load important information

## LAYOUT RULES (MANDATORY)

### Grid-First Philosophy
- PREFER Bento-style asymmetric grids over stacked sections
- NEVER stack more than 2 text blocks vertically without visual break
- Use 2-column or 3-column layouts for features (not 4+)
- Hero sections should use split-image-right variant for visual businesses

### Whitespace
- Minimum py-16 padding between sections
- Hero sections need py-24 minimum
- Feature cards need breathing room (gap-6 minimum)

### Visual Hierarchy
- One dominant element per section (headline OR image, not competing)
- CTAs must have high contrast against background
- Icons should be subtle, not overpowering

## BANNED WORDS & PHRASES (INSTANT REJECTION)

### Corporate Buzzwords (NEVER USE)
- "Unlock" / "Unlock your potential"
- "Elevate" / "Elevate your experience"  
- "Synergy" / "Synergize"
- "Leverage" (as a verb)
- "Empower" / "Empowerment"
- "Revolutionize" / "Revolutionary"
- "Cutting-edge" / "Bleeding-edge"
- "Best-in-class"
- "World-class"
- "Game-changing"
- "Next-level"
- "Seamless" (overused)
- "Robust" (tech jargon)
- "Holistic"
- "Paradigm"
- "Disrupt" / "Disruptive"
- "Transform" / "Transformative" (unless actual physical transformation)

### Generic Filler (NEVER USE)
- "Welcome to [Name]"
- "We're passionate about..."
- "Your trusted partner in..."
- "Excellence in everything we do"
- "Committed to quality"
- "Dedicated professionals"
- "One-stop shop"
- "Take it to the next level"

### Tech Jargon for Non-Tech Businesses (NEVER USE)
- "Fast & Reliable" 
- "Secure" / "Your data is protected"
- "Built for speed"
- "Scalable solutions"
- "Enterprise-grade"

## CONTENT QUALITY STANDARDS

### The 3-Second Test
Every headline must pass: "Can I understand the value in 3 seconds?"

### The Specificity Rule
- BAD: "Quality service you can trust"
- GOOD: "Same-day repairs, 2-year warranty"

### The Human Voice Test
- Would a real business owner actually say this to a customer face-to-face?
- If it sounds like marketing copy, rewrite it

## VARIANT SELECTION GUIDELINES

### Hero Variants
- `split`: Use for services, portfolios, visual businesses (PREFERRED - shows images)
- `simple-centered`: Use for SaaS, apps, minimal brands
- `minimal-impact`: Use for luxury brands, high-end services
- `glassmorphism`: Use for tech, creative agencies

### Features Variants  
- `grid-3`: Default for most businesses (balanced, scannable)
- `bento-box`: Use for tech companies, creative agencies
- `zigzag-large`: Use for detailed explanations, process-heavy services

## THREE-LAYER IMAGE PROTECTION SYSTEM

The Secret Builder uses three layers to ensure professional images:
1. **AI Prompt Layer**: Bot-chat instructs AI to include Unsplash URLs
2. **Post-Processor Layer**: BuilderShell calls imageFiller after parsing
3. **Renderer Fallback**: SiteRenderer fills missing images before display

If any layer fails, the next layer catches missing images.
