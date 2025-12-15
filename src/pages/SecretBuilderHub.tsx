import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  Sparkles, 
  Layout, 
  ShoppingBag, 
  Calendar, 
  Briefcase,
  Plus,
  Paperclip,
  Palette,
  MessageSquare,
  Waves,
  Home,
  Search,
  Compass,
  Gift,
  Zap,
  ChevronDown,
  ChevronRight,
  FileCode,
  Trash2
} from 'lucide-react';
import excellionLogo from '@/assets/excellion-logo.png';

interface BuilderProject {
  id: string;
  name: string;
  idea: string;
  created_at: string;
}

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
  const [chatMode, setChatMode] = useState(true);
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('builder_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast({ title: 'Deleted', description: 'Project removed' });
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('builder_projects')
        .select('id, name, idea, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setProjects(data);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const handleSubmit = (prompt?: string) => {
    const ideaToUse = prompt || idea;
    if (!ideaToUse.trim()) return;
    navigate('/secret-builder', { state: { initialIdea: ideaToUse } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left Sidebar - Dark Theme */}
      <aside className="w-64 flex flex-col fixed h-full z-20 border-r" style={{ background: 'linear-gradient(180deg, #0f0f0f 0%, #0d0a12 100%)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
        {/* Workspace Selector */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <img src={excellionLogo} alt="Excellion" className="h-6 w-6" />
            <span className="font-medium flex-1 text-left" style={{ color: '#d4af37' }}>Excellion</span>
            <ChevronDown className="h-4 w-4" style={{ color: 'rgba(212, 175, 55, 0.6)' }} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(147, 51, 234, 0.2)' }}>
            <Home className="h-4 w-4" style={{ color: '#d4af37' }} />
            <span className="text-sm font-medium">Home</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-violet-500/15 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <Search className="h-4 w-4" style={{ color: '#d4af37' }} />
            <span className="text-sm font-medium">Search</span>
          </a>
          
          {/* Projects Section */}
          <div className="pt-4">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(212, 175, 55, 0.5)' }}>Projects</span>
            <div className="mt-2 space-y-1">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors w-full"
                  >
                    <button
                      onClick={() => navigate('/secret-builder', { state: { projectId: project.id } })}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <FileCode className="h-4 w-4 flex-shrink-0" style={{ color: '#d4af37' }} />
                      <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{project.name}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-900/30 transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {isLoading ? 'Loading...' : 'No projects yet'}
                </div>
              )}
            </div>
          </div>

          {/* Resources Section */}
          <div className="pt-4">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(212, 175, 55, 0.5)' }}>Resources</span>
            <div className="mt-2 space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-violet-500/15 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Compass className="h-4 w-4" style={{ color: '#d4af37' }} />
                <span className="text-sm">Discover</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-3 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
          {/* Share Promo Card */}
          <div className="p-3 rounded-xl border" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.18) 0%, rgba(212, 175, 55, 0.08) 100%)', borderColor: 'rgba(147, 51, 234, 0.35)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4" style={{ color: '#d4af37' }} />
              <span className="text-sm font-medium" style={{ color: '#d4af37' }}>Share Excellion</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Invite friends and earn rewards</p>
          </div>

          {/* Upgrade Promo Card */}
          <div className="p-3 rounded-xl border" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)', borderColor: 'rgba(147, 51, 234, 0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4" style={{ color: '#d4af37' }} />
              <span className="text-sm font-medium" style={{ color: '#d4af37' }}>Upgrade to Pro</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Unlock unlimited builds</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: 'linear-gradient(135deg, #d4af37, #8b7227)', color: '#0a0a0a' }}>
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>User</p>
              <p className="text-xs" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative min-h-screen">
        {/* Dark Gradient Background with Gold & Purple Accents */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 45%),
              radial-gradient(ellipse at 10% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 80%, rgba(139, 114, 39, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(10, 10, 10, 0.95) 0%, transparent 80%),
              linear-gradient(135deg, #0a0a0a 0%, #0d0a10 50%, #0a0a0a 100%)
            `
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 pb-48">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Let's build something, <span style={{ color: '#d4af37' }}>User</span>
            </h1>
            <p className="text-lg max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Describe your website idea and watch it come to life
            </p>
          </div>

          {/* Input Container Card */}
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(15, 15, 15, 0.9)', borderColor: 'rgba(212, 175, 55, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212, 175, 55, 0.05), 0 0 80px rgba(147, 51, 234, 0.1)' }}>
              {/* Text Input Area */}
              <div className="p-4">
                <Input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your website idea..."
                  className="border-0 bg-transparent text-base h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                />
              </div>

              {/* Controls Row */}
              <div className="px-4 pb-4 flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <Plus className="h-4 w-4" style={{ color: '#d4af37' }} />
                  </button>
                  <button className="h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <Paperclip className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                    <span className="text-xs font-medium" style={{ color: '#d4af37' }}>Attach</span>
                  </button>
                  <button className="h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <Palette className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                    <span className="text-xs font-medium" style={{ color: '#d4af37' }}>Theme</span>
                    <ChevronDown className="h-3 w-3" style={{ color: 'rgba(212, 175, 55, 0.6)' }} />
                  </button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setChatMode(!chatMode)}
                    className="h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors"
                    style={{ 
                      background: chatMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: chatMode ? '#d4af37' : 'rgba(255,255,255,0.6)'
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Chat</span>
                  </button>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Waves className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={!idea.trim()}
                    className="h-9 w-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #8b7227)' }}
                  >
                    <ArrowRight className="h-4 w-4" style={{ color: '#0a0a0a' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Templates Sheet */}
        <div className="fixed bottom-0 left-64 right-0 z-20">
          <div className="rounded-t-3xl border-t" style={{ background: 'linear-gradient(180deg, rgba(15, 15, 15, 0.98) 0%, rgba(12, 10, 18, 0.98) 100%)', borderColor: 'rgba(212, 175, 55, 0.15)', boxShadow: '0 -10px 40px rgba(0,0,0,0.5), 0 -5px 30px rgba(147, 51, 234, 0.08)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: '#d4af37' }} />
                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>Templates</span>
              </div>
              <button className="flex items-center gap-1 text-sm transition-colors" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                Browse all
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Templates Grid */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSubmit(template.prompt)}
                    className="group p-4 rounded-xl border transition-all text-left hover:scale-[1.02]"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(212, 175, 55, 0.03) 100%)', 
                      borderColor: 'rgba(147, 51, 234, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(212, 175, 55, 0.03) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.25)';
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg border flex items-center justify-center transition-colors" style={{ background: 'rgba(147, 51, 234, 0.18)', borderColor: 'rgba(147, 51, 234, 0.35)' }}>
                        <template.icon className="h-5 w-5 transition-colors" style={{ color: '#d4af37' }} />
                      </div>
                    </div>
                    <h3 className="font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.9)' }}>{template.title}</h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
