import { Link } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background" role="contentinfo">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center gap-2">
              <img src={excellionLogo} alt="Excellion AI" className="w-8 h-8 object-contain" width="32" height="32" loading="lazy" />
              <span className="text-xl font-bold text-foreground">Excellion AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Build beautiful websites with AI. No coding required. Excellion turns a short conversation into a real website with pages, copy, forms, and a clear launch plan.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-4 md:col-span-2">
            <p className="text-sm font-semibold text-foreground">Product</p>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4 md:col-span-2">
            <p className="text-sm font-semibold text-foreground">Company</p>
            <ul className="space-y-2">
              <li>
                <Link to="/legal#privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal#terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal#cookies" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4 md:col-span-2">
            <p className="text-sm font-semibold text-foreground">Support</p>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/maintenance-request" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Maintenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Column */}
          <div className="space-y-4 md:col-span-2">
            <p className="text-sm font-semibold text-foreground">Builder</p>
            <ul className="space-y-2">
              <li>
                <Link to="/secret-builder-hub" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Studio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-center items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Excellion AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;