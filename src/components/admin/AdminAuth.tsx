import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Crown, Users, UserCheck, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (level: string, permissions: string[]) => void;
}

const adminLevels = [
  {
    level: "principal",
    password: "ST2024PRIN",
    icon: Crown,
    title: "Principal",
    description: "Full administrative access",
    permissions: [
      "Create global announcements",
      "Manage all users and staff", 
      "Send emergency notifications",
      "Access all school data",
      "Modify system settings",
      "Create and assign roles",
      "Manage school calendar",
      "Override all restrictions"
    ]
  },
  {
    level: "teacher", 
    password: "ST2024TEACH",
    icon: UserCheck,
    title: "Teacher",
    description: "Classroom and student management",
    permissions: [
      "Post assignments for classes",
      "Send class announcements",
      "Manage student attendance",
      "Grade assignments",
      "Communicate with parents",
      "Access student records",
      "Create class events"
    ]
  },
  {
    level: "coordinator",
    password: "ST2024COORD", 
    icon: Users,
    title: "Academic Coordinator",
    description: "Departmental oversight",
    permissions: [
      "Coordinate department activities",
      "Schedule department meetings",
      "Manage department resources",
      "Review teacher performance",
      "Plan curriculum",
      "Organize academic events",
      "Access department reports"
    ]
  },
  {
    level: "parent_rep",
    password: "ST2024PARENT",
    icon: Shield,
    title: "Parent Representative", 
    description: "Limited community management",
    permissions: [
      "Create parent community posts",
      "Organize parent events",
      "Moderate parent discussions",
      "Share community resources",
      "Collect parent feedback",
      "Coordinate volunteer activities"
    ]
  }
];

export const AdminAuth = ({ isOpen, onClose, onAuthenticated }: AdminAuthProps) => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLevel || !password) {
      toast({
        title: "Missing Information",
        description: "Please select an admin level and enter the password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      const adminLevel = adminLevels.find(level => level.level === selectedLevel);
      
      if (adminLevel && password === adminLevel.password) {
        toast({
          title: "Authentication Successful",
          description: `Welcome, ${adminLevel.title}! You now have administrative access.`,
        });
        onAuthenticated(selectedLevel, adminLevel.permissions);
        onClose();
      } else {
        toast({
          title: "Authentication Failed", 
          description: "Invalid password for the selected admin level.",
          variant: "destructive",
        });
      }
      
      setLoading(false);
      setPassword("");
    }, 1000);
  };

  const selectedAdmin = adminLevels.find(level => level.level === selectedLevel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Key className="w-5 h-5 text-primary" />
            Sheikh Tais Academy Admin Access
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAuthenticate} className="space-y-6">
          <div className="space-y-3">
            <Label>Administrator Level</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your admin level" />
              </SelectTrigger>
              <SelectContent>
                {adminLevels.map((admin) => (
                  <SelectItem key={admin.level} value={admin.level}>
                    <div className="flex items-center gap-2">
                      <admin.icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{admin.title}</div>
                        <div className="text-xs text-muted-foreground">{admin.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAdmin && (
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <selectedAdmin.icon className="w-4 h-4 text-primary" />
                  {selectedAdmin.title} Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selectedAdmin.permissions.slice(0, 4).map((permission, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      {permission}
                    </li>
                  ))}
                  {selectedAdmin.permissions.length > 4 && (
                    <li className="text-primary font-medium">
                      +{selectedAdmin.permissions.length - 4} more permissions...
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="admin-password">Administrator Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="Enter admin password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Contact the IT administrator if you've forgotten your password
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading || !selectedLevel || !password}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </Button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Sheikh Tais Academy Administrative System v2.1
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};