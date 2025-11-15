import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  Clock, 
  Star, 
  TrendingUp,
  Award,
  PlayCircle,
  PauseCircle
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  provider: string;
  domain: string;
  progress: number;
  completed: boolean;
  skillLevel: string;
  rating: number;
  duration: string;
  enrolledAt: string;
  lastAccessedAt?: string;
}

interface CourseQuizSelectionProps {
  courses: Course[];
  userSkills: Record<string, string>;
  onSelectQuiz: (type: 'course' | 'domain', selection: string) => void;
  onBack?: () => void;
}

export default function CourseQuizSelection({ 
  courses, 
  userSkills, 
  onSelectQuiz,
  onBack 
}: CourseQuizSelectionProps) {
  const [selectedQuizType, setSelectedQuizType] = useState<'course' | 'domain'>('course');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  // Group courses by domain
  const coursesByDomain = courses.reduce((acc, course) => {
    if (!acc[course.domain]) {
      acc[course.domain] = [];
    }
    acc[course.domain].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Get unique domains from courses
  const availableDomains = Object.keys(coursesByDomain);

  // Get domains with completed courses
  const completedDomains = Object.entries(coursesByDomain)
    .filter(([_, courses]) => courses.some(c => c.completed))
    .map(([domain]) => domain);

  // Get domains with in-progress courses
  const inProgressDomains = Object.entries(coursesByDomain)
    .filter(([_, courses]) => courses.some(c => c.progress > 0 && !c.completed))
    .map(([domain]) => domain);

  const getStatusIcon = (course: Course) => {
    if (course.completed) {
      return <CheckCircle2 className="h-4 w-4 text-chart-3" />;
    }
    if (course.progress > 0) {
      return <PlayCircle className="h-4 w-4 text-primary" />;
    }
    return <PauseCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getQuizRecommendation = (course: Course) => {
    if (course.completed) {
      return {
        text: "Test your knowledge",
        color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
        description: "See how well you mastered this course material"
      };
    }
    if (course.progress >= 50) {
      return {
        text: "Check your progress",
        color: "bg-primary/10 text-primary border-primary/20",
        description: "Assess your understanding of the covered material"
      };
    }
    if (course.progress > 0) {
      return {
        text: "Quick check-in",
        color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
        description: "Test your knowledge of the basics"
      };
    }
    return {
      text: "Pre-assessment",
      color: "bg-muted/10 text-muted-foreground border-muted/20",
      description: "See what you already know about this topic"
    };
  };

  const handleStartQuiz = () => {
    if (selectedQuizType === 'course' && selectedCourse) {
      onSelectQuiz('course', selectedCourse);
    } else if (selectedQuizType === 'domain' && selectedDomain) {
      onSelectQuiz('domain', selectedDomain);
    }
  };

  const canStartQuiz = selectedQuizType === 'course' ? selectedCourse : selectedDomain;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Choose Your Quiz</h1>
        <p className="text-muted-foreground">
          Take a quiz based on your enrolled courses or test your domain knowledge
        </p>
      </div>

      {/* Quiz Type Selection */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Quiz Type</h2>
        <RadioGroup 
          value={selectedQuizType} 
          onValueChange={(value) => setSelectedQuizType(value as 'course' | 'domain')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Label
              htmlFor="quiz-course"
              className="flex items-center gap-3 p-4 rounded-md border cursor-pointer hover-elevate transition-all"
            >
              <RadioGroupItem value="course" id="quiz-course" />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Course-Based Quiz
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Test your knowledge of specific course material
                </p>
              </div>
            </Label>

            <Label
              htmlFor="quiz-domain"
              className="flex items-center gap-3 p-4 rounded-md border cursor-pointer hover-elevate transition-all"
            >
              <RadioGroupItem value="domain" id="quiz-domain" />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium">
                  <Brain className="h-5 w-5 text-chart-2" />
                  Domain Assessment
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Evaluate your overall skill level in a domain
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Course Selection */}
      {selectedQuizType === 'course' && (
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Select a Course</h2>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>No courses enrolled yet</p>
              <p className="text-sm">Enroll in courses first to take course-specific quizzes</p>
            </div>
          ) : (
            <RadioGroup value={selectedCourse} onValueChange={setSelectedCourse}>
              <div className="space-y-4">
                {courses.map((course) => {
                  const recommendation = getQuizRecommendation(course);
                  return (
                    <Label
                      key={course.id}
                      htmlFor={`course-${course.id}`}
                      className="flex items-start gap-3 p-4 rounded-md border cursor-pointer hover-elevate transition-all"
                    >
                      <RadioGroupItem value={course.id} id={`course-${course.id}`} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(course)}
                              <h3 className="font-medium">{course.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{course.provider}</p>
                          </div>
                          <Badge variant="outline" className={recommendation.color}>
                            {recommendation.text}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                            {course.domain}
                          </Badge>
                          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                            {course.skillLevel}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-yellow-400" />
                            {course.rating}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {recommendation.description}
                        </p>
                        
                        {course.progress > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progress</span>
                              <span className="text-xs font-medium">{course.progress}%</span>
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Label>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </Card>
      )}

      {/* Domain Selection */}
      {selectedQuizType === 'domain' && (
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Select a Domain</h2>
          {availableDomains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4" />
              <p>No domains available</p>
              <p className="text-sm">Enroll in courses to unlock domain assessments</p>
            </div>
          ) : (
            <RadioGroup value={selectedDomain} onValueChange={setSelectedDomain}>
              <div className="space-y-4">
                {availableDomains.map((domain) => {
                  const domainCourses = coursesByDomain[domain];
                  const completedCount = domainCourses.filter(c => c.completed).length;
                  const inProgressCount = domainCourses.filter(c => c.progress > 0 && !c.completed).length;
                  const userSkillLevel = userSkills[domain];
                  
                  return (
                    <Label
                      key={domain}
                      htmlFor={`domain-${domain}`}
                      className="flex items-start gap-3 p-4 rounded-md border cursor-pointer hover-elevate transition-all"
                    >
                      <RadioGroupItem value={domain} id={`domain-${domain}`} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{domain}</h3>
                          <div className="flex gap-2">
                            {userSkillLevel && (
                              <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                                {userSkillLevel}
                              </Badge>
                            )}
                            {completedCount > 0 && (
                              <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                                <Award className="h-3 w-3 mr-1" />
                                {completedCount} completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {domainCourses.length} course{domainCourses.length !== 1 ? 's' : ''} enrolled
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {completedCount > 0 && (
                            <span>
                              <CheckCircle2 className="h-3 w-3 inline mr-1 text-chart-3" />
                              {completedCount} completed
                            </span>
                          )}
                          {inProgressCount > 0 && (
                            <span>
                              <PlayCircle className="h-3 w-3 inline mr-1 text-primary" />
                              {inProgressCount} in progress
                            </span>
                          )}
                          <span>
                            <Brain className="h-3 w-3 inline mr-1" />
                            Test your overall {domain} knowledge
                          </span>
                        </div>
                      </div>
                    </Label>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        )}
        <div className="flex-1" />
        <Button 
          size="lg"
          onClick={handleStartQuiz}
          disabled={!canStartQuiz}
          className="glow-primary"
        >
          <Brain className="h-5 w-5 mr-2" />
          Start Quiz
        </Button>
      </div>
    </div>
  );
}
