import { useState, useCallback, useMemo } from 'react';

export type WebsiteType = 
  | 'local_service' 
  | 'restaurant' 
  | 'ecommerce' 
  | 'portfolio' 
  | 'agency' 
  | 'saas' 
  | 'coaching' 
  | 'event' 
  | 'other';

export type ServiceMode = 'local' | 'online' | 'both';

export type PrimaryGoal = 
  | 'get_quote' 
  | 'book_appointment' 
  | 'call_me' 
  | 'buy_product' 
  | 'join_email' 
  | 'contact_me';

export type ColorThemePreset = 
  | 'dark_gold' 
  | 'bw_minimal' 
  | 'navy_white' 
  | 'forest_cream' 
  | 'charcoal_blue' 
  | 'warm_sand' 
  | 'bold_red'
  | 'custom';

export interface ColorThemeCustom {
  primary: string;
  accent: string;
  backgroundMode: 'dark' | 'light';
}

export interface InterviewAnswers {
  websiteType: WebsiteType | null;
  websiteTypeOther: string;
  businessName: string;
  serviceMode: ServiceMode | null;
  serviceArea: string;
  primaryGoal: PrimaryGoal | null;
  offers: [string, string, string];
  colorThemePreset: ColorThemePreset | null;
  colorThemeCustom: ColorThemeCustom | null;
}

export interface InterviewState {
  step: number;
  answers: InterviewAnswers;
  isComplete: boolean;
}

const INITIAL_ANSWERS: InterviewAnswers = {
  websiteType: null,
  websiteTypeOther: '',
  businessName: '',
  serviceMode: null,
  serviceArea: '',
  primaryGoal: null,
  offers: ['', '', ''],
  colorThemePreset: null,
  colorThemeCustom: null,
};

const TOTAL_STEPS = 6;

const WEBSITE_TYPE_LABELS: Record<WebsiteType, string> = {
  local_service: 'Local Service',
  restaurant: 'Restaurant',
  ecommerce: 'E-commerce',
  portfolio: 'Portfolio',
  agency: 'Agency',
  saas: 'SaaS',
  coaching: 'Coaching/Course',
  event: 'Event',
  other: 'Other',
};

const GOAL_LABELS: Record<PrimaryGoal, string> = {
  get_quote: 'Get a quote',
  book_appointment: 'Book an appointment',
  call_me: 'Call me',
  buy_product: 'Buy a product',
  join_email: 'Join email list',
  contact_me: 'Contact me',
};

export const OFFER_SUGGESTIONS: Record<WebsiteType, string[]> = {
  local_service: ['Free estimates', 'Licensed & insured', 'Same-day service', 'Emergency calls', 'Warranty included'],
  restaurant: ['Order online', 'Catering', 'Daily specials', 'Reservations', 'Delivery available'],
  ecommerce: ['Free shipping over $X', '30-day returns', 'Best sellers', 'New arrivals', 'Secure checkout'],
  portfolio: ['View my work', 'Case studies', 'About me', 'Request a quote', 'Download resume'],
  agency: ['Free consultation', 'Strategy + design', 'SEO + ads', 'Case studies', 'Book a call'],
  saas: ['Start free trial', 'Book a demo', 'Integrations', 'Pricing', 'Security'],
  coaching: ['Free consultation', '1-on-1 coaching', 'Group sessions', 'Course access', 'Testimonials'],
  event: ['Buy tickets', 'View schedule', 'VIP access', 'Location info', 'Contact organizer'],
  other: ['Request a quote', 'View our work', 'About us', 'Contact us', 'Our services'],
};

