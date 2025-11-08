import { Card } from "@/components/ui/card";
import { Award, BookOpen, Clock, TrendingUp } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  testId: string;
}

function StatCard({ icon, label, value, trend, testId }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-md bg-primary/10">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-chart-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground mb-1" data-testid={testId}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

interface DashboardStatsProps {
  completedCourses: number;
  inProgressCourses: number;
  totalHours: number;
  skillLevel: string;
}

export default function DashboardStats({ 
  completedCourses, 
  inProgressCourses, 
  totalHours, 
  skillLevel 
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        label="Courses in Progress"
        value={inProgressCourses.toString()}
        testId="stat-courses-progress"
      />
      <StatCard
        icon={<Award className="h-5 w-5 text-primary" />}
        label="Completed Courses"
        value={completedCourses.toString()}
        trend="+2 this month"
        testId="stat-courses-completed"
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-primary" />}
        label="Learning Hours"
        value={`${totalHours}h`}
        trend="+8h this week"
        testId="stat-learning-hours"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        label="Current Level"
        value={skillLevel}
        testId="stat-skill-level"
      />
    </div>
  );
}