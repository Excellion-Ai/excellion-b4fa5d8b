// BuilderShell - Main component for secret builder
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Code, HelpCircle, Settings, Send, Loader2, Monitor, Tablet, Smartphone, LayoutGrid, Upload, Undo2, Redo2, Copy, Check, ExternalLink, Zap, Sparkles, ImagePlus, BarChart3, Globe, X, MousePointer2, GitCompare, Users, Database, Box, Shield, CreditCard, LogIn, CloudOff, Image as ImageIcon, Pencil, Bookmark, BookOpen, Github } from 'lucide-react';
import { CreditBalance } from './CreditBalance';
import { AttachmentMenu, AttachmentChips, AttachmentItem } from './attachments';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SiteSpec } from '@/types/site-spec';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { specFromChat } from '@/lib/specFromChat';
import { SiteRenderer } from './SiteRenderer';
import { CoursePreview } from './CoursePreview';
import { CourseBuilderPanel } from './CourseBuilderPanel';
import { RefineChat } from './RefineChat';
import { CourseSettingsDialog } from './CourseSettingsDialog';
import { CourseActionBar } from './CourseActionBar';
import { CoursePublishDialog } from './CoursePublishDialog';
import { ThemeEditor } from './ThemeEditor';
import { LogoUpload } from './LogoUpload';
import { HelpChat } from './HelpChat';
import { CodeExport, generateHtmlFromSpec } from './CodeExport';
import { SectionLibrary } from './SectionLibrary';
import { PageManager } from './PageManager';
import { AnalyticsPanel } from './AnalyticsPanel';
import { CustomDomainsPanel } from './CustomDomainsPanel';
import { DiffViewer } from './DiffViewer';
import { BookmarksPanel } from './BookmarksPanel';
import { KnowledgePanel } from './KnowledgePanel';
import { PresenceAvatars } from './PresenceAvatars';
import { PresenceCursor } from './PresenceCursor';
import { SchemaVizPanel } from './SchemaVizPanel';
import { ThreeDPanel } from './ThreeDPanel';
import { SecurityScanPanel } from './SecurityScanPanel';
import { RenameDialog } from './RenameDialog';
import { supabase } from '@/integrations/supabase/client';
import { useSiteEditor } from '@/hooks/useSiteEditor';
import { useHistory } from '@/hooks/useHistory';
import { usePresence } from '@/hooks/usePresence';
import { useCredits, CreditActionType } from '@/hooks/useCredits';
import { calculateCreditCost } from '@/lib/calculateCreditCost';
import { detectNiche } from '@/lib/motion/motionEngine';
import { MotionIntensity } from '@/lib/motion/types';
import type { Json } from '@/integrations/supabase/types';
import { routeNiche, type NicheRoute, type IntegrationType } from '@/lib/nicheRouter';
import { selectArchetype, type ConversionArchetype } from '@/lib/conversionArchetypes';
import { getPacksForIntegrations, mergeIntegrationPages, type IntegrationPack } from '@/lib/integrationPacks';
import { checkSiteSpec as contentGuardrail } from '@/lib/contentGuardrail';
import { checkDiversity as diversityGuardrail, recordGeneration } from '@/lib/diversityGuardrail';
import { computeSignature } from '@/lib/layoutSignature';
import { 
  validateSpecAgainstScaffold, 
  INTEGRATION_TO_COMPONENT,
  type GenerationScaffold, 
  type DebugInfo, 
  type PageMap,
  type ScaffoldValidationResult 
} from '@/types/scaffold';

type GenerationStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  htmlCode?: string;
  attachments?: { name: string; url: string; type: string }[];
};

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

type LocationState = {
  initialIdea?: string;
  projectId?: string;
  templateSpec?: SiteSpec;
};

const INITIAL_STEPS: GenerationStep[] = [
  { id: 1, label: 'Analyzing idea', status: 'pending' },
  { id: 2, label: 'Fetching URL info', status: 'pending' },
  { id: 3, label: 'Generating website', status: 'pending' },
  { id: 4, label: 'Building preview', status: 'pending' },
];

// Allowed icon names that exist in FeaturesSection
const ALLOWED_ICONS = new Set([
  'Zap', 'Shield', 'Clock', 'Star', 'Wrench', 'Heart', 'Users', 'Award', 'Target', 'Truck',
  'CheckCircle', 'Settings', 'Sparkles', 'Lightbulb', 'Rocket', 'Gift', 'ThumbsUp', 'Crown',
  'Scissors', 'Hammer', 'PaintBucket', 'Droplets', 'Flame', 'Snowflake', 'Plug', 'Key',
  'UtensilsCrossed', 'Coffee', 'Wine', 'Pizza', 'Cake', 'Cookie', 'Soup', 'ChefHat',
  'Car', 'Gauge', 'Fuel', 'CarFront', 'Stethoscope', 'Pill', 'Activity', 'HeartPulse', 'Brain', 'Eye', 'Smile', 'Syringe', 'Ambulance',
  'Briefcase', 'Scale', 'FileText', 'Calculator', 'Building', 'Landmark', 'Gavel', 'FileSignature',
  'Palette', 'Camera', 'Pen', 'Brush', 'Film', 'Music', 'Mic', 'Aperture', 'ImagePlus',
  'Dumbbell', 'Leaf', 'Apple', 'Bike', 'Timer', 'Footprints', 'HeartHandshake',
  'Dog', 'Cat', 'PawPrint', 'Paw', 'Bird', 'Fish', 'Rabbit',
  'Shirt', 'Diamond', 'Flower2', 'Gem', 'Watch', 'Glasses', 'Handbag',
  'Home', 'Bed', 'Sofa', 'Bath', 'Trees', 'Armchair', 'Lamp', 'DoorOpen',
  'Monitor', 'Code', 'Cpu', 'Wifi', 'Database', 'Cloud', 'Globe', 'Server', 'BrainCircuit', 'Binary',
  'Plane', 'MapPin', 'Compass', 'Ship', 'Train', 'Luggage', 'Mountain', 'Palmtree',
  'GraduationCap', 'BookOpen', 'Pencil', 'Library', 'School', 'NotebookPen',
  'Lock', 'ShieldCheck', 'Fingerprint', 'ScanFace', 'KeyRound',
  'Phone', 'Mail', 'MessageCircle', 'Send', 'AtSign', 'Megaphone',
  'Trophy', 'Medal', 'Volleyball', 'Gamepad2', 'Swords', 'Flag', 'CircleDot',
  'Wheat', 'Tractor', 'Sprout', 'Flower', 'TreeDeciduous', 'Grape',
  'Clapperboard', 'Popcorn', 'Ticket', 'PartyPopper', 'Dice', 'Theater'
]);

// Fallback icons when AI generates invalid ones
const FALLBACK_ICONS = ['Zap', 'Star', 'Shield', 'Heart', 'Award', 'Target', 'Sparkles', 'Rocket'];

// Validate image URL format - also accept GENERATE: prompts for AI generation
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Accept GENERATE: prompts for AI image generation
  if (url.startsWith('GENERATE:')) return true;
  // Allow Unsplash, placeholder, storage URLs, and data URLs
  return url.startsWith('https://images.unsplash.com/') || 
         url.startsWith('https://source.unsplash.com/') ||
         url.startsWith('data:image/') ||
         (url.startsWith('https://') && url.includes('supabase'));
}

// Check if an image URL is a generation prompt
function isImageGenerationPrompt(url: string | undefined): boolean {
  return url?.startsWith('GENERATE:') || false;
}

// Default fallback image for invalid URLs
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop';