export const COLOR_THEME_PRESETS: Record<Exclude<ColorThemePreset, 'custom'>, { 
  primary: string; 
  accent: string; 
  backgroundMode: 'dark' | 'light'; 
  label: string;
}> = {
  dark_gold: { primary: '#111111', accent: '#D4AF37', backgroundMode: 'dark', label: 'Dark + Gold (Luxury)' },
  bw_minimal: { primary: '#000000', accent: '#FFFFFF', backgroundMode: 'light', label: 'Black + White (Minimal)' },
  navy_white: { primary: '#1e3a5a', accent: '#FFFFFF', backgroundMode: 'light', label: 'Navy + White (Corporate)' },
  forest_cream: { primary: '#064e3b', accent: '#FDF6E3', backgroundMode: 'light', label: 'Forest + Cream (Natural)' },
  charcoal_blue: { primary: '#1f2937', accent: '#3b82f6', backgroundMode: 'dark', label: 'Charcoal + Blue (Modern Tech)' },
  warm_sand: { primary: '#d4a574', accent: '#8b5a2b', backgroundMode: 'light', label: 'Warm Sand + Clay (Warm)' },
  bold_red: { primary: '#7f1d1d', accent: '#fbbf24', backgroundMode: 'dark', label: 'Bold Red + Gold (Bold)' },
};

const COLOR_THEME_LABELS: Record<ColorThemePreset, string> = {
  dark_gold: 'Dark + Gold (Luxury)',
  bw_minimal: 'Black + White (Minimal)',
  navy_white: 'Navy + White (Corporate)',
  forest_cream: 'Forest + Cream (Natural)',
  charcoal_blue: 'Charcoal + Blue (Modern Tech)',
  warm_sand: 'Warm Sand + Clay (Warm)',
  bold_red: 'Bold Red + Gold (Bold)',
  custom: 'Custom',
};

