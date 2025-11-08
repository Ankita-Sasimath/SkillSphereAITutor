import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import AssessmentPage from "@/pages/AssessmentPage";
import OnboardingFlow from "@/components/OnboardingFlow";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/onboarding" component={() => (
        <OnboardingFlow onComplete={(data) => {
          console.log('Onboarding complete:', data);
          window.location.href = '/dashboard';
        }} />
      )} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assessments" component={AssessmentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;