import { PostsFeed } from "@/components/feed/PostsFeed";
import { AssignmentsFeed } from "@/components/assignments/AssignmentsFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, BookOpen, Bell } from "lucide-react";

interface AnnouncementsPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const AnnouncementsPage = ({ user }: AnnouncementsPageProps) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
          <Megaphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">School Feed</h1>
          <p className="text-muted-foreground">Stay updated with the latest announcements and assignments</p>
        </div>
      </div>

      {/* Tabs for different content types */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            All Updates
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Assignments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6 mt-6">
          {/* Combined feed - alternating between posts and assignments */}
          <div className="space-y-6">
            <PostsFeed user={user} />
            <AssignmentsFeed user={user} />
          </div>
        </TabsContent>
        
        <TabsContent value="announcements" className="mt-6">
          <PostsFeed user={user} />
        </TabsContent>
        
        <TabsContent value="assignments" className="mt-6">
          <AssignmentsFeed user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};