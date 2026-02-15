import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Paperclip, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Attachment {
  id: string;
  file: File;
  preview?: string;
}

interface CommandMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; preview?: string }[];
}

interface CourseCommandPanelProps {
  course: any;
  courseId: string | null;
  onApplyChanges: (changes: any) => Promise<void>;
}

export function CourseCommandPanel({ course, courseId, onApplyChanges }: CourseCommandPanelProps) {
  const storageKey = courseId ? `course-commands-${courseId}` : null;

  const [commandHistory, setCommandHistory] = useState<CommandMessage[]>(() => {
    if (!storageKey) return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (storageKey && commandHistory.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(commandHistory));
    }
  }, [commandHistory, storageKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      const att: Attachment = { id: crypto.randomUUID(), file };
      if (file.type.startsWith('image/')) {
        att.preview = URL.createObjectURL(file);
      }
      return att;
    });
    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  // Handle paste for images
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        handleFiles(imageFiles);
      }
    };
    textarea.addEventListener('paste', handler);
    return () => textarea.removeEventListener('paste', handler);
  }, [handleFiles]);

  const processCommand = async () => {
    if ((!currentCommand.trim() && attachments.length === 0) || isProcessing) return;

    const command = currentCommand.trim();
    const currentAttachments = attachments.map((a) => ({
      name: a.file.name,
      preview: a.preview,
    }));

    setCurrentCommand('');
    setAttachments([]);
    setIsProcessing(true);
    setCommandHistory((prev) => [
      ...prev,
      { role: 'user', content: command || '(attached files)', attachments: currentAttachments },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("interpret-course-command", {
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
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {msg.attachments.map((att, j) =>
                  att.preview ? (
                    <img
                      key={j}
                      src={att.preview}
                      alt={att.name}
                      className="w-16 h-16 object-cover rounded border border-zinc-700"
                    />
                  ) : (
                    <span key={j} className="text-xs bg-zinc-700 px-2 py-1 rounded">{att.name}</span>
                  )
                )}
              </div>
            )}
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
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att) => (
              <div key={att.id} className="relative group">
                {att.preview ? (
                  <img
                    src={att.preview}
                    alt={att.file.name}
                    className="w-14 h-14 object-cover rounded border border-zinc-700"
                  />
                ) : (
                  <div className="w-14 h-14 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 text-center leading-tight px-1 truncate">
                      {att.file.name.split('.').pop()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-1.5 -right-1.5 bg-zinc-700 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* Paperclip button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-amber-500 p-2 rounded transition shrink-0 mb-1"
            title="Attach files or images"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />

          <textarea
            ref={textareaRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                e.preventDefault();
                processCommand();
              }
            }}
            placeholder="Describe changes to your course..."
            rows={3}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none text-sm"
            disabled={isProcessing}
          />
          <button
            onClick={processCommand}
            disabled={isProcessing || (!currentCommand.trim() && attachments.length === 0)}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
