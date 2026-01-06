import { SiteSpec } from '@/types/site-spec';
import { Layout, Briefcase, BookOpen, Users, GraduationCap, Dumbbell, Palette, Video, DollarSign, Heart } from 'lucide-react';

// Full SiteSpec definitions for each template
// Note: Hero and CTA use ctaText/secondaryCtaText format for preview component compatibility
export const TEMPLATE_SPECS: Record<string, SiteSpec> = {
  saas: {
    name: 'SaaS Starter',
    description: 'Modern SaaS landing page',
    businessModel: 'SERVICE_BASED',
    layoutStructure: 'bento',
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#22d3ee',
      backgroundColor: '#0f0f0f',
      textColor: '#f9fafb',
      darkMode: true,
      fontHeading: 'Inter, sans-serif',
      fontBody: 'Inter, sans-serif',
    },
    navigation: [],
    pages: [{
      path: '/',
      title: 'Home',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          label: 'Hero',
          content: {
            headline: 'Build faster with AI-powered tools',
            subheadline: 'Ship products 10x faster. Our platform automates your workflow so you can focus on what matters.',
            ctaText: 'Start Free Trial',
            secondaryCtaText: 'Watch Demo',
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Features',
          content: {
            title: 'Everything you need to scale',
            subtitle: 'Powerful features designed for modern teams',
            items: [
              { icon: 'Zap', title: 'AI Automation', description: 'Automate repetitive tasks with smart AI' },
              { icon: 'Shield', title: 'Real-time Analytics', description: 'Track metrics that matter instantly' },
              { icon: 'Users', title: 'Team Collaboration', description: 'Work together seamlessly' },
              { icon: 'Star', title: 'Enterprise Security', description: 'Bank-grade encryption for your data' },
            ],
          },
        },
        {
          id: 'pricing',
          type: 'pricing',
          label: 'Pricing',
          content: {
            title: 'Simple, transparent pricing',
            subtitle: 'No hidden fees. Cancel anytime.',
            items: [
              { name: 'Starter', price: '$29', period: '/mo', features: ['5 team members', '10GB storage', 'Basic analytics'], ctaText: 'Get Started' },
              { name: 'Pro', price: '$79', period: '/mo', features: ['Unlimited members', '100GB storage', 'Advanced analytics', 'Priority support'], highlighted: true, ctaText: 'Start Free Trial' },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['Custom limits', 'Dedicated support', 'SLA guarantee', 'SSO'], ctaText: 'Contact Sales' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Testimonials',
          content: {
            title: 'Loved by teams worldwide',
            subtitle: 'See what our customers have to say',
            items: [
              { name: 'Sarah Chen', role: 'CTO at TechCorp', quote: 'This tool cut our deployment time by 80%. Absolutely game-changing.', rating: 5 },
              { name: 'Mark Rivera', role: 'Founder, StartupX', quote: 'The best investment we made this year. ROI was immediate.', rating: 5 },
              { name: 'Anna Kim', role: 'Product Lead', quote: 'Finally a tool that just works. No more hassle.', rating: 5 },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'Ready to get started?',
          description: 'Join thousands of teams already using our platform.',
          content: {
            headline: 'Ready to get started?',
            subheadline: 'Join thousands of teams already using our platform.',
            ctaText: 'Start Your Free Trial',
          },
        },
      ],
    }],
    footer: { copyright: '© 2024 SaaS Co. All rights reserved.' },
  },

  restaurant: {
    name: 'Restaurant Template',
    description: 'Modern restaurant website',
    businessModel: 'HOSPITALITY',
    layoutStructure: 'standard',
    theme: {
      primaryColor: '#dc2626',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      backgroundColor: '#1a1a1a',
      textColor: '#fafafa',
      darkMode: true,
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Inter, sans-serif',
    },
    navigation: [],
    pages: [{
      path: '/',
      title: 'Home',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          label: 'Hero',
          content: {
            headline: 'Authentic flavors, unforgettable moments',
            subheadline: 'Experience fine dining crafted with passion. Fresh ingredients, bold flavors, warm hospitality.',
            ctaText: 'View Menu',
            secondaryCtaText: 'Book a Table',
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Menu Highlights',
          content: {
            title: 'Our Signature Dishes',
            subtitle: 'Chef-curated selections made with locally sourced ingredients',
            items: [
              { icon: 'Star', title: 'Wagyu Steak', description: 'Grade A5 Japanese wagyu, truffle butter, seasonal vegetables' },
              { icon: 'Star', title: 'Lobster Risotto', description: 'Fresh Maine lobster, saffron arborio, parmesan foam' },
              { icon: 'Star', title: 'Tasting Menu', description: "7-course chef's selection with wine pairings" },
              { icon: 'Star', title: 'Seasonal Specials', description: 'Rotating dishes featuring the freshest ingredients' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Reviews',
          content: {
            title: 'What our guests say',
            subtitle: 'Read reviews from our satisfied diners',
            items: [
              { name: 'James Miller', role: 'Food Critic', quote: 'An exceptional dining experience. Every dish was a masterpiece.', rating: 5 },
              { name: 'Emily Rose', role: 'Regular Guest', quote: 'My go-to spot for special occasions. Never disappoints.', rating: 5 },
              { name: 'David Park', role: 'Food Blogger', quote: 'The best fine dining in the city. Period.', rating: 5 },
            ],
          },
        },
        {
          id: 'contact',
          type: 'contact',
          label: 'Reservations',
          content: {
            title: 'Make a Reservation',
            subtitle: 'Book your table and let us create a memorable evening',
            phone: '(555) 123-4567',
            email: 'reservations@restaurant.com',
            address: '123 Culinary Street, Downtown',
          },
        },
      ],
    }],
    footer: { copyright: '© 2024 Fine Dining Co.' },
  },

  portfolio: {
    name: 'Creative Portfolio',
    description: 'Professional portfolio showcase',
    businessModel: 'PORTFOLIO_IDENTITY',
    layoutStructure: 'layered',
    theme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#eab308',
      accentColor: '#84cc16',
      backgroundColor: '#fafafa',
      textColor: '#171717',
      darkMode: false,
      fontHeading: 'Space Grotesk, sans-serif',
      fontBody: 'Inter, sans-serif',
    },
    navigation: [],
    pages: [{
      path: '/',
      title: 'Home',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          label: 'Hero',
          content: {
            headline: 'Designer & Developer',
            subheadline: "I craft digital experiences that blend creativity with functionality. Let's build something remarkable together.",
            ctaText: 'View My Work',
            secondaryCtaText: 'Get in Touch',
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
            title: 'By the Numbers',
            items: [
              { value: '8+', label: 'Years Experience' },
              { value: '50+', label: 'Projects Completed' },
              { value: '30+', label: 'Happy Clients' },
              { value: '12', label: 'Awards Won' },
            ],
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Services',
          content: {
            title: 'What I Do',
            subtitle: 'Specializing in end-to-end digital product design',
            items: [
              { icon: 'Palette', title: 'Brand Identity', description: 'Logo design, visual systems, brand guidelines' },
              { icon: 'Target', title: 'UI/UX Design', description: 'User research, wireframes, high-fidelity prototypes' },
              { icon: 'Code', title: 'Web Development', description: 'React, Next.js, responsive web applications' },
              { icon: 'Zap', title: 'Motion Design', description: 'Animations, micro-interactions, video editing' },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: "Let's work together",
          description: "Have a project in mind? I'd love to hear about it.",
          content: {
            headline: "Let's work together",
            subheadline: "Have a project in mind? I'd love to hear about it.",
            ctaText: 'Start a Project',
          },
        },
        {
          id: 'contact',
          type: 'contact',
          label: 'Contact',
          content: {
            title: 'Get in Touch',
            subtitle: "Drop me a line and let's create something amazing",
            email: 'hello@portfolio.com',
          },
        },
      ],
    }],
    footer: { copyright: '© 2024 Creative Studio' },
  },

  service: {
    name: 'Service Business',
    description: 'Professional service company',
    businessModel: 'SERVICE_BASED',
    layoutStructure: 'standard',
    theme: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#06b6d4',
      accentColor: '#14b8a6',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      darkMode: false,
      fontHeading: 'Inter, sans-serif',
      fontBody: 'Inter, sans-serif',
    },
    navigation: [],
    pages: [{
      path: '/',
      title: 'Home',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          label: 'Hero',
          content: {
            headline: 'Professional services you can trust',
            subheadline: 'We deliver exceptional results with a commitment to quality. Get a free consultation today.',
            ctaText: 'Get Free Quote',
            secondaryCtaText: 'Our Services',
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
            title: 'Why Choose Us',
            items: [
              { value: '15+', label: 'Years in Business' },
              { value: '1000+', label: 'Projects Done' },
              { value: '99%', label: 'Client Satisfaction' },
              { value: '24/7', label: 'Support' },
            ],
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Services',
          content: {
            title: 'Our Services',
            subtitle: 'Comprehensive solutions tailored to your needs',
            items: [
              { icon: 'Briefcase', title: 'Consulting', description: 'Expert advice to optimize your operations' },
              { icon: 'Wrench', title: 'Implementation', description: 'End-to-end project delivery and support' },
              { icon: 'Clock', title: 'Maintenance', description: 'Ongoing care to keep everything running smoothly' },
              { icon: 'Users', title: 'Training', description: 'Empower your team with the skills they need' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Reviews',
          content: {
            title: 'What clients say',
            subtitle: 'Trusted by businesses across the country',
            items: [
              { name: 'Robert Johnson', role: 'CEO, TechStart', quote: 'Incredibly professional team. They delivered beyond our expectations.', rating: 5 },
              { name: 'Lisa Wang', role: 'Operations Director', quote: 'Reliable, efficient, and always responsive. Highly recommend.', rating: 5 },
              { name: 'Tom Bradley', role: 'Small Business Owner', quote: 'The best service provider we have worked with.', rating: 5 },
            ],
          },
        },
        {
          id: 'faq',
          type: 'faq',
          label: 'FAQ',
          content: {
            title: 'Frequently Asked Questions',
            subtitle: 'Get answers to common questions',
            items: [
              { question: 'How do I get started?', answer: 'Simply fill out our contact form or call us for a free consultation.' },
              { question: 'What areas do you serve?', answer: 'We serve clients nationwide with both on-site and remote services.' },
              { question: 'Do you offer warranties?', answer: 'Yes, all our work comes with a satisfaction guarantee.' },
              { question: 'What are your business hours?', answer: 'We are available Monday to Friday, 9am to 6pm, with 24/7 emergency support.' },
            ],
          },
        },
        {
          id: 'contact',
          type: 'contact',
          label: 'Contact',
          content: {
            title: 'Request a Free Quote',
            subtitle: "Tell us about your project and we'll get back to you within 24 hours",
            phone: '(555) 987-6543',
            email: 'info@servicecompany.com',
            address: '456 Business Avenue, Suite 100',
          },
        },
      ],
    }],
    footer: { copyright: '© 2024 Service Company. Licensed & Insured.' },
  },

  ecommerce: {
    name: 'E-commerce Store',
    description: 'Modern online store',
    businessModel: 'RETAIL_COMMERCE',
    layoutStructure: 'horizontal',
    theme: {
      primaryColor: '#ec4899',
      secondaryColor: '#f43f5e',
      accentColor: '#a855f7',
      backgroundColor: '#fafafa',
      textColor: '#18181b',
      darkMode: false,
      fontHeading: 'Poppins, sans-serif',
      fontBody: 'Inter, sans-serif',
    },
    navigation: [],
    pages: [{
      path: '/',
      title: 'Home',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          label: 'Hero',
          content: {
            headline: 'New arrivals are here',
            subheadline: 'Discover the latest trends. Free shipping on orders over $50. Shop the collection now.',
            ctaText: 'Shop Now',
            secondaryCtaText: 'View Collections',
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Collections',
          content: {
            title: 'Shop by Category',
            subtitle: "Find exactly what you're looking for",
            items: [
              { icon: 'Star', title: 'New Arrivals', description: 'Fresh styles just dropped' },
              { icon: 'Heart', title: 'Best Sellers', description: 'Customer favorites' },
              { icon: 'Zap', title: 'Sale Items', description: 'Up to 50% off' },
              { icon: 'Award', title: 'Limited Edition', description: 'Exclusive pieces' },
            ],
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
            title: 'Shop With Confidence',
            items: [
              { value: '50K+', label: 'Happy Customers' },
              { value: '500+', label: 'Products' },
              { value: '4.9', label: 'Star Rating' },
              { value: 'Free', label: 'Shipping Over $50' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Reviews',
          content: {
            title: 'Customer Reviews',
            subtitle: 'See what our customers are saying',
            items: [
              { name: 'Jessica T.', role: 'Verified Buyer', quote: 'Amazing quality and fast shipping. Will definitely order again!', rating: 5 },
              { name: 'Michael K.', role: 'Verified Buyer', quote: 'Love my purchase! The fit is perfect and the material is premium.', rating: 5 },
              { name: 'Sarah M.', role: 'Verified Buyer', quote: 'Great customer service and beautiful products.', rating: 5 },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'Join our newsletter',
          description: 'Get 15% off your first order plus exclusive access to new drops.',
          content: {
            headline: 'Join our newsletter',
            subheadline: 'Get 15% off your first order plus exclusive access to new drops.',
            ctaText: 'Subscribe Now',
          },
        },
      ],
    }],
    footer: { copyright: '© 2024 Fashion Store. All rights reserved.' },
  },

  blog: {
    name: 'Blog & Content',
    description: 'Content-focused website',
    businessModel: 'PORTFOLIO_IDENTITY',
    layoutStructure: 'layered',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#34d399',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      darkMode: false,
      fontHeading: 'Merriweather, serif',
      fontBody: 'Source Sans Pro, sans-serif',
    },
    navigation: [],
    pages: [{
      path: '/',
      title: 'Home',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          label: 'Hero',
          content: {
            headline: 'Ideas that inspire action',
            subheadline: 'Thoughtful perspectives on technology, design, and building products that matter. Subscribe for weekly insights.',
            ctaText: 'Read Latest',
            secondaryCtaText: 'Subscribe Free',
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Categories',
          content: {
            title: 'Explore Topics',
            subtitle: 'Deep dives into the subjects that shape our industry',
            items: [
              { icon: 'Target', title: 'Product Strategy', description: 'Building products users love' },
              { icon: 'Palette', title: 'Design Systems', description: 'Scalable design at any size' },
              { icon: 'Code', title: 'Engineering', description: 'Technical deep dives and tutorials' },
              { icon: 'Users', title: 'Leadership', description: 'Growing teams and culture' },
            ],
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
            title: 'Growing Community',
            items: [
              { value: '200+', label: 'Articles' },
              { value: '50K', label: 'Subscribers' },
              { value: '2M', label: 'Monthly Readers' },
              { value: 'Weekly', label: 'New Content' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Reader Feedback',
          content: {
            title: 'What readers say',
            subtitle: 'Join our growing community of readers',
            items: [
              { name: 'David Park', role: 'Product Manager', quote: 'The most actionable content I read. Every article teaches something new.', rating: 5 },
              { name: 'Anna Schmidt', role: 'Designer', quote: 'A must-read newsletter. Quality over quantity, always.', rating: 5 },
              { name: 'Chris Lee', role: 'Engineer', quote: 'Deep technical content without the fluff.', rating: 5 },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'Never miss an update',
          description: 'Join 50,000+ readers getting weekly insights straight to their inbox.',
          content: {
            headline: 'Never miss an update',
            subheadline: 'Join 50,000+ readers getting weekly insights straight to their inbox.',
            ctaText: 'Subscribe for Free',
          },
        },
      ],
    }],
    footer: { copyright: '© 2024 The Blog. Made with care.' },
  },
};

// Template metadata with icons
export const TEMPLATES = [
  {
    id: 'online-course',
    title: 'Online Course',
    tags: ['Education', 'Self-paced'],
    bestFor: 'Video courses, tutorials, skill training',
    icon: GraduationCap,
    prompt: 'A self-paced online course with video modules, quizzes, and certification',
    spec: TEMPLATE_SPECS.saas,
  },
  {
    id: 'coaching-program',
    title: 'Coaching Program',
    tags: ['1-on-1', 'Mentorship'],
    bestFor: 'Life coaches, business mentors, consultants',
    icon: Users,
    prompt: 'A coaching program with group calls, private sessions, and community access',
    spec: TEMPLATE_SPECS.service,
  },
  {
    id: 'cohort-course',
    title: 'Cohort-Based Course',
    tags: ['Live', 'Community'],
    bestFor: 'Bootcamps, accelerators, group programs',
    icon: Video,
    prompt: 'A cohort-based course with live sessions, homework, and peer learning',
    spec: TEMPLATE_SPECS.saas,
  },
  {
    id: 'fitness-program',
    title: 'Fitness Program',
    tags: ['Health', 'Wellness'],
    bestFor: 'Personal trainers, yoga instructors, nutrition coaches',
    icon: Dumbbell,
    prompt: 'A fitness program with workout videos, meal plans, and progress tracking',
    spec: TEMPLATE_SPECS.service,
  },
  {
    id: 'creative-masterclass',
    title: 'Creative Masterclass',
    tags: ['Creative', 'Skills'],
    bestFor: 'Artists, designers, musicians, writers',
    icon: Palette,
    prompt: 'A creative masterclass teaching artistic skills with project-based learning',
    spec: TEMPLATE_SPECS.portfolio,
  },
  {
    id: 'membership-site',
    title: 'Membership Site',
    tags: ['Recurring', 'Content'],
    bestFor: 'Content creators, newsletters, exclusive communities',
    icon: DollarSign,
    prompt: 'A membership site with exclusive content, community access, and monthly perks',
    spec: TEMPLATE_SPECS.blog,
  },
];
