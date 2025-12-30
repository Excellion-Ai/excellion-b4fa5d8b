import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Github, ArrowLeft } from "lucide-react";
import diyBackgroundVideo from "@/assets/diy-background.mp4";
import { z } from "zod";

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATIONS = [60000, 300000, 900000]; // 1min, 5min, 15min
const ATTEMPT_WINDOW = 300000; // 5 minutes

interface LoginAttempt {
  timestamp: number;
  email: string;
}

const getLoginAttempts = (): LoginAttempt[] => {
  try {
    const attempts = localStorage.getItem('auth_attempts');
    return attempts ? JSON.parse(attempts) : [];
  } catch {
    return [];
  }
};

const saveLoginAttempts = (attempts: LoginAttempt[]) => {
  localStorage.setItem('auth_attempts', JSON.stringify(attempts));
};

const getLockoutInfo = (email: string) => {
  const attempts = getLoginAttempts();
  const now = Date.now();
  
  // Filter recent attempts for this email
  const recentAttempts = attempts.filter(
    (a) => a.email === email && now - a.timestamp < ATTEMPT_WINDOW
  );
  
  if (recentAttempts.length < MAX_ATTEMPTS) {
    return { isLocked: false, remainingTime: 0, attemptCount: recentAttempts.length };
  }
  
  // Calculate lockout duration based on attempt count
  const lockoutIndex = Math.min(
    Math.floor(recentAttempts.length / MAX_ATTEMPTS) - 1,
    LOCKOUT_DURATIONS.length - 1
  );
  const lockoutDuration = LOCKOUT_DURATIONS[lockoutIndex];
  const lastAttempt = recentAttempts[recentAttempts.length - 1];
  const lockoutEnd = lastAttempt.timestamp + lockoutDuration;
  
  if (now < lockoutEnd) {
    return {
      isLocked: true,
      remainingTime: lockoutEnd - now,
      attemptCount: recentAttempts.length,
    };
  }
  
  return { isLocked: false, remainingTime: 0, attemptCount: recentAttempts.length };
};

const recordFailedAttempt = (email: string) => {
  const attempts = getLoginAttempts();
  attempts.push({ timestamp: Date.now(), email });
  saveLoginAttempts(attempts);
};

const clearLoginAttempts = (email: string) => {
  const attempts = getLoginAttempts();
  const filtered = attempts.filter((a) => a.email !== email);
  saveLoginAttempts(filtered);
};

const authSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword !== undefined) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Password strength checker
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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get redirect URL from query params (e.g., /auth?redirect=/checkout?plan=pro)
  const redirectTo = searchParams.get("redirect") || "/";
  
  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  useEffect(() => {
    const handleAuthRedirect = (session: any) => {
      if (session) {
        // Check for pending builder data from WebBuilderHome
        const pendingData = sessionStorage.getItem('pendingBuilderData');
        if (pendingData && redirectTo === '/secret-builder-hub') {
          sessionStorage.removeItem('pendingBuilderData');
          const builderData = JSON.parse(pendingData);
          navigate('/secret-builder-hub', { state: builderData });
        } else {
          navigate(redirectTo);
        }
      }
    };

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthRedirect(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthRedirect(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    const lockoutInfo = getLockoutInfo(email);
    if (lockoutInfo.isLocked) {
      setLockoutTime(lockoutInfo.remainingTime);
      const minutes = Math.ceil(lockoutInfo.remainingTime / 60000);
      toast.error(`Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`);
      return;
    }

    setLoading(true);

    try {
      // Validate form data
      const validationData = isLogin 
        ? { email, password }
        : { email, password, confirmPassword };
      
      const result = authSchema.safeParse(validationData);
      
      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          recordFailedAttempt(email);
          
          const updatedLockout = getLockoutInfo(email);
          if (updatedLockout.isLocked) {
            setLockoutTime(updatedLockout.remainingTime);
          }
          const remainingAttempts = MAX_ATTEMPTS - (updatedLockout.attemptCount % MAX_ATTEMPTS);
          
          // Handle specific error messages with clearer feedback
          let errorMessage = error.message;
          // Always show "Incorrect password" for any login credential error
          if (error.message.includes("Invalid login credentials") || error.message.includes("invalid")) {
            errorMessage = "Incorrect password. Please check your password and try again.";
            setPasswordError("Incorrect password");
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Please check your email to confirm your account";
          } else {
            // For any other login error, assume password is incorrect
            setPasswordError("Incorrect password");
          }
          
          throw new Error(
            errorMessage + 
            (remainingAttempts > 0 && remainingAttempts < MAX_ATTEMPTS 
              ? ` (${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining)` 
              : '')
          );
        }
        
        setPasswordError("");
        
        clearLoginAttempts(email);
        
        // If "Remember me" is unchecked, store flag to clear session on browser close
        if (!rememberMe) {
          sessionStorage.setItem('clearSessionOnClose', 'true');
        } else {
          sessionStorage.removeItem('clearSessionOnClose');
        }
        
        toast.success("Logged in successfully!");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          // Handle specific signup errors
          let errorMessage = error.message;
          if (error.message.includes("User already registered")) {
            errorMessage = "An account with this email already exists. Please sign in instead.";
          }
          throw new Error(errorMessage);
        }
        
        // Check if user was created (auto-confirm enabled means they're logged in)
        if (data.user && data.session) {
          toast.success("Account created successfully!");
        } else if (data.user && !data.session) {
          toast.success("Account created! Please check your email to confirm.");
        } else {
          toast.success("Account created successfully!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `${provider} login failed`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailSchema = z.string().email("Invalid email address");
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

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
                {showForgotPassword 
                  ? "Reset Password" 
                  : isLogin 
                    ? "Welcome Back" 
                    : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center text-foreground/80">
                {showForgotPassword
                  ? "Enter your email to receive a reset link"
                  : isLogin
                    ? "Sign in to your account to continue"
                    : "Sign up to get started with Excellion"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Forgot Password Form */}
              {showForgotPassword ? (
                resetEmailSent ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-foreground">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Check your inbox and click the link to reset your password.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmailSent(false);
                      }}
                      className="mt-4"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-foreground">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/20 border-white/20 text-foreground"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full text-sm text-foreground/80 hover:text-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </button>
                  </form>
                )
              ) : (
                <>
                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("google")}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("github")}
                  className="w-full"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/50 px-2 text-foreground/70">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/20 border-white/20 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    required
                    minLength={isLogin ? undefined : 8}
                    className={`bg-background/20 border-white/20 text-foreground ${
                      isLogin && passwordError ? "border-destructive" : ""
                    }`}
                  />
                  {isLogin && passwordError && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                      {passwordError}
                    </p>
                  )}
                  {!isLogin && password && (
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

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className={`bg-background/20 border-white/20 text-foreground ${
                        confirmPassword && password !== confirmPassword ? "border-destructive" : ""
                      }`}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm text-foreground/80 cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>
                )}

                {lockoutTime > 0 && (
                  <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md">
                    Account temporarily locked. Try again in {Math.ceil(lockoutTime / 1000)} seconds.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={loading || lockoutTime > 0}
                >
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                </Button>
              </form>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Forgot password?
                </button>
              )}
                </>
              )}
            </CardContent>

            {!showForgotPassword && (
              <CardFooter className="flex flex-col space-y-2">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </CardFooter>
            )}
          </Card>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Auth;