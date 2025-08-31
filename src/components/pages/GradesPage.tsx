import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  BookOpen, 
  Calendar,
  FileText,
  Download,
  Eye
} from "lucide-react";

interface GradesPageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const GradesPage = ({ user }: GradesPageProps) => {
  const [selectedSemester, setSelectedSemester] = useState("current");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const subjects = [
    {
      name: "Mathematics",
      currentGrade: "A-",
      percentage: 89,
      assignments: [
        { name: "Chapter 5 Quiz", score: 92, date: "2024-03-10", type: "quiz" },
        { name: "Homework Set 12", score: 85, date: "2024-03-08", type: "homework" },
        { name: "Midterm Exam", score: 91, date: "2024-03-05", type: "exam" },
        { name: "Project: Statistics", score: 88, date: "2024-03-01", type: "project" }
      ],
      trend: "up",
      teacher: "Mr. Johnson"
    },
    {
      name: "English Literature",
      currentGrade: "B+",
      percentage: 87,
      assignments: [
        { name: "Essay: Shakespeare", score: 90, date: "2024-03-12", type: "essay" },
        { name: "Reading Quiz Ch. 8", score: 82, date: "2024-03-09", type: "quiz" },
        { name: "Book Report", score: 88, date: "2024-03-03", type: "project" },
        { name: "Vocabulary Test", score: 89, date: "2024-02-28", type: "test" }
      ],
      trend: "up",
      teacher: "Ms. Davis"
    },
    {
      name: "Science",
      currentGrade: "A",
      percentage: 92,
      assignments: [
        { name: "Lab Report: Chemistry", score: 94, date: "2024-03-11", type: "lab" },
        { name: "Unit 4 Test", score: 89, date: "2024-03-07", type: "test" },
        { name: "Science Fair Project", score: 95, date: "2024-03-04", type: "project" },
        { name: "Weekly Quiz", score: 91, date: "2024-03-02", type: "quiz" }
      ],
      trend: "up",
      teacher: "Dr. Smith"
    },
    {
      name: "History",
      currentGrade: "B",
      percentage: 85,
      assignments: [
        { name: "Chapter 12 Test", score: 83, date: "2024-03-13", type: "test" },
        { name: "Research Paper", score: 87, date: "2024-03-06", type: "essay" },
        { name: "Map Assignment", score: 82, date: "2024-02-29", type: "homework" },
        { name: "Group Presentation", score: 89, date: "2024-02-25", type: "presentation" }
      ],
      trend: "stable",
      teacher: "Mrs. Wilson"
    }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "text-success";
    if (grade.startsWith('B')) return "text-info";
    if (grade.startsWith('C')) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-info";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-success" />;
      case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <span className="w-4 h-4 text-muted-foreground">→</span>;
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case "exam": return "destructive";
      case "test": return "warning";
      case "quiz": return "info";
      case "project": return "success";
      case "homework": return "secondary";
      default: return "outline";
    }
  };

  const overallGPA = subjects.reduce((sum, subject) => sum + subject.percentage, 0) / subjects.length;
  const overallLetterGrade = overallGPA >= 90 ? "A" : overallGPA >= 80 ? "B" : overallGPA >= 70 ? "C" : "D";

  const filteredSubjects = selectedSubject === "all" 
    ? subjects 
    : subjects.filter(subject => subject.name.toLowerCase().includes(selectedSubject.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-success/10 via-success/5 to-primary/10 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-success" />
              {user.role === "parent" ? "Child's Grades" : "My Grades"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Track academic performance and progress across all subjects
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getGradeColor(overallLetterGrade)}`}>
                {overallLetterGrade}
              </div>
              <div className="text-sm text-muted-foreground">Overall Grade</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">
                {Math.round(overallGPA)}%
              </div>
              <div className="text-sm text-muted-foreground">GPA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Grade Overview</CardTitle>
              <CardDescription>
                View grades by semester and subject
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Semester</SelectItem>
                  <SelectItem value="previous">Previous Semester</SelectItem>
                  <SelectItem value="all">All Semesters</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Cards */}
          {filteredSubjects.map((subject, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {subject.name}
                        {getTrendIcon(subject.trend)}
                      </CardTitle>
                      <CardDescription>
                        Teacher: {subject.teacher}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getGradeColor(subject.currentGrade)}`}>
                      {subject.currentGrade}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subject.percentage}%
                    </div>
                  </div>
                </div>
                <Progress value={subject.percentage} className="mt-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Recent Assignments</h4>
                  {subject.assignments.slice(0, 4).map((assignment, assignmentIndex) => (
                    <div key={assignmentIndex} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{assignment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(assignment.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getAssignmentTypeColor(assignment.type) as any} className="text-xs">
                          {assignment.type}
                        </Badge>
                        <div className={`text-lg font-bold ${getScoreColor(assignment.score)}`}>
                          {assignment.score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Assignments
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getGradeColor(overallLetterGrade)}`}>
                  {overallLetterGrade}
                </div>
                <div className="text-lg text-muted-foreground">
                  {Math.round(overallGPA)}%
                </div>
                <Progress value={overallGPA} className="mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-success">
                    {subjects.filter(s => s.currentGrade.startsWith('A')).length}
                  </div>
                  <div className="text-xs text-muted-foreground">A Grades</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-info">
                    {subjects.filter(s => s.currentGrade.startsWith('B')).length}
                  </div>
                  <div className="text-xs text-muted-foreground">B Grades</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['A', 'B', 'C', 'D'].map((grade, index) => {
                const count = subjects.filter(s => s.currentGrade.startsWith(grade)).length;
                const percentage = (count / subjects.length) * 100;
                return (
                  <div key={grade}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={getGradeColor(grade)}>{grade} Grade</span>
                      <span className="font-medium">{count} subjects</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-info" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="font-medium text-sm text-success-foreground">Grade Updated</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Science Lab Report - 94% (Yesterday)
                  </div>
                </div>
                <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="font-medium text-sm text-info-foreground">New Assignment</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Math Chapter 6 Quiz - Due Friday
                  </div>
                </div>
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="font-medium text-sm text-warning-foreground">Report Card</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Q3 Report Card available
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report Card
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Grade History
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Grade Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};