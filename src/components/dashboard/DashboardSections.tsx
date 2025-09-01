import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen } from "lucide-react";

export const DashboardSections = () => {
  return (
    <div className="space-y-6">
      {/* Upcoming Assignments */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-academy-brown" />
            Upcoming Assignments
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-academy-brown hover:text-academy-yellow"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Assignments Found</p>
            <p className="text-sm">There are no assignments matching your current filter.</p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-academy-brown" />
            Upcoming Events
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-academy-brown hover:text-academy-yellow"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Events Found</p>
            <p className="text-sm">There are no events matching your current filter.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};