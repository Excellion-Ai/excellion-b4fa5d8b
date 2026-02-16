import { Check, Mic, Wand2, RefreshCw, Rocket, Clock, FileText, ShoppingCart, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface StartHereDashboardProps {
  onNavigateToLesson: (moduleIndex: number, lessonIndex: number) => void;
}

const steps = [
  { id: 'prompt', label: 'Start the Prompt Call', icon: Mic, color: 'text-primary' },
  { id: 'generate', label: 'Generate Draft', icon: Wand2, color: 'text-blue-400' },
  { id: 'regenerate', label: 'Regenerate Anything', icon: RefreshCw, color: 'text-purple-400' },
  { id: 'publish', label: 'Publish + Share', icon: Rocket, color: 'text-green-400' },
];

const timelineCards = [
  { time: '0 min', title: 'Your Prompt', desc: 'A detailed AI prompt generated from your answers', icon: FileText },
  { time: '15 min', title: 'Course Draft', desc: 'Modules, lessons, quizzes, and downloads', icon: Wand2 },
  { time: '30 min', title: 'Sales Page', desc: 'Headline, features, CTA — ready to share', icon: ShoppingCart },
  { time: '60 min', title: 'Published Link', desc: 'A live course URL your clients can access', icon: Download },
];

export function StartHereDashboard({ onNavigateToLesson }: StartHereDashboardProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-8">
      {/* Checklist */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your 4-Step Checklist</h3>
          <div className="space-y-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <label
                  key={step.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={checked[step.id] || false}
                    onCheckedChange={() => toggle(step.id)}
                  />
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <Icon className={`h-4 w-4 ${step.color} shrink-0`} />
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                  {checked[step.id] && (
                    <Check className="h-4 w-4 text-green-400 ml-auto" />
                  )}
                </label>
              );
            })}
          </div>

          <Button
            className="w-full mt-6 bg-primary hover:bg-primary/90 gap-2"
            size="lg"
            onClick={() => onNavigateToLesson(0, 1)} // Module 1, Lesson 2
          >
            <Mic className="h-4 w-4" />
            Start Step 1: Prompt Call
          </Button>
        </CardContent>
      </Card>

      {/* Visual Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          What You'll Have in 60 Minutes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {timelineCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i} className="bg-muted/10 border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-bold text-primary mb-2">{card.time}</div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{card.title}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{card.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
