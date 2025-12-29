import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { 
  WebsiteType, 
  ServiceMode, 
  PrimaryGoal, 
  ColorThemePreset,
  ColorThemeCustom,
  InterviewAnswers,
  OFFER_SUGGESTIONS,
  COLOR_THEME_PRESETS,
  isValidHexColor,
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
  { value: 'both', label: 'Both' },
];

const PRIMARY_GOALS: { value: PrimaryGoal; label: string }[] = [
  { value: 'get_quote', label: 'Get a quote' },
  { value: 'book_appointment', label: 'Book an appointment' },
  { value: 'call_me', label: 'Call me' },
  { value: 'buy_product', label: 'Buy a product' },
  { value: 'join_email', label: 'Join email list' },
  { value: 'contact_me', label: 'Contact me' },
];

const COLOR_THEMES: { value: ColorThemePreset; label: string; colors?: { primary: string; accent: string } }[] = [
  { value: 'dark_gold', label: 'Dark + Gold (Luxury)', colors: { primary: '#111111', accent: '#D4AF37' } },
  { value: 'bw_minimal', label: 'Black + White (Minimal)', colors: { primary: '#000000', accent: '#FFFFFF' } },
  { value: 'navy_white', label: 'Navy + White (Corporate)', colors: { primary: '#1e3a5a', accent: '#FFFFFF' } },
  { value: 'forest_cream', label: 'Forest + Cream (Natural)', colors: { primary: '#064e3b', accent: '#FDF6E3' } },
  { value: 'charcoal_blue', label: 'Charcoal + Blue (Modern Tech)', colors: { primary: '#1f2937', accent: '#3b82f6' } },
  { value: 'warm_sand', label: 'Warm Sand + Clay (Warm)', colors: { primary: '#d4a574', accent: '#8b5a2b' } },
  { value: 'custom', label: 'Custom' },
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

function ColorThemeChip({
  theme,
  selected,
  onClick,
}: {
  theme: typeof COLOR_THEMES[0];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
        selected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background/50 text-foreground/80 border-border/50 hover:border-primary/50 hover:bg-background/70'
      }`}
    >
      {theme.colors && (
        <div className="flex -space-x-1">
          <div 
            className="w-4 h-4 rounded-full border border-white/20" 
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div 
            className="w-4 h-4 rounded-full border border-white/20" 
            style={{ backgroundColor: theme.colors.accent }}
          />
        </div>
      )}
      <span>{theme.label}</span>
    </button>
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
  
  // Get offer suggestions based on website type
  const offerSuggestions = answers.websiteType 
    ? OFFER_SUGGESTIONS[answers.websiteType] 
    : OFFER_SUGGESTIONS.other;

  // Handle suggestion chip click - fill next empty offer field
  const handleSuggestionClick = (suggestion: string) => {
    const emptyIndex = answers.offers.findIndex(o => !o.trim());
    if (emptyIndex !== -1) {
      onUpdateOffer(emptyIndex as 0 | 1 | 2, suggestion);
    } else {
      // All filled - replace the third one
      onUpdateOffer(2, suggestion);
    }
  };

  // Handle color theme selection
  const handleColorThemeSelect = (preset: ColorThemePreset) => {
    onUpdateAnswer('colorThemePreset', preset);
    if (preset !== 'custom') {
      onUpdateAnswer('colorThemeCustom', null);
    } else {
      // Initialize custom with defaults
      onUpdateAnswer('colorThemeCustom', {
        primary: '#111111',
        accent: '#D4AF37',
        backgroundMode: 'dark',
      });
    }
  };

  // Handle custom color updates
  const handleCustomColorChange = (field: keyof ColorThemeCustom, value: string) => {
    const current = answers.colorThemeCustom || { primary: '#111111', accent: '#D4AF37', backgroundMode: 'dark' as const };
    onUpdateAnswer('colorThemeCustom', { ...current, [field]: value });
  };

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
            {answers.websiteType === 'other' && (
              <div className="pt-2">
                <Input
                  value={answers.websiteTypeOther}
                  onChange={(e) => onUpdateAnswer('websiteTypeOther', e.target.value)}
                  placeholder="Describe your business type (e.g., Pet grooming, Music lessons...)"
                  className="bg-background/50 border-border/50"
                  autoFocus
                />
              </div>
            )}
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
            {(answers.serviceMode === 'local' || answers.serviceMode === 'both') && (
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
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                What are your top offers?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add up to 3. These become your homepage highlights.
              </p>
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => {
                const value = answers.offers[i as 0 | 1 | 2];
                const isOverLimit = value.length > 60;
                return (
                  <div key={i} className="relative">
                    <Input
                      value={value}
                      onChange={(e) => onUpdateOffer(i as 0 | 1 | 2, e.target.value)}
                      onBlur={(e) => onUpdateOffer(i as 0 | 1 | 2, e.target.value.trim())}
                      placeholder={
                        i === 0 ? "e.g., Free estimates" :
                        i === 1 ? "e.g., Same-day appointments" :
                        "e.g., Monthly membership / packages"
                      }
                      maxLength={60}
                      className={`bg-background/50 border-border/50 pr-12 ${isOverLimit ? 'border-destructive' : ''}`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                      value.length > 50 ? 'text-amber-500' : 'text-muted-foreground/50'
                    }`}>
                      {value.length}/60
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Pick a color theme
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                This sets your site's main colors. You can change it later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEMES.map((theme) => (
                <ColorThemeChip
                  key={theme.value}
                  theme={theme}
                  selected={answers.colorThemePreset === theme.value}
                  onClick={() => handleColorThemeSelect(theme.value)}
                />
              ))}
            </div>
            
            {/* Custom color inputs */}
            {answers.colorThemePreset === 'custom' && (
              <div className="pt-3 space-y-3 p-4 rounded-lg bg-background/30 border border-border/30">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Primary color</label>
                    <div className="relative">
                      <Input
                        value={answers.colorThemeCustom?.primary || '#111111'}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                        placeholder="#111111"
                        className={`bg-background/50 border-border/50 pl-10 font-mono text-sm ${
                          answers.colorThemeCustom?.primary && !isValidHexColor(answers.colorThemeCustom.primary) 
                            ? 'border-destructive' 
                            : ''
                        }`}
                      />
                      <div 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-white/20"
                        style={{ backgroundColor: answers.colorThemeCustom?.primary || '#111111' }}
                      />
                    </div>
                    {answers.colorThemeCustom?.primary && !isValidHexColor(answers.colorThemeCustom.primary) && (
                      <p className="text-xs text-destructive mt-1">Use format #RRGGBB</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Accent color</label>
                    <div className="relative">
                      <Input
                        value={answers.colorThemeCustom?.accent || '#D4AF37'}
                        onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                        placeholder="#D4AF37"
                        className={`bg-background/50 border-border/50 pl-10 font-mono text-sm ${
                          answers.colorThemeCustom?.accent && !isValidHexColor(answers.colorThemeCustom.accent) 
                            ? 'border-destructive' 
                            : ''
                        }`}
                      />
                      <div 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-white/20"
                        style={{ backgroundColor: answers.colorThemeCustom?.accent || '#D4AF37' }}
                      />
                    </div>
                    {answers.colorThemeCustom?.accent && !isValidHexColor(answers.colorThemeCustom.accent) && (
                      <p className="text-xs text-destructive mt-1">Use format #RRGGBB</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Background mode</label>
                  <div className="flex gap-2">
                    {(['dark', 'light'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleCustomColorChange('backgroundMode', mode)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border capitalize ${
                          answers.colorThemeCustom?.backgroundMode === mode
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background/50 text-foreground/80 border-border/50 hover:border-primary/50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
      <div className="min-h-[160px]">
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
