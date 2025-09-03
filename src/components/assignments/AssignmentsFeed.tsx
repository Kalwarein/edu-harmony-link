import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Clock, FileText, User } from "lucide-react";
import { ShimmerCard, ShimmerText, ShimmerAvatar } from "@/components/ui/shimmer";
import { formatDistanceToNow, format, isAfter } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  created_by: string;
  creator?: {
    first_name: string;
    last_name: string;
    role: string;
    admin_level?: string;
  };
}

interface AssignmentsFeedProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const AssignmentsFeed = ({ user }: AssignmentsFeedProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    
    // Real-time subscription for assignments
    const channel = supabase
      .channel('assignments-feed')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' },
        () => fetchAssignments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch creator profiles separately
      const assignmentsWithCreators = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role, admin_level')
            .eq('user_id', assignment.created_by)
            .single();
          
          return {
            ...assignment,
            creator: profile || undefined
          };
        })
      );

      setAssignments(assignmentsWithCreators);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error loading assignments",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (hoursUntilDue < 24) {
      return <Badge className="bg-orange-500 text-white">Due Soon</Badge>;
    } else if (hoursUntilDue < 72) {
      return <Badge className="bg-yellow-500 text-white">Due This Week</Badge>;
    } else {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    // Placeholder for assignment submission
    toast({
      title: "Assignment Submission",
      description: "Assignment submission feature coming soon!",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex items-center space-x-3">
                <ShimmerAvatar />
                <div className="space-y-2 flex-1">
                  <ShimmerText className="w-1/2" />
                  <ShimmerText className="w-1/3 h-3" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ShimmerCard className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">No Assignments</h3>
            <p className="text-muted-foreground">
              You're all caught up! No assignments have been posted yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                    {assignment.creator?.first_name?.[0]}{assignment.creator?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {assignment.creator?.first_name} {assignment.creator?.last_name}
                    </p>
                    {assignment.creator?.role === 'staff' && (
                      <Badge variant="outline" className="text-xs">Teacher</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Posted {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {assignment.due_date && getStatusBadge(assignment.due_date)}
            </div>
            
            <CardTitle className="flex items-center gap-2 mt-3">
              <BookOpen className="w-5 h-5 text-primary" />
              {assignment.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {assignment.description && (
              <p className="whitespace-pre-wrap text-foreground leading-relaxed mb-4">
                {assignment.description}
              </p>
            )}
            
            {assignment.due_date && (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Due:</span>
                  <span>{format(new Date(assignment.due_date), 'PPP p')}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ({formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })})
                </div>
              </div>
            )}
            
            {user.role === 'student' && (
              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={() => handleSubmitAssignment(assignment.id)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Submit Assignment
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Add to Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};