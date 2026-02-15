import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Paperclip, X, Pencil, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Attachment {
  id: string;
  file: File;
  preview?: string;
}

type InputMode = 'build' | 'chat';

interface CommandMessage {
  role: 'user' | 'assistant';
  content: string;
  mode?: InputMode;
  attachments?: { name: string; preview?: string }[];
}

interface CourseCommandPanelProps {
  course: any;
  courseId: string | null;
  onApplyChanges: (changes: any) => Promise<void>;
  isVisualEditMode?: boolean;
  onToggleVisualEdit?: () => void;
}

export function CourseCommandPanel({ course, courseId, onApplyChanges, isVisualEditMode = false, onToggleVisualEdit }: CourseCommandPanelProps) {
  const storageKey = courseId ? `course-commands-${courseId}` : null;
  const prevStorageKeyRef = useRef<string | null>(storageKey);

  const [commandHistory, setCommandHistory] = useState<CommandMessage[]>(() => {
    if (!storageKey) return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Re-load history when storageKey changes (e.g. courseId changes after save)
  useEffect(() => {
    if (storageKey && storageKey !== prevStorageKeyRef.current) {
      prevStorageKeyRef.current = storageKey;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setCommandHistory(JSON.parse(stored));
        }
      } catch { /* ignore */ }
    } else if (!storageKey) {
      prevStorageKeyRef.current = null;
    }
  }, [storageKey]);

  // Persist chat history to localStorage on every change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(commandHistory));
    }
  }, [commandHistory, storageKey]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('build');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      { role: 'user', content: command || '(attached files)', mode: inputMode, attachments: currentAttachments },
    ]);

    try {
      if (inputMode === 'chat') {
        // Chat mode — use help-chat for Q&A
        // Build conversation history for context
        const chatHistory = commandHistory
          .filter(m => m.mode === 'chat' || !m.mode)
          .slice(-10)
          .map(m => ({ role: m.role, content: m.content }));
        chatHistory.push({ role: 'user', content: command });

        const courseContext = course ? `
Current course: "${course.title || 'Untitled'}"
Description: ${course.description || 'N/A'}
Modules: ${Array.isArray(course.modules) ? course.modules.length : 0}
Template: ${course.layout_template || course.design_config?.template || 'default'}
Status: ${course.status || 'draft'}
Price: ${course.price_cents ? `$${(course.price_cents / 100).toFixed(2)}` : 'Free'}
` : '';

        const systemPrompt = `You are Excellion AI, the built-in assistant for the Excellion Course Builder platform. You have deep knowledge of the entire platform.

## PLATFORM OVERVIEW
Excellion is an AI-powered course creation platform that lets users:
- Describe a course idea in natural language and generate a complete course with AI
- Choose from 4 visual templates (Creator, Technical, Academic, Visual)
- Edit courses visually with point-and-click or AI commands
- Preview courses across 4 page views (Landing, Curriculum, Lesson, Dashboard)
- Publish courses to public URLs and sell them with Stripe integration
- Track student enrollments, progress, and analytics

## FEATURES YOU SHOULD KNOW ABOUT
- **AI Course Generation**: Users type a course idea → AI generates modules, lessons, content
- **4 Templates**: Creator (amber, coaching), Technical (indigo, dev-focused), Academic (navy, formal), Visual (rose, creative)
- **Visual Edit Mode**: Click the pencil icon to hover and edit any section directly
- **Build Mode**: Type commands like "add a module about X" or "change the hero headline"
- **Chat Mode** (current): Ask questions about the platform, course strategy, or get help
- **Landing Page**: Hero, outcomes, curriculum overview, FAQ, CTA sections — all customizable
- **Curriculum Page**: Full module/lesson list with duration and content type badges
- **Lesson Preview**: Sidebar navigation + markdown content rendering
- **Student Dashboard**: Progress tracking, next lesson, completion stats
- **Publishing**: Courses get a public URL at /course/:slug; custom domains supported
- **Payments**: Stripe checkout for paid courses; free courses auto-enroll
- **Analytics**: Course views, enrollments, lesson completion rates, revenue tracking
- **Certificates**: Auto-generated on course completion
- **Reviews**: Students can rate and review courses
- **Quizzes**: Builders can add quiz lessons with scoring
- **Resources**: Attach downloadable files to lessons
- **SEO**: Custom meta titles, descriptions, and social images per course

## COURSE STRUCTURE
Each course has: Title, Description, Modules (each with Lessons). Lessons have markdown content, duration, content type (text/video/quiz), and preview flags.

## DESIGN SYSTEM
Users can customize: primary color, font family, spacing, border radius, and section order via the Design Editor or AI commands.

## CURRENT USER CONTEXT
${courseContext}

## INSTRUCTIONS
- Answer questions about Excellion features, course strategy, content tips, and platform usage
- Be specific to THIS platform — don't reference Teachable, Kajabi, etc. unless comparing
- If asked about a feature that exists, explain how to use it in Excellion
- If asked about a feature that doesn't exist yet, say so honestly
- Be concise, friendly, and actionable
- Use markdown formatting for clarity`;

        const { data, error } = await supabase.functions.invoke("help-chat", {
          body: { messages: chatHistory, systemPrompt },
        });
        if (error) throw error;
        const reply = data?.response || data?.reply || data?.content || data?.message || "I'm not sure how to answer that. Try rephrasing your question.";
        setCommandHistory((prev) => [
          ...prev,
          { role: 'assistant', content: reply, mode: 'chat' },
        ]);
      } else {
        // Build mode — use interpret-course-command
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
            { role: 'assistant', content: data.result.preview_message, mode: 'build' },
          ]);
        } else {
          setCommandHistory((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: data?.result?.error_message || "I didn't understand that. Try being more specific about what you want to change.",
              mode: 'build',
            },
          ]);
        }
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
                  onClick={() => { setCurrentCommand(cmd); setInputMode('build'); }}
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
                ? msg.mode === 'chat'
                  ? 'bg-blue-500/20 text-blue-100 ml-4'
                  : 'bg-amber-500/20 text-amber-100 ml-4'
                : 'bg-zinc-800 text-gray-300 mr-4'
            }`}
          >
            {msg.role === 'user' && (
              <span className="text-[10px] uppercase tracking-wider opacity-60 block mb-1">
                {msg.mode === 'chat' ? '💬 Question' : '🔧 Build'}
              </span>
            )}
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
          <div className="flex flex-col gap-1 shrink-0 mb-1">
            {/* Visual edit toggle */}
            <button
              type="button"
              onClick={onToggleVisualEdit}
              className={`p-2 rounded transition ${isVisualEditMode ? 'text-amber-500 bg-amber-500/10' : 'text-gray-400 hover:text-amber-500'}`}
              title={isVisualEditMode ? 'Visual edit mode ON' : 'Visual edit mode OFF'}
            >
              <Pencil className="w-5 h-5" />
            </button>
            {/* Paperclip button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-amber-500 p-2 rounded transition"
              title="Attach files or images"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
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
            placeholder={inputMode === 'chat' ? 'Ask a question about your course...' : 'Describe changes to your course...'}
            rows={3}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none text-sm"
            disabled={isProcessing}
          />

          <div className="flex flex-col gap-1 shrink-0 mb-1">
            {/* Chat mode toggle */}
            <button
              type="button"
              onClick={() => setInputMode(inputMode === 'chat' ? 'build' : 'chat')}
              className={`p-2 rounded transition ${inputMode === 'chat' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-blue-400'}`}
              title={inputMode === 'chat' ? 'Chat mode (click to switch to build)' : 'Switch to chat mode'}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            {/* Send button */}
            <button
              onClick={processCommand}
              disabled={isProcessing || (!currentCommand.trim() && attachments.length === 0)}
              className="bg-amber-500 hover:bg-amber-600 text-black p-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mode indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${inputMode === 'chat' ? 'bg-blue-400' : 'bg-amber-500'}`} />
          <span className="text-[11px] text-gray-500">
            {inputMode === 'chat' ? 'Chat mode — ask questions' : 'Build mode — apply changes'}
          </span>
        </div>
      </div>
    </div>
  );
}
