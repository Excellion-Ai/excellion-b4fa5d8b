import { SiteSpec } from '@/types/site-spec';
import { Layout, ShoppingBag, Briefcase, BookOpen, Palette, Users } from 'lucide-react';

// Full SiteSpec definitions for each template
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
    navigation: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Testimonials', href: '#testimonials' },
    ],
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
            ctas: [
              { label: 'Start Free Trial', href: '#', variant: 'primary' },
              { label: 'Watch Demo', href: '#', variant: 'outline' },
            ],
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
              { title: 'AI Automation', description: 'Automate repetitive tasks with smart AI' },
              { title: 'Real-time Analytics', description: 'Track metrics that matter instantly' },
              { title: 'Team Collaboration', description: 'Work together seamlessly' },
              { title: 'Enterprise Security', description: 'Bank-grade encryption for your data' },
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
              { name: 'Enterprise', price: 'Custom', features: ['Custom limits', 'Dedicated support', 'SLA guarantee', 'SSO'], ctaText: 'Contact Sales' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Testimonials',
          content: {
            title: 'Loved by teams worldwide',
            items: [
              { name: 'Sarah Chen', role: 'CTO at TechCorp', quote: 'This tool cut our deployment time by 80%. Absolutely game-changing.', rating: 5 },
              { name: 'Mark Rivera', role: 'Founder, StartupX', quote: 'The best investment we made this year. ROI was immediate.', rating: 5 },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'CTA',
          content: {
            headline: 'Ready to get started?',
            subheadline: 'Join thousands of teams already using our platform.',
            ctas: [{ label: 'Start Your Free Trial', href: '#', variant: 'primary' }],
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
    navigation: [
      { label: 'Menu', href: '#menu' },
      { label: 'About', href: '#about' },
      { label: 'Reserve', href: '#contact' },
    ],
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
            ctas: [
              { label: 'View Menu', href: '#menu', variant: 'primary' },
              { label: 'Book a Table', href: '#contact', variant: 'outline' },
            ],
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
              { title: 'Wagyu Steak', description: 'Grade A5 Japanese wagyu, truffle butter, seasonal vegetables' },
              { title: 'Lobster Risotto', description: 'Fresh Maine lobster, saffron arborio, parmesan foam' },
              { title: 'Tasting Menu', description: '7-course chef\'s selection with wine pairings' },
              { title: 'Seasonal Specials', description: 'Rotating dishes featuring the freshest ingredients' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Reviews',
          content: {
            title: 'What our guests say',
            items: [
              { name: 'James Miller', role: 'Food Critic', quote: 'An exceptional dining experience. Every dish was a masterpiece.', rating: 5 },
              { name: 'Emily Rose', role: 'Regular Guest', quote: 'My go-to spot for special occasions. Never disappoints.', rating: 5 },
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
    layoutStructure: 'split-screen',
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
    navigation: [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
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
            subheadline: 'I craft digital experiences that blend creativity with functionality. Let\'s build something remarkable together.',
            ctas: [
              { label: 'View My Work', href: '#work', variant: 'primary' },
              { label: 'Get in Touch', href: '#contact', variant: 'outline' },
            ],
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
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
              { title: 'Brand Identity', description: 'Logo design, visual systems, brand guidelines' },
              { title: 'UI/UX Design', description: 'User research, wireframes, high-fidelity prototypes' },
              { title: 'Web Development', description: 'React, Next.js, responsive web applications' },
              { title: 'Motion Design', description: 'Animations, micro-interactions, video editing' },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'CTA',
          content: {
            headline: 'Let\'s work together',
            subheadline: 'Have a project in mind? I\'d love to hear about it.',
            ctas: [{ label: 'Start a Project', href: '#contact', variant: 'primary' }],
          },
        },
        {
          id: 'contact',
          type: 'contact',
          label: 'Contact',
          content: {
            title: 'Get in Touch',
            subtitle: 'Drop me a line and let\'s create something amazing',
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
    navigation: [
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Contact', href: '#contact' },
    ],
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
            ctas: [
              { label: 'Get Free Quote', href: '#contact', variant: 'primary' },
              { label: 'Our Services', href: '#services', variant: 'outline' },
            ],
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
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
              { title: 'Consulting', description: 'Expert advice to optimize your operations' },
              { title: 'Implementation', description: 'End-to-end project delivery and support' },
              { title: 'Maintenance', description: 'Ongoing care to keep everything running smoothly' },
              { title: 'Training', description: 'Empower your team with the skills they need' },
            ],
          },
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          label: 'Reviews',
          content: {
            title: 'What clients say',
            items: [
              { name: 'Robert Johnson', role: 'CEO, TechStart', quote: 'Incredibly professional team. They delivered beyond our expectations.', rating: 5 },
              { name: 'Lisa Wang', role: 'Operations Director', quote: 'Reliable, efficient, and always responsive. Highly recommend.', rating: 5 },
            ],
          },
        },
        {
          id: 'faq',
          type: 'faq',
          label: 'FAQ',
          content: {
            title: 'Frequently Asked Questions',
            items: [
              { question: 'How do I get started?', answer: 'Simply fill out our contact form or call us for a free consultation.' },
              { question: 'What areas do you serve?', answer: 'We serve clients nationwide with both on-site and remote services.' },
              { question: 'Do you offer warranties?', answer: 'Yes, all our work comes with a satisfaction guarantee.' },
            ],
          },
        },
        {
          id: 'contact',
          type: 'contact',
          label: 'Contact',
          content: {
            title: 'Request a Free Quote',
            subtitle: 'Tell us about your project and we\'ll get back to you within 24 hours',
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
    navigation: [
      { label: 'Shop', href: '#shop' },
      { label: 'Collections', href: '#collections' },
      { label: 'Sale', href: '#sale' },
    ],
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
            ctas: [
              { label: 'Shop Now', href: '#shop', variant: 'primary' },
              { label: 'View Collections', href: '#collections', variant: 'outline' },
            ],
          },
        },
        {
          id: 'features',
          type: 'features',
          label: 'Collections',
          content: {
            title: 'Shop by Category',
            subtitle: 'Find exactly what you\'re looking for',
            items: [
              { title: 'New Arrivals', description: 'Fresh styles just dropped' },
              { title: 'Best Sellers', description: 'Customer favorites' },
              { title: 'Sale Items', description: 'Up to 50% off' },
              { title: 'Limited Edition', description: 'Exclusive pieces' },
            ],
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
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
            items: [
              { name: 'Jessica T.', role: 'Verified Buyer', quote: 'Amazing quality and fast shipping. Will definitely order again!', rating: 5 },
              { name: 'Michael K.', role: 'Verified Buyer', quote: 'Love my purchase! The fit is perfect and the material is premium.', rating: 5 },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'CTA',
          content: {
            headline: 'Join our newsletter',
            subheadline: 'Get 15% off your first order plus exclusive access to new drops.',
            ctas: [{ label: 'Subscribe Now', href: '#', variant: 'primary' }],
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
    navigation: [
      { label: 'Articles', href: '#articles' },
      { label: 'About', href: '#about' },
      { label: 'Subscribe', href: '#subscribe' },
    ],
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
            ctas: [
              { label: 'Read Latest', href: '#articles', variant: 'primary' },
              { label: 'Subscribe Free', href: '#subscribe', variant: 'outline' },
            ],
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
              { title: 'Product Strategy', description: 'Building products users love' },
              { title: 'Design Systems', description: 'Scalable design at any size' },
              { title: 'Engineering', description: 'Technical deep dives and tutorials' },
              { title: 'Leadership', description: 'Growing teams and culture' },
            ],
          },
        },
        {
          id: 'stats',
          type: 'stats',
          label: 'Stats',
          content: {
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
            items: [
              { name: 'David Park', role: 'Product Manager', quote: 'The most actionable content I read. Every article teaches something new.', rating: 5 },
              { name: 'Anna Schmidt', role: 'Designer', quote: 'A must-read newsletter. Quality over quantity, always.', rating: 5 },
            ],
          },
        },
        {
          id: 'cta',
          type: 'cta',
          label: 'Subscribe',
          content: {
            headline: 'Never miss an update',
            subheadline: 'Join 50,000+ readers getting weekly insights straight to their inbox.',
            ctas: [{ label: 'Subscribe for Free', href: '#', variant: 'primary' }],
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
    id: 'saas',
    title: 'SaaS Landing Page',
    tags: ['Marketing', 'Tech'],
    bestFor: 'Software products, apps, digital services',
    icon: Layout,
    prompt: 'A modern SaaS landing page with hero, features grid, pricing tiers, testimonials, and CTA sections',
    spec: TEMPLATE_SPECS.saas,
  },
  {
    id: 'restaurant',
    title: 'Restaurant & Menu',
    tags: ['Food', 'Local'],
    bestFor: 'Restaurants, cafes, food trucks',
    icon: ShoppingBag,
    prompt: 'A modern restaurant website with online ordering, menu display, and reservations',
    spec: TEMPLATE_SPECS.restaurant,
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    tags: ['Creative', 'Personal'],
    bestFor: 'Designers, developers, freelancers',
    icon: Palette,
    prompt: 'A professional portfolio website to showcase my work and attract clients',
    spec: TEMPLATE_SPECS.portfolio,
  },
  {
    id: 'service',
    title: 'Service Business',
    tags: ['Local', 'Services'],
    bestFor: 'Contractors, consultants, agencies',
    icon: Briefcase,
    prompt: 'A service business website with appointment booking, testimonials, and service listings',
    spec: TEMPLATE_SPECS.service,
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    tags: ['Retail', 'Online'],
    bestFor: 'Online shops, dropshipping, D2C brands',
    icon: ShoppingBag,
    prompt: 'An e-commerce store with product catalog, shopping cart, and checkout flow',
    spec: TEMPLATE_SPECS.ecommerce,
  },
  {
    id: 'blog',
    title: 'Blog / Content',
    tags: ['Content', 'Media'],
    bestFor: 'Writers, publications, thought leaders',
    icon: BookOpen,
    prompt: 'A blog website with articles, categories, and newsletter signup',
    spec: TEMPLATE_SPECS.blog,
  },
];
