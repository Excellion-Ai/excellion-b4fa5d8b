import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background" role="contentinfo">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-3">
            <p className="text-xl font-bold text-foreground">Excellion</p>
            <p className="text-sm text-muted-foreground">
              Excellion builds modern, custom websites for small businesses. We handle the design, development, and launch for you, so you can stay focused on running your business. Start with a free mockup and estimate—no obligation.
            </p>
          </div>

          {/* Company Column */}
          <nav className="space-y-4 md:col-span-3" aria-label="Company links">
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
          </nav>

          {/* Solutions Column */}
          <nav className="space-y-4 md:col-span-3" aria-label="Solutions links">
            <p className="text-sm font-semibold text-foreground">Solutions</p>
            <ul className="space-y-2">
              <li>
                <Link to="/diy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  DIY Builder
                </Link>
              </li>
              <li>
                <Link to="/dfy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Done for you
                </Link>
              </li>
              <li>
                <Link to="/operations#maintenance" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Maintenance
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support Column */}
          <nav className="space-y-4 md:col-span-3" aria-label="Support links">
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
                <a 
                  href="https://discord.gg/tmDTkwVY9u" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  aria-label="Join Excellion Discord community (opens in new tab)"
                >
                  Discord
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-center items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Excellion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
