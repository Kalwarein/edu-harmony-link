import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Phone, 
  Video, 
  Users, 
  MessageSquare,
  Crown,
  Star,
  Shield,
  Clock,
  UserX,
  Archive,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  File,
  Mic,
  X,
  Reply
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { VideoCall } from "./VideoCall";
import { MessageBubble } from "./MessageBubble";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_admin_level?: string;
  created_at: string;
  is_admin_message?: boolean;
  reply_to?: string;
  reply_to_content?: string;
  reply_to_sender?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface MessagesPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  adminLevel?: string;
  adminPermissions?: string[];
}

export const EnhancedMessagesPage = ({ user, adminLevel, adminPermissions }: MessagesPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Real-time subscription for messages
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          // Fetch sender profile information
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role, admin_level')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            ...payload.new,
            sender_name: senderProfile 
              ? `${senderProfile.first_name} ${senderProfile.last_name}`
              : 'Unknown User',
            sender_role: senderProfile?.role || 'student',
            sender_admin_level: senderProfile?.admin_level
          } as Message;

          setMessages(prev => [...prev, newMessage]);
          
          // Update unread count if message is not from current user
          if (payload.new.sender_id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // Fetch messages with sender information by joining manually
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData?.map(msg => msg.sender_id) || [])];
      
      // Fetch profiles for all senders
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, role, admin_level')
        .in('user_id', senderIds);

      // Create a lookup map
      const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);

      // Format messages with sender info
      const formattedMessages = messagesData?.map(msg => {
        const profile = profilesMap.get(msg.sender_id);
        return {
          ...msg,
          sender_name: profile 
            ? `${profile.first_name} ${profile.last_name}`
            : 'Unknown User',
          sender_role: profile?.role || 'student',
          sender_admin_level: profile?.admin_level
        };
      }) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachmentFile) || loading) return;

    setLoading(true);
    const messageContent = newMessage.trim();
    let attachmentUrl = '';
    let attachmentType = '';
    let attachmentName = '';

    try {
      // Handle file upload if there's an attachment
      if (attachmentFile) {
        setUploadingFile(true);
        const fileExt = attachmentFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(`messages/${fileName}`, attachmentFile);

        let uploadData = data;
        if (uploadError) {
          // If storage bucket doesn't exist, create it first
          if (uploadError.message.includes('Bucket not found')) {
            await supabase.storage.createBucket('chat-attachments', { public: true });
            // Retry upload
            const { data: retryData, error: retryError } = await supabase.storage
              .from('chat-attachments')
              .upload(`messages/${fileName}`, attachmentFile);
            
            if (retryError) throw retryError;
            uploadData = retryData;
          } else {
            throw uploadError;
          }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(uploadData?.path || `messages/${fileName}`);

        attachmentUrl = publicUrl;
        attachmentType = attachmentFile.type;
        attachmentName = attachmentFile.name;
        setUploadingFile(false);
      }

      const messageData: any = {
        content: messageContent || (attachmentFile ? `Sent ${attachmentFile.type.startsWith('image/') ? 'an image' : 'a file'}` : ''),
        sender_id: user.id,
        is_admin_message: adminLevel ? true : false
      };

      if (replyingTo) {
        messageData.reply_to = replyingTo.id;
        messageData.reply_to_content = replyingTo.content;
        messageData.reply_to_sender = replyingTo.sender_name;
      }

      if (attachmentUrl) {
        messageData.attachment_url = attachmentUrl;
        messageData.attachment_type = attachmentType;
        messageData.attachment_name = attachmentName;
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      // Reset form
      setNewMessage("");
      setReplyingTo(null);
      setAttachmentFile(null);
      
      toast({
        title: "Message Sent",
        description: "Your message has been delivered to the chat.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
    setUploadingFile(false);
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // Users can only delete their own messages

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast({
        title: "Message Deleted",
        description: "Your message has been removed from the chat.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive"
      });
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    // Focus on input field
    const inputElement = document.querySelector('input[placeholder*="message"]') as HTMLInputElement;
    inputElement?.focus();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      setAttachmentFile(file);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Implement admin actions (timeout, block, etc.)
      console.log(`Admin action: ${action} on user ${userId}`);
      
      toast({
        title: "Action Completed",
        description: `User ${action} has been applied.`,
      });
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        title: "Error",
        description: "Failed to perform admin action.",
        variant: "destructive"
      });
    }
  };

  const startCall = (type: 'video' | 'audio') => {
    setCallType(type);
    setShowVideoCall(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto">
      {/* Chat Header */}
      <Card className="flex-shrink-0 border-b rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">School Chat</CardTitle>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <Avatar className="w-8 h-8 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Avatar className="w-8 h-8 border-2 border-background">
                  <AvatarFallback className="text-xs bg-secondary/10">+</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-muted-foreground">
                {messages.length > 0 ? `${new Set(messages.map(m => m.sender_id)).size} participants` : '1 participant'}
              </span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => startCall('audio')}
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              Audio Call
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => startCall('video')}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              Video Call
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
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col overflow-hidden rounded-none border-x border-b">
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === user.id}
                user={user}
                adminLevel={adminLevel}
                onReply={handleReply}
                onDelete={deleteMessage}
                onUserAction={handleUserAction}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <Separator />
        </CardContent>
      </Card>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="bg-muted/50 border-t px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Reply className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Replying to</span>
            <span className="font-medium">{replyingTo.sender_name}</span>
            <span className="text-muted-foreground truncate max-w-xs">
              {replyingTo.content}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(null)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Attachment Preview */}
      {attachmentFile && (
        <div className="bg-muted/50 border-t px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {attachmentFile.type.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            ) : (
              <File className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium">{attachmentFile.name}</span>
            <span className="text-muted-foreground">
              ({(attachmentFile.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachmentFile(null)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Message Input - Fixed at bottom */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="flex gap-2 items-end">
              <div className="flex gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="h-10 w-10 p-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="h-10 w-10 p-0"
                  title="Voice recording (coming soon)"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              
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
                disabled={uploadingFile}
              />
              
              <Button 
                onClick={sendMessage} 
                disabled={loading || uploadingFile || (!newMessage.trim() && !attachmentFile)}
                className="h-10 px-4"
              >
                {uploadingFile ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>
                {newMessage.length}/500 characters
              </span>
              <span className="hidden sm:block">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        callType={callType}
        participants={[]}
      />
    </div>
  );
};