import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  MoreVertical, 
  UserX, 
  Clock, 
  Shield,
  Crown,
  Star,
  Users,
  Video,
  Phone,
  Archive
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoCall } from "./VideoCall";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_admin_level?: string | null;
  created_at: string;
  is_admin_message?: boolean;
}

interface MessagesPageProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  adminLevel?: string;
  adminPermissions?: string[];
}

export const MessagesPage = ({ user, adminLevel, adminPermissions }: MessagesPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Set up real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('New message:', payload.new);
          const newMessage = payload.new as Message;
          
          // Fetch sender profile for the new message
          supabase
            .from('profiles')
            .select('first_name, last_name, role, admin_level')
            .eq('user_id', newMessage.sender_id)
            .single()
            .then(({ data: profile, error }) => {
              const messageWithSender = {
                ...newMessage,
                sender_name: profile 
                  ? `${profile.first_name} ${profile.last_name}`.trim() 
                  : newMessage.sender_id === user.id ? 'You' : 'Anonymous',
                sender_role: profile?.role || 'student',
                sender_admin_level: profile?.admin_level || null
              };
              
              setMessages(prev => [...prev, messageWithSender]);
              if (newMessage.sender_id !== user.id) {
                setUnreadCount(prev => prev + 1);
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch profiles for all unique sender IDs
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, role, admin_level')
        .in('user_id', senderIds);

      // Create a map of profiles by user_id
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Format messages with sender data
      const messagesWithSenders = messagesData.map(msg => {
        const profile = profilesMap.get(msg.sender_id);
        return {
          ...msg,
          sender_name: profile 
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : msg.sender_id === user.id ? 'You' : 'Anonymous',
          sender_role: profile?.role || 'student',
          sender_admin_level: profile?.admin_level || null
        };
      });

      setMessages(messagesWithSenders);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "Unable to load chat history",
        variant: "destructive",
      });
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Send message to Supabase
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: messageContent,
          sender_id: user.id,
          is_admin_message: !!adminLevel
        });

      if (error) throw error;

      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
      setNewMessage(messageContent); // Restore the message
    } finally {
      setLoading(false);
    }
  };

  const startCall = (type: "video" | "audio") => {
    setCallType(type);
    setShowVideoCall(true);
  };

  // Admin actions
  const handleUserAction = (userId: string, action: "block" | "timeout") => {
    // Implement user moderation actions
    toast({
      title: "Action Performed",
      description: `User ${action} action performed (Demo)`,
    });
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string, adminLevel?: string | null) => {
    if (adminLevel) {
      switch (adminLevel) {
        case "principal":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "teacher":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "coordinator":
          return "bg-green-100 text-green-800 border-green-200";
        case "parent":
          return "bg-purple-100 text-purple-800 border-purple-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
    
    switch (role) {
      case "student":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "parent":
        return "bg-green-50 text-green-700 border-green-200";
      case "staff":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex flex-col">
      <Card className="flex-1 flex flex-col border-0 shadow-none md:border md:shadow-sm">
        <CardHeader className="border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">School Chat</h3>
                <p className="text-sm text-muted-foreground">
                  {messages.length} messages • {unreadCount} unread
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => startCall("video")}
                className="flex items-center gap-1"
              >
                <Video className="w-4 h-4" />
                Video
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => startCall("audio")}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                Audio
              </Button>
              
              {adminLevel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {adminLevel === "principal" && <Crown className="w-3 h-3" />}
                  {adminLevel === "teacher" && <Star className="w-3 h-3" />}
                  {adminLevel === "coordinator" && <Shield className="w-3 h-3" />}
                  {adminLevel === "parent" && <Users className="w-3 h-3" />}
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === user.id;
              const isAdminMessage = message.is_admin_message || message.sender_admin_level;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`text-xs font-medium ${
                      isAdminMessage ? 'bg-primary/10 text-primary' : 'bg-muted'
                    }`}>
                      {message.sender_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${isOwnMessage ? 'order-2' : ''}`}>
                        {isOwnMessage ? 'You' : message.sender_name}
                      </span>
                      
                      <div className={`flex items-center gap-1 ${isOwnMessage ? 'order-1 flex-row-reverse' : ''}`}>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor(message.sender_role, message.sender_admin_level)}`}
                        >
                          {message.sender_admin_level || message.sender_role}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`inline-block max-w-full p-3 rounded-lg ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : isAdminMessage
                        ? 'bg-secondary/50 border border-secondary'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>

                    {/* Admin Controls */}
                    {adminLevel && !isOwnMessage && (
                      <div className="mt-2 flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="top">
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(message.sender_id, "timeout")}
                              className="text-orange-600"
                            >
                              <Clock className="w-3 h-3 mr-2" />
                              Timeout User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(message.sender_id, "block")}
                              className="text-red-600"
                            >
                              <UserX className="w-3 h-3 mr-2" />
                              Block User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="w-3 h-3 mr-2" />
                              Archive Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Message Input */}
          <div className="p-4 bg-card/50">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={adminLevel ? "Send message as admin..." : "Type your message..."}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !newMessage.trim()}
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>
                {newMessage.length}/500 characters
              </span>
              <span>
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        callType={callType}
        participants={[]} // In a real app, this would be dynamic
      />
    </div>
  );
};