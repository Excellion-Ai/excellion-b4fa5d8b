import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommandMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CourseCommandPanelProps {
  course: any;
  courseId: string | null;
  onApplyChanges: (changes: any) => Promise<void>;
}

export function CourseCommandPanel({ course, courseId, onApplyChanges }: CourseCommandPanelProps) {
  const [commandHistory, setCommandHistory] = useState<CommandMessage[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const processCommand = async () => {
    if (!currentCommand.trim() || isProcessing) return;

    const command = currentCommand.trim();
    setCurrentCommand('');
    setIsProcessing(true);
    setCommandHistory((prev) => [...prev, { role: 'user', content: command }]);

    try {
      const { data, error } = await supabase.functions.invoke('interpret-course-command', {
        body: {
          command,
          current_course: course.curriculum || course,
          current_design: course.design_config || {},
        },
      });

      if (error) throw error;

      if (data?.success && data.result?.understood) {
        await onApplyChanges(data.result.changes);
        setCommandHistory((prev) => [
          ...prev,
          { role: 'assistant', content: data.result.preview_message },
        ]);
      } else {
        setCommandHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data?.result?.error_message || "I didn't understand that. Try being more specific about what you want to change.",
          },
        ]);
      }
    } catch (err) {
      console.error('Command error:', err);
      setCommandHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    }

    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Command History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {commandHistory.length === 0 && (
          <div className="text-muted-foreground text-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Design Commands</span>
            </div>
            <p className="text-xs">Try commands like:</p>
            <ul className="space-y-1.5 text-xs">
              <li className="px-2 py-1.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition"
                onClick={() => setCurrentCommand('Change the primary color to blue')}>
                "Change the primary color to blue"
              </li>
              <li className="px-2 py-1.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition"
                onClick={() => setCurrentCommand('Switch to timeline layout')}>
                "Switch to timeline layout"
              </li>
              <li className="px-2 py-1.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition"
                onClick={() => setCurrentCommand('Add a testimonials section')}>
                "Add a testimonials section"
              </li>
              <li className="px-2 py-1.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition"
                onClick={() => setCurrentCommand('Change the hero headline to...')}>
                "Change the hero headline to..."
              </li>
              <li className="px-2 py-1.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition"
                onClick={() => setCurrentCommand('Reorder sections: hero, curriculum, outcomes')}>
                "Reorder sections: hero, curriculum, outcomes"
              </li>
            </ul>
          </div>
        )}
        {commandHistory.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg text-sm ${
              msg.role === 'user'
                ? 'bg-primary/20 text-primary-foreground ml-8'
                : 'bg-muted text-foreground mr-8'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isProcessing && (
          <div className="bg-muted text-muted-foreground p-3 rounded-lg mr-8 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-sm">Processing your request...</span>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && processCommand()}
            placeholder="Describe changes to your course..."
            className="flex-1 bg-card/50 border-border"
            disabled={isProcessing}
          />
          <Button
            onClick={processCommand}
            disabled={isProcessing || !currentCommand.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 shrink-0"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
