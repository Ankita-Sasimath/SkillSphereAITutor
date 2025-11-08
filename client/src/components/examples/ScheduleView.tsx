import ScheduleView from '../ScheduleView';

export default function ScheduleViewExample() {
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
    {
      id: "3",
      title: "Week 2 Review Session",
      course: "Data Science Fundamentals",
      type: "review" as const,
      date: "Nov 17, 2025",
      time: "4:00 PM",
      duration: "45 mins"
    }
  ];

  return (
    <ScheduleView 
      items={scheduleItems}
      onAddSchedule={() => console.log('Add schedule clicked')}
    />
  );
}