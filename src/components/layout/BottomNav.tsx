import { Button } from "@/components/ui/button";
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
  const navItems = [
    { 
      id: "dashboard", 
      label: "Home", 
      icon: Home,
      path: "dashboard"
    },
    { 
      id: "calendar", 
      label: "Calendar", 
      icon: Calendar,
      path: "calendar"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell,
      path: "notifications"
    },
    { 
      id: "assignments", 
      label: "Assignments", 
      icon: BookOpen,
      path: "assignments"
    },
    { 
      id: "messages", 
      label: "Messages", 
      icon: MessageSquare,
      path: "messages"
    },
    { 
      id: "admin", 
      label: "Admin", 
      icon: Shield,
      path: "admin"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:hidden z-50">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.path || 
            (item.path === "dashboard" && currentPage === "dashboard");
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onPageChange(item.path)}
              className={`
                h-full rounded-none border-none flex flex-col items-center justify-center gap-1 px-1
                ${isActive 
                  ? "text-academy-brown bg-academy-cream" 
                  : "text-muted-foreground hover:text-academy-brown hover:bg-academy-cream/50"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};