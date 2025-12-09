import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, User, Loader2, MessageSquare, ArrowLeft, Sparkles, Copy, Check, FileText, Code, Lightbulb, Play, Monitor, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import excellionLogo from "@/assets/excellion-logo.png";
import { AppSpec, GeneratedCode, CodeGenerationStatus } from "@/types/app-spec";
import { SitePreview } from "@/components/secret-builder/SitePreview";
import { CodeExport } from "@/components/secret-builder/CodeExport";

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
      content: "What are we building today? Describe your idea and I'll generate a blueprint, then build you a live preview.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [spec, setSpec] = useState<AppSpec | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  
  // Code generation state
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [codeStatus, setCodeStatus] = useState<CodeGenerationStatus>('idle');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [healAttempts, setHealAttempts] = useState(0);
  const MAX_HEAL_ATTEMPTS = 2;
  
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

  const generateCode = async (appSpec: AppSpec) => {
    setCodeStatus('generating');
    setCodeError(null);
    setActiveTab('preview');

    try {
      const { data, error } = await supabase.functions.invoke('code-agent', {
        body: {
          spec: appSpec,
          buildPrompt: appSpec.buildPrompt,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedCode(data as GeneratedCode);
      setCodeStatus('success');
      setHealAttempts(0);
      
      // Update chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Site generated! Check the Preview tab to see it live, or the Code tab to copy the React component."
      }]);

    } catch (error) {
      console.error("Code generation error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to generate code";
      
      // Try self-healing if we have attempts left
      if (healAttempts < MAX_HEAL_ATTEMPTS && generatedCode?.reactCode) {
        setCodeStatus('healing');
        setHealAttempts(prev => prev + 1);
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Code had an issue, attempting to fix... (attempt ${healAttempts + 1}/${MAX_HEAL_ATTEMPTS})`
        }]);
        
        await healCode(errorMsg);
      } else {
        setCodeError(errorMsg);
        setCodeStatus('error');
        toast({
          title: "Code Generation Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  };

  const healCode = async (errorMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('code-agent', {
        body: {
          spec,
          buildPrompt: spec?.buildPrompt,
          previousCode: generatedCode?.reactCode,
          error: errorMessage,
        },
      });

      if (error) throw error;

      setGeneratedCode(data as GeneratedCode);
      setCodeStatus('success');
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Fixed! The preview should now work correctly."
      }]);

    } catch (error) {
      console.error("Code healing error:", error);
      setCodeError(error instanceof Error ? error.message : "Failed to fix code");
      setCodeStatus('error');
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
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

      const summaryMessage = `Blueprint ready!\n\n**Summary:**\n${appSpec.summary.map(s => `• ${s}`).join('\n')}\n\n**App Type:** ${appSpec.appType}\n**Stack:** ${appSpec.targetStack}\n\nGenerating live preview...`;
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: "assistant", content: summaryMessage };
        return newMessages;
      });

      // Auto-generate code after spec
      await generateCode(appSpec);

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
        content: "What are we building today? Describe your idea and I'll generate a blueprint, then build you a live preview.",
      },
    ]);
    setSpec(null);
    setGeneratedCode(null);
    setCodeStatus('idle');
    setCodeError(null);
    setHealAttempts(0);
  };

  const copyPrompt = async () => {
    if (!spec?.buildPrompt) return;
    await navigator.clipboard.writeText(spec.buildPrompt);
    setCopied(true);
    toast({ title: "Copied!", description: "Build prompt copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const rebuildSite = () => {
    if (spec) {
      setHealAttempts(0);
      generateCode(spec);
    }
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

      {/* Right Panel - Preview, Spec, Code */}
      <div className="flex-1 flex flex-col bg-background/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
            <TabsList className="h-9">
              <TabsTrigger value="preview" className="text-xs gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="spec" className="text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Spec
              </TabsTrigger>
              <TabsTrigger value="prompt" className="text-xs gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Build Prompt
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Code
              </TabsTrigger>
              <TabsTrigger value="questions" className="text-xs gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="debug" className="text-xs gap-1.5">
                <Bug className="w-3.5 h-3.5" />
                Debug
              </TabsTrigger>
            </TabsList>
            
            {spec && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={rebuildSite}
                disabled={codeStatus === 'generating' || codeStatus === 'healing'}
                className="gap-1.5"
              >
                {codeStatus === 'generating' || codeStatus === 'healing' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {codeStatus === 'healing' ? 'Fixing...' : 'Rebuild'}
              </Button>
            )}
          </div>

          <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
            <SitePreview 
              siteDefinition={generatedCode?.siteDefinition || null}
              isLoading={codeStatus === 'generating' || codeStatus === 'healing'}
            />
          </TabsContent>

          <TabsContent value="spec" className="flex-1 m-0 overflow-hidden">
            {spec ? (
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No spec generated yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompt" className="flex-1 m-0 overflow-hidden flex flex-col">
            {spec ? (
              <>
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
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No prompt generated yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
            <CodeExport generatedCode={generatedCode} />
          </TabsContent>

          <TabsContent value="questions" className="flex-1 m-0 overflow-hidden">
            {spec ? (
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No questions yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="debug" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Bug className="w-4 h-4 text-orange-500" />
                    Debug Info
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Code Status</div>
                      <div className="text-sm font-mono">{codeStatus}</div>
                    </div>

                    {codeError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <div className="text-xs text-destructive mb-1">Error</div>
                        <div className="text-sm font-mono text-destructive">{codeError}</div>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Heal Attempts</div>
                      <div className="text-sm font-mono">{healAttempts} / {MAX_HEAL_ATTEMPTS}</div>
                    </div>

                    {generatedCode?.siteDefinition && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-2">Site Definition (JSON)</div>
                        <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                          {JSON.stringify(generatedCode.siteDefinition, null, 2)}
                        </pre>
                      </div>
                    )}

                    {generatedCode?.reactCode && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-2">Raw React Code (first 2000 chars)</div>
                        <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                          {generatedCode.reactCode.slice(0, 2000)}
                          {generatedCode.reactCode.length > 2000 && '...\n[truncated]'}
                        </pre>
                      </div>
                    )}

                    {!generatedCode && !codeError && (
                      <div className="text-sm text-muted-foreground">
                        No generated code yet. Enter an idea to generate.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BotExperiment;
