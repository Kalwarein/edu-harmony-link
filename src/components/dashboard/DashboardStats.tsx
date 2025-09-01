import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Clock } from "lucide-react";

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

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Pending"
        value="0"
        icon={BookOpen}
        color="text-academy-brown"
      />
      <StatCard
        title="Attendance"
        value="0%"
        icon={TrendingUp}
        color="text-green-600"
      />
      <StatCard
        title="Events"
        value="0"
        icon={Clock}
        color="text-academy-yellow"
      />
    </div>
  );
};