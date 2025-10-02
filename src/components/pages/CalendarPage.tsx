import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, BookOpen, AlertCircle, GraduationCap } from "lucide-react";

interface CalendarPageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const CalendarPage = ({ user }: CalendarPageProps) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedView, setSelectedView] = useState("month");

  const events = [
    {
      id: 1,
      title: "Math Quiz - Chapter 5",
      date: "2024-03-15",
      time: "9:00 AM",
      type: "academic",
      description: "Quiz covering algebraic equations and functions",
      class: "Math 8A",
      priority: "high"
    },
    {
      id: 2,
      title: "Parent-Teacher Conference",
      date: "2024-03-15",
      time: "2:00 PM",
      type: "meeting",
      description: "Individual meetings with parents",
      priority: "high"
    },
    {
      id: 3,
      title: "Science Fair",
      date: "2024-03-20",
      time: "10:00 AM",
      type: "event",
      description: "Annual school science fair and exhibitions",
      priority: "medium"
    },
    {
      id: 4,
      title: "Spring Break",
      date: "2024-03-25",
      time: "All Day",
      type: "holiday",
      description: "School closed for spring break",
      priority: "low"
    },
    {
      id: 5,
      title: "Library Study Session",
      date: "2024-03-18",
      time: "3:30 PM",
      type: "extracurricular",
      description: "Group study session for upcoming exams",
      priority: "medium"
    },
    {
      id: 6,
      title: "Report Card Distribution",
      date: "2024-03-22",
      time: "All Day",
      type: "academic",
      description: "Quarter 3 report cards available",
      priority: "high"
    }
  ];

  const filterOptions = [
    { value: "all", label: "All Events" },
    { value: "academic", label: "Academic" },
    { value: "meeting", label: "Meetings" },
    { value: "event", label: "School Events" },
    { value: "holiday", label: "Holidays" },
    { value: "extracurricular", label: "Extracurricular" }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "academic": return BookOpen;
      case "meeting": return Users;
      case "event": return GraduationCap;
      case "holiday": return Calendar;
      case "extracurricular": return Clock;
      default: return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "academic": return "bg-primary/10 border-primary/20 text-primary";
      case "meeting": return "bg-warning/10 border-warning/20 text-warning";
      case "event": return "bg-success/10 border-success/20 text-success";
      case "holiday": return "bg-secondary/10 border-secondary/20 text-secondary";
      case "extracurricular": return "bg-info/10 border-info/20 text-info";
      default: return "bg-muted/10 border-muted/20 text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const filteredEvents = selectedFilter === "all" 
    ? events 
    : events.filter(event => event.type === selectedFilter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return eventDate.toDateString() === today.toDateString();
  };

  const isUpcoming = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <div className="space-y-6 pb-24 px-4 max-w-7xl mx-auto pt-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              School Calendar
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with all school events, deadlines, and important dates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filter Events</CardTitle>
              <CardDescription>
                Choose which type of events to display
              </CardDescription>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mini Calendar - Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">March 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground mb-4">
                Mini calendar widget would go here
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="p-2 font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {/* Sample calendar days */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div 
                    key={day} 
                    className={`p-2 hover:bg-muted rounded cursor-pointer transition-colors ${
                      day === 15 ? 'bg-primary text-primary-foreground' : ''
                    } ${day === 20 || day === 22 ? 'bg-secondary/20' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {filteredEvents.filter(e => isUpcoming(e.date)).length}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {filteredEvents.filter(e => e.type === 'academic').length}
                </div>
                <div className="text-sm text-muted-foreground">Academic Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {filteredEvents.filter(e => e.priority === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Events */}
          {filteredEvents.some(event => isToday(event.date)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Today's Events
                </CardTitle>
                <CardDescription>
                  Events scheduled for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => isToday(event.date))
                    .map((event) => {
                      const EventIcon = getEventIcon(event.type);
                      return (
                        <div 
                          key={event.id} 
                          className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <EventIcon className="w-5 h-5" />
                              <div>
                                <h4 className="font-medium">{event.title}</h4>
                                <p className="text-sm opacity-80">{event.time}</p>
                              </div>
                            </div>
                            <Badge variant={getPriorityColor(event.priority) as any}>
                              {event.priority}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2 opacity-90">{event.description}</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Events List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFilter === "all" ? "All Events" : filterOptions.find(f => f.value === selectedFilter)?.label}
              </CardTitle>
              <CardDescription>
                {filteredEvents.length} events found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const EventIcon = getEventIcon(event.type);
                  return (
                    <div 
                      key={event.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getEventColor(event.type)}`}>
                          <EventIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.date)} • {event.time}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                          {event.class && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {event.class}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getPriorityColor(event.priority) as any} className="mb-2">
                          {event.priority}
                        </Badge>
                        <div className="text-xs text-muted-foreground capitalize">
                          {event.type}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No events found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filter to see more events.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {user.role === "staff" && (
            <div className="flex gap-3">
              <Button className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Add Event
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Schedule Assignment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};