import { DashboardStats } from "./DashboardStats";
import { DashboardSections } from "./DashboardSections";

interface ParentDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onNavigate?: (page: string) => void;
}

export const ParentDashboard = ({ user, onNavigate }: ParentDashboardProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-academy-yellow to-academy-gold text-foreground p-8 rounded-lg shadow-academy">
        <h1 className="text-3xl font-bold">{getGreeting()}</h1>
        <p className="text-lg opacity-90 mt-1">Welcome back, {user.name}!</p>
      </div>

      {/* Quick Stats - Parent View */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Child's Progress</h2>
        <DashboardStats user={{ id: '', ...user }} />
      </div>

      {/* Dashboard Sections */}
      <DashboardSections user={{ id: '', ...user }} onNavigate={onNavigate} />
    </div>
  );
};