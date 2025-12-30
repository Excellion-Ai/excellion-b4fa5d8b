import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import diyBackgroundVideo from "@/assets/diy-background.mp4";

const getPasswordStrength = (pwd: string) => {
  const checks = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { checks, passed, total: 4 };
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);
  const isPasswordValid = passwordStrength.passed === 4;

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    });

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Please ensure your password meets all requirements");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success("Password updated successfully!");
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={(el) => el && (el.playbackRate = 0.75)}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        >
          <source src={diyBackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <main className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md bg-background border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl text-center text-foreground">
                Set New Password
              </CardTitle>
              <CardDescription className="text-center text-foreground/80">
                {isValidSession 
                  ? "Enter your new password below"
                  : "This reset link has expired or is invalid"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isValidSession ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">New Password</Label>
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/20 border-white/20 text-foreground"
                    />
                    {password && (
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= passwordStrength.passed
                                  ? passwordStrength.passed <= 2
                                    ? "bg-destructive"
                                    : passwordStrength.passed === 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-xs flex items-center gap-1.5 ${passwordStrength.checks.length ? "text-green-500" : "text-muted-foreground"}`}>
                            {passwordStrength.checks.length ? "✓" : "○"} At least 8 characters
                          </p>
                          <p className={`text-xs flex items-center gap-1.5 ${passwordStrength.checks.uppercase ? "text-green-500" : "text-muted-foreground"}`}>
                            {passwordStrength.checks.uppercase ? "✓" : "○"} One uppercase letter
                          </p>
                          <p className={`text-xs flex items-center gap-1.5 ${passwordStrength.checks.lowercase ? "text-green-500" : "text-muted-foreground"}`}>
                            {passwordStrength.checks.lowercase ? "✓" : "○"} One lowercase letter
                          </p>
                          <p className={`text-xs flex items-center gap-1.5 ${passwordStrength.checks.number ? "text-green-500" : "text-muted-foreground"}`}>
                            {passwordStrength.checks.number ? "✓" : "○"} One number
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`bg-background/20 border-white/20 text-foreground ${
                        confirmPassword && password !== confirmPassword ? "border-destructive" : ""
                      }`}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={loading || !isPasswordValid || password !== confirmPassword}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-foreground">
                    This password reset link has expired or is invalid.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please request a new password reset link.
                  </p>
                  <Button
                    onClick={() => navigate("/auth")}
                    className="mt-4 bg-accent hover:bg-accent/90"
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ResetPassword;
