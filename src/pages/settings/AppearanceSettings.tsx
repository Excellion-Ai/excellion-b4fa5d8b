import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Palette, Moon, Sun, Monitor, Loader2 } from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode for low-light environments' },
  { id: 'light', label: 'Light', icon: Sun, description: 'Light mode for bright environments' },
  { id: 'system', label: 'System', icon: Monitor, description: 'Follow your system preference' },
];

export default function AppearanceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fall back to localStorage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_settings')
        .select('theme, accent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setTheme(data.theme);
        setAccent(data.accent);
      } else {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    
    // Apply theme immediately
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.success('Theme saved locally');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme,
          accent,
        });

      if (error) throw error;
      toast.success('Appearance settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme & Appearance</h1>
        <p className="text-muted-foreground">Customize how Excellion looks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Theme
          </CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={theme} onValueChange={handleThemeChange}>
            <div className="grid gap-4">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                      theme === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleThemeChange(option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className={`p-2 rounded-lg ${
                      option.id === 'dark' ? 'bg-slate-800' :
                      option.id === 'light' ? 'bg-slate-200' : 'bg-gradient-to-r from-slate-800 to-slate-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        option.id === 'dark' ? 'text-white' :
                        option.id === 'light' ? 'text-slate-800' : 'text-white'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Accent Colors - Coming Soon */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-lg">Accent Color</CardTitle>
          <CardDescription>Coming soon - Customize your accent color</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {['#D4AF37', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 border-transparent disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}
                disabled
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
