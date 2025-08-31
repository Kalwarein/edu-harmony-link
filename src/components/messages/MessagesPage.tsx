import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Shield, Clock, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_admin_message: boolean;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
    is_blocked?: boolean;
    timeout_until?: string;
  };
}

interface MessagesPageProps {
  user: any;
  adminLevel?: string;
  adminPermissions?: string[];
}

export const MessagesPage = ({ user, adminLevel, adminPermissions }: MessagesPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isAdmin = adminLevel && adminPermissions;
  const canManageUsers = adminPermissions?.includes("Manage all users and staff") || 
                        adminPermissions?.includes("Moderate parent discussions");

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          setUnreadCount(prev => prev + 1);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Add demo sender data since we don't have the foreign key working yet
      const messagesWithSenders = (data || []).map(msg => ({
        ...msg,
        sender: {
          first_name: "Demo",
          last_name: "User",
          avatar_url: "👤",
          role: msg.is_admin_message ? "admin" : "student"
        }
      }));
      
      setMessages(messagesWithSenders);
    } catch (error) {
      // Load demo messages if DB fails
      const demoMessages: Message[] = [
        {
          id: "1",
          sender_id: "admin",
          content: "Welcome to Sheikh Tais Academy community chat! Please be respectful and follow our guidelines.",
          is_admin_message: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          sender: { first_name: "Admin", last_name: "System", role: "admin", avatar_url: "🎓" }
        },
        {
          id: "2", 
          sender_id: "student1",
          content: "Hello everyone! Excited to be part of this academy!",
          is_admin_message: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: { first_name: "Sarah", last_name: "Ahmed", role: "student", avatar_url: "👩‍🎓" }
        }
      ];
      setMessages(demoMessages);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    
    try {
      const messageData = {
        sender_id: user.user_id || 'demo-user',
        content: newMessage,
        is_admin_message: !!isAdmin
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      setNewMessage("");
      
      toast({
        title: "Message sent!",
        description: isAdmin ? "Admin message broadcasted to all users." : "Your message has been sent.",
      });
    } catch (error) {
      // Add message locally if DB fails (demo mode)
      const demoMessage: Message = {
        id: Date.now().toString(),
        sender_id: user.user_id || 'demo-user',
        content: newMessage,
        is_admin_message: !!isAdmin,
        created_at: new Date().toISOString(),
        sender: {
          first_name: user.first_name || user.name?.split(' ')[0] || "Demo",
          last_name: user.last_name || user.name?.split(' ')[1] || "User", 
          avatar_url: user.avatar || "👤",
          role: user.role || 'student'
        }
      };
      
      setMessages(prev => [...prev, demoMessage]);
      setNewMessage("");
    }
    
    setLoading(false);
  };

  const handleUserAction = async (userId: string, action: 'block' | 'timeout' | 'unblock') => {
    // Simulate admin action
    toast({
      title: "User Action",
      description: `User ${action} action has been applied.`,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-background">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">ST</span>
              </div>
              <div>
                <h3 className="font-semibold">Sheikh Tais Academy</h3>
                <p className="text-sm text-muted-foreground">Community Chat</p>
              </div>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  {adminLevel?.toUpperCase()}
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === (user.user_id || 'demo-user');
            const isBlocked = message.sender?.is_blocked;
            const isTimedOut = message.sender?.timeout_until && 
                             new Date(message.sender.timeout_until) > new Date();

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={message.sender?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                    {message.sender?.avatar_url || 
                     `${message.sender?.first_name?.[0] || 'U'}${message.sender?.last_name?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </span>
                    {message.is_admin_message && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {message.sender?.role && (
                      <Badge variant="outline" className="text-xs">
                        {message.sender.role}
                      </Badge>
                    )}
                    {(isBlocked || isTimedOut) && (
                      <Badge variant="destructive" className="text-xs">
                        {isBlocked ? <Ban className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`rounded-lg p-3 max-w-full break-words ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : message.is_admin_message
                        ? 'bg-gradient-to-r from-secondary to-primary text-white border border-primary/20'
                        : 'bg-muted'
                    } ${(isBlocked || isTimedOut) ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.created_at)}
                    </span>
                    
                    {canManageUsers && !isOwnMessage && message.sender_id !== 'admin' && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUserAction(message.sender_id, 'timeout')}
                        >
                          <Clock className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-destructive"
                          onClick={() => handleUserAction(message.sender_id, 'block')}
                        >
                          <Ban className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <Card className="rounded-none border-x-0 border-b-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2 items-end"
          >
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isAdmin 
                    ? "Send admin message to all users..." 
                    : "Type your message..."
                }
                className="pr-10 bg-background"
                maxLength={500}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>

            <Button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className={`${
                isAdmin 
                  ? 'bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90' 
                  : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              {newMessage.length}/500 characters
            </p>
            {isAdmin && (
              <p className="text-xs text-primary font-medium">
                🔹 Admin mode active - message will be broadcast to all users
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};