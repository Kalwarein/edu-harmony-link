import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  GraduationCap, 
  Menu, 
  Bell, 
  Settings, 
  LogOut,
  Home,
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Megaphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  onMessagesClick?: () => void;
  adminLevel?: string | null;
  showAdminPanel?: boolean;
}

export const Navbar = ({ user, currentPage, onPageChange, onLogout, onMessagesClick, adminLevel, showAdminPanel }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Real-time subscription for notifications
    const channel = supabase
      .channel('notification-count')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
        .or(`recipient_id.eq.${user.email},recipient_id.is.null`);
        
      if (!error && data) {
        setUnreadCount(data.length || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const getNavItems = () => {
    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "announcements", label: "School Feed", icon: Megaphone },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "calendar", label: "Calendar", icon: Calendar },
    ];

    if (user.role === "student") {
      return [
        ...commonItems,
        { id: "grades", label: "Grades", icon: BarChart3 },
        { id: "assignments", label: "Assignments", icon: BookOpen },
      ];
    }

    if (user.role === "parent") {
      return [
        ...commonItems,
        { id: "grades", label: "Child's Grades", icon: BarChart3 },
      ];
    }

    if (user.role === "staff") {
      return [
        ...commonItems,
        { id: "assignments", label: "Assignments", icon: BookOpen },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={currentPage === item.id ? "default" : "ghost"}
          className={`justify-start gap-2 w-full ${
            currentPage === item.id 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted"
          }`}
          onClick={() => {
            if (item.id === "notifications") {
              onPageChange("notifications");
            } else if (item.id === "messages") {
              onMessagesClick?.();
            } else {
              onPageChange(item.id);
            }
            onItemClick?.();
          }}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
          {item.id === "notifications" && unreadCount > 0 && (
            <Badge 
              className="ml-auto h-5 w-5 text-xs rounded-full bg-red-500 text-white flex items-center justify-center p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sheikh Tais Academy
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex flex-col space-y-1">
              <NavItems />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => onPageChange('notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full bg-red-500 text-white flex items-center justify-center p-0"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPageChange("profile")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings & Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-r from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Sheikh Tais Academy
                  </h2>
                </div>
                
                <div className="space-y-2">
                  <NavItems onItemClick={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};