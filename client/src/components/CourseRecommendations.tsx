import CourseCard from "./CourseCard";
import webDevThumbnail from '@assets/generated_images/Web_development_course_thumbnail_cbc6d31e.png';
import dataScienceThumbnail from '@assets/generated_images/Data_science_course_thumbnail_a43dc243.png';
import mlThumbnail from '@assets/generated_images/Machine_learning_course_thumbnail_908e060f.png';
import mobileThumbnail from '@assets/generated_images/Mobile_development_course_thumbnail_9d7477e2.png';

interface CourseRecommendationsProps {
  skillLevel?: "Beginner" | "Intermediate" | "Advanced";
}

export default function CourseRecommendations({ skillLevel = "Beginner" }: CourseRecommendationsProps) {
  // todo: remove mock functionality
  const courses = [
    {
      title: "Complete Web Development Bootcamp",
      provider: "Udemy",
      duration: "52 hours",
      difficulty: "Beginner" as const,
      price: "Free",
      thumbnail: webDevThumbnail,
      rating: 4.8
    },
    {
      title: "Data Science Fundamentals",
      provider: "Coursera",
      duration: "40 hours",
      difficulty: "Intermediate" as const,
      price: "$49/month",
      thumbnail: dataScienceThumbnail,
      rating: 4.6
    },
    {
      title: "Machine Learning A-Z",
      provider: "edX",
      duration: "60 hours",
      difficulty: "Advanced" as const,
      price: "$299",
      thumbnail: mlThumbnail,
      rating: 4.9
    },
    {
      title: "iOS & Android Development",
      provider: "Udacity",
      duration: "35 hours",
      difficulty: "Intermediate" as const,
      price: "Free",
      thumbnail: mobileThumbnail,
      rating: 4.7
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-semibold text-2xl mb-2">
          Recommended for You
        </h2>
        <p className="text-muted-foreground">
          Based on your {skillLevel} skill level, here are personalized course suggestions
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            {...course}
            onStart={() => console.log('Start course:', course.title)}
          />
        ))}
      </div>
    </div>
  );
}