import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "@/components/auth/LoginPage";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Navbar } from "@/components/layout/Navbar";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { CalendarPage } from "@/components/pages/CalendarPage";
import { GradesPage } from "@/components/pages/GradesPage";
import { MessagesPage } from "@/components/messages/MessagesPage";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isNewUser, setIsNewUser] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminLevel, setAdminLevel] = useState<string | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleOnboardingComplete = (userData: any) => {
    setUser(userData);
    setIsNewUser(false);
  };

  const handleLogin = (role: string, userData: any) => {
    setUser({ ...userData, role });
    setIsNewUser(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
    setAdminLevel(null);
    setAdminPermissions([]);
    setShowAdminPanel(false);
  };

  const handleAdminAuthenticated = (level: string, permissions: string[]) => {
    setAdminLevel(level);
    setAdminPermissions(permissions);
    setShowAdminAuth(false);
    setShowAdminPanel(true);
  };

  const handleAdminExit = () => {
    setShowAdminPanel(false);
    setAdminLevel(null);
    setAdminPermissions([]);
  };

  const handleMessagesClick = () => {
    if (adminLevel) {
      // If admin, go directly to messages with admin powers
      setCurrentPage("messages");
    } else {
      // Show admin auth dialog for regular users
      setShowAdminAuth(true);
    }
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
    if (showAdminPanel) {
      return (
        <AdminPanel
          adminLevel={adminLevel!}
          adminPermissions={adminPermissions}
          user={user}
          onClose={handleAdminExit}
        />
      );
    }

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
          <MessagesPage 
            user={user} 
            adminLevel={adminLevel || undefined} 
            adminPermissions={adminPermissions.length > 0 ? adminPermissions : undefined} 
          />
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

  // Show onboarding for new users
  if (isNewUser && !user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show login for returning users
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
            onMessagesClick={handleMessagesClick}
            adminLevel={adminLevel}
            showAdminPanel={showAdminPanel}
          />
          <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${currentPage === 'messages' ? 'py-0' : 'py-8'}`}>
            {renderCurrentPage()}
          </main>
        </div>
        
        <AdminAuth 
          isOpen={showAdminAuth}
          onClose={() => setShowAdminAuth(false)}
          onAuthenticated={handleAdminAuthenticated}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
