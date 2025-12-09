import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, User, Loader2, MessageSquare, ArrowLeft, Sparkles, Copy, Check, FileText, Code, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import excellionLogo from "@/assets/excellion-logo.png";
import { AppSpec } from "@/types/app-spec";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const BotExperiment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = (location.state as { initialPrompt?: string; template?: string })?.initialPrompt || "";
  const template = (location.state as { template?: string })?.template || "";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "What app are we building today? Describe your idea and I'll generate a complete blueprint with spec, build prompt, and critical questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [spec, setSpec] = useState<AppSpec | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("spec");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoSent = useRef(false);
  const { toast } = useToast();

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

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Add thinking message
      setMessages(prev => [...prev, { role: "assistant", content: "Analyzing your idea and generating blueprint..." }]);

      const { data, error } = await supabase.functions.invoke('builder-agent', {
        body: {
          idea: messageText.trim(),
          target: 'lovable',
          complexity: 'standard',
        },
      });

      if (error) throw error;

      const appSpec = data as AppSpec;
      setSpec(appSpec);

      // Update the assistant message with summary
      const summaryMessage = `Blueprint ready!\n\n**Summary:**\n${appSpec.summary.map(s => `• ${s}`).join('\n')}\n\n**App Type:** ${appSpec.appType}\n**Stack:** ${appSpec.targetStack}\n\nCheck the panels on the right for full spec, build prompt, and critical questions.`;
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: "assistant", content: summaryMessage };
        return newMessages;
      });

    } catch (error) {
      console.error("Generation error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: "assistant", 
          content: "Failed to generate blueprint. Please try again." 
        };
        return newMessages;
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate blueprint",
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
        content: "What app are we building today? Describe your idea and I'll generate a complete blueprint with spec, build prompt, and critical questions.",
      },
    ]);
    setSpec(null);
  };

  const copyPrompt = async () => {
    if (!spec?.buildPrompt) return;
    await navigator.clipboard.writeText(spec.buildPrompt);
    setCopied(true);
    toast({ title: "Copied!", description: "Build prompt copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="block mt-2">{line.replace(/\*\*/g, '')}</strong>;
      }
      if (line.startsWith('• ')) {
        return <span key={i} className="block ml-2">{line}</span>;
      }
      return <span key={i} className="block">{line}</span>;
    });
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Excellion Secret Builder</title>
      </Helmet>

      {/* Chat Panel */}
      <div className="w-[380px] flex flex-col border-r border-border/50 bg-card/30">
        {/* Header */}
        <header className="h-14 border-b border-border/50 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/web-builder")} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src={excellionLogo} alt="Excellion" className="w-7 h-7" />
            <span className="font-semibold text-sm">Secret Builder</span>
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
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {formatMessageContent(message.content)}
                  </div>
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
        <div className="p-3 border-t border-border/50 bg-background flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your app idea..."
              className="text-sm h-10"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Spec & Prompt */}
      <div className="flex-1 flex flex-col bg-background/50">
        {spec ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="h-14 border-b border-border/50 px-4 flex items-center bg-background/80 backdrop-blur-sm">
                <TabsList className="h-9">
                  <TabsTrigger value="spec" className="text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Spec
                  </TabsTrigger>
                  <TabsTrigger value="prompt" className="text-xs gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    Build Prompt
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="text-xs gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Questions
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="spec" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Summary */}
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Summary
                      </h3>
                      <ul className="space-y-1.5">
                        {spec.summary.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* App Type & Stack */}
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        App Type & Stack
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Type:</span>
                          <span className="text-sm text-foreground">{spec.appType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Stack:</span>
                          <span className="text-sm text-foreground">{spec.targetStack}</span>
                        </div>
                      </div>
                    </section>

                    {/* Pages */}
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Pages / Screens
                      </h3>
                      <div className="space-y-2">
                        {spec.pages.map((page, i) => (
                          <div key={i} className="p-2 rounded-lg bg-muted/50 border border-border/50">
                            <div className="text-sm font-medium text-foreground">{page.name}</div>
                            <div className="text-xs text-muted-foreground">{page.description}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Core Features */}
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Core Features
                      </h3>
                      <ul className="space-y-1.5">
                        {spec.coreFeatures.map((feature, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Data Model */}
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Data Model
                      </h3>
                      <div className="space-y-2">
                        {spec.dataModel.map((entity, i) => (
                          <div key={i} className="p-2 rounded-lg bg-muted/50 border border-border/50">
                            <div className="text-sm font-medium text-foreground">{entity.entity}</div>
                            <div className="text-xs text-muted-foreground">{entity.fields.join(', ')}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Integrations */}
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Integrations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {spec.integrations.map((integration, i) => (
                          <span key={i} className="px-2 py-1 rounded-md text-xs bg-primary/10 text-primary border border-primary/20">
                            {integration}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="prompt" className="flex-1 m-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Copy this prompt into Lovable, v0, or Bolt</span>
                  <Button variant="outline" size="sm" onClick={copyPrompt} className="gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <pre className="p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {spec.buildPrompt}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="questions" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Answer these to refine your spec:
                    </p>
                    <div className="space-y-3">
                      {spec.criticalQuestions.map((question, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex items-start gap-2">
                            <span className="text-primary font-medium text-sm">{i + 1}.</span>
                            <span className="text-sm text-foreground">{question}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground max-w-md px-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-foreground mb-2">Secret Builder</h3>
              <p className="text-sm">
                Describe your app idea and I'll generate a complete blueprint: structured spec, optimized build prompt, and critical questions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotExperiment;
