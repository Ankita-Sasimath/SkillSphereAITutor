import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  selectedAnswer?: number;
  onSelectAnswer?: (index: number) => void;
  onNext: (answer?: string) => void;
  onPrevious?: () => void;
  canProceed?: boolean;
  isSubmitting?: boolean;
}

export default function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedAnswer: propSelectedAnswer,
  onSelectAnswer,
  onNext,
  onPrevious,
  canProceed = true,
  isSubmitting = false
}: QuizQuestionProps) {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string>("");
  
  const selectedAnswer = propSelectedAnswer !== undefined ? propSelectedAnswer : -1;
  
  const handleAnswerChange = (value: string) => {
    const index = options.indexOf(value);
    if (onSelectAnswer) {
      onSelectAnswer(index);
    } else {
      setLocalSelectedAnswer(value);
    }
  };

  const handleNext = () => {
    if (onSelectAnswer) {
      onNext();
    } else if (localSelectedAnswer) {
      onNext(localSelectedAnswer);
      setLocalSelectedAnswer("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground" data-testid="question-number">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-8 mb-6">
        <h2 className="font-display font-semibold text-2xl mb-8 text-foreground" data-testid="question-text">
          {question}
        </h2>

        <RadioGroup 
          value={selectedAnswer >= 0 ? options[selectedAnswer] : localSelectedAnswer} 
          onValueChange={handleAnswerChange}
        >
          <div className="space-y-3">
            {options.map((option, index) => (
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className="flex items-center gap-3 p-4 rounded-md border cursor-pointer hover-elevate transition-all"
                data-testid={`option-${index}`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <span className="text-base">{option}</span>
              </Label>
            ))}
          </div>
        </RadioGroup>
      </Card>

      <div className="flex items-center justify-between">
        {onPrevious ? (
          <Button variant="outline" onClick={onPrevious} data-testid="button-previous">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div />
        )}
        
        <Button 
          onClick={handleNext} 
          disabled={!canProceed || isSubmitting}
          data-testid="button-next"
        >
          {isSubmitting ? "Submitting..." : questionNumber === totalQuestions ? "Submit Quiz" : "Next Question"}
          {!isSubmitting && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}