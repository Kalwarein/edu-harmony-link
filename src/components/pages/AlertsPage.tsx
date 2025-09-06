import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Shield,
  Crown,
  Users,
  Star,
  Cloud,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Shimmer } from '@/components/ui/shimmer';

interface Alert {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  is_erasable: boolean;
  recipient_id?: string;
  created_at: string;
}

interface AlertsPageProps {
  user: any;
}

export const AlertsPage = ({ user }: AlertsPageProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    
    // Real-time subscription for alerts
    const channel = supabase
      .channel('alerts-feed')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications'
        },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get read notifications from localStorage for broadcast notifications
      const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
      
      // Mark broadcast notifications as read if they're in localStorage
      const processedData = (data || []).map(notification => {
        if (!notification.recipient_id && readNotifications.includes(notification.id)) {
          return { ...notification, is_read: true };
        }
        return notification;
      });
      
      setAlerts(processedData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return AlertTriangle;
      case 'weather':
        return Cloud;
      case 'academic':
        return Star;
      case 'event':
        return Calendar;
      case 'general':
      default:
        return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'weather':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'academic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLevel = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'URGENT';
      case 'weather':
        return 'HIGH';
      case 'academic':
        return 'MEDIUM';
      case 'event':
        return 'MEDIUM';
      case 'general':
      default:
        return 'LOW';
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert || alert.is_read) return;

      if (alert.recipient_id) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', alertId)
          .eq('recipient_id', user.id);

        if (error) throw error;
      } else {
        // For broadcast notifications, store read status in localStorage
        const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
        if (!readNotifications.includes(alertId)) {
          readNotifications.push(alertId);
          localStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(readNotifications));
        }
      }
      
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Emergency Alerts & Announcements
            {alerts.filter(a => !a.is_read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(a => !a.is_read).length} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[600px]">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts</h3>
                <p className="text-muted-foreground">
                  You don't have any alerts at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  const priority = getPriorityLevel(alert.type);
                  
                  return (
                    <Card
                      key={alert.id}
                      className={`transition-all duration-200 hover:shadow-md animate-fade-in cursor-pointer border-l-4 ${
                        alert.type === 'emergency' ? 'border-l-red-500' :
                        alert.type === 'weather' ? 'border-l-blue-500' :
                        alert.type === 'academic' ? 'border-l-purple-500' :
                        alert.type === 'event' ? 'border-l-green-500' :
                        'border-l-gray-500'
                      } ${
                        !alert.is_read ? 'bg-primary/5 border-primary' : ''
                      }`}
                      onClick={() => !alert.is_read && markAsRead(alert.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`p-3 rounded-lg ${
                              alert.type === 'emergency' ? 'bg-red-100 text-red-600' :
                              alert.type === 'weather' ? 'bg-blue-100 text-blue-600' :
                              alert.type === 'academic' ? 'bg-purple-100 text-purple-600' :
                              alert.type === 'event' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="h-6 w-6" />
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-bold text-lg ${
                                    !alert.is_read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {alert.title}
                                  </h3>
                                  {!alert.is_read && (
                                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-semibold ${getAlertColor(alert.type)}`}
                                  >
                                    {alert.type.toUpperCase()}
                                  </Badge>
                                  <Badge 
                                    variant={priority === 'URGENT' ? 'destructive' : priority === 'HIGH' ? 'secondary' : 'outline'}
                                    className="text-xs font-semibold"
                                  >
                                    {priority} PRIORITY
                                  </Badge>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${
                              alert.type === 'emergency' ? 'bg-red-50 border-red-200' :
                              alert.type === 'weather' ? 'bg-blue-50 border-blue-200' :
                              alert.type === 'academic' ? 'bg-purple-50 border-purple-200' :
                              alert.type === 'event' ? 'bg-green-50 border-green-200' :
                              'bg-gray-50 border-gray-200'
                            }`}>
                              <p className={`text-sm leading-relaxed ${
                                !alert.is_read ? 'text-foreground font-medium' : 'text-muted-foreground'
                              }`}>
                                {alert.content}
                              </p>
                            </div>

                            {!alert.is_erasable && (
                              <div className="flex items-center gap-2 mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <Shield className="h-4 w-4 text-orange-600" />
                                <span className="text-xs text-orange-700 font-medium">
                                  This is a permanent alert and cannot be dismissed
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};