// Generate AI images for GENERATE: prompts in the spec
async function processImageGenerationPrompts(
  spec: SiteSpec,
  supabaseClient: typeof supabase
): Promise<SiteSpec> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session?.access_token) {
    console.warn('[ImageGen] No auth session - skipping image generation');
    return spec;
  }

  const updatedSpec = JSON.parse(JSON.stringify(spec)) as SiteSpec;
  const businessName = spec.name || 'Business';
  const route = routeNiche(spec.description || businessName);
  const niche = route.category.toUpperCase().replace('_', ' ');

  // Find all GENERATE: prompts in the spec
  const imagePromises: Promise<void>[] = [];

  for (const page of updatedSpec.pages || []) {
    for (const section of page.sections || []) {
      const content = section.content as any;
      
      // Check hero background
      if (content?.backgroundImage && isImageGenerationPrompt(content.backgroundImage)) {
        const prompt = content.backgroundImage.replace('GENERATE:', '').trim();
        imagePromises.push(
          generateImageForPrompt(prompt, businessName, niche, session.access_token)
            .then(url => { content.backgroundImage = url; })
            .catch(() => { content.backgroundImage = FALLBACK_IMAGE; })
        );
      }

      // Check gallery/portfolio items
      if (content?.items && Array.isArray(content.items)) {
        for (const item of content.items) {
          if (item.image && isImageGenerationPrompt(item.image)) {
            const prompt = item.image.replace('GENERATE:', '').trim();
            imagePromises.push(
              generateImageForPrompt(prompt, businessName, niche, session.access_token)
                .then(url => { item.image = url; })
                .catch(() => { item.image = FALLBACK_IMAGE; })
            );
          }
        }
      }
    }
  }

  // Wait for all images to generate (with timeout)
  if (imagePromises.length > 0) {
    console.log(`[ImageGen] Generating ${imagePromises.length} AI images...`);
    try {
      await Promise.race([
        Promise.all(imagePromises),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Image generation timeout')), 60000))
      ]);
      console.log('[ImageGen] All images generated successfully');
    } catch (err) {
      console.warn('[ImageGen] Some images may have failed:', err);
    }
  }

  return updatedSpec;
}

// Generate a single AI image
async function generateImageForPrompt(
  prompt: string,
  businessName: string,
  niche: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-niche-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      businessName,
      niche,
      imageType: 'hero',
      customPrompt: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.imageUrl || data.images?.[0] || FALLBACK_IMAGE;
}

function normalizeSpec(spec: any): any {
  // GLOBAL icon tracking across all pages
  const globalUsedIcons = new Set<string>();
  let fallbackIndex = 0;
  
  // Normalize pages: convert slug to path if needed
  if (spec.pages && Array.isArray(spec.pages)) {
    spec.pages = spec.pages.map((page: any) => {
      if (page.slug && !page.path) {
        // Convert slug to path
        const slug = page.slug;
        page.path = slug === 'home' ? '/' : `/${slug.replace(/-page$/, '')}`;
        delete page.slug;
      }
      
      // Validate and fix icons/images in sections
      if (page.sections && Array.isArray(page.sections)) {
        page.sections = page.sections.map((section: any) => {
          // Fix hero background images
          if (section.type === 'hero' && section.content?.backgroundImage) {
            if (!isValidImageUrl(section.content.backgroundImage)) {
              section.content.backgroundImage = FALLBACK_IMAGE;
            }
          }
          
          // Fix items with icons and images
          if (section.content?.items && Array.isArray(section.content.items)) {
            section.content.items = section.content.items.map((item: any, idx: number) => {
              // Validate and dedupe icons GLOBALLY
              if (item.icon) {
                // Check if icon is valid
                if (!ALLOWED_ICONS.has(item.icon)) {
                  // Find an unused fallback
                  let foundIcon = false;
                  for (let i = 0; i < FALLBACK_ICONS.length; i++) {
                    const fi = FALLBACK_ICONS[(fallbackIndex + i) % FALLBACK_ICONS.length];
                    if (!globalUsedIcons.has(fi)) {
                      item.icon = fi;
                      foundIcon = true;
                      break;
                    }
                  }
                  if (!foundIcon) {
                    item.icon = FALLBACK_ICONS[fallbackIndex % FALLBACK_ICONS.length];
                  }
                  fallbackIndex++;
                }
                // Check for duplicates globally
                if (globalUsedIcons.has(item.icon)) {
                  for (let i = 0; i < FALLBACK_ICONS.length; i++) {
                    const fi = FALLBACK_ICONS[(fallbackIndex + i) % FALLBACK_ICONS.length];
                    if (!globalUsedIcons.has(fi)) {
                      item.icon = fi;
                      break;
                    }
                  }
                  fallbackIndex++;
                }
                globalUsedIcons.add(item.icon);
              }
              
              // Validate image URLs
              if (item.image && !isValidImageUrl(item.image)) {
                item.image = FALLBACK_IMAGE;
              }
              if (item.avatar && !isValidImageUrl(item.avatar)) {
                item.avatar = undefined; // Remove invalid avatars
              }
              
              return item;
            });
          }
          return section;
        });
      }
      return page;
    });
  }
  return spec;
}

function extractJsonFromResponse(
  text: string, 
  forceFallback: boolean = false,
  fallbackForcedOnceRef?: React.MutableRefObject<boolean>
): { message: string; siteSpec: SiteSpec | null } {
  // DEBUG: Force fallback once if ?forceFallback=1
  if (forceFallback && fallbackForcedOnceRef && !fallbackForcedOnceRef.current) {
    console.log('[DEBUG] Forcing fallback - returning null from extractJsonFromResponse');
    fallbackForcedOnceRef.current = true;
    return { message: text, siteSpec: null };
  }
  
  // Try to find JSON code block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      let parsed = JSON.parse(jsonMatch[1].trim());
      const message = text.replace(/```json[\s\S]*?```/, '').trim();
      
      // Validate it has the required structure
      if (parsed.name && parsed.pages && Array.isArray(parsed.pages)) {
        parsed = normalizeSpec(parsed);
        return { message, siteSpec: parsed as SiteSpec };
      }
    } catch (e) {
      console.error('Failed to parse JSON from response:', e);
    }
  }
  
  // Fallback: try to find raw JSON object
  const rawJsonMatch = text.match(/\{[\s\S]*"name"[\s\S]*"pages"[\s\S]*\}/);
  if (rawJsonMatch) {
    try {
      let parsed = JSON.parse(rawJsonMatch[0]);
      if (parsed.name && parsed.pages) {
        const message = text.replace(rawJsonMatch[0], '').trim();
        parsed = normalizeSpec(parsed);
        return { message, siteSpec: parsed as SiteSpec };
      }
    } catch (e) {
      console.error('Failed to parse raw JSON:', e);
    }
  }
  
  return { message: text, siteSpec: null };
}

