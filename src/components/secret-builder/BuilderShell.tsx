import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Code, HelpCircle, Settings, Send, Loader2, Monitor, Tablet, Smartphone, LayoutGrid, Upload, Undo2, Redo2, Copy, Check, ExternalLink, Zap, Sparkles, ImagePlus, BarChart3, Globe, Paperclip, X, MousePointer2, GitCompare, Users, Database, Box, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SiteSpec } from '@/types/site-spec';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { specFromChat } from '@/lib/specFromChat';
import { SiteRenderer } from './SiteRenderer';
import { ThemeEditor } from './ThemeEditor';
import { CodeExport, generateHtmlFromSpec } from './CodeExport';
import { SectionLibrary } from './SectionLibrary';
import { PageManager } from './PageManager';
import { AnalyticsPanel } from './AnalyticsPanel';
import { CustomDomainsPanel } from './CustomDomainsPanel';
import { DiffViewer } from './DiffViewer';
import { BookmarksPanel } from './BookmarksPanel';
import { PWAExport } from './PWAExport';
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
import type { Json } from '@/integrations/supabase/types';

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
  'Car', 'Gauge', 'Fuel', 'Stethoscope', 'Pill', 'Activity', 'HeartPulse', 'Brain', 'Eye', 'Smile',
  'Briefcase', 'Scale', 'FileText', 'Calculator', 'Building', 'Landmark',
  'Palette', 'Camera', 'Pen', 'Brush', 'Film', 'Music', 'Mic',
  'Dumbbell', 'Leaf', 'Apple', 'Bike', 'Timer', 'Dog', 'Cat', 'PawPrint', 'Paw',
  'Shirt', 'Diamond', 'Flower2', 'Gem', 'Home', 'Bed', 'Sofa', 'Bath', 'Trees',
  'Monitor', 'Code', 'Cpu', 'Wifi', 'Database', 'Cloud', 'Globe',
  'Plane', 'MapPin', 'Compass', 'Ship', 'Train', 'GraduationCap', 'BookOpen', 'Pencil',
  'Lock', 'ShieldCheck', 'Fingerprint', 'Phone', 'Mail', 'MessageCircle', 'Send'
]);

// Fallback icons when AI generates invalid ones
const FALLBACK_ICONS = ['Zap', 'Star', 'Shield', 'Heart', 'Award', 'Target', 'Sparkles', 'Rocket'];

