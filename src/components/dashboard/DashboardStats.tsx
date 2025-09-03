import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShimmerCard } from "@/components/ui/shimmer";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <Icon className={`w-8 h-8 mb-3 ${color}`} />
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{title}</div>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const DashboardStats = ({ user }: DashboardStatsProps) => {
  const [stats, setStats] = useState({
    assignments: 0,
    messages: 0,
    announcements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        // Fetch assignments count
        const { count: assignmentsCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true });

        // Fetch messages count
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });

        // Fetch announcements count
        const { count: announcementsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        setStats({
          assignments: assignmentsCount || 0,
          messages: messagesCount || 0,
          announcements: announcementsCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <ShimmerCard key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Assignments"
        value={stats.assignments}
        icon={BookOpen}
        color="text-primary"
      />
      <StatCard
        title="Messages"
        value={stats.messages}
        icon={MessageSquare}
        color="text-blue-600"
      />
      <StatCard
        title="Announcements"
        value={stats.announcements}
        icon={TrendingUp}
        color="text-green-600"
      />
    </div>
  );
};