import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "@/components/auth/LoginPage";
import { BottomNav } from "@/components/layout/BottomNav";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Navbar } from "@/components/layout/Navbar";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { ConversationsList } from "@/components/messages/ConversationsList";
import { ContactsList } from "@/components/messages/ContactsList";
import { DirectChatPage } from "@/components/messages/DirectChatPage";
import { GroupChatPage } from "@/components/messages/GroupChatPage";
import { AnnouncementsPage } from "@/components/pages/AnnouncementsPage";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  admin_level?: string;
  avatar_url?: string;
}

interface ExtendedUser extends User {
  profile?: UserProfile;
}

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminLevel, setAdminLevel] = useState<string | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              setUser({
                ...session.user,
                profile: profile || undefined
              });
              setShowSplash(true);
            } catch (error) {
              console.error('Error fetching profile:', error);
              setUser({
                ...session.user,
                profile: undefined
              });
            }
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setUser({
            ...session.user,
            profile: profile || undefined
          });
          setShowSplash(true);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser({
            ...session.user,
            profile: undefined
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData: ExtendedUser) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    // Just navigate to messages, no admin auth needed for messaging
    setCurrentPage("messages");
  };

  const renderDashboard = () => {
    const userName = user?.profile?.first_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const userRole = user?.profile?.role || 'student';
    
    const userProps = {
      name: userName,
      email: userEmail,
      role: userRole
    };
    
    switch (userRole) {
      case "student":
        return <StudentDashboard user={userProps} onNavigate={setCurrentPage} />;
      case "parent":
        return <ParentDashboard user={userProps} onNavigate={setCurrentPage} />;
      case "staff":
        return <StaffDashboard user={userProps} onNavigate={setCurrentPage} />;
      default:
        return <StudentDashboard user={userProps} onNavigate={setCurrentPage} />;
    }
  };

  // Show loading
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gradient-to-r from-primary to-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
              </div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show splash screen when user logs in
  if (showSplash) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SplashScreen onComplete={() => setShowSplash(false)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show login for users not authenticated
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
        <Router>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-background">
            <Navbar 
              user={{
                name: user?.profile?.first_name || user?.email?.split('@')[0] || 'User',
                email: user?.email || '',
                role: user?.profile?.role || 'student'
              }} 
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onLogout={handleLogout}
              onMessagesClick={handleMessagesClick}
              adminLevel={adminLevel}
              showAdminPanel={showAdminPanel}
            />
            <main className="pb-20">
              <Routes>
                <Route path="/" element={renderDashboard()} />
                <Route path="/messages" element={<ConversationsList currentUserId={user?.id || ''} />} />
                <Route path="/messages/contacts" element={<ContactsList currentUserId={user?.id || ''} />} />
                <Route path="/messages/chat/:conversationId" element={<DirectChatPage currentUserId={user?.id || ''} currentUserName={user?.profile?.first_name || 'User'} />} />
                <Route path="/messages/group" element={<GroupChatPage user={{
                  id: user?.id || '',
                  name: user?.profile?.first_name || user?.email?.split('@')[0] || 'User',
                  email: user?.email || '',
                  role: user?.profile?.role || 'student'
                }} adminLevel={adminLevel} />} />
                <Route path="/admin" element={
                  <div className="p-4">
                    <Button onClick={() => setShowAdminAuth(true)} className="w-full">
                      Access Admin Panel
                    </Button>
                  </div>
                } />
                <Route path="/notifications" element={<NotificationsPage user={{
                  id: user?.id || '',
                  name: user?.profile?.first_name || user?.email?.split('@')[0] || 'User',
                  email: user?.email || '',
                  role: user?.profile?.role || 'student'
                }} />} />
                <Route path="/announcements" element={<AnnouncementsPage user={{
                  id: user?.id || '',
                  name: user?.profile?.first_name || user?.email?.split('@')[0] || 'User',
                  email: user?.email || '',
                  role: user?.profile?.role || 'student'
                }} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            {/* Mobile Bottom Navigation */}
            <BottomNav 
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              user={{
                name: user?.profile?.first_name || user?.email?.split('@')[0] || 'User',
                email: user?.email || '',
                role: user?.profile?.role || 'student'
              }}
            />
          </div>
          
          <AdminAuth 
            isOpen={showAdminAuth}
            onClose={() => setShowAdminAuth(false)}
            onAuthenticated={handleAdminAuthenticated}
          />
          
          {showAdminPanel && (
            <AdminPanel
              adminLevel={adminLevel!}
              adminPermissions={adminPermissions}
              user={{
                id: user?.id || '',
                email: user?.email || '',
                name: user?.profile?.first_name || user?.email?.split('@')[0] || 'User',
                role: user?.profile?.role || 'student'
              }}
              onClose={handleAdminExit}
            />
          )}
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