function normalizeSpec(spec: any): any {
  // Normalize pages: convert slug to path if needed
  if (spec.pages && Array.isArray(spec.pages)) {
    spec.pages = spec.pages.map((page: any) => {
      if (page.slug && !page.path) {
        // Convert slug to path
        const slug = page.slug;
        page.path = slug === 'home' ? '/' : `/${slug.replace(/-page$/, '')}`;
        delete page.slug;
      }
      
      // Validate and fix icons in sections
      if (page.sections && Array.isArray(page.sections)) {
        let usedIcons = new Set<string>();
        page.sections = page.sections.map((section: any) => {
          if (section.content?.items && Array.isArray(section.content.items)) {
            section.content.items = section.content.items.map((item: any, idx: number) => {
              if (item.icon) {
                // Check if icon is valid
                if (!ALLOWED_ICONS.has(item.icon)) {
                  // Replace with fallback
                  item.icon = FALLBACK_ICONS[idx % FALLBACK_ICONS.length];
                }
                // Check for duplicates and replace if needed
                if (usedIcons.has(item.icon)) {
                  for (const fallback of FALLBACK_ICONS) {
                    if (!usedIcons.has(fallback)) {
                      item.icon = fallback;
                      break;
                    }
                  }
                }
                usedIcons.add(item.icon);
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

function extractJsonFromResponse(text: string): { message: string; siteSpec: SiteSpec | null } {
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
  const state = location.state as LocationState | null;
  const initialIdea = state?.initialIdea || '';
  const projectIdFromState = state?.projectId || null;
  const templateSpecFromState = state?.templateSpec || null;

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
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(projectIdFromState);
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
  const [attachments, setAttachments] = useState<{ file?: File; name: string; url?: string }[]>([]);
  const [visualEditsEnabled, setVisualEditsEnabled] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [pendingSpec, setPendingSpec] = useState<SiteSpec | null>(null);
  const [previousSpecForDiff, setPreviousSpecForDiff] = useState<SiteSpec | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  // Multiplayer presence
  const { otherUsers, updateCursor } = usePresence(projectId);
  
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
    
    const spec = data.spec as { html?: string; messages?: Message[]; siteSpec?: SiteSpec; themeId?: string } | null;
    
    // Check if project has generated content
    const hasContent = spec?.html || spec?.siteSpec || (spec?.messages && spec.messages.length > 0);
    
    if (hasContent) {
      // Load existing content
      if (spec?.html) {
        setGeneratedHtml(spec.html);
      }
      if (spec?.siteSpec) {
        setSiteSpec(spec.siteSpec);
      }
      if (spec?.messages && Array.isArray(spec.messages)) {
        setMessages(spec.messages.map((m, i) => ({
          id: m.id || `loaded-${i}`,
          role: m.role,
          content: m.content,
          htmlCode: m.htmlCode,
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

  const saveProject = async (html: string | null, allMessages: Message[], ideaText: string, currentSiteSpec: SiteSpec | null) => {
    // Use AI-generated site name if available, otherwise fall back to idea text
    const aiGeneratedName = currentSiteSpec?.name;
    const name = projectName !== 'New Project' ? projectName : (aiGeneratedName || ideaText.slice(0, 50));
    
    const projectData = {
      name,
      idea: ideaText,
      spec: { 
        html, 
        siteSpec: currentSiteSpec,
        messages: allMessages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          htmlCode: m.htmlCode,
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
      }
    } else {
      const { data, error } = await supabase
        .from('builder_projects')
        .insert(projectData)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to save project:', error);
      } else if (data) {
        setProjectId(data.id);
        setProjectName(name);
        toast.success('Project saved!');
      }
    }
  };

  // Auto-save when siteSpec changes (from inline editing)
  useEffect(() => {
    if (siteSpec && projectId) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      saveProject(generatedHtml, messages, firstUserMessage?.content || '', siteSpec);
    }
  }, [siteSpec]);

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

  const handleGenerate = async (inputIdea?: string) => {
    const ideaToUse = inputIdea || idea;
    if (!ideaToUse.trim()) return;

    // Convert attachments to base64 for API and upload to storage for actual use
    const currentAttachments = [...attachments];
    const attachmentData: { name: string; url: string; type: string }[] = [];
    const imageDataForApi: { type: 'image_url'; image_url: { url: string } }[] = [];
    const uploadedImageUrls: { name: string; url: string; purpose?: string }[] = [];

    for (const att of currentAttachments) {
      if (att.file && att.file.type.startsWith('image/')) {
        // Convert to base64 for multimodal AI context
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(att.file!);
        });
        
        // Upload to Supabase storage so AI can reference it in the site
        try {
          const fileExt = att.name.split('.').pop() || 'png';
          const fileName = `builder-uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('builder-images')
            .upload(fileName, att.file, { 
              contentType: att.file.type,
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
              attachmentData.push({ name: att.name, url: urlData.publicUrl, type: att.file.type });
            } else {
              attachmentData.push({ name: att.name, url: base64, type: att.file.type });
            }
          } else {
            console.error('Upload error:', uploadError);
            attachmentData.push({ name: att.name, url: base64, type: att.file.type });
          }
        } catch (uploadErr) {
          console.error('Failed to upload image:', uploadErr);
          attachmentData.push({ name: att.name, url: base64, type: att.file.type });
        }
        
        imageDataForApi.push({ type: 'image_url', image_url: { url: base64 } });
      } else if (att.file) {
        attachmentData.push({ name: att.name, url: '', type: att.file.type });
      }
    }

    // If images were uploaded, append instructions to the user's message
    let enhancedIdea = ideaToUse;
    if (uploadedImageUrls.length > 0) {
      const imageInstructions = uploadedImageUrls.map(img => {
        if (img.purpose === 'logo') {
          return `[USER UPLOADED LOGO - USE THIS URL: ${img.url}]`;
        }
        return `[USER UPLOADED IMAGE "${img.name}" - USE THIS URL: ${img.url}]`;
      }).join('\n');
      enhancedIdea = `${ideaToUse}\n\n${imageInstructions}`;
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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, modelMode, projectId }),
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

      updateStep(4, 'active');
      
      const { message: assistantText, siteSpec: parsedSpec } = extractJsonFromResponse(fullResponse);
      
      let newSiteSpec: SiteSpec | null = null;
      if (parsedSpec) {
        newSiteSpec = parsedSpec;
        setSiteSpec(parsedSpec);
        setGeneratedHtml(null); // Use SiteSpec rendering instead of raw HTML
        
        // Set project name from AI-generated site name
        if (parsedSpec.name && projectName === 'New Project') {
          setProjectName(parsedSpec.name);
        }
      } else {
        // Fallback to rule-based generation if AI didn't return valid JSON
        console.warn('AI did not return valid JSON, using fallback generator');
        newSiteSpec = specFromChat(ideaToUse);
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

    setIsGeneratingImage(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          prompt: imagePrompt,
          referenceImage: imageAttachment || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      if (data.imageUrl) {
        // Update hero section image if site exists
        if (siteSpec) {
          const heroSection = siteSpec.pages[currentPageIndex]?.sections.find(s => s.type === 'hero');
          if (heroSection) {
            editor.updateSection(heroSection.id, (section) => ({
              ...section,
              content: {
                ...section.content,
                image: data.imageUrl,
              },
            }));
            toast.success('Image applied to hero section!');
          } else {
            navigator.clipboard.writeText(data.imageUrl);
            toast.success('Image generated! URL copied to clipboard.');
          }
        } else {
          navigator.clipboard.writeText(data.imageUrl);
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

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: { file: File; name: string; url: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= 10 * 1024 * 1024) {
        // Create a preview URL for images
        const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
        newAttachments.push({ file, name: file.name, url });
      } else {
        toast.error(`${file.name} exceeds 10MB limit`);
      }
    }
    
    setAttachments(prev => [...prev, ...newAttachments].slice(0, 5));
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full border-r border-border flex flex-col bg-card/30">
            {/* Header with Studio button and Project Name */}
            <div className="border-b border-border px-3 py-2.5 bg-card/50">
              <div className="flex items-center gap-3">
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
                  className="gap-1.5 text-xs shrink-0"
                  disabled={isGenerating}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {isGenerating ? 'Generating...' : 'Studio'}
                </Button>
                <div className="h-4 w-px bg-border" />
                <button
                  onClick={() => setShowRenameDialog(true)}
                  className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary px-1.5 py-0.5 rounded transition-colors group min-w-0 flex-1"
                  title="Click to rename project"
                >
                  <span className="truncate">{projectName || 'Untitled Project'}</span>
                  <svg className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                      Describe your business idea to get started
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {/* Show attachments if present */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} className="relative">
                              {att.type.startsWith('image/') && att.url ? (
                                <img 
                                  src={att.url} 
                                  alt={att.name} 
                                  className="max-h-32 max-w-full rounded-lg object-cover" 
                                />
                              ) : (
                                <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1 text-xs">
                                  <Paperclip className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Theme Editor - show when site exists */}
            {siteSpec && (
              <div className="border-t border-border p-3">
                <ThemeEditor 
                  theme={siteSpec.theme} 
                  onUpdateTheme={editor.updateTheme} 
                />
              </div>
            )}

            {/* Hidden file input for attachments */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileAttach}
            />

            <div className="border-t border-border p-4">
              {/* Attachments preview */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs">
                      {att.url ? (
                        <img src={att.url} alt={att.name} className="h-6 w-6 rounded object-cover" />
                      ) : (
                        <Paperclip className="h-3 w-3" />
                      )}
                      <span className="truncate max-w-[100px]">{att.name}</span>
                      <button onClick={() => removeAttachment(idx)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant={visualEditsEnabled ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 shrink-0 transition-all duration-300 ${
                    visualEditsEnabled 
                      ? 'bg-primary text-primary-foreground animate-pulse shadow-lg shadow-primary/30' 
                      : ''
                  }`}
                  onClick={() => {
                    setVisualEditsEnabled(!visualEditsEnabled);
                    toast.success(visualEditsEnabled ? 'Visual edits disabled' : 'Visual edits enabled - click elements to edit');
                  }}
                  title={visualEditsEnabled ? 'Disable visual edits' : 'Enable visual edits'}
                >
                  <MousePointer2 className={`h-4 w-4 transition-transform duration-300 ${visualEditsEnabled ? 'scale-110' : ''}`} />
                </Button>
                <Input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your app idea..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  disabled={isGenerating}
                />
                <Button
                  size="icon"
                  onClick={() => handleGenerate()}
                  disabled={!idea.trim() || isGenerating}
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel - Preview + Tabs */}
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-full flex flex-col">
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/30">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${previewMode === 'desktop' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${previewMode === 'tablet' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${previewMode === 'mobile' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          {/* Model is auto-selected by the bot based on prompt complexity */}

          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* SectionLibrary hidden but code preserved */}
            {/* {siteSpec && siteSpec.pages[currentPageIndex] && (
              <SectionLibrary
                onAddSection={editor.addSection}
                onRemoveSection={editor.removeSection}
                onUpdateAnimation={editor.updateSectionAnimation}
                existingSections={siteSpec.pages[currentPageIndex].sections}
              />
            )} */}
            
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
            
            {/* PWA Export - hidden but code preserved */}
            {/* <PWAExport siteSpec={siteSpec} projectName={projectName} /> */}
            
            {/* Knowledge Base */}
            <KnowledgePanel projectId={projectId} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              className="gap-1.5 text-xs"
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              AI Image
            </Button>
            
            {/* Domains button - hidden, moved to publish dropdown */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDomainsDialog(true)}
              className="gap-1.5 text-xs"
              disabled={!projectId}
            >
              <Globe className="h-3.5 w-3.5" />
              Domains
            </Button> */}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSchemaDialog(true)}
              className="gap-1.5 text-xs"
            >
              <Database className="h-3.5 w-3.5" />
              Database
            </Button>
            
            {/* 3D Button - hidden but code preserved */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThreeDDialog(true)}
              className="gap-1.5 text-xs"
            >
              <Box className="h-3.5 w-3.5" />
              3D
            </Button> */}
            
            {/* Security button - hidden, moved to publish dropdown */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityDialog(true)}
              className="gap-1.5 text-xs"
            >
              <Shield className="h-3.5 w-3.5" />
              Security
            </Button> */}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalyticsDialog(true)}
              className="gap-1.5 text-xs"
              disabled={!projectId}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </Button>
            
            {/* Publish dropdown with Domains and Security */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={!siteSpec || isPublishing}
                  className="gap-1.5 bg-primary hover:bg-primary/90"
                >
                  {isPublishing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePublish} disabled={!siteSpec || isPublishing} className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Publish Site</span>
                </DropdownMenuItem>
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
              ) : siteSpec ? (
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
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No site generated yet. Enter an idea to see a live preview.
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
              {imageAttachment ? 'Edit Image with AI' : 'Generate AI Image'}
            </DialogTitle>
            <DialogDescription>
              {imageAttachment 
                ? 'Describe how you want to edit the attached image'
                : 'Describe the image you want to generate, or attach an image to edit it'}
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
                placeholder={imageAttachment ? "e.g., Make it more vibrant, add sunset colors" : "e.g., Modern gym interior with equipment"}
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
                    <Paperclip className="h-4 w-4" />
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
                          setAttachments(prev => [...prev, { name: image.name, url: image.url }].slice(0, 5));
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
    </div>
  );
}
