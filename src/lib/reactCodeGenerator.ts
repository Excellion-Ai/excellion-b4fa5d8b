import { SiteSpec } from '@/types/site-spec';

export interface ProjectFile {
  path: string;
  content: string;
}

export function generateReactProject(spec: SiteSpec, projectName: string): ProjectFile[] {
  const safeName = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const files: ProjectFile[] = [];
  
  files.push({ path: 'package.json', content: generatePackageJson(safeName) });
  files.push({ path: 'vite.config.ts', content: generateViteConfig() });
  files.push({ path: 'tailwind.config.js', content: generateTailwindConfig(spec) });
  files.push({ path: 'postcss.config.js', content: generatePostCSSConfig() });
  files.push({ path: 'tsconfig.json', content: generateTSConfig() });
  files.push({ path: 'index.html', content: generateIndexHtml(spec) });
  files.push({ path: 'README.md', content: generateReadme(spec, projectName) });
  files.push({ path: '.gitignore', content: generateGitIgnore() });
  
  files.push({ path: 'src/main.tsx', content: generateMain() });
  files.push({ path: 'src/App.tsx', content: generateApp(spec) });
  files.push({ path: 'src/index.css', content: generateIndexCSS(spec) });
  
  files.push({ path: 'src/components/Navbar.tsx', content: generateNavbar(spec) });
  files.push({ path: 'src/components/Footer.tsx', content: generateFooter(spec) });
  
  spec.pages[0]?.sections.forEach(section => {
    const componentName = `${capitalizeFirst(section.type)}Section`;
    files.push({
      path: `src/components/${componentName}.tsx`,
      content: generateSectionComponent(section, spec)
    });
  });

  return files;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generatePackageJson(name: string): string {
  return JSON.stringify({
    name,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview"
    },
    dependencies: {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^0.462.0"
    },
    devDependencies: {
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "autoprefixer": "^10.4.19",
      "postcss": "^8.4.38",
      "tailwindcss": "^3.4.3",
      "typescript": "^5.2.2",
      "vite": "^5.3.1"
    }
  }, null, 2);
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;
}

function generateTailwindConfig(spec: SiteSpec): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '${spec.theme.primaryColor}',
        secondary: '${spec.theme.secondaryColor}',
        accent: '${spec.theme.accentColor || spec.theme.primaryColor}',
      },
      fontFamily: {
        heading: ['${spec.theme.fontHeading.split(',')[0].replace(/'/g, '')}', 'sans-serif'],
        body: ['${spec.theme.fontBody.split(',')[0].replace(/'/g, '')}', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;
}

function generatePostCSSConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
}

function generateTSConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }]
  }, null, 2);
}

function generateIndexHtml(spec: SiteSpec): string {
  const fonts = [spec.theme.fontHeading, spec.theme.fontBody]
    .filter(Boolean)
    .map(f => f.split(',')[0].replace(/'/g, '').replace(/ /g, '+'))
    .filter((v, i, a) => a.indexOf(v) === i)
    .join('&family=');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.name}</title>
    <meta name="description" content="${spec.description || spec.name}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${fonts}&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function generateReadme(spec: SiteSpec, projectName: string): string {
  return `# ${projectName}

${spec.description || 'A modern website built with React and Tailwind CSS.'}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite

## Project Structure

\`\`\`
src/
├── components/     # React components
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
\`\`\`

---
Generated with Lovable Builder
`;
}

function generateGitIgnore(): string {
  return `# Dependencies
node_modules

# Build output
dist

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode
.idea

# OS
.DS_Store
Thumbs.db
`;
}

function generateMain(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
}

function generateApp(spec: SiteSpec): string {
  const page = spec.pages[0];
  const sectionImports = page?.sections
    .map(s => `import ${capitalizeFirst(s.type)}Section from './components/${capitalizeFirst(s.type)}Section'`)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join('\n') || '';

  const sectionComponents = page?.sections
    .map(s => `      <${capitalizeFirst(s.type)}Section />`)
    .join('\n') || '';

  return `import Navbar from './components/Navbar'
import Footer from './components/Footer'
${sectionImports}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Navbar />
      <main>
${sectionComponents}
      </main>
      <Footer />
    </div>
  )
}

export default App`;
}

function generateIndexCSS(spec: SiteSpec): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${spec.theme.primaryColor};
  --secondary: ${spec.theme.secondaryColor};
  --accent: ${spec.theme.accentColor || spec.theme.primaryColor};
  --background: ${spec.theme.backgroundColor};
  --foreground: ${spec.theme.textColor};
}