// Validate hex color format
export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function useInterviewIntake(initialPrompt: string = '') {
  const [state, setState] = useState<InterviewState>({
    step: 1,
    answers: INITIAL_ANSWERS,
    isComplete: false,
  });

  // Preserve quick prompt text separately
  const [quickPrompt, setQuickPrompt] = useState(initialPrompt);

  const updateAnswer = useCallback(<K extends keyof InterviewAnswers>(
    key: K,
    value: InterviewAnswers[K]
  ) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [key]: value },
    }));
  }, []);

  const updateOffer = useCallback((index: 0 | 1 | 2, value: string) => {
    setState(prev => {
      const newOffers = [...prev.answers.offers] as [string, string, string];
      // Enforce 60 char limit
      newOffers[index] = value.slice(0, 60);
      return {
        ...prev,
        answers: { ...prev.answers, offers: newOffers },
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (prev.step >= TOTAL_STEPS) {
        return { ...prev, isComplete: true };
      }
      return { ...prev, step: prev.step + 1 };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.max(1, prev.step - 1),
    }));
  }, []);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      step: Math.max(1, Math.min(TOTAL_STEPS, step)),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 1,
      answers: INITIAL_ANSWERS,
      isComplete: false,
    });
  }, []);

  // Check if current step can proceed (has required data)
  const canProceed = useMemo(() => {
    const { answers, step } = state;
    switch (step) {
      case 1: 
        if (answers.websiteType === 'other') {
          return answers.websiteTypeOther.trim().length > 0;
        }
        return answers.websiteType !== null;
      case 2: return answers.businessName.trim().length > 0;
      case 3: return answers.serviceMode !== null;
      case 4: return answers.primaryGoal !== null;
      case 5: return true; // Offers are optional
      case 6: 
        // For custom theme, require valid hex colors
        if (answers.colorThemePreset === 'custom') {
          const custom = answers.colorThemeCustom;
          if (!custom) return false;
          return isValidHexColor(custom.primary) && isValidHexColor(custom.accent);
        }
        return answers.colorThemePreset !== null;
      default: return false;
    }
  }, [state]);

  // Check if all required fields are filled for final submission
  const canSubmit = useMemo(() => {
    const { answers } = state;
    // For custom theme, validate hex colors
    if (answers.colorThemePreset === 'custom') {
      const custom = answers.colorThemeCustom;
      if (!custom || !isValidHexColor(custom.primary) || !isValidHexColor(custom.accent)) {
        return false;
      }
    }
    return (
      answers.websiteType !== null &&
      answers.businessName.trim().length > 0 &&
      answers.primaryGoal !== null &&
      answers.colorThemePreset !== null
    );
  }, [state]);

  // Compose the prompt from interview answers
  const composedPrompt = useMemo(() => {
    const { answers } = state;
    if (!canSubmit) return '';

    // Use custom type if "other" is selected, otherwise use the label
    const typeLabel = answers.websiteType === 'other' && answers.websiteTypeOther.trim()
      ? answers.websiteTypeOther.trim()
      : answers.websiteType 
        ? WEBSITE_TYPE_LABELS[answers.websiteType] 
        : '';
    const goalLabel = answers.primaryGoal ? GOAL_LABELS[answers.primaryGoal] : '';
    
    // Color theme description
    let colorDesc = '';
    if (answers.colorThemePreset && answers.colorThemePreset !== 'custom') {
      const preset = COLOR_THEME_PRESETS[answers.colorThemePreset];
      colorDesc = `Color theme: ${preset.label} (primary: ${preset.primary}, accent: ${preset.accent}, ${preset.backgroundMode} mode).`;
    } else if (answers.colorThemePreset === 'custom' && answers.colorThemeCustom) {
      const custom = answers.colorThemeCustom;
      colorDesc = `Custom color theme: primary ${custom.primary}, accent ${custom.accent}, ${custom.backgroundMode} mode.`;
    }
    
    let serviceInfo = '';
    if (answers.serviceMode === 'both' && answers.serviceArea) {
      serviceInfo = ` Serves both local (${answers.serviceArea}) and online customers.`;
    } else if (answers.serviceMode === 'both') {
      serviceInfo = ' Serves both local and online customers.';
    } else if (answers.serviceMode === 'local' && answers.serviceArea) {
      serviceInfo = ` Serves ${answers.serviceArea}.`;
    } else if (answers.serviceMode === 'online') {
      serviceInfo = ' Operates online.';
    }

    const offersFiltered = answers.offers.map(o => o.trim()).filter(Boolean);
    const offersText = offersFiltered.length > 0
      ? ` Top offers: ${offersFiltered.join(', ')}.`
      : '';

    return `Build a ${typeLabel.toLowerCase()} website for ${answers.businessName}.${serviceInfo} Primary goal: ${goalLabel.toLowerCase()}.${offersText} ${colorDesc} Generate a high-converting homepage plus essential pages.`;
  }, [state, canSubmit]);

  // Structured data for backend
  const structuredData = useMemo(() => {
    const { answers } = state;
    
    // Get color theme data
    let colorTheme = null;
    if (answers.colorThemePreset && answers.colorThemePreset !== 'custom') {
      const preset = COLOR_THEME_PRESETS[answers.colorThemePreset];
      colorTheme = {
        preset: answers.colorThemePreset,
        primary: preset.primary,
        accent: preset.accent,
        backgroundMode: preset.backgroundMode,
      };
    } else if (answers.colorThemePreset === 'custom' && answers.colorThemeCustom) {
      colorTheme = {
        preset: 'custom',
        primary: answers.colorThemeCustom.primary,
        accent: answers.colorThemeCustom.accent,
        backgroundMode: answers.colorThemeCustom.backgroundMode,
      };
    }
    
    return {
      websiteType: answers.websiteType === 'other' ? answers.websiteTypeOther : answers.websiteType,
      businessName: answers.businessName,
      serviceMode: answers.serviceMode,
      serviceArea: answers.serviceArea || null,
      primaryGoal: answers.primaryGoal,
      offers: answers.offers.map(o => o.trim()).filter(Boolean),
      colorThemePreset: answers.colorThemePreset,
      colorThemeCustom: answers.colorThemeCustom,
      colorTheme, // Combined color theme object for easy consumption
    };
  }, [state]);

  return {
    // State
    step: state.step,
    totalSteps: TOTAL_STEPS,
    answers: state.answers,
    isComplete: state.isComplete,
    
    // Quick prompt (for mode switching)
    quickPrompt,
    setQuickPrompt,
    
    // Actions
    updateAnswer,
    updateOffer,
    nextStep,
    prevStep,
    skipStep,
    goToStep,
    reset,
    
    // Computed
    canProceed,
    canSubmit,
    composedPrompt,
    structuredData,
    
    // Labels for display
    labels: {
      websiteTypes: WEBSITE_TYPE_LABELS,
      goals: GOAL_LABELS,
      colorThemes: COLOR_THEME_LABELS,
    },
  };
}
