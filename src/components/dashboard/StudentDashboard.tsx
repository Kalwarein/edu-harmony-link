import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Calendar, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Star,
  Target
} from "lucide-react";

interface StudentDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const upcomingAssignments = [
    {
      id: 1,
      title: "Math Chapter 5 Quiz",
      subject: "Mathematics",
      dueDate: "Tomorrow",
      priority: "high",
      status: "pending"
    },
    {
      id: 2,
      title: "History Essay",
      subject: "History",
      dueDate: "Friday",
      priority: "medium",
      status: "in-progress"
    },
    {
      id: 3,
      title: "Science Lab Report",
      subject: "Science",
      dueDate: "Next Monday",
      priority: "low",
      status: "pending"
    }
  ];

  const todaySchedule = [
    { time: "9:00 AM", subject: "Mathematics", room: "Room 101", type: "class" },
    { time: "10:30 AM", subject: "English", room: "Room 205", type: "class" },
    { time: "12:00 PM", subject: "Lunch Break", room: "Cafeteria", type: "break" },
    { time: "1:00 PM", subject: "Science", room: "Lab 301", type: "lab" },
    { time: "2:30 PM", subject: "History", room: "Room 150", type: "class" },
  ];

  const recentGrades = [
    { subject: "Mathematics", grade: "A", score: 92, date: "Yesterday" },
    { subject: "English", grade: "B+", score: 87, date: "2 days ago" },
    { subject: "Science", grade: "A-", score: 89, date: "1 week ago" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "text-success";
    if (grade.startsWith('B')) return "text-info";
    if (grade.startsWith('C')) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user.name}! 🎓
            </h1>
            <p className="text-muted-foreground mt-2">
              You have 3 assignments due this week. Keep up the great work!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">Overall Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">98%</div>
              <div className="text-sm text-muted-foreground">Attendance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Upcoming Assignments
              </CardTitle>
              <CardDescription>
                Stay on top of your deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        assignment.priority === 'high' ? 'bg-destructive' :
                        assignment.priority === 'medium' ? 'bg-warning' : 'bg-secondary'
                      }`} />
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(assignment.priority) as any}>
                        {assignment.dueDate}
                      </Badge>
                      {assignment.status === 'in-progress' && (
                        <Clock className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Assignments
              </Button>
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Recent Grades
              </CardTitle>
              <CardDescription>
                Your latest performance results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{grade.subject}</h4>
                        <p className="text-sm text-muted-foreground">{grade.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {grade.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-sm font-medium text-muted-foreground w-16">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.subject}</div>
                      <div className="text-xs text-muted-foreground">{item.room}</div>
                    </div>
                    <Badge variant={item.type === 'break' ? 'secondary' : 'outline'} className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Assignment Completion</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Attendance Rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-success">12</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">3</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-info" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="font-medium text-sm text-info-foreground">School Holiday</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    No classes on Friday due to Teacher Training Day.
                  </div>
                </div>
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="font-medium text-sm text-success-foreground">Library Hours Extended</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Library will be open until 8 PM during exam week.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};