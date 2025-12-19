import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

const Navigation = () => {
  const { isAdmin } = useAdmin();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105" aria-label="Excellion Home">
          <img 
            src={excellionLogo} 
            alt="Excellion company logo" 
            className="h-8 w-8 sm:h-10 sm:w-10" 
            width="40" 
            height="40"
            loading="eager"
          />
          <span className="text-lg sm:text-xl font-bold text-foreground">Excellion</span>
        </Link>
          
        <div className="hidden md:flex items-center gap-8">
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/builder-faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/secret-builder-hub">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Building
              </Button>
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <a 
                  href="/#how-it-works" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  How it Works
                </a>
                <Link 
                  to="/pricing" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
                <Link 
                  to="/builder-faq" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
                <div className="pt-6 border-t border-border flex flex-col gap-3">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="w-full gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/secret-builder-hub">
                    <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Start Building
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
