import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Send,
  Palette,
  MousePointer2,
  Globe,
  Download,
  CheckCircle2,
  Play,
  ChevronRight,
  Lightbulb,
  Zap,
  Eye,
  Pencil,
  LayoutGrid,
  Image,
  FileText,
  Rocket
} from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: 'Describe Your Business',
    icon: Sparkles,
    duration: '1 min',
    description: 'Start by entering a clear description of your business or website idea in the prompt field.',
    details: [
      'Be specific about your industry (e.g., "Italian restaurant in Brooklyn" or "Personal injury law firm")',
      'Mention your target audience and main services',
      'Include any specific features you need (booking, contact form, pricing)',
      'The more detail you provide, the better your generated site will match your vision'
    ],
    tips: [
      'Enable "Auto-improve prompts" for AI-enhanced descriptions',
      'Use the attachment button to add images, brand kits, or reference links',
      'Keep it under 500 words for best results'
    ]
  },
  {
    id: 2,
    title: 'Generate Your Website',
    icon: Zap,
    duration: '10-20 sec',
    description: 'Click the send button to generate your complete website. Our AI will create pages, sections, and content tailored to your business.',
    details: [
      'The AI analyzes your industry and creates appropriate sections',
      'You\'ll see a live preview as the site generates',
      'Generation typically takes 10-20 seconds',
      'The progress indicator shows token count and estimated time'
    ],
    tips: [
      'Watch the preview panel to see your site come to life',
      'Initial generation creates a complete multi-section site',
      'Don\'t worry if it\'s not perfect—you can refine everything next'
    ]
  },
  {
    id: 3,
    title: 'Review Your Site',
    icon: Eye,
    duration: '2-5 min',
    description: 'Once generated, explore your new website using the device preview options to see how it looks on desktop, tablet, and mobile.',
    details: [
      'Use the device icons (Desktop, Tablet, Mobile) to test responsiveness',
      'Scroll through all sections to see the complete site',
      'Check that the content matches your business accurately',
      'Note any sections you want to add, remove, or modify'
    ],
    tips: [
      'The refresh button re-renders without losing data',
      'Use undo/redo to navigate between versions',
      'Switch between pages using the Page Manager'
    ]
  },
  {
    id: 4,
    title: 'Edit with Visual Mode',
    icon: MousePointer2,
    duration: '5-10 min',
    description: 'Click the Visual Edit button to make direct changes. Select any element to edit text, colors, images, and more—no credits used!',
    details: [
      'Click "Visual Edit" button in the toolbar or chat area',
      'Hover over elements to see what\'s editable',
      'Click to select and open the edit panel',
      'Changes apply instantly without AI regeneration'
    ],
    tips: [
      'Visual edits are FREE and don\'t use credits',
      'Edit headings, paragraphs, buttons, and images directly',
      'Change colors, fonts, spacing, and icons',
      'Click "Done" when finished to exit visual mode'
    ]
  },
  {
    id: 5,
    title: 'Refine with Chat',
    icon: Send,
    duration: 'Varies',
    description: 'Use the chat to make larger changes. Ask the AI to add sections, change layouts, update content, or make style adjustments.',
    details: [
      'Type natural language requests like "Add a FAQ section"',
      'Ask for specific changes: "Make the hero headline more impactful"',
      'Request new pages: "Add an About Us page"',
      'Combine multiple requests in one message for efficiency'
    ],
    tips: [
      'Be specific about what you want changed',
      'Each chat message uses 1-5 credits depending on complexity',
      'Use dynamic suggestion buttons for quick improvements',
      'The AI remembers your conversation context'
    ]
  },
  {
    id: 6,
    title: 'Customize the Theme',
    icon: Palette,
    duration: '2-3 min',
    description: 'Open the Theme Editor to change your site\'s color scheme, fonts, and overall aesthetic to match your brand.',
    details: [
      'Click the palette icon or "Theme" button in the toolbar',
      'Choose from preset themes or create custom colors',
      'Set primary, secondary, and accent colors',
      'Preview changes in real-time before applying'
    ],
    tips: [
      'Use your brand colors for consistency',
      'Dark themes work great for modern businesses',
      'Consider accessibility when choosing contrast'
    ]
  },
  {
    id: 7,
    title: 'Manage Pages & Sections',
    icon: LayoutGrid,
    duration: '3-5 min',
    description: 'Use the Page Manager to add new pages and the Section Library to add pre-built components to any page.',
    details: [
      'Click "Pages" to see all pages in your site',
      'Add common pages like About, Services, Contact',
      'Drag sections to reorder them on any page',
      'Delete sections you don\'t need'
    ],
    tips: [
      'Each page can have its own unique sections',
      'Use the Section Library for quick additions',
      'Keep navigation simple with 4-6 main pages max'
    ]
  },
  {
    id: 8,
    title: 'Add Images & Media',
    icon: Image,
    duration: '5-10 min',
    description: 'Upload your own images or use AI Image Generation to create unique visuals for your site.',
    details: [
      'Click "AI Image" in the toolbar to generate images',
      'Use Visual Edit mode to replace placeholder images',
      'Upload logos, product photos, team headshots',
      'All images are optimized automatically'
    ],
    tips: [
      'AI-generated images cost 2 credits each',
      'Use high-quality images for hero sections',
      'Consistent image style improves professionalism'
    ]
  },
  {
    id: 9,
    title: 'Save & Version History',
    icon: FileText,
    duration: '1 min',
    description: 'Your work is auto-saved, but you can also create bookmarks and access version history to restore previous states.',
    details: [
      'Projects auto-save after each generation',
      'Use Ctrl+S (or Cmd+S) to force save',
      'Access Version History with Ctrl+H',
      'Create bookmarks at key milestones'
    ],
    tips: [
      'Bookmark before making major changes',
      'Version history shows all saved states',
      'You can restore any previous version instantly'
    ]
  },
  {
    id: 10,
    title: 'Publish Your Website',
    icon: Globe,
    duration: '30 sec',
    description: 'When you\'re ready, click the Publish button to make your site live. Get a shareable URL instantly!',
    details: [
      'Click the "Publish" button in the top-right toolbar',
      'Your site is deployed to a global CDN',
      'Get a shareable .excellion.site URL immediately',
      'Copy and share your live website link'
    ],
    tips: [
      'Publishing is FREE on all plans',
      'Sites update instantly when you republish',
      'Connect a custom domain in Settings for a professional URL'
    ]
  },
  {
    id: 11,
    title: 'Export Your Code',
    icon: Download,
    duration: '1 min',
    description: 'Download your complete React project as a ZIP file, or deploy directly to Vercel for production hosting.',
    details: [
      'Click "Export" in the toolbar to see options',
      'Download as ZIP includes all React components',
      'One-click Vercel deployment for instant hosting',
      'HTML export available for simple hosting'
    ],
    tips: [
      'Code export costs 2 credits',
      'ZIP includes package.json and Tailwind config',
      'You own your code—no lock-in'
    ]
  }
];

