import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LandingPage from "./pages/LandingPage";

// Lazy load all non-critical routes for faster initial load
const Pricing = lazy(() => import("./pages/Pricing"));
const DFY = lazy(() => import("./pages/DFY"));
const Operations = lazy(() => import("./pages/Operations"));
const Survey = lazy(() => import("./pages/Survey"));
const SurveyNew = lazy(() => import("./pages/SurveyNew"));
const Results = lazy(() => import("./pages/Results"));
const Booking = lazy(() => import("./pages/Booking"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const MaintenanceRequest = lazy(() => import("./pages/MaintenanceRequest"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Sonner />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* HIDDEN - Uncomment to restore DIY page: <Route path="/diy" element={<Pricing />} /> */}
        <Route path="/dfy" element={<DFY />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/survey-old" element={<Survey />} />
        <Route path="/survey" element={<SurveyNew />} />
        <Route path="/results" element={<Results />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/maintenance-request" element={<MaintenanceRequest />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </QueryClientProvider>
);

export default App;
