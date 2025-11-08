import DashboardStats from '../DashboardStats';

export default function DashboardStatsExample() {
  return (
    <DashboardStats 
      completedCourses={5}
      inProgressCourses={3}
      totalHours={42}
      skillLevel="Intermediate"
    />
  );
}