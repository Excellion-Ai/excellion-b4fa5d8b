import { Toaster } from "@/components/ui/toaster";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Helper to handle stale chunk errors with auto-reload
const lazyWithRetry = (componentImport: () => Promise<any>) => 
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error: any) {
      // If chunk failed to load (stale bundle), reload the page once
      if (error?.message?.includes('Failed to fetch dynamically imported module')) {
        const hasReloaded = sessionStorage.getItem('chunk_reload');
        if (!hasReloaded) {
          sessionStorage.setItem('chunk_reload', 'true');
          window.location.reload();
          return { default: () => null };
        }
        sessionStorage.removeItem('chunk_reload');
      }
      throw error;
    }
  });

// Lazy load all routes for faster initial load
const WebBuilderHome = lazyWithRetry(() => import("./pages/WebBuilderHome"));
const BuilderPricing = lazyWithRetry(() => import("./pages/BuilderPricing"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const BuilderFAQ = lazyWithRetry(() => import("./pages/BuilderFAQ"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Legal = lazyWithRetry(() => import("./pages/Legal"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const ThankYou = lazyWithRetry(() => import("./pages/ThankYou"));
const MaintenanceRequest = lazyWithRetry(() => import("./pages/MaintenanceRequest"));
const SecretBuilder = lazyWithRetry(() => import("./pages/SecretBuilder"));
const SecretBuilderHub = lazyWithRetry(() => import("./pages/SecretBuilderHub"));
const BuilderResources = lazyWithRetry(() => import("./pages/BuilderResources"));
const Billing = lazyWithRetry(() => import("./pages/Billing"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const CheckoutSuccess = lazyWithRetry(() => import("./pages/CheckoutSuccess"));
const GitHubCallback = lazyWithRetry(() => import("./pages/GitHubCallback"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));

// Settings pages
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const ProfileSettings = lazyWithRetry(() => import("./pages/settings/ProfileSettings"));
const BillingSettings = lazyWithRetry(() => import("./pages/settings/BillingSettings"));
const NotificationsSettings = lazyWithRetry(() => import("./pages/settings/NotificationsSettings"));
const WorkspaceSettings = lazyWithRetry(() => import("./pages/settings/WorkspaceSettings"));
const TeamSettings = lazyWithRetry(() => import("./pages/settings/TeamSettings"));
const DomainsSettings = lazyWithRetry(() => import("./pages/settings/DomainsSettings"));
const AppearanceSettings = lazyWithRetry(() => import("./pages/settings/AppearanceSettings"));
const ShortcutsSettings = lazyWithRetry(() => import("./pages/settings/ShortcutsSettings"));
const HelpSettings = lazyWithRetry(() => import("./pages/settings/HelpSettings"));
const SupportSettings = lazyWithRetry(() => import("./pages/settings/SupportSettings"));
const KnowledgeSettings = lazyWithRetry(() => import("./pages/settings/KnowledgeSettings"));
// const Index = lazy(() => import("./pages/Index"));
// const DFY = lazy(() => import("./pages/DFY"));
// const BookCall = lazy(() => import("./pages/BookCall"));
// const Survey = lazy(() => import("./pages/Survey"));
// const Pricing = lazy(() => import("./pages/Pricing"));
// const Operations = lazy(() => import("./pages/Operations"));
// const BotExperiment = lazy(() => import("./pages/BotExperiment"));
// const Hub = lazy(() => import("./pages/Hub"));

const queryClient = new QueryClient();

// Minimal loading component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  // Handle "Remember me" - clear session on browser close if not checked
  useEffect(() => {
    const handleBeforeUnload = () => {
      const shouldClear = sessionStorage.getItem('clearSessionOnClose');
      if (shouldClear === 'true') {
        supabase.auth.signOut();
        sessionStorage.removeItem('clearSessionOnClose');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<WebBuilderHome />} />
        <Route path="/pricing" element={<BuilderPricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/builder-faq" element={<BuilderFAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/maintenance-request" element={<MaintenanceRequest />} />
        <Route path="/secret-builder-hub" element={<SecretBuilderHub />} />
        <Route path="/secret-builder" element={<SecretBuilder />} />
        <Route path="/builder-resources" element={<BuilderResources />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/github-callback" element={<GitHubCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Settings routes */}
        <Route path="/settings" element={<Settings />}>
          <Route index element={<ProfileSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route path="workspace" element={<WorkspaceSettings />} />
          <Route path="team" element={<TeamSettings />} />
          <Route path="knowledge" element={<KnowledgeSettings />} />
          <Route path="domains" element={<DomainsSettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="shortcuts" element={<ShortcutsSettings />} />
          <Route path="help" element={<HelpSettings />} />
          <Route path="support" element={<SupportSettings />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </QueryClientProvider>
  );
};

export default App;
