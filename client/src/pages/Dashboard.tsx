import DashboardLayout from "@/components/DashboardLayout";
import DashboardStats from "@/components/DashboardStats";
import SkillProgress from "@/components/SkillProgress";
import CourseRecommendations from "@/components/CourseRecommendations";
import ScheduleView from "@/components/ScheduleView";
import LearningPathChart from "@/components/LearningPathChart";
import AIChatbot from "@/components/AIChatbot";

export default function Dashboard() {
  // todo: remove mock functionality
  const skills = [
    { name: "Web Development", level: 75, category: "Frontend" },
    { name: "Data Analysis", level: 60, category: "Analytics" },
    { name: "Machine Learning", level: 45, category: "AI/ML" },
  ];

  const weeklyData = [
    { week: "Week 1", hours: 8 },
    { week: "Week 2", hours: 12 },
    { week: "Week 3", hours: 10 },
    { week: "Week 4", hours: 15 },
  ];

  const scheduleItems = [
    {
      id: "1",
      title: "React Fundamentals Quiz",
      course: "Complete Web Development",
      type: "quiz" as const,
      date: "Nov 15, 2025",
      time: "2:00 PM",
      duration: "30 mins"
    },
    {
      id: "2",
      title: "Advanced Hooks Module",
      course: "Complete Web Development",
      type: "module" as const,
      date: "Nov 16, 2025",
      time: "10:00 AM",
      duration: "1 hour"
    },
  ];

  return (
    <DashboardLayout userName="Alex Johnson">
      <div className="space-y-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-2">Welcome back, Alex! 👋</h1>
          <p className="text-muted-foreground">Here's your learning progress overview</p>
        </div>

        <DashboardStats
          completedCourses={5}
          inProgressCourses={3}
          totalHours={42}
          skillLevel="Intermediate"
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LearningPathChart data={weeklyData} />
            <CourseRecommendations skillLevel="Intermediate" />
          </div>
          
          <div className="space-y-6">
            <SkillProgress skills={skills} />
            <ScheduleView items={scheduleItems} />
          </div>
        </div>
      </div>

      <AIChatbot />
    </DashboardLayout>
  );
}