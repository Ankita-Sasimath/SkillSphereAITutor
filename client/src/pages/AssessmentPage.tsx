import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // todo: remove mock functionality
  const questions = [
    {
      question: "What is the primary purpose of React Hooks?",
      options: [
        "To add styling to components",
        "To use state and other React features in functional components",
        "To create class-based components",
        "To connect to external APIs"
      ]
    },
    {
      question: "Which hook is used for side effects in React?",
      options: [
        "useState",
        "useEffect",
        "useContext",
        "useReducer"
      ]
    },
  ];

  const handleNext = (answer: string) => {
    console.log('Answer:', answer);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    return (
      <DashboardLayout userName="Alex Johnson">
        <QuizResults
          score={7}
          totalQuestions={10}
          skillLevel="Intermediate"
          topicBreakdown={[
            { topic: "React Fundamentals", correct: 4, total: 4 },
            { topic: "Hooks & State", correct: 2, total: 3 },
            { topic: "Component Design", correct: 1, total: 3 }
          ]}
          onViewCourses={() => console.log('View courses')}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Alex Johnson">
      <QuizQuestion
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        question={questions[currentQuestion].question}
        options={questions[currentQuestion].options}
        onNext={handleNext}
        onPrevious={currentQuestion > 0 ? handlePrevious : undefined}
      />
    </DashboardLayout>
  );
}