const QUICK_TIPS = [
  { title: 'Keyboard Shortcuts', description: 'Press ? to see all shortcuts', icon: '⌨️' },
  { title: 'Undo Mistakes', description: 'Ctrl+Z to undo, Ctrl+Y to redo', icon: '↩️' },
  { title: 'Mobile Preview', description: 'Press Ctrl+3 for mobile view', icon: '📱' },
  { title: 'Free Visual Edits', description: 'Visual mode edits don\'t use credits', icon: '🎨' },
  { title: 'Auto-Save', description: 'Your work is saved automatically', icon: '💾' },
  { title: 'Help Chat', description: 'Click "Help" for instant help', icon: '💬' },
];

export default function BuilderResources() {
  const navigate = useNavigate();
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/secret-builder-hub')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Resources & Tutorial</h1>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="w-3 h-3 mr-1" />
            Getting Started Guide
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Build Your Website in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow this step-by-step tutorial to create, customize, and publish your professional website—no coding required.
          </p>
        </div>

        {/* Quick Tips Grid */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Quick Tips
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_TIPS.map((tip, index) => (
              <Card key={index} className="bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-colors">
                <CardContent className="p-3 text-center">
                  <span className="text-2xl mb-2 block">{tip.icon}</span>
                  <p className="text-xs font-medium">{tip.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Step-by-Step Tutorial */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Step-by-Step Tutorial
          </h3>

          {TUTORIAL_STEPS.map((step) => (
            <Card
              key={step.id}
              className={`transition-all duration-200 ${
                expandedStep === step.id
                  ? 'ring-2 ring-primary/50 bg-secondary/20'
                  : 'hover:bg-secondary/10'
              }`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      expandedStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Step {step.id}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        {step.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {step.duration}
                    </Badge>
                    <ChevronRight
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedStep === step.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>

              {expandedStep === step.id && (
                <CardContent className="pt-0 pb-6">
                  <div className="ml-14 space-y-6">
                    {/* Details */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                        What to do
                      </h4>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Pro Tips
                      </h4>
                      <ul className="space-y-2">
                        {step.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center py-12 border-t">
          <h3 className="text-2xl font-bold mb-4">Ready to Build?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Head back to the Studio and start creating your professional website in minutes.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/secret-builder-hub')}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Go to Studio
          </Button>
        </div>
      </main>
    </div>
  );
}
