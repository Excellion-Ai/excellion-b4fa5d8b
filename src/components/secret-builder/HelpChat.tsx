import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Sparkles, History, Plus, GripVertical, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

const SYSTEM_PROMPT = `You are Excellion's helpful assistant for the Secret Bot Builder. You help users understand how to:
- Generate websites using the AI builder
- Edit and customize their generated sites
- Use features like theme editor, logo upload, attachments
- Manage pages and sections
- Publish and export their sites
- Use visual edits mode
- Work with the section library

Be concise, friendly, and helpful. Keep responses under 150 words unless more detail is needed. Focus on practical guidance.`;

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm here to help you with the Excellion Builder. Ask me anything about generating sites, editing, or using features!"
};

const STORAGE_KEY = 'excellion-chat-history';

export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) }));
      }
    } catch {}
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Center the chat on open
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && !showHistory) {
      inputRef.current.focus();
    }
  }, [isOpen, showHistory]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    
    const maxX = windowWidth / 2 - 100;
    const maxY = windowHeight / 2 - 100;
    
    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const generateTitle = (msgs: Message[]): string => {
    const firstUserMsg = msgs.find(m => m.role === 'user');
    if (firstUserMsg) {
      const title = firstUserMsg.content.slice(0, 30);
      return title.length < firstUserMsg.content.length ? title + '...' : title;
    }
    return 'New Chat';
  };

  const saveCurrentSession = () => {
    if (messages.length <= 1) return; // Don't save if only welcome message
    
    const session: ChatSession = {
      id: currentSessionId || Date.now().toString(),
      title: generateTitle(messages),
      messages: messages.filter(m => m.id !== 'welcome'),
      createdAt: new Date()
    };

    setSessions(prev => {
      const existing = prev.findIndex(s => s.id === session.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = session;
        return updated;
      }
      return [session, ...prev].slice(0, 20); // Keep max 20 sessions
    });
    setCurrentSessionId(session.id);
  };

  const startNewChat = () => {
    saveCurrentSession();
    setMessages([WELCOME_MESSAGE]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    saveCurrentSession();
    setMessages([WELCOME_MESSAGE, ...session.messages]);
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setMessages([WELCOME_MESSAGE]);
      setCurrentSessionId(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('help-chat', {
        body: {
          messages: [
            ...conversationHistory,
            { role: 'user', content: userMessage.content }
          ],
          systemPrompt: SYSTEM_PROMPT
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || "I'm sorry, I couldn't process that. Please try again."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Help chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    saveCurrentSession();
    setIsOpen(false);
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.95, filter: prefersReducedMotion ? 'none' : 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const pulseAnimation = prefersReducedMotion ? undefined : {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
  };

  const sheenVariants = {
    initial: { x: '-100%' },
    hover: { x: '100%', transition: { duration: 0.5, ease: 'easeInOut' as const } }
  };

  return (
    <>
      <motion.div 
        className="bg-card border border-border rounded-lg overflow-hidden relative group"
        whileHover={prefersReducedMotion ? {} : { scale: 1.02, boxShadow: '0 0 20px hsl(var(--primary) / 0.15)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center gap-2 transition-colors relative overflow-hidden"
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          <motion.div animate={isOpen ? {} : pulseAnimation}>
            <MessageCircle className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">Chat</span>
          
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
            variants={sheenVariants}
            initial="initial"
            whileHover="hover"
          />
        </motion.button>
      </motion.div>

      {isOpen && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[9990]"
                onClick={handleClose}
              />
              
              {/* Draggable Chat Window */}
              <motion.div
                ref={dragRef}
                initial={{ opacity: 0, scale: 0.9, filter: prefersReducedMotion ? 'none' : 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: prefersReducedMotion ? 'none' : 'blur(8px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[9999] flex flex-col"
                style={{ 
                  width: '380px',
                  maxHeight: '70vh',
                  left: `calc(50% - 190px + ${position.x}px)`,
                  top: `calc(50% - 200px + ${position.y}px)`,
                  boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--border))',
                  cursor: isDragging ? 'grabbing' : 'auto'
                }}
              >
              {/* Animated gradient background orbs */}
              {!prefersReducedMotion && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
                    animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"
                    animate={{ x: [0, -20, 0], y: [0, -30, 0], scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              )}

              {/* Header with drag handle */}
              <motion.div 
                className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 backdrop-blur-sm relative select-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onMouseDown={handleMouseDown}
                style={{ cursor: 'grab' }}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <motion.div
                    animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <motion.span 
                    className="text-sm font-semibold"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    Ask Excellion
                  </motion.span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowHistory(!showHistory)}
                    title="Chat History"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={startNewChat}
                    title="New Chat"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <motion.div whileHover={prefersReducedMotion ? {} : { rotate: 90 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleClose}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* History Panel */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 top-[52px] bg-card z-10 flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold">Chat History</h3>
                      <p className="text-xs text-muted-foreground">
                        {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ScrollArea className="flex-1">
                      {sessions.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No previous chats yet
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {sessions.map(session => (
                            <motion.button
                              key={session.id}
                              onClick={() => loadSession(session)}
                              className={`w-full p-3 rounded-lg text-left transition-colors group ${
                                currentSessionId === session.id 
                                  ? 'bg-primary/10 border border-primary/20' 
                                  : 'hover:bg-muted'
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{session.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.messages.length} message{session.messages.length !== 1 ? 's' : ''} • {
                                      new Date(session.createdAt).toLocaleDateString()
                                    }
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  onClick={(e) => deleteSession(session.id, e)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowHistory(false)}
                      >
                        Back to Chat
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area */}
              <div className="overflow-y-auto max-h-[300px]" ref={scrollRef}>
                <motion.div 
                  className="p-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        variants={messageVariants}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                    <AnimatePresence>
                      {isLoading && (
                        <motion.div 
                          className="flex justify-start"
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                            <span className="text-xs text-muted-foreground">Thinking...</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask a question..."
                    className="flex-1 h-10 text-sm rounded-lg"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-lg"
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
