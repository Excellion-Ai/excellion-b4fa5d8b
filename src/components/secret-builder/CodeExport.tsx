import { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SiteSpec } from '@/types/site-spec';
import { GeneratedCode } from '@/types/app-spec';

interface CodeExportProps {
  siteSpec?: SiteSpec | null;
  projectName?: string;
  generatedCode?: GeneratedCode | null;
}

export function generateHtmlFromSpec(spec: SiteSpec): string {
  const { theme, name, navigation, pages, footer } = spec;
  const page = pages[0];
  
  const fontFamilies = [theme.fontHeading, theme.fontBody]
    .filter(Boolean)
    .map(f => f.replace(/, sans-serif/g, '').replace(/'/g, ''))
    .join('|');

  const sections = page?.sections.map((section) => {
    switch (section.type) {
      case 'hero': {
        const content = section.content as any;
        return `
    <section class="hero" style="background-image: ${content.backgroundImage ? `url('${content.backgroundImage}')` : 'none'};">
      <div class="hero-content">
        <h1>${content.headline || ''}</h1>
        <p>${content.subheadline || ''}</p>
        <div class="cta-buttons">
          ${(content.ctas || []).map((cta: any) => 
            `<a href="${cta.href}" class="btn btn-${cta.variant}">${cta.label}</a>`
          ).join('')}
        </div>
      </div>
    </section>`;
      }
      case 'features': {
        const content = section.content as any;
        return `
    <section class="features">
      <h2>${content.title || ''}</h2>
      ${content.subtitle ? `<p class="subtitle">${content.subtitle}</p>` : ''}
      <div class="features-grid">
        ${(content.items || []).map((item: any) => `
        <div class="feature-card">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>`).join('')}
      </div>
    </section>`;
      }
      case 'pricing': {
        const content = section.content as any;
        return `
    <section class="pricing">
      <h2>${content.title || ''}</h2>
      ${content.subtitle ? `<p class="subtitle">${content.subtitle}</p>` : ''}
      <div class="pricing-grid">
        ${(content.items || []).map((tier: any) => `
        <div class="pricing-card${tier.highlighted ? ' highlighted' : ''}">
          <h3>${tier.name}</h3>
          <div class="price">${tier.price}${tier.period ? `<span>/${tier.period}</span>` : ''}</div>
          <ul>
            ${(tier.features || []).map((f: string) => `<li>✓ ${f}</li>`).join('')}
          </ul>
          <a href="#" class="btn btn-primary">${tier.ctaText || 'Get Started'}</a>
        </div>`).join('')}
      </div>
    </section>`;
      }
      case 'testimonials': {
        const content = section.content as any;
        return `
    <section class="testimonials">
      <h2>${content.title || ''}</h2>
      <div class="testimonials-grid">
        ${(content.items || []).map((item: any) => `
        <div class="testimonial-card">
          <p class="quote">"${item.quote}"</p>
          <div class="author">
            <strong>${item.name}</strong>
            <span>${item.role}</span>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
      }
      case 'faq': {
        const content = section.content as any;
        return `
    <section class="faq">
      <h2>${content.title || ''}</h2>
      <div class="faq-list">
        ${(content.items || []).map((item: any) => `
        <details class="faq-item">
          <summary>${item.question}</summary>
          <p>${item.answer}</p>
        </details>`).join('')}
      </div>
    </section>`;
      }
      case 'contact': {
        const content = section.content as any;
        return `
    <section class="contact">
      <h2>${content.title || ''}</h2>
      ${content.subtitle ? `<p class="subtitle">${content.subtitle}</p>` : ''}
      <form class="contact-form">
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Your Email" required>
        <textarea placeholder="Your Message" rows="4" required></textarea>
        <button type="submit" class="btn btn-primary">Send Message</button>
      </form>
    </section>`;
      }
      case 'cta': {
        const content = section.content as any;
        return `
    <section class="cta-section">
      <h2>${content.headline || ''}</h2>
      ${content.subheadline ? `<p>${content.subheadline}</p>` : ''}
      <div class="cta-buttons">
        ${(content.ctas || []).map((cta: any) => 
          `<a href="${cta.href}" class="btn btn-${cta.variant}">${cta.label}</a>`
        ).join('')}
      </div>
    </section>`;
      }
      default:
        return '';
    }
  }).join('\n') || '';

  const navHtml = navigation.length > 0 ? `
  <nav class="main-nav">
    <div class="nav-brand">${name}</div>
    <ul class="nav-links">
      ${navigation.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}
    </ul>
  </nav>` : '';

  const footerHtml = footer ? `
  <footer>
    <p>${footer.copyright}</p>
    ${footer.links ? `<div class="footer-links">
      ${footer.links.map(link => `<a href="${link.href}">${link.label}</a>`).join('')}
    </div>` : ''}
  </footer>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamilies.replace(/ /g, '+')}&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: ${theme.primaryColor};
      --secondary: ${theme.secondaryColor};
      --accent: ${theme.accentColor || theme.primaryColor};
      --bg: ${theme.backgroundColor};
      --text: ${theme.textColor};
      --font-heading: ${theme.fontHeading};
      --font-body: ${theme.fontBody};
    }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    h1, h2, h3, h4 { font-family: var(--font-heading); }
    .main-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: ${theme.darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)'};
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }
    .nav-brand { font-weight: 700; font-size: 1.25rem; }
    .nav-links { list-style: none; display: flex; gap: 2rem; }
    .nav-links a { text-decoration: none; color: var(--text); transition: color 0.2s; }
    .nav-links a:hover { color: var(--primary); }
    .hero {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: ${theme.darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'};
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; }
    .hero h1 { font-size: clamp(2rem, 5vw, 4rem); margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      font-size: 1rem;
    }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
    .btn-secondary { background: var(--secondary); color: white; }
    .btn-outline { border: 2px solid var(--primary); color: var(--primary); background: transparent; }
    section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
    .subtitle { opacity: 0.7; margin-top: 0.5rem; margin-bottom: 2rem; }
    .features-grid, .pricing-grid, .testimonials-grid {
      display: grid;
      gap: 2rem;
      margin-top: 2rem;
    }
    .features-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .feature-card {
      padding: 2rem;
      border-radius: 12px;
      background: ${theme.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
    }
    .feature-card h3 { margin-bottom: 0.5rem; color: var(--primary); }
    .pricing-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .pricing-card {
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid ${theme.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      text-align: center;
    }
    .pricing-card.highlighted {
      border-color: var(--primary);
      box-shadow: 0 0 30px ${theme.primaryColor}33;
    }
    .pricing-card .price { font-size: 2.5rem; font-weight: 700; margin: 1rem 0; }
    .pricing-card .price span { font-size: 1rem; opacity: 0.7; }
    .pricing-card ul { list-style: none; margin: 1.5rem 0; text-align: left; }
    .pricing-card li { padding: 0.5rem 0; }
    .testimonials-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .testimonial-card {
      padding: 2rem;
      border-radius: 12px;
      background: ${theme.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
    }
    .testimonial-card .quote { font-style: italic; margin-bottom: 1rem; }
    .testimonial-card .author strong { display: block; }
    .testimonial-card .author span { opacity: 0.7; font-size: 0.9rem; }
    .faq-list { max-width: 800px; margin: 2rem auto 0; }
    .faq-item {
      border-bottom: 1px solid ${theme.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      padding: 1rem 0;
    }
    .faq-item summary { cursor: pointer; font-weight: 600; }
    .faq-item p { margin-top: 1rem; opacity: 0.8; }
    .contact-form {
      max-width: 500px;
      margin: 2rem auto 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .contact-form input, .contact-form textarea {
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid ${theme.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
      background: transparent;
      color: var(--text);
      font-family: var(--font-body);
    }
    .cta-section {
      text-align: center;
      padding: 6rem 2rem;
      background: ${theme.darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
    }
    .cta-section h2 { margin-bottom: 1rem; }
    footer {
      text-align: center;
      padding: 2rem;
      opacity: 0.7;
      border-top: 1px solid ${theme.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    }
    .footer-links { margin-top: 1rem; display: flex; justify-content: center; gap: 2rem; }
    .footer-links a { color: var(--text); text-decoration: none; }
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hero { min-height: 60vh; }
    }
  </style>
</head>
<body>
${navHtml}
<main>
${sections}
</main>
${footerHtml}
</body>
</html>`;
}

export function CodeExport({ siteSpec, projectName, generatedCode }: CodeExportProps) {
  const [copied, setCopied] = useState(false);
  
  // Support legacy generatedCode prop for BotExperiment
  if (generatedCode) {
    const handleCopyLegacy = async () => {
      if (!generatedCode.reactCode) return;
      await navigator.clipboard.writeText(generatedCode.reactCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadLegacy = () => {
      if (!generatedCode.reactCode) return;
      const blob = new Blob([generatedCode.reactCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GeneratedSite.tsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('GeneratedSite.tsx downloaded!');
    };

    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCode className="h-3.5 w-3.5" />
            <span>GeneratedSite.tsx</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyLegacy} className="gap-1.5 h-7 text-xs">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="sm" onClick={handleDownloadLegacy} className="gap-1.5 h-7 text-xs">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1" scrollbarVariant="gold">
          <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {generatedCode.reactCode}
          </pre>
        </ScrollArea>
      </div>
    );
  }
  
  if (!siteSpec) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No site generated yet</p>
      </div>
    );
  }

  const html = generateHtmlFromSpec(siteSpec);

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectName || 'site').replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded!');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode className="h-3.5 w-3.5" />
          <span>index.html</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7 text-xs">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-1.5 h-7 text-xs">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1" scrollbarVariant="gold">
        <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {html}
        </pre>
      </ScrollArea>
    </div>
  );
}
