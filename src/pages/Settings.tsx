import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  User,
  CreditCard,
  Bell,
  FolderKanban,
  Users,
  Globe,
  Palette,
  Keyboard,
  HelpCircle,
  MessageSquare,
  LogOut,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import excellionLogo from '@/assets/excellion-logo.png';

const NAV_SECTIONS = [
  {
    title: 'Account',
    items: [
      { label: 'Profile', path: '/settings/profile', icon: User },
      { label: 'Billing & Credits', path: '/settings/billing', icon: CreditCard },
      { label: 'Notifications', path: '/settings/notifications', icon: Bell },
    ],
  },
  {
    title: 'Workspace & Team',
    items: [
      { label: 'Workspace Settings', path: '/settings/workspace', icon: FolderKanban },
      { label: 'Team Members', path: '/settings/team', icon: Users },
    ],
  },
  {
    title: 'Publishing',
    items: [
      { label: 'Domains', path: '/settings/domains', icon: Globe },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Theme & Appearance', path: '/settings/appearance', icon: Palette },
      { label: 'Keyboard Shortcuts', path: '/settings/shortcuts', icon: Keyboard },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help & Documentation', path: '/settings/help', icon: HelpCircle },
      { label: 'Contact Support', path: '/settings/support', icon: MessageSquare },
    ],
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-auto py-2"
            onClick={() => navigate('/secret-builder-hub')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Builder</span>
          </Button>
        </div>

        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <img src={excellionLogo} alt="Excellion" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">Settings</p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title} className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.label}</span>
                      {isActive(item.path) && (
                        <ChevronRight className="w-4 h-4 text-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
              {idx < NAV_SECTIONS.length - 1 && (
                <Separator className="mt-3" />
              )}
            </div>
          ))}
        </ScrollArea>

        {/* Sign Out */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
