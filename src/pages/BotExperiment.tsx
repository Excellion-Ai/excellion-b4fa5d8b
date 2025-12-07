import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Send, Bot, User, Loader2, MessageSquare, Monitor, Code, RefreshCw, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import excellionLogo from "@/assets/excellion-logo.png";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-chat`;

const BotExperiment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = (location.state as { initialPrompt?: string; template?: string })?.initialPrompt || "";
  const template = (location.state as { template?: string })?.template || "";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "What are we building today? Give me the idea and I'll draft a v1 plan.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoSent = useRef(false);
  const hasShownAuthPrompt = useRef(false);
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setShowAuthModal(false);
        toast({
          title: "Signed in!",
          description: "You can now save and export your website.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/bot-experiment`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Could not sign in",
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (hasAutoSent.current) return;
    
    const promptToSend = initialPrompt || (template ? `Build me a ${template} website` : "");
    
    if (promptToSend) {
      hasAutoSent.current = true;
      setTimeout(() => {
        sendMessage(promptToSend);
      }, 500);
    }
  }, [initialPrompt, template]);

  const extractCodeFromResponse = (content: string) => {
    const htmlMatch = content.match(/```html\n?([\s\S]*?)```/);
    if (htmlMatch) {
      return htmlMatch[1];
    }
    const codeMatch = content.match(/```\n?(<!DOCTYPE|<html|<div|<body)([\s\S]*?)```/i);
    if (codeMatch) {
      return codeMatch[1] + codeMatch[2];
    }
    return null;
  };

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          const code = extractCodeFromResponse(assistantContent);
          if (code) {
            setGeneratedCode(code);
            setShowPreview(true);
          }
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
      
      // Show auth modal after first user message if not logged in
      const userMessageCount = updatedMessages.filter(m => m.role === 'user').length;
      if (userMessageCount === 1 && !user && !hasShownAuthPrompt.current) {
        hasShownAuthPrompt.current = true;
        setTimeout(() => setShowAuthModal(true), 2000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "What are we building today? Give me the idea and I'll draft a v1 plan.",
      },
    ]);
    setGeneratedCode("");
    setShowPreview(false);
  };

  // Format message content - hide ALL code blocks from chat
  const formatMessageContent = (content: string) => {
    // Remove any code blocks (html, jsx, json, or unmarked)
    let cleanContent = content
      .replace(/```(?:html|jsx|json|javascript|typescript|css)?\n?[\s\S]*?```/g, "")
      .replace(/<[^>]+>/g, "") // Remove any stray HTML tags
      .trim();
    
    // If the message was mostly code, show a friendly message
    if (!cleanContent || cleanContent.length < 10) {
      return "Your website draft is ready! Check the preview on the right →";
    }
    
    return cleanContent;
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Excellion AI Website Builder</title>
      </Helmet>

      {/* Chat Panel */}
      <div className={`flex flex-col ${showPreview ? "w-[400px]" : "flex-1 max-w-3xl mx-auto"} border-r border-border transition-all duration-300`}>
        {/* Header */}
        <header className="h-14 border-b border-border px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/web-builder")} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src={excellionLogo} alt="Excellion" className="w-7 h-7" />
            <span className="font-semibold text-sm">Excellion AI</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            New
          </Button>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {formatMessageContent(message.content)}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-border bg-background flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your website..."
              className="text-sm h-10"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="flex-1 flex flex-col bg-muted/30">
          {/* Preview Header */}
          <header className="h-14 border-b border-border px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("preview")}
                className="h-7 text-xs"
              >
                <Monitor className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button
                variant={viewMode === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("code")}
                className="h-7 text-xs"
              >
                <Code className="w-3 h-3 mr-1" />
                Code
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
                if (iframe) iframe.srcdoc = generatedCode;
              }}>
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </header>

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden">
            {viewMode === "preview" ? (
              <iframe
                id="preview-iframe"
                srcDoc={generatedCode}
                className="w-full h-full border-0 bg-white"
                title="Website Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <ScrollArea className="h-full">
                <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              </ScrollArea>
            )}
          </div>
        </div>
      )}

      {/* Empty state when no preview */}
      {!showPreview && (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/20">
          <div className="text-center text-muted-foreground">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Your website preview will appear here</p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Save your progress</DialogTitle>
            <DialogDescription>
              Sign in to save your website, export code, and continue editing later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full h-11 gap-3"
              onClick={() => handleOAuthLogin('google')}
              disabled={isAuthLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 gap-3"
              onClick={() => handleOAuthLogin('github')}
              disabled={isAuthLoading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            You can also continue without signing in
          </p>
          <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(false)} className="mt-2">
            Maybe later
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BotExperiment;
