import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";

interface CourseCardProps {
  title: string;
  provider: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  price: "Free" | string;
  thumbnail: string;
  rating?: number;
  onStart: () => void;
}

export default function CourseCard({
  title,
  provider,
  duration,
  difficulty,
  price,
  thumbnail,
  rating,
  onStart
}: CourseCardProps) {
  const difficultyColor = {
    Beginner: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    Intermediate: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Advanced: "bg-chart-5/10 text-chart-5 border-chart-5/20"
  };

  return (
    <Card className="overflow-hidden hover-elevate transition-all">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover"
          data-testid="course-thumbnail"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2" data-testid="course-title">
            {title}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
              <span data-testid="course-rating">{rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3" data-testid="course-provider">
          {provider}
        </p>
        
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className={difficultyColor[difficulty]} data-testid="course-difficulty">
            {difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span data-testid="course-duration">{duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-foreground" data-testid="course-price">
            {price}
          </span>
          <Button size="sm" onClick={onStart} data-testid="button-start-course">
            Start Learning
          </Button>
        </div>
      </div>
    </Card>
  );
}