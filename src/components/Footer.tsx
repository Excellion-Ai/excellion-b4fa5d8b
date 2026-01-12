import { Link } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <img src={excellionLogo} alt="Excellion AI" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
              <span className="text-lg sm:text-xl font-bold text-foreground">Excellion AI</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Build course websites with AI. No code required. Excellion turns a short chat into a complete course site draft with pages, lessons, and clear calls-to-action.
            </p>
          </div>

          {/* Product Column */}
          <nav className="space-y-3 sm:space-y-4 md:col-span-2" aria-label="Product links">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Product</p>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  How it works
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company Column */}
          <nav className="space-y-3 sm:space-y-4 md:col-span-2" aria-label="Company links">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Company</p>
            <ul className="space-y-2">
              <li>
                <Link to="/legal#privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal#terms" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal#cookies" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support Column */}
          <nav className="space-y-3 sm:space-y-4 md:col-span-2" aria-label="Support links">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Support</p>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>

          {/* Studio Column */}
          <nav className="space-y-3 sm:space-y-4 md:col-span-2" aria-label="Builder links">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Builder</p>
            <ul className="space-y-2">
              <li>
                <Link to="/secret-builder-hub" className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-1">
                  Studio
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-border/50 flex flex-col md:flex-row justify-center items-center">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Excellion AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
