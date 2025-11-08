import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, BookOpen, FileQuestion, Loader2, Plus, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ScheduleItem {
  id: string;
  title: string;
  type: 'module' | 'quiz' | 'practice';
  date: string;
  time: string;
  duration: string;
  course?: string;
  completed: boolean;
}

export default function SchedulePage() {
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [learningGoals, setLearningGoals] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const userId = localStorage.getItem('userId') || 'demo-user-123';
  const userName = localStorage.getItem('userName') || 'User';

  // Fetch schedule
  const { data: scheduleData, isLoading } = useQuery<{ items: ScheduleItem[] }>({
    queryKey: ['/api/schedule', userId],
    enabled: !!userId,
  });

  // Generate schedule mutation
  const generateScheduleMutation = useMutation({
    mutationFn: async (goals: string) => {
      const res = await apiRequest('POST', '/api/schedule/generate', {
        userId,
        goals,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule', userId] });
      toast({
        title: "Schedule created!",
        description: "Your personalized learning schedule is ready",
      });
      setDialogOpen(false);
      setLearningGoals("");
    },
  });

  // Mark item complete mutation
  const completeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest('POST', `/api/schedule/${itemId}/complete`, {
        userId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule', userId] });
      toast({
        title: "Great job!",
        description: "Schedule item marked as complete",
      });
    },
  });

  const handleGenerateSchedule = () => {
    if (!learningGoals.trim()) return;
    generateScheduleMutation.mutate(learningGoals);
  };

  const scheduleItems = scheduleData?.items || [];
  const upcomingItems = scheduleItems.filter(item => !item.completed);
  const completedItems = scheduleItems.filter(item => item.completed);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      module: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      quiz: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      practice: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    };
    return colors[type as keyof typeof colors] || '';
  };

  const ScheduleItemCard = ({ item }: { item: ScheduleItem }) => (
    <Card className={`p-4 hover-elevate transition-all ${item.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-md ${item.completed ? 'bg-muted' : 'bg-primary/10'}`}>
          {getTypeIcon(item.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold leading-tight mb-1" data-testid={`schedule-item-title-${item.id}`}>
                {item.title}
              </h3>
              {item.course && (
                <p className="text-sm text-muted-foreground">{item.course}</p>
              )}
            </div>
            <Badge variant="outline" className={getTypeBadge(item.type)}>
              {item.type}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {item.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.time}
            </div>
            <span>·</span>
            <span>{item.duration}</span>
          </div>
        </div>

        {!item.completed && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => completeMutation.mutate(item.id)}
            disabled={completeMutation.isPending}
            data-testid={`button-complete-${item.id}`}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2" data-testid="page-title">
              Learning Schedule
            </h1>
            <p className="text-muted-foreground">
              AI-generated schedule to keep you on track
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-generate-schedule">
                <Plus className="h-4 w-4 mr-2" />
                Generate Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Learning Schedule</DialogTitle>
                <DialogDescription>
                  Tell me about your learning goals and I'll create a personalized schedule for you.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Example: I want to learn React in 4 weeks, studying 2 hours per day..."
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="input-learning-goals"
                />
                <Button
                  className="w-full"
                  onClick={handleGenerateSchedule}
                  disabled={!learningGoals.trim() || generateScheduleMutation.isPending}
                  data-testid="button-create-schedule"
                >
                  {generateScheduleMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Create Schedule
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : scheduleItems.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">No schedule yet</h3>
            <p className="text-muted-foreground mb-4">
              Let AI create a personalized learning schedule based on your goals
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-schedule">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Schedule
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingItems.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-xl mb-4">
                  Upcoming ({upcomingItems.length})
                </h2>
                <div className="space-y-3">
                  {upcomingItems.map(item => (
                    <ScheduleItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {completedItems.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-xl mb-4">
                  Completed ({completedItems.length})
                </h2>
                <div className="space-y-3">
                  {completedItems.map(item => (
                    <ScheduleItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
