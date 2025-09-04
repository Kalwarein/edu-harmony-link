import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Phone, 
  CheckCircle,
  X,
  Trash2,
  Eye,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Shimmer } from '@/components/ui/shimmer';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  is_erasable: boolean;
  recipient_id?: string;
  created_at: string;
}

interface NotificationsPageProps {
  user: any;
}

export const NotificationsPage = ({ user }: NotificationsPageProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Real-time subscription for notifications
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        () => fetchNotifications()
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `recipient_id=is.null`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'assignment':
        return FileText;
      case 'event':
        return Calendar;
      case 'call':
        return Phone;
      case 'announcement':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assignment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'event':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'call':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'announcement':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>

          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  
                  return (
                    <Card
                      key={notification.id}
                      className={`transition-all duration-200 hover:shadow-md animate-fade-in cursor-pointer ${
                        !notification.is_read ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-lg ${
                              !notification.is_read ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-semibold ${
                                    !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getNotificationColor(notification.type)}`}
                                >
                                  {notification.type}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                {notification.is_erasable && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <p className={`text-sm leading-relaxed ${
                              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.content}
                            </p>
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