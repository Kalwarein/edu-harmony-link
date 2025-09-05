import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Clock, FileText } from "lucide-react";
import { ShimmerCard, ShimmerText, ShimmerAvatar } from "@/components/ui/shimmer";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  created_by: string;
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
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
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

  const getPriorityColor = (dueDate: string | null) => {
    if (!dueDate) return "bg-muted";
    
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) return "bg-red-100 text-red-800 border-red-200";
    if (daysDiff <= 3) return "bg-orange-100 text-orange-800 border-orange-200";
    if (daysDiff <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getPriorityLabel = (dueDate: string | null) => {
    if (!dueDate) return "No due date";
    
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return "Overdue";
    if (daysDiff < 1) return "Due today";
    if (daysDiff <= 3) return "Due soon";
    if (daysDiff <= 7) return "Due this week";
    return "Upcoming";
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
                  <ShimmerText className="w-2/3" />
                  <ShimmerText className="w-1/2 h-3" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ShimmerCard className="h-24" />
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
            <h3 className="text-xl font-semibold">No Assignments Yet</h3>
            <p className="text-muted-foreground">
              Check back later for new assignments from your teachers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                    <BookOpen className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">{assignment.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Assignment
                    </Badge>
                    {assignment.due_date && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(assignment.due_date)}`}
                      >
                        {getPriorityLabel(assignment.due_date)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {assignment.description && (
              <p className="text-foreground leading-relaxed mb-4">
                {assignment.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Assigned {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {assignment.due_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      Due {format(new Date(assignment.due_date), 'PPP')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" />
                  View Details
                </Button>
                <Button size="sm" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Submit Work
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};