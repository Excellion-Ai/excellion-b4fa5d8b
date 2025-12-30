import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Loader2, Check } from 'lucide-react';

export default function NotificationsSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    notify_build_done: true,
    notify_publish_done: true,
    notify_billing: true,
    notify_product: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          notify_build_done: data.notify_build_done,
          notify_publish_done: data.notify_publish_done,
          notify_billing: data.notify_billing,
          notify_product: data.notify_product,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;
      toast.success('Notification preferences saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save preferences');
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

  const notificationOptions = [
    {
      id: 'notify_build_done',
      title: 'Build Complete',
      description: 'Get notified when your site generation is complete',
    },
    {
      id: 'notify_publish_done',
      title: 'Publish Complete',
      description: 'Get notified when your site is published',
    },
    {
      id: 'notify_billing',
      title: 'Billing Updates',
      description: 'Receive billing and subscription notifications',
    },
    {
      id: 'notify_product',
      title: 'Product Updates',
      description: 'Get updates about new features and improvements',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Manage how you receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose what updates you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor={option.id} className="font-medium">
                  {option.title}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                id={option.id}
                checked={settings[option.id as keyof typeof settings]}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, [option.id]: checked }))
                }
              />
            </div>
          ))}

          <Button onClick={handleSave} disabled={saving || saved} className="mt-4">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : null}
            {saved ? 'Changes Saved' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
