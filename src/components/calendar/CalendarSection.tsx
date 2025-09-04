import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Plus, Users, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  end_date?: string;
  end_time?: string;
  location?: string;
  event_type: string;
  priority: string;
  created_by: string;
  created_at: string;
}

interface CalendarSectionProps {
  user: any;
}

export const CalendarSection = ({ user }: CalendarSectionProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Real-time subscription for events
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDate,
          event_time: eventTime || null,
          location: location.trim() || null,
          event_type: eventType,
          priority,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event created successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setEventDate('');
      setEventTime('');
      setLocation('');
      setEventType('general');
      setPriority('normal');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return Users;
      case 'break':
        return Clock;
      case 'announcement':
        return Info;
      default:
        return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return AlertTriangle;
      case 'normal':
        return CheckCircle;
      case 'low':
        return Info;
      default:
        return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const canCreateEvents = user.role === 'staff' || user.admin_level === 'principal' || user.admin_level === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Real-time clock */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground animate-fade-in">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {format(currentDateTime, 'HH:mm:ss')}
            </div>
            <div className="text-lg opacity-90">
              {format(currentDateTime, 'EEEE, MMMM do, yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Event Form */}
      {canCreateEvents && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                School Events
              </CardTitle>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </CardHeader>

          {showCreateForm && (
            <CardContent className="space-y-4 border-t animate-fade-in">
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter event title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter event description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter event location..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isCreating}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {isCreating ? 'Creating...' : 'Create Event'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Events List */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const EventIcon = getEventIcon(event.event_type);
                const PriorityIcon = getPriorityIcon(event.priority);
                
                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 animate-fade-in"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <EventIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex items-center gap-2">
                            <PriorityIcon className={`h-4 w-4 ${getPriorityColor(event.priority)}`} />
                            <Badge 
                              variant="outline" 
                              className={getEventColor(event.event_type)}
                            >
                              {event.event_type}
                            </Badge>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-muted-foreground">{event.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(event.event_date), 'MMM dd, yyyy')}
                          </div>
                          {event.event_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.event_time}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};