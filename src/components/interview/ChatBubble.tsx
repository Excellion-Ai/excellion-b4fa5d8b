import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  subMessage?: string;
}

export function ChatBubble({ message, subMessage }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-start gap-3 mb-6"
    >
      {/* AI Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
      </div>

      {/* Message Bubble */}
      <div className="flex-1">
        <div className="inline-block bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-4 border border-border/50 shadow-lg">
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {message}
          </p>
          {subMessage && (
            <p className="text-sm text-muted-foreground mt-1.5">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
