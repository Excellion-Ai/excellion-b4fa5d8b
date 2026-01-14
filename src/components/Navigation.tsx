import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import excellionLogo from "@/assets/excellion-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, LogOut, User } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleStartBuilding = () => {
    if (user) {
      navigate("/secret-builder-hub");
    } else {
      navigate("/auth?redirect=/secret-builder-hub");
    }
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="max-w-[100px] truncate">
            {user?.email?.split("@")[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/billing" className="cursor-pointer">
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 transition-transform duration-300 hover:scale-105" aria-label="Excellion Home">
          <img 
            src={excellionLogo} 
            alt="Excellion company logo" 
            className="h-7 w-7 sm:h-10 sm:w-10" 
            width="40" 
            height="40"
            loading="eager"
          />
          <span className="text-base sm:text-xl font-bold text-foreground">Excellion</span>
        </Link>
          
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </Link>
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/builder-faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          {user && (
            <>
              <Link to="/dashboard/student" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Dashboard
              </Link>
              <Link to="/my-courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Courses
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
              )
            )}
            <Button 
              size="sm" 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleStartBuilding}
            >
              Start Building
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 touch-manipulation" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[320px] p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <img src={excellionLogo} alt="Excellion" className="h-6 w-6" />
                    <span className="font-semibold text-foreground">Excellion</span>
                  </div>
                </div>
                
                {/* Navigation Links */}
                <div className="flex flex-col p-4 gap-1">
                  <Link 
                    to="/courses" 
                    className="flex items-center h-12 px-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary/50 transition-colors touch-manipulation"
                  >
                    Courses
                  </Link>
                  <a 
                    href="/#how-it-works" 
                    className="flex items-center h-12 px-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary/50 transition-colors touch-manipulation"
                  >
                    How it Works
                  </a>
                  <Link 
                    to="/pricing" 
                    className="flex items-center h-12 px-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary/50 transition-colors touch-manipulation"
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/builder-faq" 
                    className="flex items-center h-12 px-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary/50 transition-colors touch-manipulation"
                  >
                    FAQ
                  </Link>
                  {user && (
                    <>
                      <Link 
                        to="/dashboard/student" 
                        className="flex items-center h-12 px-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary/50 transition-colors touch-manipulation"
                      >
                        My Dashboard
                      </Link>
                      <Link 
                        to="/my-courses" 
                        className="flex items-center h-12 px-3 rounded-lg text-base font-medium text-foreground hover:bg-secondary/50 transition-colors touch-manipulation"
                      >
                        My Courses
                      </Link>
                    </>
                  )}
                </div>
                
                {/* User Section */}
                <div className="mt-auto p-4 border-t border-border/50 space-y-3">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="lg" className="w-full justify-start gap-2 h-12 touch-manipulation">
                        <Shield className="h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  {!loading && (
                    user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground rounded-lg bg-secondary/30">
                          <User className="h-4 w-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <Link to="/billing">
                          <Button variant="ghost" size="lg" className="w-full justify-start h-12 touch-manipulation">
                            Billing
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="w-full justify-start text-destructive h-12 touch-manipulation" 
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth">
                        <Button variant="ghost" size="lg" className="w-full justify-start h-12 touch-manipulation">
                          Sign In
                        </Button>
                      </Link>
                    )
                  )}
                  <Button 
                    size="lg" 
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 touch-manipulation"
                    onClick={handleStartBuilding}
                  >
                    Start Building
                  </Button>
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