import { Link } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-[#050505]" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 mb-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <img src={excellionLogo} alt="Excellion" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
              <span className="text-lg sm:text-xl font-bold text-accent">Excellion</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-Powered Course Builder
            </p>
          </div>

          {/* Product Column */}
          <nav className="space-y-4 md:col-span-2" aria-label="Product links">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Product</p>
            <ul className="space-y-3">
              <li>
                <Link to="/secret-builder-hub" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  Create Course
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company Column */}
          <nav className="space-y-4 md:col-span-2" aria-label="Company links">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Company</p>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal Column */}
          <nav className="space-y-4 md:col-span-2" aria-label="Legal links">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Legal</p>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-block py-0.5">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors touch-manipulation inline-flex items-center gap-1 py-0.5"
                >
                  Sitemap
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex justify-center items-center">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Excellion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
