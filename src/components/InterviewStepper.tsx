import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { 
  Wrench,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Building2,
  Cloud,
  GraduationCap,
  Calendar,
  Sparkles,
  MapPin,
  Globe,
  Layers,
  FileText,
  Phone,
  ShoppingCart,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { ChatBubble, OptionCard, ColorSwatchCard, ProgressDots, ActionBar } from '@/components/interview';
import { 
  WebsiteType, 
  ServiceMode, 
  PrimaryGoal, 
  ColorThemePreset,
  ColorThemeCustom,
  InterviewAnswers,
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

const WEBSITE_TYPE_OPTIONS = [
  { value: 'local_service' as WebsiteType, label: 'Local Service', icon: Wrench },
  { value: 'restaurant' as WebsiteType, label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'ecommerce' as WebsiteType, label: 'E-commerce', icon: ShoppingBag },
  { value: 'portfolio' as WebsiteType, label: 'Portfolio', icon: Briefcase },
  { value: 'agency' as WebsiteType, label: 'Agency', icon: Building2 },
  { value: 'saas' as WebsiteType, label: 'SaaS', icon: Cloud },
  { value: 'coaching' as WebsiteType, label: 'Coaching', icon: GraduationCap },
  { value: 'event' as WebsiteType, label: 'Event', icon: Calendar },
  { value: 'other' as WebsiteType, label: 'Other', icon: Sparkles },
];

const SERVICE_MODE_OPTIONS = [
  { value: 'local' as ServiceMode, label: 'Local Only', icon: MapPin },
  { value: 'online' as ServiceMode, label: 'Online Only', icon: Globe },
  { value: 'both' as ServiceMode, label: 'Both', icon: Layers },
];

const PRIMARY_GOAL_OPTIONS = [
  { value: 'get_quote' as PrimaryGoal, label: 'Get a Quote', icon: FileText },
  { value: 'book_appointment' as PrimaryGoal, label: 'Book Appointment', icon: Calendar },
  { value: 'call_me' as PrimaryGoal, label: 'Call Me', icon: Phone },
  { value: 'buy_product' as PrimaryGoal, label: 'Buy Product', icon: ShoppingCart },
  { value: 'join_email' as PrimaryGoal, label: 'Join Email List', icon: Mail },
  { value: 'contact_me' as PrimaryGoal, label: 'Contact Me', icon: MessageSquare },
];

const COLOR_THEME_OPTIONS = [
  { value: 'dark_gold' as ColorThemePreset, label: 'Luxury Dark', primary: '#111111', accent: '#D4AF37' },
  { value: 'bw_minimal' as ColorThemePreset, label: 'Minimal', primary: '#000000', accent: '#FFFFFF' },
  { value: 'navy_white' as ColorThemePreset, label: 'Corporate', primary: '#1e3a5a', accent: '#FFFFFF' },
  { value: 'forest_cream' as ColorThemePreset, label: 'Natural', primary: '#064e3b', accent: '#FDF6E3' },
  { value: 'charcoal_blue' as ColorThemePreset, label: 'Tech', primary: '#1f2937', accent: '#3b82f6' },
  { value: 'warm_sand' as ColorThemePreset, label: 'Warm', primary: '#d4a574', accent: '#8b5a2b' },
  { value: 'custom' as ColorThemePreset, label: 'Custom' },
];

const STEP_QUESTIONS = {
  1: { message: "Let's build something amazing! What type of website are you creating?", sub: "Pick the closest match" },
  2: { message: "Great choice! What's your business called?", sub: "This will appear throughout your site" },
  3: { message: "Do you serve customers locally, online, or both?", sub: "This helps us add the right features" },
  4: { message: "What's the #1 thing you want visitors to do?", sub: "This becomes your main call-to-action" },
  5: { message: "What are your top offers or services?", sub: "These become your homepage highlights (optional)" },
  6: { message: "Last step! Pick a color theme for your site.", sub: "Don't worry, you can change it later" },
};

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
  const currentQuestion = STEP_QUESTIONS[step as keyof typeof STEP_QUESTIONS];

  const handleColorThemeSelect = (preset: ColorThemePreset) => {
    onUpdateAnswer('colorThemePreset', preset);
    if (preset !== 'custom') {
      onUpdateAnswer('colorThemeCustom', null);
    } else {
      onUpdateAnswer('colorThemeCustom', {
        primary: '#111111',
        accent: '#D4AF37',
        backgroundMode: 'dark',
      });
    }
  };

  const handleCustomColorChange = (field: keyof ColorThemeCustom, value: string) => {
    const current = answers.colorThemeCustom || { primary: '#111111', accent: '#D4AF37', backgroundMode: 'dark' as const };
    onUpdateAnswer('colorThemeCustom', { ...current, [field]: value });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-3 gap-3">
            {WEBSITE_TYPE_OPTIONS.map((option, i) => (
              <OptionCard
                key={option.value}
                icon={option.icon}
                label={option.label}
                selected={answers.websiteType === option.value}
                onClick={() => onUpdateAnswer('websiteType', option.value)}
                delay={i * 0.05}
              />
            ))}
          </div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto"
          >
            <Input
              value={answers.businessName}
              onChange={(e) => onUpdateAnswer('businessName', e.target.value)}
              placeholder="e.g., Tony's Pizza, Apex Roofing..."
              className="h-14 text-lg bg-card/60 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/50 text-center"
              autoFocus
            />
            <p className="text-xs text-muted-foreground/60 mt-3 text-center">
              Press Enter or click Continue when ready
            </p>
          </motion.div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {SERVICE_MODE_OPTIONS.map((option, i) => (
                <OptionCard
                  key={option.value}
                  icon={option.icon}
                  label={option.label}
                  selected={answers.serviceMode === option.value}
                  onClick={() => onUpdateAnswer('serviceMode', option.value)}
                  delay={i * 0.05}
                />
              ))}
            </div>
            
            <AnimatePresence>
              {(answers.serviceMode === 'local' || answers.serviceMode === 'both') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-w-sm mx-auto pt-2"
                >
                  <Input
                    value={answers.serviceArea}
                    onChange={(e) => onUpdateAnswer('serviceArea', e.target.value)}
                    placeholder="City or region you serve..."
                    className="h-12 bg-card/60 border-border/50 text-center"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            {PRIMARY_GOAL_OPTIONS.map((option, i) => (
              <OptionCard
                key={option.value}
                icon={option.icon}
                label={option.label}
                selected={answers.primaryGoal === option.value}
                onClick={() => onUpdateAnswer('primaryGoal', option.value)}
                delay={i * 0.05}
              />
            ))}
          </div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-3"
          >
            {[0, 1, 2].map((i) => {
              const value = answers.offers[i as 0 | 1 | 2];
              return (
                <div key={i} className="relative">
                  <Input
                    value={value}
                    onChange={(e) => onUpdateOffer(i as 0 | 1 | 2, e.target.value)}
                    onBlur={(e) => onUpdateOffer(i as 0 | 1 | 2, e.target.value.trim())}
                    placeholder={
                      i === 0 ? "e.g., Free estimates" :
                      i === 1 ? "e.g., Same-day service" :
                      "e.g., Licensed & insured"
                    }
                    maxLength={60}
                    className="h-12 bg-card/60 border-border/50 pr-12 text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40">
                    {value.length}/60
                  </span>
                </div>
              );
            })}
          </motion.div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {COLOR_THEME_OPTIONS.map((theme, i) => (
                <ColorSwatchCard
                  key={theme.value}
                  label={theme.label}
                  primaryColor={theme.primary}
                  accentColor={theme.accent}
                  isCustom={theme.value === 'custom'}
                  selected={answers.colorThemePreset === theme.value}
                  onClick={() => handleColorThemeSelect(theme.value)}
                  delay={i * 0.05}
                />
              ))}
            </div>

            <AnimatePresence>
              {answers.colorThemePreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-w-sm mx-auto pt-2"
                >
                  <div className="p-4 rounded-xl bg-card/40 border border-border/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Primary</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={answers.colorThemeCustom?.primary || '#111111'}
                            onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                            className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer bg-transparent"
                          />
                          <Input
                            value={answers.colorThemeCustom?.primary || '#111111'}
                            onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                            placeholder="#111111"
                            className={`bg-card/50 border-border/50 font-mono text-xs flex-1 ${
                              answers.colorThemeCustom?.primary && !isValidHexColor(answers.colorThemeCustom.primary) 
                                ? 'border-destructive' 
                                : ''
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Accent</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={answers.colorThemeCustom?.accent || '#D4AF37'}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer bg-transparent"
                          />
                          <Input
                            value={answers.colorThemeCustom?.accent || '#D4AF37'}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            placeholder="#D4AF37"
                            className={`bg-card/50 border-border/50 font-mono text-xs flex-1 ${
                              answers.colorThemeCustom?.accent && !isValidHexColor(answers.colorThemeCustom.accent) 
                                ? 'border-destructive' 
                                : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with back button and progress */}
      <div className="flex items-center justify-between">
        <div className="w-20">
          {step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
        </div>
        
        <ProgressDots currentStep={step} totalSteps={totalSteps} />
        
        <div className="w-20 text-right">
          <button
            type="button"
            onClick={onSwitchToQuickPrompt}
            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
          >
            Quick prompt
          </button>
        </div>
      </div>

      {/* AI Chat Bubble with Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ChatBubble 
            message={currentQuestion?.message || ''} 
            subMessage={currentQuestion?.sub}
          />
        </motion.div>
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-[180px]"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Action Bar */}
      <ActionBar
        isLastStep={isLastStep}
        canProceed={canProceed}
        canSubmit={canSubmit}
        isGenerating={isGenerating}
        showSkip={step === 5}
        onNext={onNext}
        onSkip={onSkip}
        onSubmit={onSubmit}
      />
    </div>
  );
}
