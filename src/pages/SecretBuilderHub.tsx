import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, Layout, ShoppingBag, Calendar, Briefcase } from 'lucide-react';
import excellionLogo from '@/assets/excellion-logo.png';

const TEMPLATES = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Online ordering & menu',
    icon: ShoppingBag,
    prompt: 'A modern restaurant website with online ordering, menu display, and reservations',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase your work',
    icon: Layout,
    prompt: 'A professional portfolio website to showcase my work and attract clients',
  },
  {
    id: 'booking',
    title: 'Booking Service',
    description: 'Appointments & scheduling',
    icon: Calendar,
    prompt: 'A service business website with appointment booking and service listings',
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Professional services',
    icon: Briefcase,
    prompt: 'A professional agency website with services, team, and case studies',
  },
];

export default function SecretBuilderHub() {
  const [idea, setIdea] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (prompt?: string) => {
    const ideaToUse = prompt || idea;
    if (!ideaToUse.trim()) return;
    
    // Navigate to the builder with the idea as state
    navigate('/secret-builder', { state: { initialIdea: ideaToUse } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-background to-pink-900/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-600/20 via-transparent to-transparent" />
      
      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={excellionLogo} alt="Excellion" className="h-8 w-8" />
          <span className="text-lg font-semibold text-foreground">Secret Builder</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Let's build something amazing
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Describe your website idea and watch it come to life
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-2xl">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-2 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your website idea..."
                  className="border-0 bg-transparent text-lg h-14 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
              </div>
              <Button
                onClick={() => handleSubmit()}
                disabled={!idea.trim()}
                size="lg"
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="w-full max-w-4xl mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start with a template
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSubmit(template.prompt)}
                className="group p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-medium text-foreground mb-1">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
