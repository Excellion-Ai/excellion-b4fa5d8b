import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2,
  Link2,
  ChevronDown,
  ChevronUp,
  Target,
  Briefcase,
  Palette,
  FileText,
  Globe
} from 'lucide-react';
import { Message, BuilderState, SmartDefaults } from '@/hooks/useBuilderState';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BuilderChatProps {
  messages: Message[];
  state: BuilderState;
  isLoading: boolean;
  inputs: SmartDefaults;
  onInputsChange: (inputs: Partial<SmartDefaults>) => void;
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string) => void;
}

const QUICK_ACTIONS = [
  'Make it more modern',
  'Improve SEO',
  'Add booking section',
  'Add pricing section',
  'Change colors',
  'Tighten copy',
];

const BUSINESS_TYPES = [
  'Restaurant',
  'Gym / Fitness',
  'Salon / Spa',
  'Consultant',
  'E-commerce',
  'Agency',
  'Portfolio',
  'Other',
];

const GOALS = [
  { value: 'leads', label: 'Generate Leads' },
  { value: 'bookings', label: 'Get Bookings' },
  { value: 'ecommerce', label: 'Sell Products' },
  { value: 'info', label: 'Share Information' },
] as const;

const VIBES = [
  { value: 'modern', label: 'Modern' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'playful', label: 'Playful' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
] as const;

function formatMessageContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <strong key={i} className="block mt-3 mb-1 text-foreground font-semibold">{line.replace(/\*\*/g, '')}</strong>;
    }
    if (line.startsWith('• ')) {
      return <span key={i} className="block ml-3 text-muted-foreground leading-relaxed">{line}</span>;
    }
    if (line.trim() === '') {
      return <span key={i} className="block h-2" />;
    }
    return <span key={i} className="block leading-relaxed">{line}</span>;
  });
}

export function BuilderChat({
  messages,
  state,
  isLoading,
  inputs,
  onInputsChange,
  onSendMessage,
  onQuickAction,
}: BuilderChatProps) {
  const [input, setInput] = useState('');
  const [setupOpen, setSetupOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasBuilt = state === 'preview_ready' || state === 'editing' || state === 'exporting';

  // Collapse setup after first build
  useEffect(() => {
    if (hasBuilt) {
      setSetupOpen(false);
    }
  }, [hasBuilt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    let fullMessage = input.trim();
    if (inputs.businessType && !hasBuilt) {
      fullMessage = `[Business type: ${inputs.businessType}] ${fullMessage}`;
    }
    if (inputs.referenceUrl?.trim() && !hasBuilt) {
      fullMessage = `${fullMessage}\n\nReference: ${inputs.referenceUrl.trim()}`;
    }
    
    onSendMessage(fullMessage);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canUseQuickActions = state === 'preview_ready' || state === 'editing';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Build Brief Card - shows when project has content */}
      {hasBuilt && (
        <div className="px-5 pt-5 pb-3">
          <div className="p-4 rounded-xl border border-border/50 bg-card/50">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Build Brief</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {inputs.businessType && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{inputs.businessType}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-3.5 h-3.5" />
                <span className="capitalize">{inputs.goal}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Palette className="w-3.5 h-3.5" />
                <span className="capitalize">{inputs.vibe}</span>
              </div>
              {inputs.referenceUrl && (
                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate text-xs">{inputs.referenceUrl}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Setup Accordion - shows before build */}
      {!hasBuilt && (
        <div className="px-5 pt-5 pb-3">
          <Collapsible open={setupOpen} onOpenChange={setSetupOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Project Setup</span>
              </div>
              {setupOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 p-4 rounded-xl border border-border/50 bg-card/30 space-y-4">
                {/* Business Type */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Business Type</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-between h-10 text-sm">
                        {inputs.businessType || 'Select type...'}
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      {BUSINESS_TYPES.map((type) => (
                        <DropdownMenuItem 
                          key={type} 
                          onClick={() => onInputsChange({ businessType: type })}
                          className="cursor-pointer"
                        >
                          {type}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Goal */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => onInputsChange({ goal: goal.value })}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                          inputs.goal === goal.value 
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibe */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Style/Vibe</label>
                  <div className="flex flex-wrap gap-2">
                    {VIBES.map((vibe) => (
                      <button
                        key={vibe.value}
                        onClick={() => onInputsChange({ vibe: vibe.value })}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          inputs.vibe === vibe.value 
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {vibe.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA Text */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Primary CTA</label>
                  <Input
                    value={inputs.ctaText}
                    onChange={(e) => onInputsChange({ ctaText: e.target.value })}
                    placeholder="e.g., Get Started, Book Now"
                    className="h-10 text-sm"
                  />
                </div>

                {/* Reference URL */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    Reference URL <span className="text-muted-foreground/60 font-normal">(optional)</span>
                  </label>
                  <Input
                    value={inputs.referenceUrl || ''}
                    onChange={(e) => onInputsChange({ referenceUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-5" scrollbarVariant="gold" ref={scrollRef}>
        <div className="py-4 space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/50"
                )}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {formatMessageContent(message.content)}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {canUseQuickActions && (
        <div className="px-5 py-3 border-t border-border/40">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => onQuickAction(action)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-5 border-t border-border/40">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={state === 'idle' ? "Describe your website idea..." : "Ask for changes or refinements..."}
            className="text-sm h-12 rounded-xl"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            size="icon" 
            className="h-12 w-12 flex-shrink-0 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
          {hasBuilt ? 'Press Enter to update' : 'Press Enter to build'}
        </p>
      </div>
    </div>
  );
}
