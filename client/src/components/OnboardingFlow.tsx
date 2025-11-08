import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Sparkles, Brain } from "lucide-react";

const DOMAINS = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design"
];

interface OnboardingFlowProps {
  onComplete: (data: { domains: string[]; name: string }) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      console.log('Onboarding complete:', { name, selectedDomains });
      onComplete({ domains: selectedDomains, name });
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return selectedDomains.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-12 bg-primary" : s < step ? "w-8 bg-primary/50" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        <Card className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display font-bold text-3xl mb-2">Welcome to SkillPath!</h2>
                <p className="text-muted-foreground">Let's personalize your learning journey</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg"
                  data-testid="input-name"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display font-bold text-3xl mb-2">Choose Your Interests</h2>
                <p className="text-muted-foreground">Select domains you'd like to explore</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {DOMAINS.map((domain) => (
                  <Badge
                    key={domain}
                    variant={selectedDomains.includes(domain) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm hover-elevate"
                    onClick={() => toggleDomain(domain)}
                    data-testid={`domain-${domain.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {domain}
                  </Badge>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-md bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">What's Next?</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll generate a personalized quiz to assess your skill level in the domains you've selected. 
                      This helps us recommend the perfect courses for your learning journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            <Button onClick={handleNext} disabled={!canProceed()} data-testid="button-continue">
              {step === 2 ? "Start Assessment" : "Continue"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}