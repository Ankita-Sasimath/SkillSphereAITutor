import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";
import DomainSelection from "@/components/DomainSelection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AssessmentPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizData, setQuizData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showDomainSelection, setShowDomainSelection] = useState(true);

  // Get user data from localStorage (set during onboarding)
  const userId = localStorage.getItem('userId') || 'demo-user-123';
  const selectedDomains = JSON.parse(localStorage.getItem('selectedDomains') || '["Web Development"]');

  // Generate quiz for selected domain
  const generateQuizMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiRequest('POST', '/api/quiz/generate', {
        domains: [domain],
        userId
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setQuizData(data);
      setUserAnswers(new Array(data.questions.length).fill(-1));
      setShowDomainSelection(false);
    },
  });

  // Submit quiz answers
  const submitQuizMutation = useMutation({
    mutationFn: async (answers: number[]) => {
      const res = await apiRequest('POST', '/api/quiz/submit', {
        userId,
        domain: quizData.domain,
        questions: quizData.questions,
        answers
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setQuizResults(data);
      setShowResults(true);
      // Invalidate and refetch skills query to show updated skill levels in Dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'skills'] });
      // Also invalidate course recommendations since they depend on skill levels
      queryClient.invalidateQueries({ queryKey: ['/api/courses/recommendations'] });
    },
  });

  // Handle domain selection
  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    generateQuizMutation.mutate(domain);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit quiz
      submitQuizMutation.mutate(userAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleViewCourses = () => {
    // Store results in localStorage for course recommendation page
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    navigate('/courses');
  };

  const handleRetakeQuiz = () => {
    // Reset quiz state and go back to domain selection
    setQuizData(null);
    setShowResults(false);
    setQuizResults(null);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setSelectedDomain(null);
    setShowDomainSelection(true);
  };

  // Show domain selection if no domain is selected
  // Always show ALL available domains, not just from onboarding
  if (showDomainSelection && !generateQuizMutation.isPending) {
    return (
      <DashboardLayout userName="User">
        <DomainSelection
          availableDomains={selectedDomains}
          onSelectDomain={handleDomainSelect}
          showAllDomains={true}
          title="Choose a Domain for Assessment"
          description="Select a domain to take a skill assessment quiz"
        />
      </DashboardLayout>
    );
  }

  if (generateQuizMutation.isPending) {
    return (
      <DashboardLayout userName="User">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="font-display font-bold text-2xl mb-2">Generating Your Assessment</h2>
            <p className="text-muted-foreground mb-4">
              Our AI is creating a personalized quiz for {selectedDomain || selectedDomains[0]}...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (generateQuizMutation.isError) {
    return (
      <DashboardLayout userName="User">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <h2 className="font-display font-bold text-2xl mb-2 text-destructive">Error</h2>
            <p className="text-muted-foreground mb-4">
              Failed to generate quiz. Please try again.
            </p>
            <Button onClick={() => setShowDomainSelection(true)}>
              Go Back to Domain Selection
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (showResults && quizResults) {
    return (
      <DashboardLayout userName="User">
        <QuizResults
          score={quizResults.score}
          totalQuestions={quizResults.totalQuestions}
          skillLevel={quizResults.skillLevel}
          domain={quizData.domain}
          results={quizResults.results || []}
          onViewCourses={handleViewCourses}
          onRetakeQuiz={handleRetakeQuiz}
        />
      </DashboardLayout>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return null;
  }

  const currentQ = quizData.questions[currentQuestion];
  const canProceed = userAnswers[currentQuestion] !== -1;

  return (
    <DashboardLayout userName="User">
      <QuizQuestion
        questionNumber={currentQuestion + 1}
        totalQuestions={quizData.questions.length}
        question={currentQ.question}
        options={currentQ.options}
        selectedAnswer={userAnswers[currentQuestion]}
        onSelectAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={currentQuestion > 0 ? handlePrevious : undefined}
        canProceed={canProceed}
        isSubmitting={submitQuizMutation.isPending}
      />
    </DashboardLayout>
  );
}