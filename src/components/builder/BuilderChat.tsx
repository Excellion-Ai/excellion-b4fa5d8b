import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2,
  Link2,
  ChevronDown
} from 'lucide-react';
import { Message, BuilderState } from '@/hooks/useBuilderState';
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
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string) => void;
}

const QUICK_ACTIONS = [
  'Make it more modern',
  'Improve SEO',
  'Add booking section',
  'Add pricing section',
  'Change colors',
  'Add testimonials',
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

function formatMessageContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <strong key={i} className="block mt-2 text-foreground">{line.replace(/\*\*/g, '')}</strong>;
    }
    if (line.startsWith('• ')) {
      return <span key={i} className="block ml-2 text-muted-foreground">{line}</span>;
    }
    return <span key={i} className="block">{line}</span>;
  });
}

export function BuilderChat({
  messages,
  state,
  isLoading,
  onSendMessage,
  onQuickAction,
}: BuilderChatProps) {
  const [input, setInput] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    let fullMessage = input.trim();
    if (businessType) {
      fullMessage = `[Business type: ${businessType}] ${fullMessage}`;
    }
    if (referenceUrl.trim()) {
      fullMessage = `${fullMessage}\n\nReference: ${referenceUrl.trim()}`;
    }
    
    onSendMessage(fullMessage);
    setInput('');
    setReferenceUrl('');
    setShowUrlInput(false);
    setBusinessType(null);
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
      {/* Status Bar */}
      <div className="h-12 border-b border-border/50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            state === 'idle' && "bg-muted-foreground",
            (state === 'generating_plan' || state === 'building') && "bg-primary animate-pulse",
            state === 'preview_ready' && "bg-green-500",
            state === 'editing' && "bg-amber-500",
            state === 'exporting' && "bg-blue-500"
          )} />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {state.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
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
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {canUseQuickActions && (
        <div className="px-4 py-2 border-t border-border/50">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => onQuickAction(action)}
                className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {/* Optional inputs row */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                {businessType || 'Business type'}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {BUSINESS_TYPES.map((type) => (
                <DropdownMenuItem 
                  key={type} 
                  onClick={() => setBusinessType(type === businessType ? null : type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant={showUrlInput ? "secondary" : "outline"} 
            size="sm" 
            className="h-8 text-xs gap-1.5"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            <Link2 className="w-3 h-3" />
            Reference URL
          </Button>
        </div>

        {/* Reference URL input */}
        {showUrlInput && (
          <Input
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://example.com (optional)"
            className="h-9 text-sm"
          />
        )}

        {/* Main input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={state === 'idle' ? "Describe your website idea..." : "Ask for changes or refinements..."}
            className="text-sm h-11"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            size="icon" 
            className="h-11 w-11 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