body {
  font-family: ${spec.theme.fontBody};
  background-color: var(--background);
  color: var(--foreground);
}

h1, h2, h3, h4, h5, h6 {
  font-family: ${spec.theme.fontHeading};
}

.bg-background { background-color: var(--background); }
.text-foreground { color: var(--foreground); }
.bg-primary { background-color: var(--primary); }
.text-primary { color: var(--primary); }
.bg-secondary { background-color: var(--secondary); }
.border-primary { border-color: var(--primary); }
`;
}

function generateNavbar(spec: SiteSpec): string {
  const navItems = spec.navigation.map(n => 
    `        <a href="${n.href}" className="hover:text-primary transition-colors">${n.label}</a>`
  ).join('\n');

  return `export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-gray-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="font-heading font-bold text-xl">
            ${spec.logo ? `<img src="${spec.logo}" alt="${spec.name}" className="h-8" />` : spec.name}
          </div>
          <div className="hidden md:flex items-center gap-8">
${navItems}
          </div>
        </div>
      </div>
    </nav>
  )
}`;
}

function generateFooter(spec: SiteSpec): string {
  const footerLinks = spec.footer?.links?.map(l => 
    `          <a href="${l.href}" className="hover:text-primary transition-colors">${l.label}</a>`
  ).join('\n') || '';

  return `export default function Footer() {
  return (
    <footer className="border-t border-gray-200/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-70">${spec.footer?.copyright || `© ${new Date().getFullYear()} ${spec.name}. All rights reserved.`}</p>
          <div className="flex gap-6 text-sm">
${footerLinks}
          </div>
        </div>
      </div>
    </footer>
  )
}`;
}

function generateSectionComponent(section: any, spec: SiteSpec): string {
  const content = section.content;
  
  switch (section.type) {
    case 'hero':
      return generateHeroSection(content, spec);
    case 'features':
      return generateFeaturesSection(content);
    case 'pricing':
      return generatePricingSection(content);
    case 'testimonials':
      return generateTestimonialsSection(content);
    case 'faq':
      return generateFAQSection(content);
    case 'contact':
      return generateContactSection(content);
    case 'cta':
      return generateCTASection(content);
    case 'stats':
      return generateStatsSection(content);
    case 'services':
      return generateServicesSection(content);
    case 'gallery':
      return generateGallerySection(content);
    case 'team':
      return generateTeamSection(content);
    case 'portfolio':
      return generatePortfolioSection(content);
    default:
      return generateCustomSection(content);
  }
}

function generateHeroSection(content: any, spec: SiteSpec): string {
  const bgStyle = content.backgroundImage 
    ? `style={{ backgroundImage: 'url(${content.backgroundImage})' }}` 
    : '';
  
  const ctas = content.ctas || [];
  const primaryCta = ctas.find((c: any) => c.variant === 'primary') || ctas[0];
  const secondaryCta = ctas.find((c: any) => c.variant !== 'primary');

  return `export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center px-4 py-20 bg-cover bg-center" ${bgStyle}>
      ${content.backgroundImage ? `<div className="absolute inset-0 ${spec.theme.darkMode ? 'bg-black/60' : 'bg-white/80'}" />` : ''}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
          ${content.headline || 'Welcome'}
        </h1>
        <p className="text-xl md:text-2xl opacity-80 mb-8 max-w-2xl mx-auto">
          ${content.subheadline || ''}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          ${primaryCta ? `<a href="${primaryCta.href}" className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all">${primaryCta.label}</a>` : ''}
          ${secondaryCta ? `<a href="${secondaryCta.href}" className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all">${secondaryCta.label}</a>` : ''}
        </div>
      </div>
    </section>
  )
}`;
}

function generateFeaturesSection(content: any): string {
  const items = (content.items || []).map((item: any) => 
    `        <div className="p-6 rounded-xl bg-gray-100/5 border border-gray-200/10">
          <h3 className="text-xl font-heading font-semibold mb-2 text-primary">${item.title}</h3>
          <p className="opacity-70">${item.description}</p>
        </div>`
  ).join('\n');

  return `export default function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Features'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-12 max-w-2xl mx-auto">${content.subtitle}</p>` : '<div className="mb-12" />'}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
