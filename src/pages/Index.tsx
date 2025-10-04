import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Bell, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full shadow-elegant">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Sheikh Tais Academy</h1>
              <p className="text-muted-foreground">Please log in to access your dashboard</p>
            </div>
            <Button 
              onClick={() => navigate("/auth")}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-foreground"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInfo = {
    id: user.id,
    name: `${profile.first_name} ${profile.last_name}`,
    email: user.email,
    role: profile.role,
  };

  const handleNavigate = (page: string) => {
    navigate(page);
  };

  const renderDashboard = () => {
    switch (profile.role) {
      case "student":
        return <StudentDashboard user={userInfo} onNavigate={handleNavigate} />;
      case "parent":
        return <ParentDashboard user={userInfo} onNavigate={handleNavigate} />;
      case "staff":
      case "admin":
        return <StaffDashboard user={userInfo} onNavigate={handleNavigate} />;
      default:
        return (
          <Card className="shadow-elegant">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-muted-foreground">Welcome to Sheikh Tais Academy</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-academy-cream to-background pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/announcements")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-sm">Announcements</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/messages")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-xl mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-sm">Messages</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/assignments")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-academy-gold rounded-xl mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-sm">Assignments</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/notifications")}
          >
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-academy-brown to-secondary rounded-xl mx-auto flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-sm">Community</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Index;
