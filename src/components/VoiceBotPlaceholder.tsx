import { useState, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceBotPlaceholderProps {
  onClose?: () => void;
}

const INTERVIEW_QUESTIONS = [
  "What's the main topic or skill your course will teach?",
  "Who is your ideal student? What's their current level?",
  "What transformation will students achieve by the end?",
  "How would you describe your teaching style?",
  "What makes your approach unique?",
];

export function VoiceBotPlaceholder({ onClose }: VoiceBotPlaceholderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(24).fill(0.1));

  // Simulate call timer
  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, [isConnected]);

  // Simulate audio visualization
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => 0.1 + Math.random() * 0.9)
      );
    }, 100);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Cycle through questions
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setCurrentQuestion(q => (q + 1) % INTERVIEW_QUESTIONS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    setIsConnected(true);
    setCallDuration(0);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCallDuration(0);
    onClose?.();
  };

  return (
    <div className="flex flex-col items-center min-h-[420px] -mx-6 -mb-6 rounded-b-lg overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      
      <div className="relative z-10 flex flex-col items-center w-full h-full py-6 px-4">
        {/* AI Avatar with glow */}
        <div className="relative mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
            animate={isConnected ? {
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            } : { scale: 1, opacity: 0.2 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg shadow-primary/25"
            animate={isConnected ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-2xl font-bold text-primary-foreground">AI</span>
          </motion.div>
          
          {/* Connection status indicator */}
          <motion.div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${
              isConnected ? 'bg-emerald-500' : 'bg-muted'
            }`}
            animate={isConnected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {isConnected && <Volume2 className="w-2.5 h-2.5 text-white" />}
          </motion.div>
        </div>

        {/* Title and status */}
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Course Interview
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isConnected ? `In call · ${formatTime(callDuration)}` : "AI-powered voice interview"}
        </p>

        {/* Audio visualizer */}
        <div className="flex items-center justify-center gap-[3px] h-12 mb-4 px-4">
          {audioLevels.map((level, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-primary/60 to-primary"
              animate={{ 
                height: isConnected ? `${level * 40}px` : '4px',
                opacity: isConnected ? 0.7 + level * 0.3 : 0.3
              }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {/* Current question card */}
        <AnimatePresence mode="wait">
          {isConnected && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 mb-6"
            >
              <p className="text-xs text-primary font-medium mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI is asking...
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                "{INTERVIEW_QUESTIONS[currentQuestion]}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not connected state - info */}
        {!isConnected && (
          <div className="w-full max-w-sm bg-muted/30 rounded-xl p-4 mb-6 border border-border/30">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Our AI will ask you questions about your course idea, audience, and goals to help generate the perfect curriculum.
            </p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Call controls */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <Button
                size="lg"
                variant={isMuted ? "destructive" : "secondary"}
                className="rounded-full w-14 h-14 p-0"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16 p-0 shadow-lg shadow-destructive/25"
                onClick={handleDisconnect}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              
              <div className="w-14 h-14" /> {/* Spacer for balance */}
            </>
          ) : (
            <Button
              size="lg"
              className="rounded-full px-8 h-14 gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
              onClick={handleConnect}
            >
              <Phone className="w-5 h-5" />
              <span className="font-semibold">Start Interview</span>
            </Button>
          )}
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {isConnected 
            ? "Speak naturally — the AI will guide the conversation"
            : "Takes about 2 minutes"}
        </p>

        {/* Coming soon badge */}
        <div className="mt-4 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span className="text-xs text-amber-400 font-medium">✨ Voice AI coming soon</span>
        </div>
      </div>
    </div>
  );
}
