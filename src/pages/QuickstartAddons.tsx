import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ListChecks } from 'lucide-react';

const addons = [
  { id: 'checkins', title: 'Weekly check-in forms', description: 'Drip a short form each week to track student progress.' },
  { id: 'resources', title: 'Resource library page', description: 'Centralize all downloadable worksheets, templates, and PDFs.' },
  { id: 'community', title: 'Community or discussion link', description: 'Connect a Circle, Skool, or Discord community.' },
  { id: 'email', title: 'Email notifications', description: 'Set up enrollment confirmations and lesson reminders.' },
  { id: 'upsell', title: 'Upsell or next-offer page', description: 'Add a checkout link for your next course or 1:1 coaching.' },
  { id: 'affiliate', title: 'Affiliate or referral tracking', description: 'Create a shareable link with a referral code.' },
  { id: 'testimonials', title: 'Student testimonials section', description: 'Collect and display social proof on your sales page.' },
  { id: 'certificate', title: 'Completion certificate customization', description: 'Upload a branded certificate background.' },
];

export default function QuickstartAddons() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/learn/quickstart')} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Course
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <ListChecks className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Optional Add-Ons Checklist</h1>
          <Badge variant="secondary">Optional</Badge>
        </div>
        <p className="text-muted-foreground mb-8">
          These are optional enhancements you can add to your course after launching. None are required to go live.
        </p>

        <div className="space-y-3">
          {addons.map(addon => (
            <label
              key={addon.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={!!checked[addon.id]}
                onCheckedChange={() => toggle(addon.id)}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-foreground">{addon.title}</p>
                <p className="text-sm text-muted-foreground">{addon.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
