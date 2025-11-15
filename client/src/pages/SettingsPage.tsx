import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Trophy, Target, BookOpen, Brain, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiRequest } from "@/lib/queryClient";
import LearningPathChart from "@/components/LearningPathChart";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
  });

  const userId = localStorage.getItem("userId") || "demo-user-123";

  // Fetch enrolled courses
  const { data: enrolledCoursesData } = useQuery<{ courses: any[] }>({
    queryKey: ["enrolledCourses", userId],
    enabled: !!userId,
  });

  // Fetch quiz history
  const { data: quizHistoryData } = useQuery<any[]>({
    queryKey: ["/api/quiz/history", userId],
    enabled: !!userId,
  });

  // Fetch user skills
  const { data: skillsData } = useQuery<Record<string, string>>({
    queryKey: ["/api/user", userId, "skills"],
    enabled: !!userId,
  });

  const enrolledCourses = enrolledCoursesData?.courses || [];
  const quizHistory = quizHistoryData || [];
  const skills = skillsData || {};

  // Calculate performance metrics
  const totalQuizzes = quizHistory.length;
  const averageScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / quizHistory.length)
    : 0;

  // Calculate total hours spent (estimated based on course duration and quiz time)
  const totalHoursCalc = Math.round(
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

  // Generate weekly learning data for the chart
  const weeklyData = [
    { week: "Week 1", hours: Math.round(totalHoursCalc * 0.1) },
    { week: "Week 2", hours: Math.round(totalHoursCalc * 0.15) },
    { week: "Week 3", hours: Math.round(totalHoursCalc * 0.2) },
    { week: "Week 4", hours: Math.round(totalHoursCalc * 0.25) },
    { week: "Week 5", hours: Math.round(totalHoursCalc * 0.3) },
  ];



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          username: data.username || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Not authenticated");

      const response = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      localStorage.setItem("userName", formData.fullName);

      toast({
        title: "Settings updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account and track your learning progress</p>
        </div>

        <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  data-testid="input-fullname"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled
                />
                <p className="text-sm text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-save-settings"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Learning Progress Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Learning Progress Graph
            </CardTitle>
            <CardDescription>Your learning journey visualization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LearningPathChart data={weeklyData} />
          </CardContent>
        </Card>


        </div>
      </div>
    </DashboardLayout>
  );
}
