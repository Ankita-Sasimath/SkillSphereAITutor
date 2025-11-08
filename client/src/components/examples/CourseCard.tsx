import CourseCard from '../CourseCard';
import webDevThumbnail from '@assets/generated_images/Web_development_course_thumbnail_cbc6d31e.png';

export default function CourseCardExample() {
  return (
    <div className="max-w-sm">
      <CourseCard
        title="Complete Web Development Bootcamp"
        provider="Udemy"
        duration="52 hours"
        difficulty="Beginner"
        price="Free"
        thumbnail={webDevThumbnail}
        rating={4.8}
        onStart={() => console.log('Start course clicked')}
      />
    </div>
  );
}