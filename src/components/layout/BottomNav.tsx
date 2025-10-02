import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Bell, 
  BookOpen, 
  MessageSquare, 
  Shield 
} from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const BottomNav = ({ currentPage, onPageChange, user }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { 
      id: "dashboard", 
      label: "Home", 
      icon: Home,
      path: "/"
    },
    { 
      id: "calendar", 
      label: "Calendar", 
      icon: Calendar,
      path: "/calendar"
    },
    { 
      id: "assignments", 
      label: "Assignments", 
      icon: BookOpen,
      path: "/announcements"
    },
    { 
      id: "messages", 
      label: "Messages", 
      icon: MessageSquare,
      path: "/messages"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell,
      path: "/notifications"
    }
  ];

  const handleNavClick = (path: string, id: string) => {
    navigate(path);
    onPageChange(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/" && location.pathname === "/");
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavClick(item.path, item.id)}
              className={`
                h-full rounded-none border-none flex flex-col items-center justify-center gap-1 px-1
                transition-all duration-200 hover:scale-110 active:scale-95
                ${isActive 
                  ? "text-primary bg-primary/10 scale-110 shadow-md" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }
              `}
            >
              <item.icon className={`transition-all duration-200 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} />
              <span className={`text-xs font-medium transition-all duration-200 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};