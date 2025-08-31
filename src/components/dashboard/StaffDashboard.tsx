import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  BarChart3,
  GraduationCap
} from "lucide-react";

interface StaffDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const StaffDashboard = ({ user }: StaffDashboardProps) => {
  const classes = [
    { name: "Mathematics 8A", students: 28, period: "Period 1", room: "Room 101" },
    { name: "Mathematics 8B", students: 26, period: "Period 3", room: "Room 101" },
    { name: "Advanced Math", students: 15, period: "Period 5", room: "Room 101" },
  ];

  const todaySchedule = [
    { time: "8:00 AM", class: "Mathematics 8A", room: "Room 101", type: "class" },
    { time: "9:30 AM", class: "Free Period", room: "Staff Room", type: "break" },
    { time: "10:00 AM", class: "Mathematics 8B", room: "Room 101", type: "class" },
    { time: "11:30 AM", class: "Lunch Break", room: "Staff Room", type: "break" },
    { time: "12:30 PM", class: "Advanced Math", room: "Room 101", type: "class" },
    { time: "2:00 PM", class: "Grade Papers", room: "Room 101", type: "prep" },
  ];

  const pendingTasks = [
    {
      title: "Grade Math Quiz (8A)",
      priority: "high",
      dueDate: "Today",
      type: "grading",
      students: 28
    },
    {
      title: "Prepare Lesson Plan",
      priority: "medium",
      dueDate: "Tomorrow",
      type: "planning",
      subject: "Algebra"
    },
    {
      title: "Submit Attendance Report",
      priority: "high",
      dueDate: "Today",
      type: "admin",
      deadline: "5:00 PM"
    },
    {
      title: "Parent Meeting Follow-up",
      priority: "low",
      dueDate: "Friday",
      type: "communication",
      parent: "Mrs. Johnson"
    }
  ];

  const classStats = {
    totalStudents: 69,
    averageAttendance: 94,
    assignmentsToGrade: 45,
    upcomingTests: 2
  };

  const recentMessages = [
    {
      from: "Principal Johnson",
      subject: "Staff Meeting Reminder",
      time: "2 hours ago",
      priority: "high"
    },
    {
      from: "Parent - Mrs. Davis",
      subject: "Question about homework",
      time: "4 hours ago",
      priority: "medium"
    },
    {
      from: "IT Department",
      subject: "System Maintenance Tonight",
      time: "1 day ago",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "grading": return FileText;
      case "planning": return BookOpen;
      case "admin": return AlertCircle;
      case "communication": return MessageSquare;
      default: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good morning, {user.name}! 🍎
            </h1>
            <p className="text-muted-foreground mt-2">
              You have 4 pending tasks and 3 classes scheduled today
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{classStats.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{classStats.averageAttendance}%</div>
              <div className="text-sm text-muted-foreground">Avg Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{classStats.averageAttendance}%</div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">{classStats.assignmentsToGrade}</div>
                <div className="text-sm text-muted-foreground">To Grade</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-info" />
              <div>
                <div className="text-2xl font-bold">{classStats.upcomingTests}</div>
                <div className="text-sm text-muted-foreground">Upcoming Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                My Classes
              </CardTitle>
              <CardDescription>
                Classes you're teaching this semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classes.map((classItem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{classItem.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {classItem.period} • {classItem.room}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{classItem.students}</div>
                      <div className="text-sm text-muted-foreground">students</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  View All Students
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Class Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pending Tasks
              </CardTitle>
              <CardDescription>
                Items that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task, index) => {
                  const TaskIcon = getTaskIcon(task.type);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <TaskIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {task.type === 'grading' && `${task.students} students`}
                            {task.type === 'planning' && task.subject}
                            {task.type === 'admin' && task.deadline}
                            {task.type === 'communication' && task.parent}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getPriorityColor(task.priority) as any}>
                        {task.dueDate}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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
                      <div className="font-medium text-sm">{item.class}</div>
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

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-info" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages.map((message, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm">{message.from}</div>
                      <Badge 
                        variant={message.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {message.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {message.subject}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {message.time}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Messages
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
                <FileText className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Take Attendance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Grade Assignments
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Parents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};