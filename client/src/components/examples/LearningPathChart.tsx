import LearningPathChart from '../LearningPathChart';

export default function LearningPathChartExample() {
  const weeklyData = [
    { week: "Week 1", hours: 8 },
    { week: "Week 2", hours: 12 },
    { week: "Week 3", hours: 10 },
    { week: "Week 4", hours: 15 },
  ];

  return <LearningPathChart data={weeklyData} />;
}