function containsUrl(text: string): boolean {
  return /https?:\/\/[^\s<>"{}|\\^`[\]]+/i.test(text);
}

export function BuilderShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ projectId?: string }>();
  const state = location.state as LocationState | null;
  const initialIdea = state?.initialIdea || '';
  // Support both URL params and state for project ID
  const projectIdFromUrl = params.projectId || null;
  const projectIdFromState = state?.projectId || null;
  const templateSpecFromState = state?.templateSpec || null;

  // Debug mode query params
  const searchParams = new URLSearchParams(location.search);
  const debugMode = searchParams.get('debug') === '1';
  const forceFallback = searchParams.get('forceFallback') === '1';

  // Debug state for panel - using imported DebugInfo type
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    lastScaffold: null,
    lastSpecPageMap: {},
    lastGuardrailViolations: [],
    lastLayoutSignature: null,
  });

  const [idea, setIdea] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { 
    state: siteSpec, 
    setState: setSiteSpecWithHistory, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    reset: resetSiteSpec 
  } = useHistory<SiteSpec | null>(null);
  const [courseSpec, setCourseSpec] = useState<{
    title: string;
    description: string;
    difficulty: string;
    duration_weeks: number;
    modules: Array<{
      id: string;
      title: string;
      description: string;
      lessons: Array<{
        id: string;
        title: string;
        duration: string;
        type: 'video' | 'text' | 'quiz' | 'assignment';
        description?: string;
        is_preview?: boolean;
      }>;
    }>;
    learningOutcomes?: string[];
  } | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(projectIdFromUrl || projectIdFromState);
  const [projectName, setProjectName] = useState<string>('New Project');
  const [modelMode, setModelMode] = useState<'fast' | 'quality'>('quality');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showDomainsDialog, setShowDomainsDialog] = useState(false);
  const [showSchemaDialog, setShowSchemaDialog] = useState(false);
  const [showThreeDDialog, setShowThreeDDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ name: string; url: string }[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [visualEditsEnabled, setVisualEditsEnabled] = useState(false);
  const [motionIntensity, setMotionIntensity] = useState<MotionIntensity>(() => {
    // Load from localStorage, default to 'premium'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('excellion-motion-intensity') as MotionIntensity) || 'premium';
    }
    return 'premium';
  });
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [pendingSpec, setPendingSpec] = useState<SiteSpec | null>(null);
  const [previousSpecForDiff, setPreviousSpecForDiff] = useState<SiteSpec | null>(null);
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showRefineChat, setShowRefineChat] = useState(false);
  const [showCourseSettings, setShowCourseSettings] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [courseSettings, setCourseSettings] = useState({
    price: null as number | null,
    currency: 'USD',
    customDomain: '',
    seoTitle: '',
    seoDescription: '',
    enrollmentOpen: true,
    maxStudents: null as number | null,
    thumbnail: null as string | null,
  });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fallbackForcedOnceRef = useRef<boolean>(false);
  
  // Multiplayer presence
  const { otherUsers, updateCursor } = usePresence(projectId);
  
  // Credits system
  const { 
    balance: creditBalance, 
    checkCredits, 
    getCost, 
    deductLocal, 
    authenticated: isAuthenticated,
    fetchCredits 
  } = useCredits();
  
  // Wrapper to make setSiteSpec work like useState setter for useSiteEditor
  const setSiteSpec = useCallback((value: React.SetStateAction<SiteSpec | null>) => {
    if (typeof value === 'function') {
      const newValue = value(siteSpec);
      if (newValue !== null) {
        setSiteSpecWithHistory(newValue);
      }
    } else {
      setSiteSpecWithHistory(value);
    }
  }, [siteSpec, setSiteSpecWithHistory]);
  
  // Use the site editor hook for inline editing
  const editor = useSiteEditor(siteSpec, setSiteSpec, currentPageIndex);
  
  const hasAutoGeneratedRef = useRef(false);
  const hasLoadedProjectRef = useRef(false);

  // Immediately load template spec if provided (for instant preview)
  useEffect(() => {
    if (templateSpecFromState && !siteSpec) {
      setSiteSpec(templateSpecFromState);
      setProjectName(templateSpecFromState.name || 'New Project');
    }
  }, [templateSpecFromState]);

  // Load existing project OR trigger generation for new projects from hub
  useEffect(() => {
    if (projectId && !hasLoadedProjectRef.current) {
      hasLoadedProjectRef.current = true;
      loadProjectAndMaybeGenerate(projectId);
    }
  }, [projectId]);

  // Load generated images on mount so library is always available
  useEffect(() => {
    fetchGeneratedImages();
    
    // Listen for refresh events from LogoUpload
    const handleRefresh = () => fetchGeneratedImages();
    window.addEventListener('refresh-image-library', handleRefresh);
    return () => window.removeEventListener('refresh-image-library', handleRefresh);
  }, []);

  const loadProjectAndMaybeGenerate = async (id: string) => {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      return;
    }

    setProjectName(data.name);
    
    // Load published URL if site is published
    if (data.published_url) {
      setPublishedUrl(data.published_url);
    }
    
    const spec = data.spec as { 
      html?: string; 
      messages?: Message[]; 
      siteSpec?: SiteSpec; 
      courseSpec?: typeof courseSpec;
      themeId?: string 
    } | null;
    
    // Check if project has generated content (including courseSpec)
    const hasContent = spec?.html || spec?.siteSpec || spec?.courseSpec || (spec?.messages && spec.messages.length > 0);
    
    if (hasContent) {
      // Load existing content
      if (spec?.html) {
        setGeneratedHtml(spec.html);
      }
      if (spec?.siteSpec) {
        setSiteSpec(spec.siteSpec);
      }
      // Load courseSpec if it exists
      if (spec?.courseSpec) {
        setCourseSpec(spec.courseSpec);
      }
      if (spec?.messages && Array.isArray(spec.messages)) {
        setMessages(spec.messages.map((m, i) => ({
          id: m.id || `loaded-${i}`,
          role: m.role,
          content: m.content,
          htmlCode: m.htmlCode,
          attachments: m.attachments, // Restore attached images
        })));
      }
    } else if (initialIdea && !hasAutoGeneratedRef.current) {
      // New project from hub - trigger generation immediately
      hasAutoGeneratedRef.current = true;
      setIdea(initialIdea);
      // Small delay to ensure state is ready
      setTimeout(() => {
        handleGenerate(initialIdea);
      }, 100);
    }
  };

  // Fallback for direct navigation without projectId
  useEffect(() => {
    if (initialIdea && !projectId && !siteSpec && !generatedHtml && !isGenerating && messages.length === 0 && !hasAutoGeneratedRef.current) {
      hasAutoGeneratedRef.current = true;
      setIdea(initialIdea);
      handleGenerate(initialIdea);
    }
  }, []);

  const updateStep = (stepId: number, status: GenerationStep['status']) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s))
    );
  };

  const saveProject = async (
    html: string | null, 
    allMessages: Message[], 
    ideaText: string, 
    currentSiteSpec: SiteSpec | null,
    currentCourseSpec?: typeof courseSpec
  ) => {
    // Get current user for new projects
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use AI-generated site/course name if available, otherwise fall back to idea text
    const aiGeneratedName = currentSiteSpec?.name || currentCourseSpec?.title;
    const name = projectName !== 'New Project' ? projectName : (aiGeneratedName || ideaText.slice(0, 50));
    
    const projectData = {
      name,
      idea: ideaText,
      spec: { 
        html, 
        siteSpec: currentSiteSpec,
        courseSpec: currentCourseSpec || null,
        messages: allMessages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          htmlCode: m.htmlCode,
          attachments: m.attachments, // Persist attached images
        }))
      } as unknown as Json,
    };

    if (projectId) {
      const { error } = await supabase
        .from('builder_projects')
        .update(projectData)
        .eq('id', projectId);

      if (error) {
        console.error('Failed to update project:', error);
      } else {
        setSaveStatus('saved');
      }
    } else {
      const { data, error } = await supabase
        .from('builder_projects')
        .insert({ ...projectData, user_id: user?.id })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to save project:', error);
      } else if (data) {
        setProjectId(data.id);
        setProjectName(name);
        setSaveStatus('saved');
        toast.success('Project saved!');
        
        // Update URL to include project ID for persistence
        navigate(`/studio/${data.id}`, { replace: true, state: { projectId: data.id } });
      }
    }
  };

  // Auto-save when siteSpec changes (from inline editing)
  useEffect(() => {
    if (siteSpec && projectId) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      saveProject(generatedHtml, messages, firstUserMessage?.content || '', siteSpec, courseSpec);
    }
  }, [siteSpec]);

  // Auto-save when courseSpec changes (from inline editing or generation)
  useEffect(() => {
    if (courseSpec && projectId) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      saveProject(generatedHtml, messages, firstUserMessage?.content || '', siteSpec, courseSpec);
    }
  }, [courseSpec]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z')) && canRedo) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [canUndo, canRedo, undo, redo]);

  // Warn users if they try to leave during generation
  useEffect(() => {
    if (!isGenerating) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Website generation is in progress. Are you sure you want to leave?';
      return e.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  // Helper to deduct credits via edge function with dynamic cost
  const deductCredits = async (
    action: CreditActionType, 
    description?: string,
    customAmount?: number
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to use AI features', {
          action: {
            label: 'Sign In',
            onClick: () => navigate('/auth'),
          },
        });
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke('deduct-credits', {
        body: { action, description, projectId, amount: customAmount }
      });
      
      if (error || !data?.success) {
        if (data?.insufficient) {
          toast.error(`Not enough credits. Need ${data?.required || customAmount || getCost(action)}, have ${data?.balance || 0}`, {
            action: {
              label: 'Get Credits',
              onClick: () => navigate('/billing'),
            },
          });
          return false;
        }
        console.error('Credit deduction error:', error || data?.error);
        return true;
      }
      
      fetchCredits(); // Refresh credit balance after deduction
      return true;
    } catch (err) {
      console.error('Credit deduction failed:', err);
      return true;
    }
  };

  // Course-specific generation handler
  const handleGenerateCourse = async (ideaToUse: string, courseOptions?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration_weeks: number;
    includeQuizzes: boolean;
    includeAssignments: boolean;
  }) => {
    // Deduct credits for course generation
    const canProceed = await deductCredits('generation', 'Course generation', 3);
    if (!canProceed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: ideaToUse,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIdea('');
    setAttachments([]);
    setSaveStatus('unsaved');

    setIsGenerating(true);
    setCourseSpec(null);
    setSiteSpec(null);
    setGeneratedHtml(null);
    setSteps([
      { id: 1, label: 'Understanding your idea...', status: 'pending' },
      { id: 2, label: 'Creating curriculum structure...', status: 'pending' },
      { id: 3, label: 'Writing lesson content...', status: 'pending' },
      { id: 4, label: 'Finalizing course...', status: 'pending' },
    ]);

    try {
      updateStep(1, 'active');
      await new Promise((r) => setTimeout(r, 300));
      updateStep(1, 'complete');

      updateStep(2, 'active');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in to generate courses');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          prompt: ideaToUse,
          options: {
            difficulty: courseOptions?.difficulty || 'beginner',
            duration_weeks: courseOptions?.duration_weeks || 6,
            includeQuizzes: courseOptions?.includeQuizzes ?? true,
            includeAssignments: courseOptions?.includeAssignments ?? false,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate course');
      }

      const data = await response.json();
      updateStep(2, 'complete');

      updateStep(3, 'active');
      await new Promise((r) => setTimeout(r, 200));
      updateStep(3, 'complete');
      
      updateStep(4, 'active');
      
      if (data.course) {
        setCourseSpec(data.course);
        setProjectName(data.course.title || 'New Course');
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Course "${data.course.title}" generated! Check the preview on the right.`,
        };
        const allMessages = [...messages, userMessage, assistantMessage];
        setMessages(allMessages);
        
        // Save with the new courseSpec
        await saveProject(null, allMessages, ideaToUse, null, data.course);
      }

      updateStep(4, 'complete');
    } catch (error) {
      console.error('Course generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate course');
      setSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (inputIdea?: string, retryCount: number = 0) => {
    const ideaToUse = inputIdea || idea;
    if (!ideaToUse.trim()) return;

    // ============ COURSE-ONLY BUILDER ============
    // Always use course generation - this is a COURSE builder, not a website builder
    return handleGenerateCourse(ideaToUse);

    // ============ ROUTING & SCAFFOLDING ============
    // Step 1: Run niche router to detect category, goal, integrations
    const route = routeNiche(ideaToUse);
    console.log('[ROUTER]', { 
      category: route.category, 
      goal: route.goal, 
      archetypeId: `${route.category}_${route.goal}`,
      integrations: route.integrationsNeeded,
      confidence: route.confidence 
    });
    
    // Step 2: Select archetype deterministically
    const archetype = selectArchetype(route.category, route.goal);
    console.log('[ARCHETYPE]', { 
      id: archetype.id, 
      requiredPages: archetype.requiredPages.map(p => p.path),
      ctaRules: archetype.ctaRules,
      forbiddenPhrases: archetype.forbiddenPhrases.slice(0, 3)
    });
    
    // Step 3: Get integration packs and build page map
    const integrationPacks = getPacksForIntegrations(route.integrationsNeeded);
    const requiredSections = new Set<string>();
    const pageMap: Record<string, string[]> = {};
    
    // Build from archetype pages
    for (const page of archetype.requiredPages) {
      pageMap[page.path] = page.requiredSections;
      page.requiredSections.forEach(s => requiredSections.add(s));
    }
    
    // Add integration pack sections
    for (const pack of integrationPacks) {
      if (pack.pages) {
        for (const page of pack.pages) {
          if (page.path && !pageMap[page.path]) {
            pageMap[page.path] = (page.sections || []).map(s => s.type || 'custom');
          }
        }
      }
    }
    
    console.log('[SCAFFOLD]', { 
      pageMap, 
      requiredSections: Array.from(requiredSections) 
    });
    
    // Step 4: Build generation scaffold for the AI prompt
    const generationScaffold = {
      category: route.category,
      goal: route.goal,
      archetypeId: archetype.id,
      requiredPages: archetype.requiredPages,
      ctaRules: archetype.ctaRules,
      forbiddenPhrases: archetype.forbiddenPhrases,
      integrations: route.integrationsNeeded,
      layoutSignature: archetype.layoutSignature,
    };

    // Determine credit action type
    const isFirstMessage = messages.length === 0;
    const editKeywords = /\b(change|update|edit|modify|replace|add|remove|make|regenerate|rebuild|redesign|redo|adjust|fix|improve|enhance|different|new|another)\b/i;
    const isEditRequest = !isFirstMessage && editKeywords.test(ideaToUse);
    const actionType: CreditActionType = isFirstMessage ? 'generation' : (isEditRequest ? 'edit' : 'chat');
    
    // Calculate dynamic credit cost based on prompt complexity
    const hasImages = attachments.some(att => 
      att.type === 'file' && att.data instanceof File && (att.data as File).type.startsWith('image/')
    );
    
    const creditCalc = calculateCreditCost(actionType, ideaToUse, {
      attachmentCount: attachments.length,
      hasImages,
      isFirstGeneration: isFirstMessage,
    });
    
    console.log('[Credits] Dynamic cost calculation:', creditCalc);
    
    // Deduct credits BEFORE making AI call with dynamic cost
    const canProceed = await deductCredits(
      actionType, 
      `AI ${actionType}: ${creditCalc.breakdown}`,
      creditCalc.totalCost
    );
    if (!canProceed) {
      return;
    }

    // Convert attachments to base64 for API and upload to storage for actual use
    const currentAttachments = [...attachments];
    const attachmentData: { name: string; url: string; type: string }[] = [];
    const imageDataForApi: { type: 'image_url'; image_url: { url: string } }[] = [];
    const uploadedImageUrls: { name: string; url: string; purpose?: string }[] = [];
    
    // Build enhanced idea with attachment context
    let enhancedIdea = ideaToUse;

    for (const att of currentAttachments) {
      // Handle file attachments
      if (att.type === 'file' && att.data instanceof File) {
        const file = att.data as File;
        if (file.type.startsWith('image/')) {
          // Convert to base64 for multimodal AI context
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          // Upload to Supabase storage so AI can reference it in the site
          try {
            const fileExt = att.name.split('.').pop() || 'png';
            const fileName = `builder-uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('builder-images')
              .upload(fileName, file, { 
                contentType: file.type,
                upsert: false 
              });
            
            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage
                .from('builder-images')
                .getPublicUrl(uploadData.path);
              
              if (urlData?.publicUrl) {
                uploadedImageUrls.push({ 
                  name: att.name, 
                  url: urlData.publicUrl,
                  purpose: att.name.toLowerCase().includes('logo') ? 'logo' : 'image'
                });
                attachmentData.push({ name: att.name, url: urlData.publicUrl, type: file.type });
              } else {
                attachmentData.push({ name: att.name, url: base64, type: file.type });
              }
            } else {
              console.error('Upload error:', uploadError);
              attachmentData.push({ name: att.name, url: base64, type: file.type });
            }
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
            const base64Fallback = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
            attachmentData.push({ name: att.name, url: base64Fallback, type: file.type });
          }
          
          imageDataForApi.push({ type: 'image_url', image_url: { url: base64 } });
        } else {
          attachmentData.push({ name: att.name, url: '', type: file.type });
        }
      }
      // Handle screenshot attachments (also files)
      else if (att.type === 'screenshot' && att.data instanceof File) {
        const file = att.data as File;
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageDataForApi.push({ type: 'image_url', image_url: { url: base64 } });
        attachmentData.push({ name: att.name, url: base64, type: 'image/png' });
      }
      // Handle text attachments
      else if (att.type === 'text' && typeof att.data === 'string') {
        attachmentData.push({ name: att.name, url: '', type: 'text/plain' });
        enhancedIdea = `${enhancedIdea}\n\n[ADDITIONAL CONTEXT - "${att.name}"]: ${att.data}`;
      }
      // Handle link attachments
      else if (att.type === 'link' && att.url) {
        attachmentData.push({ name: att.name, url: att.url, type: 'link' });
        enhancedIdea = `${enhancedIdea}\n\n[REFERENCE LINK: ${att.url}]`;
      }
      // Handle brand kit attachments
      else if (att.type === 'brandkit' && att.brandKit) {
        const bk = att.brandKit;
        const brandContext = `[BRAND KIT - Apply these brand guidelines:
- Primary Color: ${bk.primaryColor}
- Secondary Color: ${bk.secondaryColor}  
- Font: ${bk.font}
- Tone: ${bk.tone}
${bk.logo ? `- Logo URL: ${bk.logo}` : ''}]`;
        enhancedIdea = `${enhancedIdea}\n\n${brandContext}`;
        attachmentData.push({ name: 'Brand Kit', url: '', type: 'brandkit' });
      }
    }

    // If images were uploaded, append instructions to the user's message
    if (uploadedImageUrls.length > 0) {
      const imageInstructions = uploadedImageUrls.map(img => {
        if (img.purpose === 'logo') {
          return `[USER UPLOADED LOGO - USE THIS URL: ${img.url}]`;
        }
        return `[USER UPLOADED IMAGE "${img.name}" - USE THIS URL: ${img.url}]`;
      }).join('\n');
      enhancedIdea = `${enhancedIdea}\n\n${imageInstructions}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: ideaToUse, // Display original text to user
      attachments: attachmentData.length > 0 ? attachmentData : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIdea('');
    setAttachments([]); // Clear attachments after sending

    setIsGenerating(true);
    // Don't clear the existing preview - keep it visible until new one is ready
    setGeneratedHtml(null);
    // resetSiteSpec removed: Keep existing preview during generation
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));

    const hasUrl = containsUrl(ideaToUse);

    try {
      updateStep(1, 'active');
      await new Promise((r) => setTimeout(r, 200));
      updateStep(1, 'complete');

      updateStep(2, 'active');
      if (hasUrl) {
        await new Promise((r) => setTimeout(r, 100));
      }
      updateStep(2, 'complete');

      updateStep(3, 'active');
      
      // Build chat messages, including images for the latest user message
      const chatMessages = [...messages, userMessage].map((m, idx, arr) => {
        const isLatestUserMessage = idx === arr.length - 1 && m.role === 'user';
        
        // For the latest user message with attachments, use multimodal format
        if (isLatestUserMessage && imageDataForApi.length > 0) {
          return {
            role: m.role,
            content: [
              { type: 'text', text: enhancedIdea }, // Use enhanced idea with image URLs
              ...imageDataForApi,
            ],
          };
        }
        
        return {
          role: m.role,
          content: m.content,
        };
      });

      // Refresh session to ensure valid token (getUser() validates and refreshes if needed)
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        throw new Error('Please sign in to use AI features');
      }
      
      // Get the refreshed session with valid access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Session expired. Please sign in again.');
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ 
          messages: chatMessages, 
          modelMode, 
          projectId,
          scaffold: generationScaffold // Pass scaffold for AI to follow
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate website');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let textBuffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          textBuffer += decoder.decode(value, { stream: true });
          
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullResponse += content;
            } catch {
              // Partial JSON, continue
            }
          }
        }
      }

      updateStep(3, 'complete');
      // Credits already deducted before AI call

      updateStep(4, 'active');
      
      // Use forceFallback query param to test fallback path
      const { message: assistantText, siteSpec: parsedSpec } = extractJsonFromResponse(fullResponse, forceFallback, fallbackForcedOnceRef);
      
      let newSiteSpec: SiteSpec | null = null;
      if (parsedSpec) {
        // ============ SCAFFOLD VALIDATION ============
        const scaffoldValidation = validateSpecAgainstScaffold(parsedSpec, generationScaffold);
        console.log('[SCAFFOLD_VALIDATION]', {
          valid: scaffoldValidation.valid,
          violations: scaffoldValidation.violations.map(v => v.details),
        });
        
        // If scaffold validation failed and this is first attempt, retry with repair instructions
        if (!scaffoldValidation.valid && retryCount < 1) {
          console.log('[SCAFFOLD_VALIDATION] Retrying with repair instructions...');
          const repairHint = scaffoldValidation.violations
            .map(v => `FIX: ${v.details}`)
            .join('. ');
          
          toast.info('Repairing site structure...');
          return handleGenerate(`${ideaToUse}\n\n[REPAIR INSTRUCTIONS: ${repairHint}]`, retryCount + 1);
        }
        
        // ============ GUARDRAILS ============
        // Run content and diversity guardrails BEFORE setting the spec
        const contentResult = contentGuardrail(parsedSpec, route.category);
        const diversityResult = diversityGuardrail(parsedSpec);
        const layoutSig = computeSignature(parsedSpec);
        
        // Build page map for debug
        const specPageMap: PageMap = {};
        for (const page of parsedSpec.pages || []) {
          specPageMap[page.path] = (page.sections || []).map(s => s.type);
        }
        
        // Collect violations for debug (include scaffold violations)
        const allViolations = [
          ...scaffoldValidation.violations.map(v => v.details),
          ...contentResult.issues,
          ...diversityResult.issues,
        ];
        
        // Update debug info
        if (debugMode) {
          setDebugInfo({
            lastScaffold: generationScaffold,
            lastSpecPageMap: specPageMap,
            lastGuardrailViolations: allViolations,
            lastLayoutSignature: layoutSig,
          });
        }
        
        console.log('[GUARDRAIL]', { 
          passed: contentResult.valid && diversityResult.valid,
          contentIssues: contentResult.issues,
          diversityIssues: diversityResult.issues,
          severity: contentResult.severity
        });
        
        console.log('[LAYOUT]', {
          hash: layoutSig.hash,
          pageCount: layoutSig.pageCount,
          sectionPattern: layoutSig.sectionPattern,
          uniqueSectionTypes: layoutSig.uniqueSectionTypes
        });
        
        console.log('[LAYOUT_SIGNATURE]', {
          pages: Object.keys(specPageMap),
          sectionsPerPage: specPageMap,
        });
        
        // If guardrails failed and this is first attempt (and scaffold passed), retry once with constraints
        const guardrailsFailed = !contentResult.valid || !diversityResult.valid;
        if (guardrailsFailed && retryCount < 1) {
          console.log('[GUARDRAIL] Retrying generation with additional constraints...');
          const constraintHint = [
            ...contentResult.issues.map(i => `AVOID: ${i}`),
            ...diversityResult.issues.map(i => `FIX: ${i}`),
          ].join('. ');
          
          // Retry with enhanced prompt including guardrail feedback
          toast.info('Improving generation quality...');
          return handleGenerate(`${ideaToUse}\n\n[QUALITY CONSTRAINTS: ${constraintHint}]`, retryCount + 1);
        }
        
        // Record the generation for diversity tracking
        recordGeneration(parsedSpec);
        
        // Process GENERATE: image prompts in the spec (async, don't block)
        let processedSpec = parsedSpec;
        try {
          toast.info('Generating custom images for your site...');
          processedSpec = await processImageGenerationPrompts(parsedSpec, supabase);
          toast.success('Custom images generated!');
        } catch (imgErr) {
          console.warn('[ImageGen] Failed to process image prompts:', imgErr);
          // Continue with original spec - images will use fallbacks
        }
        
        newSiteSpec = processedSpec;
        setSiteSpec(processedSpec);
        setGeneratedHtml(null); // Use SiteSpec rendering instead of raw HTML
        
        // Set project name from AI-generated site name
        if (parsedSpec.name && projectName === 'New Project') {
          setProjectName(parsedSpec.name);
        }
      } else {
        // Fallback to rule-based generation if AI didn't return valid JSON
        console.warn('[specFromChat] AI did not return valid JSON, using fallback generator');
        newSiteSpec = specFromChat(ideaToUse);
        
        // Log fallback details
        const fallbackPageMap: PageMap = {};
        for (const page of newSiteSpec.pages || []) {
          fallbackPageMap[page.path] = (page.sections || []).map(s => s.type);
        }
        console.log('[specFromChat] Generated pages:', Object.keys(fallbackPageMap));
        console.log('[specFromChat] pages.length:', newSiteSpec.pages?.length || 0);
        console.log('[specFromChat] pageMap:', fallbackPageMap);
        
        // Update debug info for fallback
        if (debugMode) {
          setDebugInfo(prev => ({
            ...prev,
            lastSpecPageMap: fallbackPageMap,
            lastGuardrailViolations: ['Used fallback generator (AI JSON parse failed)'],
          }));
        }
        
        setSiteSpec(newSiteSpec);
        
        // Set project name from fallback spec
        if (newSiteSpec.name && projectName === 'New Project') {
          setProjectName(newSiteSpec.name);
        }
      }
      
      updateStep(4, 'complete');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText || 'Website generated! Check the preview on the right.',
        htmlCode: undefined,
      };
      const allMessages = [...messages, userMessage, assistantMessage];
      setMessages(allMessages);

      const firstUserMessage = allMessages.find(m => m.role === 'user');
      await saveProject(null, allMessages, firstUserMessage?.content || ideaToUse, newSiteSpec);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate. Please try again.');
      setSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter an image description');
      return;
    }

    // Check credits for image generation (2 credits)
    if (isAuthenticated && !checkCredits('image')) {
      toast.error(`Not enough credits. Need ${getCost('image')} for image generation.`);
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Deduct credits before image generation
      const canProceed = await deductCredits('image', 'AI image generation');
      if (!canProceed) {
        setIsGeneratingImage(false);
        return;
      }

      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Please log in to generate images');
        setIsGeneratingImage(false);
        return;
      }

      // Detect niche from site info for niche-specific image generation
      const businessName = siteSpec?.name || 'Business';
      const businessDescription = siteSpec?.description || '';
      const detectedNiche = detectNiche({ 
        businessName, 
        description: businessDescription 
      });

      // Use niche-specific image generation when we have a site
      const endpoint = siteSpec 
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-niche-image`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

      const requestBody = siteSpec 
        ? {
            businessName,
            businessDescription,
            niche: detectedNiche,
            imageType: 'hero',
            customPrompt: imagePrompt,
          }
        : { 
            prompt: imagePrompt,
            referenceImage: imageAttachment || undefined
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      const generatedImageUrl = data.imageUrl || data.images?.[0];
      
      if (generatedImageUrl) {
        // Update hero section image if site exists
        if (siteSpec) {
          const heroSection = siteSpec.pages[currentPageIndex]?.sections.find(s => s.type === 'hero');
          if (heroSection) {
            editor.updateSection(heroSection.id, (section) => ({
              ...section,
              content: {
                ...section.content,
                backgroundImage: generatedImageUrl,
              },
            }));
            toast.success(`Unique ${detectedNiche} image applied to hero!`);
          } else {
            navigator.clipboard.writeText(generatedImageUrl);
            toast.success('Image generated! URL copied to clipboard.');
          }
        } else {
          navigator.clipboard.writeText(generatedImageUrl);
          toast.success('Image URL copied to clipboard!');
        }
        // Refresh the library to show the new image
        fetchGeneratedImages();
        setImagePrompt('');
        setImageAttachment(null);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddAttachment = (attachment: AttachmentItem) => {
    setAttachments(prev => [...prev, attachment].slice(0, 10));
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageAttachment(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const fetchGeneratedImages = async () => {
    setIsLoadingImages(true);
    try {
      const { data, error } = await supabase.storage
        .from('builder-images')
        .list('generated', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
      
      if (error) throw error;
      
      const images = (data || [])
        .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(file => ({
          name: file.name,
          url: supabase.storage.from('builder-images').getPublicUrl(`generated/${file.name}`).data.publicUrl,
        }));
      
      setGeneratedImages(images);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handlePublish = async () => {
    if (!siteSpec || !projectId) {
      toast.error('No site to publish');
      return;
    }

    setIsPublishing(true);
    try {
      const html = generateHtmlFromSpec(siteSpec);
      
      const { data, error } = await supabase.functions.invoke('publish-site', {
        body: { 
          html, 
          projectId, 
          projectName 
        },
      });

      if (error) throw error;

      if (data?.url) {
        setPublishedUrl(data.url);
        setShowPublishDialog(true);
        toast.success('Site published successfully!');
      } else {
        throw new Error('No URL returned from publish');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish site');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!projectId) {
      toast.error('No project to unpublish');
      return;
    }

    setIsUnpublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('unpublish-site', {
        body: { projectId },
      });

      if (error) throw error;

      setPublishedUrl(null);
      toast.success('Site unpublished successfully');
    } catch (error) {
      console.error('Unpublish error:', error);
      toast.error('Failed to unpublish site');
    } finally {
      setIsUnpublishing(false);
    }
  };

  // Course publishing states
  const [courseId, setCourseId] = useState<string | null>(null);
  const [coursePublishedUrl, setCoursePublishedUrl] = useState<string | null>(null);
  const [showCoursePublishDialog, setShowCoursePublishDialog] = useState(false);

  const handlePublishCourse = async () => {
    if (!courseSpec) {
      toast.error('No course to publish');
      return;
    }

    setIsPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to publish');
        return;
      }

      // Generate a URL-friendly subdomain from title
      const subdomain = courseSpec.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50) + '-' + Date.now().toString(36);

      const courseUrl = `${window.location.origin}/course/${subdomain}`;

      // If we have an existing course ID, update it
      if (courseId) {
        const { error } = await supabase
          .from('courses')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            published_url: courseUrl,
            subdomain,
            title: courseSpec.title,
            description: courseSpec.description,
            difficulty: courseSpec.difficulty,
            duration_weeks: courseSpec.duration_weeks,
            modules: courseSpec.modules as any,
          })
          .eq('id', courseId);

        if (error) throw error;
      } else {
        // Create new course
        const { data, error } = await supabase
          .from('courses')
          .insert({
            user_id: user.id,
            status: 'published',
            published_at: new Date().toISOString(),
            published_url: courseUrl,
            subdomain,
            title: courseSpec.title,
            description: courseSpec.description,
            difficulty: courseSpec.difficulty,
            duration_weeks: courseSpec.duration_weeks,
            modules: courseSpec.modules as any,
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          setCourseId(data.id);
        }
      }

      setCoursePublishedUrl(courseUrl);
      setShowCoursePublishDialog(true);
      toast.success('Course published successfully!');
    } catch (error) {
      console.error('Course publish error:', error);
      toast.error('Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishCourse = async () => {
    if (!courseId) {
      toast.error('No course to unpublish');
      return;
    }

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          status: 'draft',
          published_at: null,
          published_url: null,
        })
        .eq('id', courseId);

      if (error) throw error;

      setCoursePublishedUrl(null);
      toast.success('Course unpublished');
    } catch (error) {
      console.error('Course unpublish error:', error);
      toast.error('Failed to unpublish course');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('URL copied!');
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'tablet': return 'max-w-[768px]';
      case 'mobile': return 'max-w-[375px]';
      default: return 'w-full';
    }
  };

  const handleRenameProject = async (newName: string) => {
    if (!projectId) return;
    try {
      const { error } = await supabase
        .from('builder_projects')
        .update({ name: newName })
        .eq('id', projectId);
      
      if (error) throw error;
      setProjectName(newName);
      toast.success('Project renamed');
    } catch (error) {
      console.error('Rename error:', error);
      toast.error('Failed to rename project');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Chat */}
        <ResizablePanel defaultSize={38} minSize={25} maxSize={55}>
          <div className="h-full border-r border-border flex flex-col bg-card/30">
            {/* Header with Studio button and Project Name */}
            <div className="border-b border-border px-2 sm:px-3 py-2 sm:py-2.5 bg-card/50">
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isGenerating) {
                      toast.warning('Please wait for generation to complete before leaving.');
                      return;
                    }
                    navigate('/secret-builder-hub');
                  }}
                  className="gap-1 sm:gap-1.5 text-xs shrink-0 px-2 sm:px-3"
                  disabled={isGenerating}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Studio'}</span>
                </Button>
                <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />
                <button
                  onClick={() => setShowRenameDialog(true)}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-foreground hover:text-primary px-1 sm:px-1.5 py-0.5 rounded transition-colors group min-w-0 flex-1"
                  title="Click to rename project"
                >
                  <span className="truncate max-w-[80px] sm:max-w-[150px] md:max-w-none">{projectName || 'Untitled Project'}</span>
                  <svg className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                </button>
                <div className="h-4 w-px bg-border ml-auto shrink-0" />
                <CreditBalance className="shrink-0" />
              </div>
            </div>
            
            {/* Course Builder Panel */}
            <CourseBuilderPanel
              idea={idea}
              onIdeaChange={setIdea}
              onGenerate={(options) => {
                handleGenerateCourse(idea, options);
              }}
              isGenerating={isGenerating}
              steps={steps}
              messages={messages}
              attachments={attachments}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={removeAttachment}
              previewRef={previewContainerRef as React.RefObject<HTMLElement>}
            />
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel - Preview + Tabs */}
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-full flex flex-col">
        <div className="h-12 border-b border-border flex items-center justify-between px-2 sm:px-4 bg-card/30 gap-1 sm:gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Presence Avatars */}
            <PresenceAvatars users={otherUsers} />
            
            {siteSpec && siteSpec.pages.length > 0 && (
              <PageManager
                pages={siteSpec.pages}
                currentPageIndex={currentPageIndex}
                onSelectPage={setCurrentPageIndex}
                onAddPage={editor.addPage}
                onRemovePage={(index) => {
                  editor.removePage(index);
                  if (currentPageIndex >= index && currentPageIndex > 0) {
                    setCurrentPageIndex(currentPageIndex - 1);
                  }
                }}
                onRenamePage={editor.renamePage}
              />
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 rounded-lg p-0.5 sm:p-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 sm:h-7 sm:w-7 ${previewMode === 'desktop' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 sm:h-7 sm:w-7 ${previewMode === 'tablet' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 sm:h-7 sm:w-7 ${previewMode === 'mobile' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          {/* Model is auto-selected by the bot based on prompt complexity */}

          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Toolbar buttons matching screenshot */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Visual */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVisualEditsEnabled(!visualEditsEnabled);
                toast.success(visualEditsEnabled ? 'Visual edits disabled' : 'Visual edits enabled - click elements to edit');
              }}
              className={`gap-1.5 text-xs px-3 h-9 ${visualEditsEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Pencil className="h-4 w-4" />
              <span>Visual</span>
            </Button>

            {/* AI Image */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              className="gap-1.5 text-xs px-3 h-9 text-muted-foreground hover:text-foreground"
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              <span>AI Image</span>
            </Button>


            {/* Bookmarks */}
            <BookmarksPanel
              projectId={projectId}
              currentSpec={siteSpec}
              onRestoreBookmark={(spec) => {
                setPreviousSpecForDiff(siteSpec);
                setPendingSpec(spec);
                setShowDiffViewer(true);
              }}
            />

            {/* Knowledge */}
            <KnowledgePanel projectId={projectId} />

            {/* Database */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSchemaDialog(true)}
              className="gap-1.5 text-xs px-3 h-9 text-muted-foreground hover:text-foreground"
            >
              <Database className="h-4 w-4" />
              <span>Database</span>
            </Button>

            {/* Analytics */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalyticsDialog(true)}
              className="gap-1.5 text-xs px-3 h-9 text-muted-foreground hover:text-foreground"
              disabled={!projectId}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>

            {/* GitHub */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info('GitHub sync coming soon!')}
              className="gap-1.5 text-xs px-3 h-9 text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Button>

            {/* Publish */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={!siteSpec || isPublishing}
                  className="gap-1.5 bg-primary hover:bg-primary/90 px-4 h-9"
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePublish} disabled={!siteSpec || isPublishing} className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Publish Site</span>
                </DropdownMenuItem>
                {publishedUrl && (
                  <DropdownMenuItem 
                    onClick={handleUnpublish} 
                    disabled={isUnpublishing} 
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    {isUnpublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CloudOff className="h-4 w-4" />
                    )}
                    <span>{isUnpublishing ? 'Unpublishing...' : 'Unpublish Site'}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowDomainsDialog(true)} disabled={!projectId} className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Custom Domains</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSecurityDialog(true)} className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div 
          className="flex-1 bg-muted/30 p-4 overflow-hidden relative"
          ref={previewContainerRef}
          onMouseMove={(e) => {
            if (projectId && previewContainerRef.current) {
              const rect = previewContainerRef.current.getBoundingClientRect();
              updateCursor({
                x: e.clientX,
                y: e.clientY
              });
            }
          }}
          onMouseLeave={() => updateCursor(null)}
        >
          {/* Other users' cursors */}
          <PresenceCursor 
            cursors={otherUsers.filter(u => u.cursor !== null)} 
            containerRef={previewContainerRef as React.RefObject<HTMLElement>}
          />
          
          <div className={`h-full mx-auto ${getPreviewWidth()} transition-all duration-300`}>
            <div className="h-full bg-background rounded-xl shadow-lg overflow-hidden border border-border">
              {generatedHtml ? (
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full h-full border-0"
                  title="Generated Website Preview"
                  sandbox="allow-scripts"
                />
              ) : courseSpec ? (
                <div className="h-full overflow-auto p-6">
                  <CoursePreview
                    course={courseSpec}
                    onUpdate={(updated) => setCourseSpec(updated)}
                    onPublish={handlePublishCourse}
                    onUnpublish={handleUnpublishCourse}
                    onRefine={() => setShowRefineChat(true)}
                    onOpenSettings={() => setShowCourseSettings(true)}
                    onPreviewAsStudent={() => {
                      if (coursePublishedUrl) {
                        window.open(coursePublishedUrl, '_blank');
                      } else {
                        toast.info('Publish course first to view as student');
                      }
                    }}
                    onDuplicate={() => toast.info('Course duplicated!')}
                    onUploadThumbnail={() => toast.info('Thumbnail upload coming soon!')}
                    isPublishing={isPublishing}
                    isPublished={!!coursePublishedUrl}
                  />
                  <RefineChat
                    open={showRefineChat}
                    onOpenChange={setShowRefineChat}
                    onRefine={async (prompt) => {
                      setIsRefining(true);
                      await new Promise(r => setTimeout(r, 1500));
                      setIsRefining(false);
                      toast.success('Course refined!');
                    }}
                    isRefining={isRefining}
                  />
                  <CourseSettingsDialog
                    open={showCourseSettings}
                    onOpenChange={setShowCourseSettings}
                    settings={courseSettings}
                    onUpdateSettings={setCourseSettings}
                    onUploadThumbnail={() => toast.info('Thumbnail upload coming soon!')}
                  />
                  <CoursePublishDialog
                    open={showCoursePublishDialog}
                    onOpenChange={setShowCoursePublishDialog}
                    courseUrl={coursePublishedUrl || ''}
                    courseTitle={courseSpec.title}
                  />
                </div>
              ) : siteSpec ? (
                <div className="h-full overflow-auto relative" style={{ isolation: 'isolate', contain: 'layout paint' }}>
                  <SiteRenderer
                    siteSpec={siteSpec}
                    pageIndex={currentPageIndex}
                    isLoading={isGenerating}
                    onUpdateHeroContent={visualEditsEnabled ? editor.updateHeroContent : undefined}
                    onUpdateFeaturesContent={visualEditsEnabled ? editor.updateFeaturesContent : undefined}
                    onUpdateFeatureItem={visualEditsEnabled ? editor.updateFeatureItem : undefined}
                    onUpdateSiteName={visualEditsEnabled ? editor.updateSiteName : undefined}
                    onUpdateNavItem={visualEditsEnabled ? editor.updateNavItem : undefined}
                    onReorderSections={visualEditsEnabled ? editor.reorderSections : undefined}
                    onPageChange={setCurrentPageIndex}
                    motionIntensity={motionIntensity}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Describe your course to see a live preview.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Publish Success Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Site Published!
            </DialogTitle>
            <DialogDescription>
              Your website is now live and accessible at the URL below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <input
                type="text"
                readOnly
                value={publishedUrl || ''}
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={copyUrl}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => publishedUrl && window.open(publishedUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                View Site
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowPublishDialog(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Generation Dialog */}
      <Dialog open={showImageDialog} onOpenChange={(open) => {
        setShowImageDialog(open);
        if (open) {
          fetchGeneratedImages();
        } else {
          setImageAttachment(null);
          setImagePrompt('');
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              {imageAttachment ? 'Edit Image with AI' : 'Generate Unique AI Image'}
            </DialogTitle>
            <DialogDescription>
              {siteSpec ? (
                <>
                  Generating unique images for <span className="font-medium text-primary">{siteSpec.name}</span>
                  {' '}({detectNiche({ businessName: siteSpec.name, description: siteSpec.description }).toLowerCase().replace('_', ' ')} niche)
                </>
              ) : imageAttachment 
                ? 'Describe how you want to edit the attached image'
                : 'Describe the image you want to generate'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image attachment preview */}
            {imageAttachment && (
              <div className="relative">
                <img 
                  src={imageAttachment} 
                  alt="Attached" 
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 bg-background/80 hover:bg-background"
                  onClick={() => setImageAttachment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Input
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder={
                  imageAttachment 
                    ? "e.g., Make it more vibrant, add sunset colors" 
                    : siteSpec 
                      ? `e.g., Professional hero image for ${siteSpec.name}`
                      : "e.g., Modern business interior with natural lighting"
                }
                className="flex-1"
                disabled={isGeneratingImage}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateImage();
                  }
                }}
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageAttach}
                  disabled={isGeneratingImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={isGeneratingImage}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowImageDialog(false)}
                disabled={isGeneratingImage}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {imageAttachment ? 'Editing...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {imageAttachment ? 'Edit' : 'Generate'}
                  </>
                )}
              </Button>
            </div>

            {/* Image Library */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Generated Images</p>
              {isLoadingImages ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : generatedImages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No images generated yet</p>
              ) : (
                <ScrollArea className="h-64">
                  <div className="grid grid-cols-4 gap-3">
                    {generatedImages.map((image) => (
                      <button
                        key={image.name}
                        className="relative group aspect-square rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
                        onClick={() => {
                          handleAddAttachment({
                            id: Math.random().toString(36).substring(2, 9),
                            type: 'file',
                            name: image.name,
                            url: image.url,
                          });
                          setShowImageDialog(false);
                          toast.success('Image added to prompt');
                        }}
                        title="Click to add to prompt"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs text-white">Insert</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Site Analytics
            </DialogTitle>
            <DialogDescription>
              Track visitors, page views, and traffic sources for your published site.
            </DialogDescription>
          </DialogHeader>
          <AnalyticsPanel projectId={projectId} />
        </DialogContent>
      </Dialog>

      {/* Custom Domains Dialog */}
      <Dialog open={showDomainsDialog} onOpenChange={setShowDomainsDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Custom Domains
            </DialogTitle>
            <DialogDescription>
              Connect your own domain to your published site with automatic SSL.
            </DialogDescription>
          </DialogHeader>
          {projectId && <CustomDomainsPanel projectId={projectId} />}
        </DialogContent>
      </Dialog>

      {/* Schema Viz Dialog */}
      <Dialog open={showSchemaDialog} onOpenChange={setShowSchemaDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database Schema & AI
            </DialogTitle>
            <DialogDescription>
              Visualize your schema and ask AI questions about your database.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[400px] -mx-6 -mb-6">
            <SchemaVizPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* 3D Panel Dialog */}
      <Dialog open={showThreeDDialog} onOpenChange={setShowThreeDDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              3D Elements
            </DialogTitle>
            <DialogDescription>
              Create interactive 3D shapes and product showcases for your site.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[450px] -mx-6 -mb-6">
            <ThreeDPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Scan Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Scan
            </DialogTitle>
            <DialogDescription>
              Analyze your site for potential security vulnerabilities.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[400px] -mx-6 -mb-6">
            <SecurityScanPanel siteSpec={siteSpec} />
          </div>
        </DialogContent>
      </Dialog>

      <DiffViewer
        isOpen={showDiffViewer}
        onClose={() => {
          setShowDiffViewer(false);
          setPendingSpec(null);
          setPreviousSpecForDiff(null);
        }}
        previousSpec={previousSpecForDiff}
        currentSpec={pendingSpec}
        onAccept={() => {
          if (pendingSpec) {
            setSiteSpec(pendingSpec);
          }
          setShowDiffViewer(false);
          setPendingSpec(null);
          setPreviousSpecForDiff(null);
        }}
        onReject={() => {
          setShowDiffViewer(false);
          setPendingSpec(null);
          setPreviousSpecForDiff(null);
        }}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        currentName={projectName}
        onRename={handleRenameProject}
      />

      {/* Debug Panel - only visible with ?debug=1 */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 w-96 max-h-80 bg-black/90 border border-amber-500/50 rounded-lg p-4 text-xs text-white font-mono z-50 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 font-bold">🔧 DEBUG PANEL</span>
            <span className="text-gray-400">?debug=1</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-cyan-400">Last Scaffold:</span>
              <pre className="text-gray-300 mt-1 overflow-x-auto">
                {JSON.stringify(debugInfo.lastScaffold ? {
                  category: debugInfo.lastScaffold.category,
                  goal: debugInfo.lastScaffold.goal,
                  archetypeId: debugInfo.lastScaffold.archetypeId,
                  requiredPages: debugInfo.lastScaffold.requiredPages?.map((p: any) => p.path),
                } : null, null, 2)}
              </pre>
            </div>
            
            <div>
              <span className="text-green-400">Spec Page Map:</span>
              <pre className="text-gray-300 mt-1 overflow-x-auto">
                {JSON.stringify(debugInfo.lastSpecPageMap, null, 2)}
              </pre>
            </div>
            
            <div>
              <span className="text-red-400">Guardrail Violations:</span>
              <pre className="text-gray-300 mt-1 overflow-x-auto">
                {debugInfo.lastGuardrailViolations.length > 0 
                  ? debugInfo.lastGuardrailViolations.join('\n')
                  : '(none)'}
              </pre>
            </div>
            
            <div>
              <span className="text-purple-400">Layout Signature:</span>
              <pre className="text-gray-300 mt-1 overflow-x-auto">
                {JSON.stringify(debugInfo.lastLayoutSignature ? {
                  hash: debugInfo.lastLayoutSignature.hash,
                  pageCount: debugInfo.lastLayoutSignature.pageCount,
                  sectionPattern: debugInfo.lastLayoutSignature.sectionPattern,
                } : null, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-700 text-gray-500">
            <span>?forceFallback=1 to test fallback</span>
          </div>
        </div>
      )}

      {/* Course Action Bar - Sticky Bottom */}
      {courseSpec && (
        <CourseActionBar
          onSaveDraft={async () => {
            setSaveStatus('saving');
            try {
              await saveProject(null, messages, idea, null);
              setSaveStatus('saved');
              toast.success('Draft saved!');
            } catch (error) {
              setSaveStatus('unsaved');
              toast.error('Failed to save draft');
            }
          }}
          onPreview={() => toast.info('Student preview coming soon!')}
          onPublish={() => {
            toast.success('Course publishing coming soon!');
          }}
          isSaving={saveStatus === 'saving'}
          isPublishing={isPublishing}
          saveStatus={saveStatus}
          checklist={[
            { 
              label: 'Title', 
              complete: Boolean(courseSpec?.title), 
              required: true 
            },
            { 
              label: 'Modules', 
              complete: (courseSpec?.modules?.length || 0) >= 3, 
              required: true 
            },
            { 
              label: 'Thumbnail', 
              complete: Boolean(courseSettings.thumbnail), 
              required: false 
            },
            { 
              label: 'Pricing', 
              complete: courseSettings.price !== null, 
              required: false 
            },
          ]}
        />
      )}
    </div>
  );
}
