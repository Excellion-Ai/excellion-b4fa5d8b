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

export type StyleVibe = 
  | 'modern' 
  | 'bold' 
  | 'warm' 
  | 'luxury' 
  | 'playful' 
  | 'dark';

export interface InterviewAnswers {
  websiteType: WebsiteType | null;
  websiteTypeOther: string; // Custom type when "other" is selected
  businessName: string;
  serviceMode: ServiceMode | null;
  serviceArea: string;
  primaryGoal: PrimaryGoal | null;
  offers: [string, string, string];
  vibe: StyleVibe | null;
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
  vibe: null,
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

const VIBE_LABELS: Record<StyleVibe, string> = {
  modern: 'Modern',
  bold: 'Bold',
  warm: 'Warm',
  luxury: 'Luxury',
  playful: 'Playful',
  dark: 'Dark/Sleek',
};

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
      newOffers[index] = value;
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
        // For "other", require the custom type to be filled
        if (answers.websiteType === 'other') {
          return answers.websiteTypeOther.trim().length > 0;
        }
        return answers.websiteType !== null;
      case 2: return answers.businessName.trim().length > 0;
      case 3: return answers.serviceMode !== null;
      case 4: return answers.primaryGoal !== null;
      case 5: return true; // Offers are optional
      case 6: return answers.vibe !== null;
      default: return false;
    }
  }, [state]);

  // Check if all required fields are filled for final submission
  const canSubmit = useMemo(() => {
    const { answers } = state;
    return (
      answers.websiteType !== null &&
      answers.businessName.trim().length > 0 &&
      answers.primaryGoal !== null &&
      answers.vibe !== null
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
    const vibeLabel = answers.vibe ? VIBE_LABELS[answers.vibe] : '';
    
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

    const offersFiltered = answers.offers.filter(o => o.trim());
    const offersText = offersFiltered.length > 0
      ? ` Top offers: ${offersFiltered.join(', ')}.`
      : '';

    return `Build a ${typeLabel.toLowerCase()} website for ${answers.businessName}.${serviceInfo} Primary goal: ${goalLabel.toLowerCase()}.${offersText} Style vibe: ${vibeLabel.toLowerCase()}. Generate a high-converting homepage plus essential pages.`;
  }, [state, canSubmit]);

  // Structured data for backend
  const structuredData = useMemo(() => {
    const { answers } = state;
    return {
      websiteType: answers.websiteType === 'other' ? answers.websiteTypeOther : answers.websiteType,
      businessName: answers.businessName,
      serviceMode: answers.serviceMode,
      serviceArea: answers.serviceArea || null,
      primaryGoal: answers.primaryGoal,
      offers: answers.offers.filter(o => o.trim()),
      vibe: answers.vibe,
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
      vibes: VIBE_LABELS,
    },
  };
}
