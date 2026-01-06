import { useState, useCallback, useMemo } from 'react';

export type WebsiteType = 
  | 'self_paced_course' 
  | 'cohort_program' 
  | 'coaching_mentorship' 
  | 'workshop_challenge' 
  | 'digital_product' 
  | 'other';

export type PrimaryGoal = 
  | 'buy_course' 
  | 'join_waitlist' 
  | 'join_email' 
  | 'book_call' 
  | 'apply_program';

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
  businessName: string; // Course or brand name
  audienceTransformation: string; // Who is this for + what will they achieve
  primaryGoal: PrimaryGoal | null;
  offers: [string, string, string]; // Course modules/structure
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
  audienceTransformation: '',
  primaryGoal: null,
  offers: ['', '', ''],
  vibe: null,
};

const TOTAL_STEPS = 6;

const WEBSITE_TYPE_LABELS: Record<WebsiteType, string> = {
  self_paced_course: 'Online course (self-paced)',
  cohort_program: 'Cohort-based program',
  coaching_mentorship: 'Coaching or mentorship program',
  workshop_challenge: 'Workshop or challenge',
  digital_product: 'Digital product or training library',
  other: 'Something else',
};

const GOAL_LABELS: Record<PrimaryGoal, string> = {
  buy_course: 'Buy the course',
  join_waitlist: 'Join a waitlist',
  join_email: 'Join email list',
  book_call: 'Book a discovery call',
  apply_program: 'Apply to program',
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
      case 3: return answers.audienceTransformation.trim().length > 0;
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
      answers.audienceTransformation.trim().length > 0 &&
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

    const offersFiltered = answers.offers.filter(o => o.trim());
    const offersText = offersFiltered.length > 0
      ? ` Course includes: ${offersFiltered.join(', ')}.`
      : '';

    return `Build a ${typeLabel.toLowerCase()} website for "${answers.businessName}". Target audience and transformation: ${answers.audienceTransformation}. Primary goal: ${goalLabel.toLowerCase()}.${offersText} Style vibe: ${vibeLabel.toLowerCase()}. Generate a high-converting course landing page.`;
  }, [state, canSubmit]);

  // Structured data for backend
  const structuredData = useMemo(() => {
    const { answers } = state;
    return {
      websiteType: answers.websiteType === 'other' ? answers.websiteTypeOther : answers.websiteType,
      businessName: answers.businessName,
      audienceTransformation: answers.audienceTransformation,
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
