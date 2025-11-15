import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight } from "lucide-react";

const DOMAINS = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design",
  "IoT (Internet of Things)",
  "Space Technology",
  "Hardware"
];

interface DomainSelectionProps {
  availableDomains?: string[]; // Optional - if not provided, shows all domains
  onSelectDomain: (domain: string) => void;
  title?: string;
  description?: string;
  showAllDomains?: boolean; // If true, shows all domains regardless of availableDomains
}

export default function DomainSelection({
  availableDomains = [],
  onSelectDomain,
  title = "Choose a Domain for Assessment",
  description = "Select a domain to take a skill assessment quiz",
  showAllDomains = true // Default to showing all domains
}: DomainSelectionProps) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Use all domains if showAllDomains is true, otherwise use availableDomains
  const domainsToShow = showAllDomains ? DOMAINS : (availableDomains.length > 0 ? availableDomains : DOMAINS);

  const handleContinue = () => {
    if (selectedDomain) {
      onSelectDomain(selectedDomain);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-3xl mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {domainsToShow.map((domain) => (
            <Badge
              key={domain}
              variant={selectedDomain === domain ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm hover-elevate transition-all ${
                selectedDomain === domain ? "glow-primary" : ""
              }`}
              onClick={() => setSelectedDomain(domain)}
              data-testid={`domain-${domain.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {domain}
            </Badge>
          ))}
        </div>

        {domainsToShow.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No domains available. Please complete onboarding first.
            </p>
            <Button onClick={() => window.location.href = '/onboarding'}>
              Go to Onboarding
            </Button>
          </div>
        )}

        <div className="flex items-center justify-end mt-8 pt-6 border-t">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedDomain}
            size="lg"
            className="glow-primary"
            data-testid="button-start-quiz"
          >
            Start Quiz
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

