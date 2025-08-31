import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "@/components/auth/LoginPage";
import { Navbar } from "@/components/layout/Navbar";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { CalendarPage } from "@/components/pages/CalendarPage";
import { GradesPage } from "@/components/pages/GradesPage";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = (role: string, userData: any) => {
    setUser({ ...userData, role });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard user={user} />;
      case "parent":
        return <ParentDashboard user={user} />;
      case "staff":
        return <StaffDashboard user={user} />;
      default:
        return <StudentDashboard user={user} />;
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return renderDashboard();
      case "calendar":
        return <CalendarPage user={user} />;
      case "grades":
        return <GradesPage user={user} />;
      case "assignments":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">Assignments Page</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case "messages":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">Messages Page</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case "resources":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">Resources Page</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case "attendance":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">Attendance Page</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case "roster":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">Class Roster Page</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      case "profile":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">Profile & Settings</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginPage onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background">
          <Navbar 
            user={user} 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderCurrentPage()}
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
