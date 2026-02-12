import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Github, Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react";
import diyBackgroundVideo from "@/assets/diy-background.mp4";
import { z } from "zod";


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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Password validation states
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get redirect URL from query params (e.g., /auth?redirect=/checkout?plan=pro)
  const redirectTo = searchParams.get("redirect") || "/";


  // Detect recovery flow from URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = searchParams.get("type") || hashParams.get("type");
    if (type === "recovery") {
      setIsResettingPassword(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
        return;
      }
      if (session && !isResettingPassword) {
        navigate(redirectTo);
      }
    });

    // Check if user is already logged in (but not if resetting password)
    if (!isResettingPassword) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate(redirectTo);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo, isResettingPassword]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();


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
          // Handle specific error messages
          let errorMessage = error.message;
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Invalid email or password";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Please check your email to confirm your account";
          }
          
          throw new Error(errorMessage);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setIsResettingPassword(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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

  return (
    <>
      <Helmet>
        <title>{isResettingPassword ? "Set New Password" : isForgotPassword ? "Reset Password" : isLogin ? "Login" : "Sign Up"} | Excellion</title>
        <meta name="description" content={isForgotPassword ? "Reset your Excellion password" : isLogin ? "Sign in to your Excellion account" : "Create your Excellion account and start learning"} />
        <meta name="robots" content="noindex" />
      </Helmet>
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
                {isResettingPassword ? "Set New Password" : isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center text-foreground/80">
                {isResettingPassword
                  ? "Enter your new password below"
                  : isForgotPassword
                    ? "Enter your email and we'll send you a reset link"
                    : isLogin
                      ? "Sign in to your account to continue"
                      : "Sign up to get started with Excellion"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isResettingPassword ? (
                /* Set New Password Form */
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="bg-background/20 border-white/20 text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword" className="text-foreground">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-background/20 border-white/20 text-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              ) : isForgotPassword ? (
                /* Forgot Password Form */
                <form onSubmit={handleForgotPassword} className="space-y-4">
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

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="flex items-center justify-center gap-1.5 w-full text-sm text-foreground/70 hover:text-accent transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to sign in
                  </button>
                </form>
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
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          className="bg-background/20 border-white/20 text-foreground pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {!isLogin && password.length > 0 && (
                        <div className="space-y-1.5 mt-2 p-3 rounded-md bg-background/30 border border-border/50">
                          <p className="text-xs text-foreground/70 font-medium mb-2">Password requirements:</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? 'text-green-400' : 'text-foreground/50'}`}>
                              {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              8+ characters
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${hasUppercase ? 'text-green-400' : 'text-foreground/50'}`}>
                              {hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              Uppercase letter
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${hasLowercase ? 'text-green-400' : 'text-foreground/50'}`}>
                              {hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              Lowercase letter
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${hasNumber ? 'text-green-400' : 'text-foreground/50'}`}>
                              {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              Number
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="bg-background/20 border-white/20 text-foreground pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remember" 
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-foreground/70 cursor-pointer hover:text-foreground transition-colors"
                          >
                            Remember me
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-sm text-foreground/70 hover:text-accent transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              {!isForgotPassword && (
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              )}
            </CardFooter>
          </Card>
        </main>

        <Footer />
      </div>
      </div>
    </>
  );
};

export default Auth;