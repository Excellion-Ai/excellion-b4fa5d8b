import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { 
  WebsiteType, 
  ServiceMode, 
  PrimaryGoal, 
  StyleVibe,
  InterviewAnswers 
} from '@/hooks/useInterviewIntake';

interface InterviewStepperProps {
  step: number;
  totalSteps: number;
  answers: InterviewAnswers;
  canProceed: boolean;
  canSubmit: boolean;
  onUpdateAnswer: <K extends keyof InterviewAnswers>(key: K, value: InterviewAnswers[K]) => void;
  onUpdateOffer: (index: 0 | 1 | 2, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  onSwitchToQuickPrompt: () => void;
  isGenerating?: boolean;
}

const WEBSITE_TYPES: { value: WebsiteType; label: string }[] = [
  { value: 'local_service', label: 'Local Service' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'agency', label: 'Agency' },
  { value: 'saas', label: 'SaaS' },
  { value: 'coaching', label: 'Coaching/Course' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

const SERVICE_MODES: { value: ServiceMode; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'online', label: 'Online' },
];

const PRIMARY_GOALS: { value: PrimaryGoal; label: string }[] = [
  { value: 'get_quote', label: 'Get a quote' },
  { value: 'book_appointment', label: 'Book an appointment' },
  { value: 'call_me', label: 'Call me' },
  { value: 'buy_product', label: 'Buy a product' },
  { value: 'join_email', label: 'Join email list' },
  { value: 'contact_me', label: 'Contact me' },
];

const STYLE_VIBES: { value: StyleVibe; label: string }[] = [
  { value: 'modern', label: 'Modern' },
  { value: 'bold', label: 'Bold' },
  { value: 'warm', label: 'Warm' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'playful', label: 'Playful' },
  { value: 'dark', label: 'Dark/Sleek' },
];

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            value === option.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background/50 text-foreground/80 border-border/50 hover:border-primary/50 hover:bg-background/70'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function InterviewStepper({
  step,
  totalSteps,
  answers,
  canProceed,
  canSubmit,
  onUpdateAnswer,
  onUpdateOffer,
  onNext,
  onBack,
  onSkip,
  onSubmit,
  onSwitchToQuickPrompt,
  isGenerating = false,
}: InterviewStepperProps) {
  const isLastStep = step === totalSteps;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              What type of website are you building?
            </h3>
            <ChipGroup
              options={WEBSITE_TYPES}
              value={answers.websiteType}
              onChange={(v) => onUpdateAnswer('websiteType', v)}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              What's your business name?
            </h3>
            <Input
              value={answers.businessName}
              onChange={(e) => onUpdateAnswer('businessName', e.target.value)}
              placeholder="e.g., Tony's Pizza, Apex Roofing..."
              className="bg-background/50 border-border/50"
              autoFocus
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Local or online business?
            </h3>
            <ChipGroup
              options={SERVICE_MODES}
              value={answers.serviceMode}
              onChange={(v) => onUpdateAnswer('serviceMode', v)}
            />
            {answers.serviceMode === 'local' && (
              <div className="pt-2">
                <label className="text-sm text-muted-foreground mb-2 block">
                  City/Area you serve
                </label>
                <Input
                  value={answers.serviceArea}
                  onChange={(e) => onUpdateAnswer('serviceArea', e.target.value)}
                  placeholder="e.g., Denver, CO"
                  className="bg-background/50 border-border/50"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              What's the primary goal of your site?
            </h3>
            <ChipGroup
              options={PRIMARY_GOALS}
              value={answers.primaryGoal}
              onChange={(v) => onUpdateAnswer('primaryGoal', v)}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Top 3 things you offer <span className="text-muted-foreground font-normal">(optional)</span>
            </h3>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={answers.offers[i as 0 | 1 | 2]}
                  onChange={(e) => onUpdateOffer(i as 0 | 1 | 2, e.target.value)}
                  placeholder={`Offer ${i + 1}`}
                  className="bg-background/50 border-border/50"
                />
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Pick a style vibe
            </h3>
            <ChipGroup
              options={STYLE_VIBES}
              value={answers.vibe}
              onChange={(v) => onUpdateAnswer('vibe', v)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {step} of {totalSteps}
        </span>
        <button
          type="button"
          onClick={onSwitchToQuickPrompt}
          className="text-primary hover:underline text-sm"
        >
          Switch to Quick Prompt
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className="min-h-[120px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div>
          {step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {step === 5 && (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          )}
          
          {isLastStep ? (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Draft
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
