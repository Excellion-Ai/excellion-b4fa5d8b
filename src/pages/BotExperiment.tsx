import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Bot, User, Loader2, Settings, MessageSquare, Sparkles, Monitor, Code, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import excellionLogo from "@/assets/excellion-logo.png";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-chat`;

const BotExperiment = () => {
  const location = useLocation();
  const initialPrompt = (location.state as { initialPrompt?: string; template?: string })?.initialPrompt || "";
  const template = (location.state as { template?: string })?.template || "";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm your website builder assistant. Tell me about the website you want to build - what's it for and what do you need it to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoSent = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-send initial prompt if passed from WebBuilderHome
  useEffect(() => {
    if (hasAutoSent.current) return;
    
    const promptToSend = initialPrompt || (template ? `I want to create a ${template} website` : "");
    
    if (promptToSend) {
      hasAutoSent.current = true;
      // Small delay to show the page first
      setTimeout(() => {
        sendMessage(promptToSend);
      }, 500);
    }
  }, [initialPrompt, template]);

  // Extract HTML code from AI response
  const extractCodeFromResponse = (content: string) => {
    const htmlMatch = content.match(/```html\n([\s\S]*?)```/);
    if (htmlMatch) {
      return htmlMatch[1];
    }
    // Also check for generic code blocks that look like HTML
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
      body: JSON.stringify({ 
        messages: userMessages,
        context: { businessName, industry, goals }
      }),
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
          // Check for code in final response
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
        content: "Hey! I'm your website builder assistant. Tell me about the website you want to build - what's it for and what do you need it to do?",
      },
    ]);
    setGeneratedCode("");
    setShowPreview(false);
  };

  const refreshPreview = () => {
    // Force iframe refresh
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && generatedCode) {
      iframe.srcdoc = generatedCode;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Excellion AI Website Builder</title>
      </Helmet>

      {/* Left Sidebar - Configuration */}
      <aside className="w-72 border-r border-border bg-muted/30 flex flex-col flex-shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={excellionLogo} alt="Excellion AI" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-semibold text-foreground">Excellion AI</h1>
              <p className="text-xs text-muted-foreground">Website Builder</p>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Project Config</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-xs text-muted-foreground">
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-xs text-muted-foreground">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. E-commerce, SaaS"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-xs text-muted-foreground">
                    Website Goals
                  </Label>
                  <Textarea
                    id="goals"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="What do you want to achieve with this website?"
                    className="bg-background/50 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={clearChat}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Excellion AI
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col min-w-0 ${showPreview ? 'max-w-[50%]' : ''}`}>
        {/* Chat Header */}
        <header className="border-b border-border p-4 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-medium text-foreground text-sm">Chat with Builder Bot</h2>
              <p className="text-xs text-muted-foreground">
                {businessName ? `Working on: ${businessName}` : "Describe your website project"}
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background/50">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Preview Panel - Shows when code is generated */}
      {showPreview && (
        <aside className="w-1/2 border-l border-border flex flex-col bg-background">
          {/* Preview Header */}
          <header className="border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-medium text-foreground text-sm">Website Preview</h2>
                <p className="text-xs text-muted-foreground">Live preview of your site</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={refreshPreview}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <Code className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Preview Content */}
          <div className="flex-1 bg-white">
            {generatedCode ? (
              <iframe
                id="preview-iframe"
                srcDoc={generatedCode}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Your website preview will appear here</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default BotExperiment;
