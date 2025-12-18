import { useState, useEffect } from "react";

interface AnimatedPlaceholderProps {
  suggestions: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function AnimatedPlaceholder({
  suggestions,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
}: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSuggestion = suggestions[currentIndex];
    
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing
      if (displayText.length < currentSuggestion.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentSuggestion.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Pause at the end before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Move to next suggestion
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % suggestions.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, suggestions, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="text-muted-foreground/60">
      {displayText}
      <span className="animate-pulse ml-0.5">|</span>
    </span>
  );
}
