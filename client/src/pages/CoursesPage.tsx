import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Star, 
  ExternalLink, 
  Filter, 
  Search, 
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Loader2,
  Target,
  Trophy
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  provider: string;
  url: string;
  domain: string;
  skillLevel: string;
  price: number;
  rating: number;
  duration: string;
  description: string;
  isFree: boolean;
  courseId?: string; // For enrolled courses from database
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { toast } = useToast();

  const userId = localStorage.getItem('userId') || 'demo-user-123';
  const userName = localStorage.getItem('userName') || 'User';
  const selectedDomains = JSON.parse(localStorage.getItem('selectedDomains') || '[]');

  // Fetch user skill levels
  const { data: skillLevels = {} } = useQuery<Record<string, string>>({
    queryKey: ['/api/user', userId, 'skills'],
    enabled: !!userId,
  });

  // Fetch recommended courses
  const { data: coursesData, isLoading } = useQuery<{ courses: Course[] }>({
    queryKey: selectedDomain 
      ? ['/api/courses/recommendations', userId, selectedDomain]
      : ['/api/courses/recommendations', userId],
    enabled: !!userId,
  });

  // Fetch enrolled courses
  const { data: enrolledCoursesData, isLoading: isLoadingEnrolled } = useQuery<{ courses: Course[] }>({
    queryKey: ['enrolledCourses', userId],
    enabled: !!userId,
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (course: Course) => {
      const res = await apiRequest('POST', '/api/courses/enroll', {
        userId,
        courseId: course.id,
        title: course.title,
        provider: course.provider,
        url: course.url,
        domain: course.domain,
        isPaid: !course.isFree,
        // Include all course details for proper display after enrollment
        description: course.description,
        skillLevel: course.skillLevel,
        duration: course.duration,
        rating: course.rating,
        price: course.price,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'enrolled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses/recommendations'] });
      toast({
        title: "Enrolled successfully!",
        description: "Course added to your learning path",
      });
    },
  });

  const courses = coursesData?.courses || [];
  const enrolledCourses = enrolledCoursesData?.courses || [];
  
  // Helper to check if course is enrolled
  const isEnrolledCourse = (courseId: string) => {
    return enrolledCourses.some(ec => ec.courseId === courseId);
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (course.provider?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesDomain = !selectedDomain || course.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const filteredEnrolledCourses = enrolledCourses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (course.provider?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesDomain = !selectedDomain || course.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  // Separate free and paid courses
  const freeCourses = filteredCourses.filter(c => c.isFree);
  const paidCourses = filteredCourses.filter(c => !c.isFree);

  const CourseCard = ({ course, isEnrolled = false }: { course: Course; isEnrolled?: boolean }) => {
    const skillLevel = skillLevels[course.domain] || 'Not assessed';
    
    return (
      <div className="glass-card p-6 rounded-2xl neon-border group">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors" data-testid={`course-title-${course.id}`}>
                {course.title}
              </h3>
              {course.isFree && (
                <Badge variant="outline" className="bg-chart-3/20 text-chart-3 border-chart-3/40 backdrop-blur-sm flex-shrink-0">
                  Free
                </Badge>
              )}
              {isEnrolled && (
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 backdrop-blur-sm flex-shrink-0 animate-pulse-neon">
                  Enrolled
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {course.provider}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 backdrop-blur-sm">
            {course.skillLevel}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            {course.rating}
          </div>
          {!course.isFree && (
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <DollarSign className="h-4 w-4" />
              {course.price}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isEnrolled && (
            <Button
              className="flex-1 glow-primary"
              onClick={() => enrollMutation.mutate(course)}
              disabled={enrollMutation.isPending}
              data-testid={`button-enroll-${course.id}`}
            >
              {enrollMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Enroll Now
            </Button>
          )}
          <Button
            variant={isEnrolled ? "default" : "outline"}
            size={isEnrolled ? "default" : "icon"}
            className={isEnrolled ? "flex-1 glow-primary" : ""}
            onClick={() => {
              if (isEnrolled) {
                // Just navigate to course for enrolled courses
                window.open(course.url, '_blank', 'noopener,noreferrer');
              }
            }}
            data-testid={`button-view-course-${course.id}`}
          >
            {isEnrolled ? (
              <>
                <ExternalLink className="h-4 w-4" />
                <span className="ml-2">Continue Learning</span>
              </>
            ) : (
              <a href={course.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-3xl mb-2" data-testid="page-title">
            Course Recommendations
          </h1>
          <p className="text-muted-foreground">
            Personalized courses based on your skill assessments
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-courses"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedDomain === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDomain(null)}
              data-testid="filter-all"
            >
              All Domains
            </Button>
            {selectedDomains.map((domain: string) => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDomain(domain)}
                data-testid={`filter-${domain.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {domain}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Tabs */}
        <Tabs defaultValue="enrolled" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="enrolled" className="flex-1 sm:flex-none" data-testid="tab-enrolled-courses">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              My Courses ({enrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger value="free" className="flex-1 sm:flex-none" data-testid="tab-free-courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Free ({freeCourses.length})
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex-1 sm:flex-none" data-testid="tab-paid-courses">
              <TrendingUp className="h-4 w-4 mr-2" />
              Premium ({paidCourses.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 sm:flex-none" data-testid="tab-all-courses">
              All ({filteredCourses.length})
            </TabsTrigger>
          </TabsList>

          {isLoading || isLoadingEnrolled ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="enrolled" className="mt-6">
          {filteredEnrolledCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No enrolled courses yet</p>
              <p className="text-sm text-muted-foreground">Browse recommended courses below and enroll to start learning!</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Enrolled Courses Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    My Enrolled Courses ({filteredEnrolledCourses.length})
                  </CardTitle>
                  <CardDescription>
                    Track your learning journey across all enrolled courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEnrolledCourses.map((course: any) => (
                      <div key={course.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm leading-tight mb-1">
                              {course.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {course.provider}
                            </p>
                          </div>
                          <Badge variant={course.completed ? "default" : "secondary"} className="text-xs">
                            {course.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-foreground/80 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {course.domain}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {course.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                            {course.duration}
                          </Badge>
                          {course.isFree && (
                            <Badge variant="outline" className="text-xs bg-chart-3/20 text-chart-3 border-chart-3/40">
                              Free
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => window.open(course.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Course
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Details List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Course Details
                  </CardTitle>
                  <CardDescription>
                    Detailed information about your enrolled courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEnrolledCourses.map((course: any, index: number) => (
                      <div key={course.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-muted-foreground">{course.provider}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={course.completed ? "default" : "secondary"}>
                              {course.completed ? "Completed" : "In Progress"}
                            </Badge>
                            {course.isFree && (
                              <Badge variant="outline" className="bg-chart-3/20 text-chart-3 border-chart-3/40">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-foreground/80">{course.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Domain:</span>
                            <p className="font-medium">{course.domain}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Level:</span>
                            <p className="font-medium">{course.level}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-medium">{course.duration}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium">{course.completed ? "Completed" : "Active"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(course.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

              <TabsContent value="free" className="mt-6">
                {freeCourses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No free courses found matching your criteria</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freeCourses.map(course => (
                      <CourseCard key={course.id} course={course} isEnrolled={isEnrolledCourse(course.id)} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="paid" className="mt-6">
                {paidCourses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No premium courses found matching your criteria</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paidCourses.map(course => (
                      <CourseCard key={course.id} course={course} isEnrolled={isEnrolledCourse(course.id)} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                {filteredCourses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No courses found matching your criteria</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                      <CourseCard key={course.id} course={course} isEnrolled={isEnrolledCourse(course.id)} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
