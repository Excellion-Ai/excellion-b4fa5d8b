import { X, Dumbbell, Flame, Timer, Heart, Apple, PersonStanding, Mountain, Baby, Bike, Zap, Salad, Footprints } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

interface TemplatesGalleryProps {
  open: boolean;
  onClose: () => void;
}

interface Template {
  id: string;
  title: string;
  niche: string;
  modules: number;
  duration: string;
  icon: React.ElementType;
  color: string;
  prompt: string;
  preview: string[];
}

const templates: Template[] = [
  {
    id: 'fat-loss',
    title: '30-Day Fat Loss Challenge',
    niche: 'Weight Loss',
    modules: 4,
    duration: '30 days',
    icon: Flame,
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    prompt: 'Create a 30-day fat loss challenge for beginners who want to lose 10-20 lbs with home workouts and simple nutrition.',
    preview: ['Calorie & Macro Setup', 'Home Workout Plans (3x/week)', 'Meal Prep Basics', 'Progress Tracking & Accountability'],
  },
  {
    id: 'strength',
    title: 'Strength Foundations Program',
    niche: 'Strength Training',
    modules: 6,
    duration: '8 weeks',
    icon: Dumbbell,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    prompt: 'Create an 8-week strength training program for intermediates focusing on the big 4 lifts with progressive overload.',
    preview: ['Squat Progression', 'Bench & Overhead Press', 'Deadlift Technique', 'Deload & Recovery Weeks'],
  },
  {
    id: 'mobility',
    title: 'Mobility & Flexibility Reset',
    niche: 'Mobility',
    modules: 4,
    duration: '4 weeks',
    icon: Zap,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    prompt: 'Create a 4-week mobility and flexibility program for desk workers with daily 15-minute routines.',
    preview: ['Upper Body Mobility', 'Hip & Ankle Openers', 'Spine & Core Activation', 'Full-Body Flow Routines'],
  },
  {
    id: 'running',
    title: 'Couch to 5K Running Plan',
    niche: 'Running',
    modules: 4,
    duration: '8 weeks',
    icon: Footprints,
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
    prompt: 'Create an 8-week couch to 5K running program for complete beginners with 3 runs per week.',
    preview: ['Walk/Run Intervals', 'Building Endurance', 'Pacing & Breathing', 'Race Day Prep'],
  },
  {
    id: 'postpartum',
    title: 'Postpartum Recovery Program',
    niche: 'Postpartum',
    modules: 4,
    duration: '12 weeks',
    icon: Baby,
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    prompt: 'Create a 12-week postpartum fitness recovery program focusing on pelvic floor, core rehab, and gradual return to exercise.',
    preview: ['Pelvic Floor Foundations', 'Core Rebuilding (Diastasis-safe)', 'Return to Strength', 'Nutrition for Recovery'],
  },
  {
    id: 'nutrition',
    title: 'Nutrition Basics Masterclass',
    niche: 'Nutrition',
    modules: 5,
    duration: '5 weeks',
    icon: Apple,
    color: 'text-red-400 bg-red-400/10 border-red-400/20',
    prompt: 'Create a 5-week nutrition fundamentals course covering macros, meal planning, supplements, and eating for specific goals.',
    preview: ['Calories & Energy Balance', 'Macros Made Simple', 'Meal Planning Templates', 'Supplements Guide'],
  },
  {
    id: 'hiit',
    title: 'HIIT & Conditioning',
    niche: 'Cardio',
    modules: 4,
    duration: '6 weeks',
    icon: Timer,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    prompt: 'Create a 6-week HIIT and metabolic conditioning program with 4 workouts per week, no equipment needed.',
    preview: ['HIIT Fundamentals', 'Tabata & EMOM Workouts', 'Metabolic Finishers', 'Recovery & Deload'],
  },
  {
    id: 'cycling',
    title: 'Indoor Cycling Program',
    niche: 'Cycling',
    modules: 4,
    duration: '6 weeks',
    icon: Bike,
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    prompt: 'Create a 6-week indoor cycling training plan with structured rides, interval sessions, and endurance builds.',
    preview: ['Bike Setup & Zones', 'Interval Training', 'Endurance Rides', 'Power & Speed Work'],
  },
  {
    id: 'hiking',
    title: 'Trail Ready: Hiking Fitness',
    niche: 'Outdoor',
    modules: 4,
    duration: '6 weeks',
    icon: Mountain,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    prompt: 'Create a 6-week hiking fitness preparation program with leg strength, cardio endurance, and trail-specific training.',
    preview: ['Leg Strength Foundation', 'Uphill Endurance', 'Balance & Stability', 'Trail Day Preparation'],
  },
  {
    id: 'self-care',
    title: 'Wellness & Self-Care Blueprint',
    niche: 'Wellness',
    modules: 4,
    duration: '4 weeks',
    icon: Heart,
    color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    prompt: 'Create a 4-week wellness and self-care course covering stress management, sleep optimization, mindfulness, and daily routines.',
    preview: ['Stress Management Tools', 'Sleep Optimization', 'Mindfulness Practices', 'Building a Self-Care Routine'],
  },
  {
    id: 'meal-prep',
    title: 'Meal Prep Mastery',
    niche: 'Nutrition',
    modules: 4,
    duration: '4 weeks',
    icon: Salad,
    color: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
    prompt: 'Create a 4-week meal prep mastery course teaching batch cooking, grocery shopping strategies, and weekly prep systems.',
    preview: ['Batch Cooking Basics', 'Grocery Shopping System', 'Weekly Prep Workflow', 'Recipes & Scaling'],
  },
  {
    id: 'bodyweight',
    title: 'Bodyweight Training System',
    niche: 'Calisthenics',
    modules: 5,
    duration: '8 weeks',
    icon: PersonStanding,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    prompt: 'Create an 8-week bodyweight-only training program with progressions from beginner to intermediate calisthenics.',
    preview: ['Push/Pull Foundations', 'Squat & Lunge Progressions', 'Core & Handstand Prep', 'Skill Unlocks (Muscle-up, L-sit)'],
  },
];

export function TemplatesGallery({ open, onClose }: TemplatesGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = templates.find(t => t.id === selectedId);

  const handleUseTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.prompt);
    toast.success(`Template prompt copied! Paste it into your builder to generate a "${template.title}" course.`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Course Templates</DialogTitle>
          <p className="text-sm text-muted-foreground">Pick a template to pre-fill your prompt. You can customize everything after generating.</p>
        </DialogHeader>

        {!selected ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${t.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{t.niche}</Badge>
                    <span className="text-[10px] text-muted-foreground">{t.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="gap-1">
              ← Back to all templates
            </Button>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${selected.color}`}>
                <selected.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selected.title}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{selected.niche}</Badge>
                  <Badge variant="outline">{selected.modules} modules</Badge>
                  <Badge variant="outline">{selected.duration}</Badge>
                </div>
              </div>
            </div>

            <Card className="bg-muted/20 border-border">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preview Modules</p>
                <ul className="space-y-1.5">
                  {selected.preview.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Generated Prompt</p>
                <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3 border border-border">
                  {selected.prompt}
                </pre>
              </CardContent>
            </Card>

            <Button className="w-full bg-primary hover:bg-primary/90 gap-2" size="lg" onClick={() => handleUseTemplate(selected)}>
              Use This Template
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
