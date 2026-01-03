import { Toaster } from "@/components/ui/toaster";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load all routes for faster initial load
const WebBuilderHome = lazy(() => import("./pages/WebBuilderHome"));
const BuilderPricing = lazy(() => import("./pages/BuilderPricing"));
const FAQ = lazy(() => import("./pages/FAQ"));
const BuilderFAQ = lazy(() => import("./pages/BuilderFAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const MaintenanceRequest = lazy(() => import("./pages/MaintenanceRequest"));
const SecretBuilder = lazy(() => import("./pages/SecretBuilder"));
const SecretBuilderHub = lazy(() => import("./pages/SecretBuilderHub"));
const Billing = lazy(() => import("./pages/Billing"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Settings pages
const Settings = lazy(() => import("./pages/Settings"));
const ProfileSettings = lazy(() => import("./pages/settings/ProfileSettings"));
const BillingSettings = lazy(() => import("./pages/settings/BillingSettings"));
const NotificationsSettings = lazy(() => import("./pages/settings/NotificationsSettings"));
const WorkspaceSettings = lazy(() => import("./pages/settings/WorkspaceSettings"));
const TeamSettings = lazy(() => import("./pages/settings/TeamSettings"));
const DomainsSettings = lazy(() => import("./pages/settings/DomainsSettings"));
const AppearanceSettings = lazy(() => import("./pages/settings/AppearanceSettings"));
const ShortcutsSettings = lazy(() => import("./pages/settings/ShortcutsSettings"));
const HelpSettings = lazy(() => import("./pages/settings/HelpSettings"));
const SupportSettings = lazy(() => import("./pages/settings/SupportSettings"));
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

const App = () => (
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
        <Route path="/billing" element={<Billing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        
        {/* Settings routes */}
        <Route path="/settings" element={<Settings />}>
          <Route index element={<ProfileSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route path="workspace" element={<WorkspaceSettings />} />
          <Route path="team" element={<TeamSettings />} />
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

export default App;
