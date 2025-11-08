import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, FileQuestion, Plus } from "lucide-react";

interface ScheduleItem {
  id: string;
  title: string;
  course: string;
  type: "quiz" | "module" | "review";
  date: string;
  time: string;
  duration: string;
}

interface ScheduleViewProps {
  items: ScheduleItem[];
  onAddSchedule?: () => void;
}

export default function ScheduleView({ items, onAddSchedule }: ScheduleViewProps) {
  const typeIcons = {
    quiz: FileQuestion,
    module: BookOpen,
    review: Calendar
  };

  const typeColors = {
    quiz: "bg-chart-5/10 text-chart-5 border-chart-5/20",
    module: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    review: "bg-chart-4/10 text-chart-4 border-chart-4/20"
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-xl">Your Schedule</h3>
        {onAddSchedule && (
          <Button size="sm" variant="outline" onClick={onAddSchedule} data-testid="button-add-schedule">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No scheduled activities yet</p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-md border hover-elevate transition-all"
                data-testid={`schedule-item-${item.id}`}
              >
                <div className="p-2 rounded-md bg-primary/10 flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-foreground" data-testid={`schedule-title-${item.id}`}>
                      {item.title}
                    </h4>
                    <Badge variant="outline" className={typeColors[item.type]} data-testid={`schedule-type-${item.id}`}>
                      {item.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2" data-testid={`schedule-course-${item.id}`}>
                    {item.course}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span data-testid={`schedule-date-${item.id}`}>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span data-testid={`schedule-time-${item.id}`}>{item.time}</span>
                    </div>
                    <span data-testid={`schedule-duration-${item.id}`}>{item.duration}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}