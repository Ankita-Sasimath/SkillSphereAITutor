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
        <OnboardingFlow onComplete={async (data) => {
          try {
            console.log('Onboarding complete:', data);
            
            // Save user to backend
            const response = await fetch('/api/user/onboard', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: data.name, domains: data.domains })
            });
            
            if (!response.ok) throw new Error('Failed to onboard user');
            
            const result = await response.json();
            
            // Store user data
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('selectedDomains', JSON.stringify(data.domains));
            localStorage.setItem('userName', data.name);
            
            window.location.href = '/assessments';
          } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to complete onboarding. Please try again.');
          }
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