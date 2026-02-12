import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { trackCourseEvent } from '@/lib/courseAnalytics';

const templates = [
  {
    title: 'Offer Page Copy Template',
    description: 'Headline, bullets, and section copy for your sales page.',
    content: `# [PROGRAM NAME] — [TRANSFORMATION PROMISE]

## Hero Section
Headline: [Desired Outcome] in [Timeframe] Without [Common Objection]
Subheadline: A [program type] for [ideal client] who want to [goal].

## What You Get
- Custom [training/nutrition] plan tailored to your goals
- Weekly 1:1 check-ins with your coach
- Direct messaging access (24hr response time)
- Private client portal with all your resources
- [Bonus resource] to accelerate your results

## The Problem
You have tried [common failed approach]. You are tired of [pain point]. You want [desired outcome] but [obstacle].

## The Solution
[Program Name] is a [duration] program that helps you [transformation]. Unlike [alternatives], we [unique differentiator].

## What Past Clients Say
"[Testimonial text]" — [Client Name]

## Investment
[Price] / [billing frequency]
Includes: [brief inclusion list]

## FAQ
See FAQ template below.

## Final CTA
Ready to [transformation verb]? [CTA Button Text]`,
  },
  {
    title: 'FAQ Template (10 Starters)',
    description: '10 common Q&A starters for fitness coaching programs.',
    content: `1. How is this different from other programs?
Unlike generic programs, [Program Name] provides [specific differentiator]. Every plan is customized to your body, schedule, and goals.

2. What if I have never worked with a coach before?
Perfect — this program is designed for [beginner/all levels]. You will get step-by-step guidance from day one.

3. How much time does this take per week?
Expect [X] hours per week for training and [Y] minutes for check-ins. Everything fits into a normal schedule.

4. What results can I realistically expect?
Most clients see [specific result] within [timeframe]. Individual results depend on consistency and starting point.

5. What is your refund policy?
We offer a [X-day] satisfaction guarantee. If you are not seeing value, contact us within [X] days for a full refund.

6. Do I need a gym membership or equipment?
[Describe equipment requirements]. We can adapt the program to your available equipment.

7. What happens after the program ends?
You will have the knowledge and habits to continue on your own. We also offer [continuation options].

8. How do check-ins work?
Every [day], you submit a quick check-in form (5-10 min). Your coach reviews and responds within [timeframe].

9. Can I do this if I have injuries or health conditions?
We work around limitations. Please disclose any conditions in your intake form so we can plan safely.

10. When does the program start?
You can start [immediately / on the next cohort date]. After purchasing, you will receive onboarding instructions within [timeframe].`,
  },
  {
    title: 'Intake Form Question Bank (20 Questions)',
    description: '20 intake questions grouped by category.',
    content: `## BASIC INFO
1. Full name
2. Age
3. Height
4. Current weight
5. Location / timezone

## HEALTH HISTORY
6. Do you have any current injuries or chronic pain? (describe)
7. Do you have any medical conditions we should know about?
8. Are you currently taking any medications or supplements?
9. Do you have any food allergies or intolerances?

## GOALS
10. What is your primary fitness goal?
11. What is your target timeline for this goal?
12. Why is achieving this goal important to you right now?
13. What have you tried before that did not work?

## CURRENT HABITS
14. How would you rate your current fitness level? (1-10)
15. How many days per week do you currently exercise?
16. Describe your current diet in one sentence.
17. How many hours of sleep do you get per night?

## LOGISTICS
18. What equipment do you have access to?
19. How many days per week can you commit to training?
20. How much time per session can you dedicate?

## PREFERENCES (optional)
- Any foods you absolutely will not eat?
- Any exercises you love or hate?
- Preferred training time (morning/afternoon/evening)?`,
  },
  {
    title: 'Weekly Check-in Question Bank (12 Questions)',
    description: '12 questions for weekly client check-ins.',
    content: `1. How would you rate this week overall? (1-10)
2. How many planned training sessions did you complete? (e.g., 4/5)
3. How closely did you follow the nutrition plan? (1-10)
4. Current weight (if tracking):
5. Upload progress photos (front, side, back)
6. Energy levels this week (1-10):
7. Average sleep this week (hours per night):
8. Stress level this week (1-10):
9. Any new pain, discomfort, or injuries?
10. What went well this week? (wins)
11. What was challenging this week? (struggles)
12. Any questions or requests for your coach?`,
  },
  {
    title: 'Client Portal Section Blueprint',
    description: 'Recommended portal structure with section descriptions.',
    content: `## TRAINING HUB
Welcome to your Training Hub! Here you will find your personalized workout plan, exercise video demos, and program schedule. New plans are uploaded every [frequency].

Suggested contents:
- Current training plan (PDF or embedded)
- Exercise video library (organized by body part)
- Program phase overview and timeline
- Training log template

## NUTRITION CENTER
Your Nutrition Center has everything you need to fuel your progress. From meal plans to grocery lists, it is all here.

Suggested contents:
- Current meal plan
- Weekly grocery list
- Recipe collection (5-10 simple recipes)
- Macro/calorie guidelines
- Supplement recommendations (if applicable)

## RESOURCES LIBRARY
Bonus materials, guides, and templates to support your journey.

Suggested contents:
- Getting started guide
- Habit tracker template
- Progress photo guide
- Mindset resources
- FAQ document

## CHECK-IN ZONE
Submit your weekly check-in here. Check-ins are due every [day] by [time]. Your coach will respond within [timeframe].

- Weekly check-in form link
- Past check-in history
- Coach feedback archive

## COMMUNICATION
How to reach your coach and what to expect.

- Messaging guidelines (response time, channels)
- Emergency contact info
- Office hours / availability`,
  },
];

export default function QuickstartTemplates() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth?redirect=/course/excellion-quickstart/templates');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${title} copied to clipboard!`);
      trackCourseEvent('templates_copied', { template: title });
    } catch {
      toast.error('Failed to copy. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/learn/excellion-quickstart')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Quickstart Templates</h1>
          </div>
          <p className="text-muted-foreground">
            Copy-ready templates for your coaching business. Click "Copy" to grab any template.
          </p>
        </div>

        <div className="space-y-6">
          {templates.map((template, idx) => (
            <Card key={idx} className="bg-card border-border">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(template.content, template.title)}
                  className="shrink-0 gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-secondary/30 rounded-lg p-4 text-sm text-foreground/80 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto font-mono leading-relaxed">
                  {template.content}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
