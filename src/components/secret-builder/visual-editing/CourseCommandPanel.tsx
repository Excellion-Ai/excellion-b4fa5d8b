import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { AI } from '@/services/ai';

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
      const data = await AI.interpretCommand(
        command,
        course.curriculum || course,
        course.design_config || {},
      );

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
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <h3 className="text-amber-500 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Design Commands
        </h3>
      </div>

      {/* Scrollable content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 min-h-0">
        {commandHistory.length === 0 && (
          <div className="space-y-2">
            <p className="text-gray-500 text-sm">Try commands like:</p>
            <div className="space-y-1">
              {[
                'Change the primary color to blue',
                'Switch to timeline layout',
                'Add a testimonials section',
                'Change the hero headline to...',
                'Reorder sections: hero, curriculum, outcomes',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => setCurrentCommand(cmd)}
                  className="block w-full text-left text-sm text-gray-400 hover:text-amber-500 p-2 rounded hover:bg-zinc-900 transition"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        )}

        {commandHistory.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg mb-2 text-sm ${
              msg.role === 'user'
                ? 'bg-amber-500/20 text-amber-100 ml-4'
                : 'bg-zinc-800 text-gray-300 mr-4'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {isProcessing && (
          <div className="bg-zinc-800 text-gray-400 p-3 rounded-lg flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      {/* FIXED PROMPT INPUT - ALWAYS AT BOTTOM */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && processCommand()}
            placeholder="Describe changes to your course..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
            disabled={isProcessing}
          />
          <button
            onClick={processCommand}
            disabled={isProcessing || !currentCommand.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
