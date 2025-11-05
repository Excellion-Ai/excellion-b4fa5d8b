import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
            <Link to="/dfy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              DFY
            </Link>
            <Link to="/diy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              DIY
            </Link>
            <Link to="/operations" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Operations
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Link to="/">
                <Button variant="secondary" size="sm">
                  Home
                </Button>
              </Link>
            </div>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-6 mt-8">
                  <Link 
                    to="/dfy" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    DFY
                  </Link>
                  <Link 
                    to="/diy" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    DIY
                  </Link>
                  <Link 
                    to="/operations" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Operations
                  </Link>
                  <div className="pt-6 border-t border-border flex flex-col gap-3">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                    <Link to="/">
                      <Button variant="secondary" size="sm" className="w-full">
                        Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
