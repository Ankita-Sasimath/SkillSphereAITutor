import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Target,
  ArrowRight,
  FileQuestion,
  Calendar,
  MessageCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trophy,
  Brain
} from "lucide-react";
import webDevImage from "@assets/generated_images/Web_development_course_thumbnail_cbc6d31e.png?url";
import mobileDevImage from "@assets/generated_images/Mobile_development_course_thumbnail_9d7477e2.png?url";
import dataScienceImage from "@assets/generated_images/Data_science_course_thumbnail_a43dc243.png?url";
import machineLearningImage from "@assets/generated_images/Machine_learning_course_thumbnail_908e060f.png?url";
import iotImage from "@assets/stock_images/iot_internet_of_thin_36bc4020.jpg?url";

export default function Dashboard() {
  const [enrolledCoursesOpen, setEnrolledCoursesOpen] = useState(false);
  const userId = localStorage.getItem('userId') || 'demo-user-123';
  const userName = localStorage.getItem('userName') || 'User';
  const selectedDomains = JSON.parse(localStorage.getItem('selectedDomains') || '[]');

  // Fetch user skill levels - refetch on mount and window focus to show latest assessments
  const { data: skillLevels = {}, refetch: refetchSkills } = useQuery<Record<string, string>>({
    queryKey: ['/api/user', userId, 'skills'],
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Refetch skills when component mounts to ensure we have the latest data
  useEffect(() => {
    if (userId) {
      refetchSkills();
    }
  }, [userId, refetchSkills]);

  // Fetch enrolled courses
  const { data: enrolledData } = useQuery<{ courses: any[] }>({
    queryKey: ['/api/user', userId, 'enrolled'],
    enabled: !!userId,
  });

  // Fetch quiz history for learning path metrics
  const { data: quizHistoryData } = useQuery<any[]>({
    queryKey: ['/api/quiz/history', userId],
    enabled: !!userId,
  });

  // Fetch schedule
  const { data: scheduleData } = useQuery<{ items: any[] }>({
    queryKey: ['/api/schedule', userId],
    enabled: !!userId,
  });

  const enrolledCourses = enrolledData?.courses || [];
  const upcomingSchedule = (scheduleData?.items || []).filter((item: any) => !item.completed).slice(0, 3);
  const skillsAssessed = Object.keys(skillLevels).length;
  const quizHistory = quizHistoryData || [];

  // Calculate learning path metrics
  const totalQuizzes = quizHistory.length;
  const averageScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / quizHistory.length)
    : 0;

  // Calculate total hours spent (estimated based on course duration and quiz time)
  const totalHours = Math.round(
    enrolledCourses.reduce((sum: number, course: any) => {
      // Extract hours from duration string (e.g., "4 weeks" -> 4, "2 hours" -> 2)
      const durationMatch = course.duration?.match(/(\d+)/);
      const courseHours = durationMatch ? parseInt(durationMatch[1]) : 2; // Default 2 hours if no duration

      // Add quiz time (estimated 15 minutes per quiz attempt)
      const courseQuizzes = quizHistory.filter((quiz: any) => quiz.domain === course.domain).length;
      const quizHours = courseQuizzes * 0.25; // 15 minutes = 0.25 hours

      return sum + courseHours + quizHours;
    }, 0)
  );

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      'Intermediate': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      'Advanced': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    };
    return colors[level] || 'bg-muted';
  };

  const getCourseImage = (course: any) => {
    const title = course.title?.toLowerCase() || '';
    const domain = course.domain?.toLowerCase() || '';
    const combined = `${title} ${domain}`;
    
    // Machine Learning courses
    if (combined.includes('machine learning') || combined.includes('ml ') || title.includes('machine learning')) {
      return machineLearningImage;
    }
    // Data Science courses
    else if (combined.includes('data science') || combined.includes('analytics') || combined.includes('statistics')) {
      return dataScienceImage;
    }
    // Web Development courses
    else if (combined.includes('web') || combined.includes('frontend') || combined.includes('backend') || combined.includes('react') || combined.includes('javascript')) {
      return webDevImage;
    }
    // Mobile Development courses
    else if (combined.includes('mobile') || combined.includes('ios') || combined.includes('android') || combined.includes('app development')) {
      return mobileDevImage;
    }
    // IoT, Hardware, Space courses
    else if (combined.includes('iot') || combined.includes('hardware') || combined.includes('space') || combined.includes('internet of things')) {
      return iotImage;
    }
    // AI courses (but not ML which is handled above)
    else if (combined.includes('artificial intelligence') || combined.includes('ai ')) {
      return machineLearningImage;
    }
    
    // Default fallback
    return webDevImage;
  };

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-2" data-testid="dashboard-welcome">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">Track your learning progress and continue your journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl neon-border group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-primary" data-testid="stat-enrolled-courses">{enrolledCourses.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Enrolled Courses</p>
          </div>

          <div className="glass-card p-6 rounded-2xl neon-border group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-chart-3/20 border border-chart-3/30 backdrop-blur-sm">
                <Award className="h-6 w-6 text-chart-3" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-chart-3" data-testid="stat-skills-assessed">{skillsAssessed}</div>
            <p className="text-sm text-muted-foreground mt-1">Skills Assessed</p>
          </div>

          <div className="glass-card p-6 rounded-2xl neon-border group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-chart-4/20 border border-chart-4/30 backdrop-blur-sm">
                <Target className="h-6 w-6 text-chart-4" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-chart-4" data-testid="stat-selected-domains">{selectedDomains.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Learning Domains</p>
          </div>

          <div className="glass-card p-6 rounded-2xl neon-border group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-chart-2/20 border border-chart-2/30 backdrop-blur-sm">
                <Clock className="h-6 w-6 text-chart-2" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-chart-2" data-testid="stat-upcoming-items">{upcomingSchedule.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Upcoming Tasks</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skills Overview */}
          <div className="glass-card p-6 rounded-2xl neon-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl text-foreground">Your Skills</h2>
              <Link href="/assessments">
                <Button variant="ghost" size="sm" className="hover:text-primary" data-testid="button-view-assessments">
                  <FileQuestion className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            </div>

            {skillsAssessed === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No skills assessed yet</p>
                <Link href="/assessments">
                  <Button data-testid="button-start-assessment">
                    Start Your First Assessment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(skillLevels).map(([domain, level]) => (
                  <div key={domain} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="flex-1">
                      <p className="font-medium text-foreground" data-testid={`skill-domain-${domain}`}>{domain}</p>
                    </div>
                    <Badge variant="outline" className={`${getLevelBadgeColor(level)} backdrop-blur-sm`} data-testid={`skill-level-${domain}`}>
                      {level}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Path Progress */}
          <div className="glass-card p-6 rounded-2xl neon-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl text-foreground">Learning Path</h2>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="hover:text-primary" data-testid="button-view-full-progress">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {/* Learning Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setEnrolledCoursesOpen(!enrolledCoursesOpen)}>
                  <Brain className="h-6 w-6 mx-auto mb-1 text-chart-2" />
                  <div className="text-lg font-bold text-foreground">{totalQuizzes}</div>
                  <div className="text-xs text-muted-foreground">Quiz Taken</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setEnrolledCoursesOpen(!enrolledCoursesOpen)}>
                  <Trophy className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold text-foreground">{averageScore}%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setEnrolledCoursesOpen(!enrolledCoursesOpen)}>
                  <Clock className="h-6 w-6 mx-auto mb-1 text-chart-4" />
                  <div className="text-lg font-bold text-foreground">{totalHours}</div>
                  <div className="text-xs text-muted-foreground">Hours Spent</div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {enrolledCourses.filter(c => c.completed).length}/{enrolledCourses.length} courses
                  </span>
                </div>
                <Progress
                  value={enrolledCourses.length > 0 ? (enrolledCourses.filter(c => c.completed).length / enrolledCourses.length) * 100 : 0}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Toggle */}
        <div className="glass-card p-6 rounded-2xl neon-border">
          <Collapsible open={enrolledCoursesOpen} onOpenChange={setEnrolledCoursesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-sm">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-display font-semibold text-xl text-foreground">Enrolled Courses</h2>
                    <p className="text-sm text-muted-foreground">
                      {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled
                    </p>
                  </div>
                </div>
                {enrolledCoursesOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-6">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No courses enrolled yet</p>
                  <Link href="/courses">
                    <Button data-testid="button-explore-courses">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course: any) => (
                    <div key={course.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-primary/40 transition-all group" data-testid={`enrolled-course-${course.id}`}>
                      <div className="flex gap-4">
                        {/* Course Image */}
                        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                          <img
                            src={getCourseImage(course)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 py-3 pr-4 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.title}</p>
                                {course.completed && (
                                  <CheckCircle2 className="h-4 w-4 text-chart-3 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <p className="text-sm text-muted-foreground">{course.provider}</p>
                                {course.domain && (
                                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                    {course.domain}
                                  </Badge>
                                )}
                                {course.skillLevel && (
                                  <Badge variant="outline" className="text-xs bg-chart-1/10 text-chart-1 border-chart-1/20">
                                    {course.skillLevel}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-md hover:bg-primary/20 transition-colors flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4 text-primary" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={course.progress || 0} className="flex-1 h-2" />
                            <span className="text-xs font-semibold text-primary min-w-[3rem] text-right">
                              {course.progress || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/courses">
            <div className="glass-card p-6 rounded-2xl glow-subtle cursor-pointer neon-border group" data-testid="card-quick-action-courses">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-sm group-hover:bg-primary/30 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">Browse Courses</h3>
                  <p className="text-sm text-muted-foreground">Discover personalized recommendations</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/schedule">
            <div className="glass-card p-6 rounded-2xl glow-subtle cursor-pointer neon-border group" data-testid="card-quick-action-schedule">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-2/20 border border-chart-2/30 backdrop-blur-sm group-hover:bg-chart-2/30 transition-colors">
                  <Calendar className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground group-hover:text-chart-2 transition-colors">View Schedule</h3>
                  <p className="text-sm text-muted-foreground">Check your learning timeline</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/mentor">
            <div className="glass-card p-6 rounded-2xl glow-subtle cursor-pointer neon-border group" data-testid="card-quick-action-mentor">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-chart-3/20 border border-chart-3/30 backdrop-blur-sm group-hover:bg-chart-3/30 transition-colors">
                  <MessageCircle className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground group-hover:text-chart-3 transition-colors">AI Mentor</h3>
                  <p className="text-sm text-muted-foreground">Get personalized guidance</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}