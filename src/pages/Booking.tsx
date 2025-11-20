import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Excellion</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Lock in Your Build
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Schedule your 30-minute build call to finalize everything
            </p>
            
            <ul className="space-y-4">
              {[
                "Review your custom mockup",
                "Finalize pricing and features",
                "Set your launch date",
                "Ask any questions you have"
              ].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <span className="text-lg text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 p-6 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> This call is free and there's no obligation. 
                We'll show you exactly what we can build and answer all your questions.
              </p>
            </div>
          </motion.div>

          {/* Right Side - Calendar Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <div className="w-full h-[600px] bg-card border border-border rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Calendar Loading...
                </h3>
                <p className="text-muted-foreground">
                  Embed your Calendly code here
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Excellion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Booking;
