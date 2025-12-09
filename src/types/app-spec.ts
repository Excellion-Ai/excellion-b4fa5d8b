export type AppSpec = {
  summary: string[];
  appType: string;
  targetStack: string;
  pages: { name: string; description: string }[];
  coreFeatures: string[];
  dataModel: { entity: string; fields: string[] }[];
  integrations: string[];
  buildPrompt: string;
  criticalQuestions: string[];
  buildPlan: string[];
};

export type BuilderTarget = 'lovable' | 'v0' | 'bolt' | 'dyad' | 'nextjs';
export type Complexity = 'simple' | 'standard' | 'advanced';

export type BuilderConfig = {
  target: BuilderTarget;
  complexity: Complexity;
};

export type AgentStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
};

export const PRESETS = [
  { id: 'local-service', label: 'Local service website', icon: 'Building2' },
  { id: 'course', label: 'Course + checkout', icon: 'GraduationCap' },
  { id: 'saas', label: 'SaaS dashboard', icon: 'LayoutDashboard' },
  { id: 'portal', label: 'Client portal', icon: 'Users' },
  { id: 'booking', label: 'Booking + calendar', icon: 'Calendar' },
  { id: 'ecommerce', label: 'E-commerce', icon: 'ShoppingCart' },
] as const;

export const TARGETS: { value: BuilderTarget; label: string }[] = [
  { value: 'lovable', label: 'Lovable' },
  { value: 'v0', label: 'v0.dev' },
  { value: 'bolt', label: 'Bolt.new' },
  { value: 'dyad', label: 'Dyad' },
  { value: 'nextjs', label: 'Generic Next.js' },
];

export const COMPLEXITIES: { value: Complexity; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'advanced', label: 'Advanced' },
];
