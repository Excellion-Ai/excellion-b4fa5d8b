import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
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
  FolderOpen,
  Star,
  Users,
  Compass,
  Gift,
  Zap,
  ChevronDown,
  ChevronRight,
  Clock,
  FileCode
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
    <div className="min-h-screen flex bg-white">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
        {/* Workspace Selector */}
        <div className="p-4 border-b border-gray-100">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <img src={excellionLogo} alt="Excellion" className="h-6 w-6" />
            <span className="font-medium text-gray-900 flex-1 text-left">Excellion</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Home</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Search</span>
          </a>
          
          {/* Projects Section */}
          <div className="pt-4">
            <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
            <div className="mt-2 space-y-1">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate('/secret-builder', { state: { initialIdea: project.idea } })}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <FileCode className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{project.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-400">
                  {isLoading ? 'Loading...' : 'No projects yet'}
                </div>
              )}
            </div>
          </div>

          {/* Resources Section */}
          <div className="pt-4">
            <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resources</span>
            <div className="mt-2 space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <Compass className="h-4 w-4" />
                <span className="text-sm">Discover</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-3 border-t border-gray-100">
          {/* Share Promo Card */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-900">Share Excellion</span>
            </div>
            <p className="text-xs text-gray-600">Invite friends and earn rewards</p>
          </div>

          {/* Upgrade Promo Card */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-900">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-gray-600">Unlock unlimited builds</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">User</p>
              <p className="text-xs text-gray-500">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative min-h-screen">
        {/* Mesh Gradient Background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 0% 0%, rgba(219, 234, 254, 0.8) 0%, transparent 50%),
              radial-gradient(ellipse at 100% 100%, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.2) 30%, transparent 60%),
              radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.9) 0%, transparent 80%),
              linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%)
            `
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 pb-48">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Let's build something, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">User</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Describe your website idea and watch it come to life
            </p>
          </div>

          {/* Input Container Card */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
              {/* Text Input Area */}
              <div className="p-4">
                <Input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your website idea..."
                  className="border-0 bg-transparent text-base h-12 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                />
              </div>

              {/* Controls Row */}
              <div className="px-4 pb-4 flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="h-8 px-3 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors">
                    <Paperclip className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Attach</span>
                  </button>
                  <button className="h-8 px-3 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors">
                    <Palette className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Theme</span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setChatMode(!chatMode)}
                    className={`h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors ${
                      chatMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Chat</span>
                  </button>
                  <button className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <Waves className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={!idea.trim()}
                    className="h-9 w-9 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Templates Sheet */}
        <div className="fixed bottom-0 left-64 right-0 z-20">
          <div className="bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl shadow-gray-300/30">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-gray-900">Templates</span>
              </div>
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
                    className="group p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-purple-200 group-hover:bg-purple-50 transition-colors">
                        <template.icon className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-0.5">{template.title}</h3>
                    <p className="text-xs text-gray-500">{template.description}</p>
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
