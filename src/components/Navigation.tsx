import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={excellionLogo} alt="Excellion Logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">Excellion</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/dfy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              DFY
            </Link>
            <Link to="/catacombs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Catacombs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Link to="/">
              <Button variant="secondary" size="sm">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
