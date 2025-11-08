import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  topicBreakdown: { topic: string; correct: number; total: number }[];
  onViewCourses: () => void;
}

export default function QuizResults({
  score,
  totalQuestions,
  skillLevel,
  topicBreakdown,
  onViewCourses
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const levelColors = {
    Beginner: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Intermediate: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    Advanced: "bg-chart-3/10 text-chart-3 border-chart-3/20"
  };

  const getMessage = () => {
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 60) return "Good job!";
    return "Keep learning!";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary" data-testid="quiz-score">
              {percentage}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {score}/{totalQuestions}
            </div>
          </div>
        </div>

        <h2 className="font-display font-bold text-3xl mb-2 text-foreground">
          {getMessage()}
        </h2>
        
        <p className="text-muted-foreground mb-4">
          Based on your performance, you're at a{" "}
          <Badge variant="outline" className={levelColors[skillLevel]} data-testid="skill-level-badge">
            {skillLevel}
          </Badge>
          {" "}level
        </p>

        <Button size="lg" onClick={onViewCourses} data-testid="button-view-courses">
          <TrendingUp className="mr-2 h-5 w-5" />
          View Recommended Courses
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-xl mb-4">Topic Breakdown</h3>
        <div className="space-y-4">
          {topicBreakdown.map((topic, index) => {
            const topicPercentage = Math.round((topic.correct / topic.total) * 100);
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground" data-testid={`topic-name-${index}`}>
                      {topic.topic}
                    </span>
                    <span className="text-sm text-muted-foreground" data-testid={`topic-score-${index}`}>
                      {topic.correct}/{topic.total}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${topicPercentage}%` }}
                    />
                  </div>
                </div>
                {topicPercentage >= 70 ? (
                  <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}