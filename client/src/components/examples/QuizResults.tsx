import QuizResults from '../QuizResults';

export default function QuizResultsExample() {
  return (
    <QuizResults
      score={7}
      totalQuestions={10}
      skillLevel="Intermediate"
      topicBreakdown={[
        { topic: "React Fundamentals", correct: 4, total: 4 },
        { topic: "Hooks & State", correct: 2, total: 3 },
        { topic: "Component Design", correct: 1, total: 3 }
      ]}
      onViewCourses={() => console.log('View courses clicked')}
    />
  );
}