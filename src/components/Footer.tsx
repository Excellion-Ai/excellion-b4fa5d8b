import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-3">
            <h3 className="text-xl font-bold text-foreground">Excellion</h3>
            <p className="text-sm text-muted-foreground">
              Building beautiful websites and apps for small businesses. Choose DIY templates or let our experts handle everything.
            </p>
          </div>

          {/* Company Column */}
          <div className="space-y-4 md:col-span-3">
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
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

          {/* Solutions Column */}
          <div className="space-y-4 md:col-span-3">
            <h4 className="text-sm font-semibold text-foreground">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/diy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  DIY Builder
                </Link>
              </li>
              <li>
                <Link to="/dfy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  DFY Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Maintenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4 md:col-span-3">
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.gg/tmDTkwVY9u" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Excellion. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built by John & Kohen
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
