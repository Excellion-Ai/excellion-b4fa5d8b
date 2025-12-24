import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm here to help you with the Excellion Builder. Ask me anything about generating sites, editing, or using features!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
    <div className="relative">
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
          <motion.div
            animate={isOpen ? {} : pulseAnimation}
          >
            <MessageCircle className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">Chat</span>
          
          {/* Sheen sweep on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
            variants={sheenVariants}
            initial="initial"
            whileHover="hover"
          />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: prefersReducedMotion ? 'none' : 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: prefersReducedMotion ? 'none' : 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
            style={{ 
              boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--border))' 
            }}
          >
            {/* Animated gradient background orbs */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
                  animate={{ 
                    x: [0, 30, 0], 
                    y: [0, 20, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"
                  animate={{ 
                    x: [0, -20, 0], 
                    y: [0, -30, 0],
                    scale: [1.1, 1, 1.1]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            )}

            <motion.div 
              className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 backdrop-blur-sm relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={prefersReducedMotion ? {} : { 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <motion.span 
                  className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  Ask Excellion
                </motion.span>
              </div>
              <motion.div whileHover={prefersReducedMotion ? {} : { rotate: 90 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            <ScrollArea className="max-h-48 relative" ref={scrollRef}>
              <motion.div 
                className="p-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm relative overflow-hidden ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                        whileHover={prefersReducedMotion ? {} : { 
                          scale: 1.02,
                          boxShadow: message.role === 'user' 
                            ? '0 4px 12px hsl(var(--primary) / 0.3)' 
                            : '0 4px 12px hsl(var(--muted) / 0.5)'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        {message.content}
                      </motion.div>
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
                        <div className="bg-muted px-3 py-2 rounded-xl flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                          <motion.div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                                animate={{ 
                                  y: prefersReducedMotion ? 0 : [-2, 2, -2],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ 
                                  duration: 0.6, 
                                  repeat: Infinity, 
                                  delay: i * 0.15,
                                  ease: 'easeInOut'
                                }}
                              />
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </ScrollArea>

            <motion.div 
              className="p-3 border-t border-border relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center gap-2 relative"
                animate={isFocused && !prefersReducedMotion ? {
                  boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 0 3px hsl(var(--primary) / 0.1)', '0 0 0 0 hsl(var(--primary) / 0)']
                } : {}}
                transition={{ duration: 1.5, repeat: isFocused ? Infinity : 0 }}
                style={{ borderRadius: '0.5rem' }}
              >
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask a question..."
                    className={`flex-1 h-9 text-sm transition-all duration-300 ${
                      isFocused ? 'ring-2 ring-primary/20 border-primary/50' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {/* Animated glow ring on focus */}
                  <AnimatePresence>
                    {isFocused && !prefersReducedMotion && (
                      <motion.div
                        className="absolute inset-0 rounded-md pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0.3, 0.6, 0.3],
                          boxShadow: [
                            '0 0 0 2px hsl(var(--primary) / 0.1)',
                            '0 0 0 4px hsl(var(--primary) / 0.05)',
                            '0 0 0 2px hsl(var(--primary) / 0.1)'
                          ]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0 relative overflow-hidden group"
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                  >
                    <motion.div
                      animate={input.trim() && !prefersReducedMotion ? { 
                        x: [0, 2, 0],
                        y: [0, -2, 0]
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                    {/* Ripple effect on click */}
                    <motion.div
                      className="absolute inset-0 bg-primary-foreground/20 rounded-md"
                      initial={{ scale: 0, opacity: 0.5 }}
                      whileTap={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