${items}
        </div>
      </div>
    </section>
  )
}`;
}

function generatePricingSection(content: any): string {
  const tiers = (content.items || []).map((tier: any) => {
    const features = (tier.features || []).map((f: string) => 
      `            <li className="flex items-center gap-2"><span className="text-primary">✓</span> ${f}</li>`
    ).join('\n');
    
    return `        <div className="p-8 rounded-2xl ${tier.highlighted ? 'border-2 border-primary shadow-lg shadow-primary/20' : 'border border-gray-200/20'}">
          <h3 className="text-2xl font-heading font-bold mb-2">${tier.name}</h3>
          <div className="text-4xl font-bold mb-1">${tier.price}${tier.period ? `<span className="text-base font-normal opacity-70">/${tier.period}</span>` : ''}</div>
          ${tier.description ? `<p className="opacity-70 mb-6">${tier.description}</p>` : '<div className="mb-6" />'}
          <ul className="space-y-3 mb-8 text-left">
${features}
          </ul>
          <button className="${tier.highlighted ? 'bg-primary text-white' : 'border border-primary text-primary'} w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-all">
            ${tier.ctaText || 'Get Started'}
          </button>
        </div>`;
  }).join('\n');

  return `export default function PricingSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Pricing'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-12 max-w-2xl mx-auto">${content.subtitle}</p>` : '<div className="mb-12" />'}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
${tiers}
        </div>
      </div>
    </section>
  )
}`;
}

function generateTestimonialsSection(content: any): string {
  const testimonials = (content.items || []).map((item: any) => 
    `        <div className="p-6 rounded-xl bg-gray-100/5 border border-gray-200/10">
          <p className="italic mb-4">"${item.quote}"</p>
          <div>
            <p className="font-semibold">${item.name}</p>
            <p className="text-sm opacity-70">${item.role}</p>
          </div>
        </div>`
  ).join('\n');

  return `export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-gray-100/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">${content.title || 'What Our Customers Say'}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
${testimonials}
        </div>
      </div>
    </section>
  )
}`;
}

function generateFAQSection(content: any): string {
  const faqs = (content.items || []).map((item: any, i: number) => 
    `        <details className="border-b border-gray-200/20 py-4 group" ${i === 0 ? 'open' : ''}>
          <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
            ${item.question}
            <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="mt-4 opacity-70">${item.answer}</p>
        </details>`
  ).join('\n');

  return `export default function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">${content.title || 'Frequently Asked Questions'}</h2>
        <div>
