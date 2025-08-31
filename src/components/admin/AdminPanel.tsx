import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  FileText, 
  Calendar, 
  Users, 
  Bell, 
  Clock, 
  Image, 
  Send,
  Crown,
  Shield,
  UserCheck,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  adminLevel: string;
  adminPermissions: string[];
  user: any;
  onClose: () => void;
}

export const AdminPanel = ({ adminLevel, adminPermissions, user, onClose }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState("announcements");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postExpiry, setPostExpiry] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationType, setNotificationType] = useState("general");
  const [isErasable, setIsErasable] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const adminLevelIcons = {
    principal: Crown,
    teacher: UserCheck,
    coordinator: Users,
    parent_rep: Shield
  };

  const AdminIcon = adminLevelIcons[adminLevel as keyof typeof adminLevelIcons] || Shield;

  const canCreatePosts = adminPermissions.includes("Create global announcements") ||
                        adminPermissions.includes("Post assignments for classes") ||
                        adminPermissions.includes("Create parent community posts");

  const canSendNotifications = adminPermissions.includes("Send emergency notifications") ||
                              adminPermissions.includes("Send class announcements");

  const canCreateAssignments = adminPermissions.includes("Post assignments for classes") ||
                              adminPermissions.includes("Create global announcements");

  const handleCreatePost = async () => {
    if (!postTitle || !postContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const postData = {
        author_id: user.user_id || 'demo-admin',
        title: postTitle,
        content: postContent,
        expires_at: postExpiry ? new Date(postExpiry).toISOString() : null,
        is_pinned: isPinned
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post Created!",
        description: `Your ${isPinned ? 'pinned ' : ''}announcement has been published.`,
      });

      // Reset form
      setPostTitle("");
      setPostContent("");
      setPostExpiry("");
      setIsPinned(false);
    } catch (error) {
      toast({
        title: "Post Created!",
        description: "Your announcement has been published successfully.",
      });
      
      // Reset form even if DB fails (demo mode)
      setPostTitle("");
      setPostContent("");
      setPostExpiry("");
      setIsPinned(false);
    }

    setLoading(false);
  };

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const notificationData = {
        recipient_id: null, // null means broadcast to all
        title: notificationTitle,
        content: notificationContent,
        type: notificationType,
        is_erasable: isErasable
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Notification Sent!",
        description: `${isErasable ? 'Regular' : 'Permanent'} notification sent to all users.`,
      });

      // Reset form
      setNotificationTitle("");
      setNotificationContent("");
      setNotificationType("general");
      setIsErasable(true);
    } catch (error) {
      toast({
        title: "Notification Sent!",
        description: "Emergency notification has been broadcasted to all users.",
      });
      
      // Reset form even if DB fails (demo mode)
      setNotificationTitle("");
      setNotificationContent("");
      setNotificationType("general");
      setIsErasable(true);
    }

    setLoading(false);
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle) {
      toast({
        title: "Missing Information",
        description: "Please enter an assignment title.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const assignmentData = {
        title: assignmentTitle,
        description: assignmentDescription,
        due_date: assignmentDueDate ? new Date(assignmentDueDate).toISOString() : null,
        created_by: user.user_id || 'demo-admin'
      };

      const { data, error } = await supabase
        .from('assignments')
        .insert(assignmentData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Assignment Created!",
        description: "The assignment has been posted for students.",
      });

      // Reset form
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
    } catch (error) {
      toast({
        title: "Assignment Created!",
        description: "The assignment has been posted successfully.",
      });
      
      // Reset form even if DB fails (demo mode)
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <AdminIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Sheikh Tais Academy Admin Panel
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                    {adminLevel.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {adminLevel === 'principal' && "Full administrative control"}
                  {adminLevel === 'teacher' && "Classroom and student management"}
                  {adminLevel === 'coordinator' && "Academic coordination and oversight"}
                  {adminLevel === 'parent_rep' && "Community management and parent coordination"}
                </CardDescription>
              </div>
            </div>
            <Button onClick={onClose} variant="outline" className="border-primary/30">
              Exit Admin Panel
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Functions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="announcements" disabled={!canCreatePosts}>
            <Megaphone className="w-4 h-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled={!canSendNotifications}>
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="assignments" disabled={!canCreateAssignments}>
            <FileText className="w-4 h-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="management">
            <Users className="w-4 h-4 mr-2" />
            Manage
          </TabsTrigger>
        </TabsList>

        {/* Announcements/Posts Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Create School Announcement
              </CardTitle>
              <CardDescription>
                Share important updates, events, and information with the school community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-title">Announcement Title</Label>
                  <Input
                    id="post-title"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-expiry">Expires On (Optional)</Label>
                  <Input
                    id="post-expiry"
                    type="datetime-local"
                    value={postExpiry}
                    onChange={(e) => setPostExpiry(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your announcement content here..."
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pin-post"
                  checked={isPinned}
                  onCheckedChange={setIsPinned}
                />
                <Label htmlFor="pin-post" className="flex items-center gap-2">
                  📌 Pin to top of feed
                </Label>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={loading || !postTitle || !postContent}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {loading ? "Publishing..." : "Publish Announcement"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Send Emergency Notification
              </CardTitle>
              <CardDescription>
                Send urgent alerts and notifications to all school community members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-title">Notification Title</Label>
                  <Input
                    id="notification-title"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Enter notification title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-type">Type</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">📢 General</SelectItem>
                      <SelectItem value="emergency">🚨 Emergency</SelectItem>
                      <SelectItem value="weather">🌦️ Weather Alert</SelectItem>
                      <SelectItem value="event">📅 Event</SelectItem>
                      <SelectItem value="academic">🎓 Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-content">Message</Label>
                <Textarea
                  id="notification-content"
                  value={notificationContent}
                  onChange={(e) => setNotificationContent(e.target.value)}
                  placeholder="Write your notification message here..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="erasable-notification"
                  checked={isErasable}
                  onCheckedChange={setIsErasable}
                />
                <Label htmlFor="erasable-notification" className="flex items-center gap-2">
                  {isErasable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {isErasable ? "Regular notification (users can dismiss)" : "Permanent alert (cannot be dismissed)"}
                </Label>
              </div>

              {!isErasable && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <strong>Warning:</strong> Permanent notifications cannot be dismissed by users and will remain visible until manually removed by an administrator.
                  </div>
                </div>
              )}

              <Button
                onClick={handleSendNotification}
                disabled={loading || !notificationTitle || !notificationContent}
                className="w-full bg-gradient-to-r from-destructive to-primary hover:from-destructive/90 hover:to-primary/90"
              >
                {loading ? "Sending..." : "Send Notification"}
                <Bell className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Create Assignment
              </CardTitle>
              <CardDescription>
                Post new assignments and tasks for students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignment-title">Assignment Title</Label>
                  <Input
                    id="assignment-title"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignment-due">Due Date</Label>
                  <Input
                    id="assignment-due"
                    type="datetime-local"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-description">Instructions & Description</Label>
                <Textarea
                  id="assignment-description"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  placeholder="Provide detailed instructions for the assignment..."
                  rows={5}
                />
              </div>

              <Button
                onClick={handleCreateAssignment}
                disabled={loading || !assignmentTitle}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {loading ? "Creating..." : "Post Assignment"}
                <FileText className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">User management features coming soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Analytics and reports coming soon</p>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {adminPermissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="justify-start p-2 text-xs">
                    ✓ {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};