import { Toaster } from "@/components/ui/toaster";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Lazy load all routes with retry logic for cache busting
const WebBuilderHome = lazyWithRetry(() => import("./pages/WebBuilderHome"), "WebBuilderHome");
const BuilderPricing = lazyWithRetry(() => import("./pages/BuilderPricing"), "BuilderPricing");
const FAQ = lazyWithRetry(() => import("./pages/FAQ"), "FAQ");
const BuilderFAQ = lazyWithRetry(() => import("./pages/BuilderFAQ"), "BuilderFAQ");
const Contact = lazyWithRetry(() => import("./pages/Contact"), "Contact");
const Legal = lazyWithRetry(() => import("./pages/Legal"), "Legal");
const Auth = lazyWithRetry(() => import("./pages/Auth"), "Auth");
const Admin = lazyWithRetry(() => import("./pages/Admin"), "Admin");
const ThankYou = lazyWithRetry(() => import("./pages/ThankYou"), "ThankYou");
const MaintenanceRequest = lazyWithRetry(() => import("./pages/MaintenanceRequest"), "MaintenanceRequest");
const SecretBuilder = lazyWithRetry(() => import("./pages/SecretBuilder"), "SecretBuilder");
const SecretBuilderHub = lazyWithRetry(() => import("./pages/SecretBuilderHub"), "SecretBuilderHub");
const Billing = lazyWithRetry(() => import("./pages/Billing"), "Billing");
const Checkout = lazyWithRetry(() => import("./pages/Checkout"), "Checkout");
const CheckoutSuccess = lazyWithRetry(() => import("./pages/CheckoutSuccess"), "CheckoutSuccess");
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "NotFound");
const CoursePage = lazyWithRetry(() => import("./pages/CoursePage"), "CoursePage");
const LearnPage = lazyWithRetry(() => import("./pages/LearnPage"), "LearnPage");
const MyCourses = lazyWithRetry(() => import("./pages/MyCourses"), "MyCourses");
const CertificatePage = lazyWithRetry(() => import("./pages/CertificatePage"), "CertificatePage");
const StudentDashboard = lazyWithRetry(() => import("./pages/StudentDashboard"), "StudentDashboard");
const CoursesPage = lazyWithRetry(() => import("./pages/CoursesPage"), "CoursesPage");
const CreatorAnalytics = lazyWithRetry(() => import("./pages/CreatorAnalytics"), "CreatorAnalytics");
const CourseDetailAnalytics = lazyWithRetry(() => import("./pages/CourseDetailAnalytics"), "CourseDetailAnalytics");
const PurchaseSuccess = lazyWithRetry(() => import("./pages/PurchaseSuccess"), "PurchaseSuccess");
const Privacy = lazyWithRetry(() => import("./pages/Privacy"), "Privacy");
const Terms = lazyWithRetry(() => import("./pages/Terms"), "Terms");
const About = lazyWithRetry(() => import("./pages/About"), "About");

// Settings pages
const Settings = lazyWithRetry(() => import("./pages/Settings"), "Settings");
const ProfileSettings = lazyWithRetry(() => import("./pages/settings/ProfileSettings"), "ProfileSettings");
const BillingSettings = lazyWithRetry(() => import("./pages/settings/BillingSettings"), "BillingSettings");
const NotificationsSettings = lazyWithRetry(() => import("./pages/settings/NotificationsSettings"), "NotificationsSettings");
const WorkspaceSettings = lazyWithRetry(() => import("./pages/settings/WorkspaceSettings"), "WorkspaceSettings");
const TeamSettings = lazyWithRetry(() => import("./pages/settings/TeamSettings"), "TeamSettings");
const DomainsSettings = lazyWithRetry(() => import("./pages/settings/DomainsSettings"), "DomainsSettings");
const KnowledgeSettings = lazyWithRetry(() => import("./pages/settings/KnowledgeSettings"), "KnowledgeSettings");
const AppearanceSettings = lazyWithRetry(() => import("./pages/settings/AppearanceSettings"), "AppearanceSettings");
const ShortcutsSettings = lazyWithRetry(() => import("./pages/settings/ShortcutsSettings"), "ShortcutsSettings");
const HelpSettings = lazyWithRetry(() => import("./pages/settings/HelpSettings"), "HelpSettings");
const SupportSettings = lazyWithRetry(() => import("./pages/settings/SupportSettings"), "SupportSettings");
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
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/maintenance-request" element={<MaintenanceRequest />} />
        <Route path="/secret-builder-hub" element={<SecretBuilderHub />} />
        <Route path="/secret-builder" element={<SecretBuilder />} />
        <Route path="/secret-builder/:projectId" element={<SecretBuilder />} />
        <Route path="/studio/:projectId" element={<SecretBuilder />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        
        {/* LMS Course Engine - Dynamic Routes */}
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:subdomain" element={<CoursePage />} />
        <Route path="/learn/:slug" element={<LearnPage />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/certificate/:id" element={<CertificatePage />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/analytics" element={<CreatorAnalytics />} />
        <Route path="/dashboard/analytics/:courseId" element={<CourseDetailAnalytics />} />
        
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

export default App;
