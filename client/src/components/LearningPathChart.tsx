import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface LearningPathChartProps {
  data: { week: string; hours: number }[];
}

export default function LearningPathChart({ data }: LearningPathChartProps) {
  const maxHours = Math.max(...data.map(d => d.hours));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-xl mb-1">Learning Activity</h3>
          <p className="text-sm text-muted-foreground">Weekly learning hours</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-chart-3">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">+15% this month</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.hours / maxHours) * 100;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground" data-testid={`week-label-${index}`}>
                  {item.week}
                </span>
                <span className="text-sm text-muted-foreground" data-testid={`week-hours-${index}`}>
                  {item.hours}h
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-chart-1 to-chart-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                  data-testid={`week-bar-${index}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}