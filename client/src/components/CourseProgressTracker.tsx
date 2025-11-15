import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  PlayCircle, 
  PauseCircle,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";
import { useState } from "react";

interface CourseProgressTrackerProps {
  courses: Array<{
    id: string;
    title: string;
    provider: string;
    domain: string;
    progress: number;
    completed: boolean;
    enrolledAt: string;
    lastAccessedAt?: string;
    duration: string;
    rating: number;
    url: string;
    skillLevel: string;
    description?: string;
    isPaid: boolean;
    price?: number;
  }>;
  onUpdateProgress?: (courseId: string, progress: number) => void;
}

export default function CourseProgressTracker({ 
  courses, 
  onUpdateProgress 
}: CourseProgressTrackerProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const getStatusIcon = (course: any) => {
    if (course.completed) {
      return <CheckCircle2 className="h-4 w-4 text-chart-3" />;
    }
    if (course.progress > 0) {
      return <PlayCircle className="h-4 w-4 text-primary" />;
    }
    return <PauseCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = (course: any) => {
    if (course.completed) {
      return "Completed";
    }
    if (course.progress > 0) {
      return `In Progress (${course.progress}%)`;
    }
    return "Not Started";
  };

  const getStatusColor = (course: any) => {
    if (course.completed) {
      return "bg-chart-3/10 text-chart-3 border-chart-3/20";
    }
    if (course.progress > 0) {
      return "bg-primary/10 text-primary border-primary/20";
    }
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getProgressDetails = (course: any) => {
    if (course.completed) {
      return {
        message: `🎉 Congratulations! You completed this course on ${formatDate(course.lastAccessedAt || course.enrolledAt)}`,
        color: "text-chart-3",
        bgColor: "bg-chart-3/5"
      };
    }
    if (course.progress > 0) {
      const lastAccessed = course.lastAccessedAt ? formatDate(course.lastAccessedAt) : formatDate(course.enrolledAt);
      return {
        message: `📚 You're ${course.progress}% through this course. Last accessed: ${lastAccessed}`,
        color: "text-primary",
        bgColor: "bg-primary/5"
      };
    }
    return {
      message: `📋 Enrolled on ${formatDate(course.enrolledAt)}. Ready to start learning!`,
      color: "text-muted-foreground",
      bgColor: "bg-muted/5"
    };
  };

  const sortedCourses = [...courses].sort((a, b) => {
    // Sort by: in-progress > completed > not started, then by progress
    if (a.progress > 0 && !a.completed && (b.progress === 0 || b.completed)) return -1;
    if (b.progress > 0 && !b.completed && (a.progress === 0 || a.completed)) return 1;
    if (a.completed && !b.completed) return 1;
    if (b.completed && !a.completed) return -1;
    return b.progress - a.progress;
  });

  if (courses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <PlayCircle className="h-12 w-12 mx-auto mb-4" />
          <p>No courses enrolled yet</p>
          <p className="text-sm">Start by enrolling in courses from the recommendations page!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{courses.length}</div>
          <div className="text-sm text-muted-foreground">Total Courses</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-chart-3">
            {courses.filter(c => c.completed).length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {courses.filter(c => c.progress > 0 && !c.completed).length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">
            {Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Progress</div>
        </Card>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {sortedCourses.map((course) => {
          const progressDetails = getProgressDetails(course);
          const isSelected = selectedCourse === course.id;
          
          return (
            <Card 
              key={course.id} 
              className={`p-6 transition-all cursor-pointer hover-elevate ${
                isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              }`}
              onClick={() => setSelectedCourse(isSelected ? null : course.id)}
            >
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(course)}
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{course.provider}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getStatusColor(course)}>
                      {getStatusText(course)}
                    </Badge>
                    <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                      {course.domain}
                    </Badge>
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                      {course.skillLevel}
                    </Badge>
                    {course.isPaid && (
                      <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                        ${course.price}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      {course.rating}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm font-bold text-primary">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              {/* Progress Details */}
              <div className={`p-3 rounded-md ${progressDetails.bgColor} ${progressDetails.color} text-sm`}>
                {progressDetails.message}
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Enrolled:</span>
                      <div className="font-medium">{formatDate(course.enrolledAt)}</div>
                    </div>
                    {course.lastAccessedAt && (
                      <div>
                        <span className="text-muted-foreground">Last Accessed:</span>
                        <div className="font-medium">{formatDate(course.lastAccessedAt)}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{course.duration}</div>
                    </div>
                  </div>
                  
                  {course.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="text-sm mt-1">{course.description}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    {!course.completed && course.progress < 100 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newProgress = Math.min(100, course.progress + 10);
                          onUpdateProgress?.(course.id, newProgress);
                        }}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Update Progress
                      </Button>
                    )}
                    {course.completed && (
                      <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                        <Award className="h-4 w-4 mr-1" />
                        Course Completed
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
