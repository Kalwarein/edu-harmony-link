import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  BookOpen,
  MessageSquare
} from "lucide-react";

interface ParentDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const ParentDashboard = ({ user }: ParentDashboardProps) => {
  // Mock data for child
  const childData = {
    name: "Alex Johnson",
    grade: "Grade 8",
    class: "8A",
    attendance: 96,
    overallGrade: 87
  };

  const recentGrades = [
    { subject: "Mathematics", grade: "A-", score: 89, date: "Yesterday", trend: "up" },
    { subject: "English", grade: "B+", score: 87, date: "2 days ago", trend: "up" },
    { subject: "Science", grade: "A", score: 92, date: "1 week ago", trend: "up" },
    { subject: "History", grade: "B", score: 85, date: "1 week ago", trend: "down" },
  ];

  const upcomingEvents = [
    {
      title: "Parent-Teacher Conference",
      date: "March 15, 2024",
      time: "2:00 PM",
      type: "meeting",
      priority: "high"
    },
    {
      title: "Science Fair",
      date: "March 20, 2024",
      time: "10:00 AM",
      type: "event",
      priority: "medium"
    },
    {
      title: "Report Card Distribution",
      date: "March 25, 2024",
      time: "All Day",
      type: "academic",
      priority: "high"
    }
  ];

  const attendanceData = [
    { month: "January", present: 20, absent: 2, late: 1 },
    { month: "February", present: 18, absent: 1, late: 0 },
    { month: "March", present: 15, absent: 0, late: 2 },
  ];

  const announcements = [
    {
      title: "School Uniform Policy Update",
      content: "New guidelines for school uniform effective next semester.",
      date: "2 days ago",
      priority: "medium"
    },
    {
      title: "Midterm Exam Schedule",
      content: "Midterm examinations will begin on April 1st.",
      date: "1 week ago",
      priority: "high"
    }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "text-success";
    if (grade.startsWith('B')) return "text-info";
    if (grade.startsWith('C')) return "text-warning";
    return "text-muted-foreground";
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {user.name}! 👨‍👩‍👧‍👦
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's how {childData.name} is doing at school
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{childData.overallGrade}%</div>
              <div className="text-sm text-muted-foreground">Overall Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{childData.attendance}%</div>
              <div className="text-sm text-muted-foreground">Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Child Info Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {childData.name}
          </CardTitle>
          <CardDescription>
            {childData.grade} • Class {childData.class}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{childData.overallGrade}%</div>
              <div className="text-sm text-muted-foreground">Overall Grade</div>
              <Progress value={childData.overallGrade} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{childData.attendance}%</div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
              <Progress value={childData.attendance} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">4</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
              <div className="mt-2 text-xs text-muted-foreground">All subjects on track</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Recent Grades & Performance
              </CardTitle>
              <CardDescription>
                {childData.name}'s latest academic results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{grade.subject}</h4>
                        <p className="text-sm text-muted-foreground">{grade.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.score}%
                        </div>
                      </div>
                      <div className="text-2xl">
                        {getTrendIcon(grade.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Detailed Report Card
              </Button>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-info" />
                Attendance Overview
              </CardTitle>
              <CardDescription>
                Monthly attendance summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.map((month, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{month.month}</h4>
                      <Badge variant="outline">
                        {Math.round((month.present / (month.present + month.absent + month.late)) * 100)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-success">{month.present}</div>
                        <div className="text-xs text-muted-foreground">Present</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-warning">{month.late}</div>
                        <div className="text-xs text-muted-foreground">Late</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-destructive">{month.absent}</div>
                        <div className="text-xs text-muted-foreground">Absent</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Important dates and meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge 
                        variant={event.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {event.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{event.date}</div>
                      <div>{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View School Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Teacher
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                View Assignments
              </Button>
            </CardContent>
          </Card>

          {/* School Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-info" />
                School Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.map((announcement, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    announcement.priority === 'high' ? 'bg-destructive/10 border-destructive/20' : 'bg-muted/50'
                  }`}>
                    <div className="font-medium text-sm">{announcement.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {announcement.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {announcement.date}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};