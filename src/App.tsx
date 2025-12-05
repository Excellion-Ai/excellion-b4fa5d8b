import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy load all non-critical routes for faster initial load
const Pricing = lazy(() => import("./pages/Pricing"));
const DFY = lazy(() => import("./pages/DFY"));
const Operations = lazy(() => import("./pages/Operations"));
const Survey = lazy(() => import("./pages/Survey"));
const BookCall = lazy(() => import("./pages/BookCall"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const MaintenanceRequest = lazy(() => import("./pages/MaintenanceRequest"));
const BotExperiment = lazy(() => import("./pages/BotExperiment"));
const WebBuilderHome = lazy(() => import("./pages/WebBuilderHome"));
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
        <Route path="/" element={<Index />} />
        {/* HIDDEN - Uncomment to restore DIY page: <Route path="/diy" element={<Pricing />} /> */}
        <Route path="/dfy" element={<DFY />} />
        {/* HIDDEN - Uncomment to restore Operations page: <Route path="/operations" element={<Operations />} /> */}
        <Route path="/survey" element={<Survey />} />
        <Route path="/book-call" element={<BookCall />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/maintenance-request" element={<MaintenanceRequest />} />
        <Route path="/bot-experiment" element={<BotExperiment />} />
        <Route path="/web-builder" element={<WebBuilderHome />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </QueryClientProvider>
);

export default App;
