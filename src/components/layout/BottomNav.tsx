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
      <div className="grid grid-cols-5 h-16">
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