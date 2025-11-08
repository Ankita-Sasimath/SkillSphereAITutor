import QuizQuestion from '../QuizQuestion';

export default function QuizQuestionExample() {
  return (
    <QuizQuestion
      questionNumber={3}
      totalQuestions={10}
      question="What is the primary purpose of React Hooks?"
      options={[
        "To add styling to components",
        "To use state and other React features in functional components",
        "To create class-based components",
        "To connect to external APIs"
      ]}
      onNext={(answer) => console.log('Answer:', answer)}
      onPrevious={() => console.log('Previous clicked')}
    />
  );
}