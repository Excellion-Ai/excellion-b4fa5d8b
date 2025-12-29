import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "sprint-bar-dismissed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const SprintPassBar = () => {
  const [isDismissed, setIsDismissed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Check localStorage for dismissal
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < SEVEN_DAYS_MS) {
          setIsDismissed(true);
          return;
        }
      }
      setIsDismissed(false);
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dismissed: true, timestamp: Date.now() })
      );
    } catch {
      // Silently fail if localStorage is unavailable
    }
  };

  const handleGetSprintPass = () => {
    navigate("/pricing#sprint-pass");
  };

  const handleViewPricing = () => {
    setShowModal(false);
    navigate("/pricing#sprint-pass");
  };

  return (
    <>
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-black border-t-2 border-accent/40">
              <div className="max-w-7xl mx-auto px-4 py-2 sm:py-0 sm:h-11 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                {/* Text Content */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
                  <span className="text-white text-sm font-medium">
                    Sprint Pass: Publish for $9 (first month).
                  </span>
                  <span className="text-white/60 text-xs">
                    Renews to Pro after 30 days unless canceled.
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-white/70 text-xs hover:text-white underline underline-offset-2 transition-colors"
                  >
                    See details
                  </button>
                  <Button
                    onClick={handleGetSprintPass}
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-7 text-xs px-3"
                  >
                    Get Sprint Pass
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="text-white/50 hover:text-white transition-colors p-1"
                    aria-label="Dismiss announcement"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sprint Pass details</DialogTitle>
          </DialogHeader>
          <ul className="space-y-3 my-4">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent mt-0.5">•</span>
              $9 for your first month to publish.
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent mt-0.5">•</span>
              After 30 days, it renews to the Pro plan unless you cancel.
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent mt-0.5">•</span>
              Cancel anytime in Settings → Billing before renewal.
            </li>
          </ul>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Got it
            </Button>
            <Button onClick={handleViewPricing}>View Pricing</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SprintPassBar;
