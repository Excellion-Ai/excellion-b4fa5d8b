import { useState } from "react";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceBotPlaceholderProps {
  onClose?: () => void;
}

export function VoiceBotPlaceholder({ onClose }: VoiceBotPlaceholderProps) {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Animated orb */}
      <div className="relative mb-8">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 via-primary/50 to-accent/40 flex items-center justify-center"
          animate={isListening ? {
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0.4)",
              "0 0 0 20px hsl(var(--primary) / 0)",
              "0 0 0 0 hsl(var(--primary) / 0)"
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center"
            animate={isListening ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Volume2 className="w-10 h-10 text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
            />
          </>
        )}
      </div>

      {/* Status text */}
      <p className="text-lg font-medium text-foreground mb-2">
        {isListening ? "Listening..." : "Voice Interview"}
      </p>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
        {isListening 
          ? "Tell me about your course idea, target audience, and goals."
          : "Click the microphone to start describing your course idea with your voice."
        }
      </p>

      {/* Mic button */}
      <Button
        size="lg"
        variant={isListening ? "destructive" : "default"}
        className="rounded-full w-14 h-14 p-0"
        onClick={() => setIsListening(!isListening)}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-4">
        {isListening ? "Click to stop" : "Click to start"}
      </p>

      {/* Coming soon badge */}
      <div className="mt-6 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
        <span className="text-xs text-muted-foreground">Voice input coming soon</span>
      </div>
    </div>
  );
}