${faqs}
        </div>
      </div>
    </section>
  )
}`;
}

function generateContactSection(content: any): string {
  return `export default function ContactSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Get in Touch'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-8">${content.subtitle}</p>` : '<div className="mb-8" />'}
        <form className="space-y-4">
          <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-gray-200/20 bg-transparent focus:border-primary outline-none transition-colors" required />
          <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg border border-gray-200/20 bg-transparent focus:border-primary outline-none transition-colors" required />
          <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200/20 bg-transparent focus:border-primary outline-none transition-colors resize-none" required></textarea>
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all">Send Message</button>
        </form>
        ${content.email ? `<p className="text-center mt-6 opacity-70">Or email us at <a href="mailto:${content.email}" className="text-primary">${content.email}</a></p>` : ''}
      </div>
    </section>
  )
}`;
}

function generateCTASection(content: any): string {
  const ctas = content.ctas || [];
  const primaryCta = ctas.find((c: any) => c.variant === 'primary') || ctas[0];

  return `export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gray-100/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">${content.headline || 'Let\'s Work Together'}</h2>
        ${content.subheadline ? `<p className="text-xl opacity-70 mb-8">${content.subheadline}</p>` : '<div className="mb-8" />'}
        ${primaryCta ? `<a href="${primaryCta.href}" className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all">${primaryCta.label}</a>` : ''}
      </div>
    </section>
  )
}`;
}

function generateStatsSection(content: any): string {
  const stats = (content.items || []).map((item: any) => 
    `        <div className="text-center">
          <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">${item.value}</div>
          <div className="opacity-70">${item.label}</div>
        </div>`
  ).join('\n');

  return `export default function StatsSection() {
  return (
    <section className="py-20 px-4 bg-gray-100/5">
      <div className="max-w-6xl mx-auto">
        ${content.title ? `<h2 className="text-3xl font-heading font-bold text-center mb-12">${content.title}</h2>` : ''}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
${stats}
        </div>
      </div>
    </section>
  )
}`;
}

function generateServicesSection(content: any): string {
  const services = (content.items || []).map((item: any) => 
    `        <div className="p-6 rounded-xl bg-gray-100/5 border border-gray-200/10">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" className="w-full h-48 object-cover rounded-lg mb-4" />` : ''}
          <h3 className="text-xl font-heading font-semibold mb-2">${item.title}</h3>
          <p className="opacity-70 mb-4">${item.description}</p>
          ${item.price ? `<p className="text-primary font-semibold">${item.price}${item.duration ? ` • ${item.duration}` : ''}</p>` : ''}
        </div>`
  ).join('\n');

  return `export default function ServicesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Our Services'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-12 max-w-2xl mx-auto">${content.subtitle}</p>` : '<div className="mb-12" />'}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
${services}
        </div>
      </div>
    </section>
  )
}`;
}

function generateGallerySection(content: any): string {
  const items = (content.items || []).map((item: any) => 
    `        <div className="group relative overflow-hidden rounded-xl">
          <img src="${item.image}" alt="${item.caption || ''}" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
          ${item.caption ? `<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p className="text-white">${item.caption}</p></div>` : ''}
        </div>`
  ).join('\n');

  return `export default function GallerySection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Gallery'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-12 max-w-2xl mx-auto">${content.subtitle}</p>` : '<div className="mb-12" />'}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
${items}
        </div>
      </div>
    </section>
  )
}`;
}

function generateTeamSection(content: any): string {
  const members = (content.items || []).map((member: any) => 
    `        <div className="text-center">
          ${member.avatar ? `<img src="${member.avatar}" alt="${member.name}" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />` : '<div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200" />'}
          <h3 className="text-xl font-heading font-semibold">${member.name}</h3>
          <p className="text-primary">${member.role}</p>
          ${member.bio ? `<p className="opacity-70 mt-2 text-sm">${member.bio}</p>` : ''}
        </div>`
  ).join('\n');

  return `export default function TeamSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Our Team'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-12 max-w-2xl mx-auto">${content.subtitle}</p>` : '<div className="mb-12" />'}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
${members}
        </div>
      </div>
    </section>
  )
}`;
}

function generatePortfolioSection(content: any): string {
  const items = (content.items || []).map((item: any) => 
    `        <a href="${item.link || '#'}" className="group block rounded-xl overflow-hidden border border-gray-200/10">
          <img src="${item.image}" alt="${item.title}" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="p-4">
            <h3 className="font-semibold mb-1">${item.title}</h3>
            ${item.description ? `<p className="text-sm opacity-70">${item.description}</p>` : ''}
            ${item.tags ? `<div className="flex flex-wrap gap-2 mt-2">${item.tags.map((t: string) => `<span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">${t}</span>`).join('')}</div>` : ''}
          </div>
        </a>`
  ).join('\n');

  return `export default function PortfolioSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">${content.title || 'Our Work'}</h2>
        ${content.subtitle ? `<p className="text-center opacity-70 mb-12 max-w-2xl mx-auto">${content.subtitle}</p>` : '<div className="mb-12" />'}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
${items}
        </div>
      </div>
    </section>
  )
}`;
}

function generateCustomSection(content: any): string {
  return `export default function CustomSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8">${content.title || 'Section'}</h2>
        ${content.body ? `<div className="prose max-w-none">${content.body}</div>` : ''}
      </div>
    </section>
  )
}`;
}
