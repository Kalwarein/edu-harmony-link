import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Clock, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShimmerCard, ShimmerText } from "@/components/ui/shimmer";
import { formatDistanceToNow } from "date-fns";

interface DashboardSectionsProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onNavigate?: (page: string) => void;
}

export const DashboardSections = ({ user, onNavigate }: DashboardSectionsProps) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Fetch recent assignments
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent announcements
        const { data: announcementsData } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        setAssignments(assignmentsData || []);
        setAnnouncements(announcementsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const assignmentsChannel = supabase
      .channel('dashboard-assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, fetchData)
      .subscribe();

    const postsChannel = supabase
      .channel('dashboard-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [user]);

  const getStatusBadge = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    } else if (hoursUntilDue < 24) {
      return <Badge className="bg-orange-500 text-white text-xs">Due Soon</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Upcoming</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ShimmerCard className="h-48" />
        <ShimmerCard className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Assignments */}
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            Recent Assignments
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate?.('assignments')}
            className="text-primary hover:text-primary/80"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {assignment.due_date && getStatusBadge(assignment.due_date)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Assignments</p>
              <p className="text-sm">Check back later for new assignments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Megaphone className="w-5 h-5 text-primary" />
            Recent Announcements
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate?.('announcements')}
            className="text-primary hover:text-primary/80"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {announcement.title && (
                        <h4 className="font-medium text-sm mb-1">{announcement.title}</h4>
                      )}
                      <p className="text-sm text-foreground line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {announcement.is_pinned && (
                      <Badge className="bg-primary text-primary-foreground text-xs ml-2">Pinned</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Announcements</p>
              <p className="text-sm">Stay tuned for school updates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};