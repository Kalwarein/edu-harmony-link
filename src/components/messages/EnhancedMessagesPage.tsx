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
  Users,
  MessageSquare,
  Crown,
  Star,
  Shield,
  Reply,
  Paperclip,
  File,
  X,
} from "lucide-react";
import { VideoCall } from "./VideoCall";
import { MessageBubble } from "./MessageBubble";

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

export const EnhancedMessagesPage = ({ user, adminLevel }: MessagesPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("first_name, last_name, role, admin_level")
            .eq("user_id", payload.new.sender_id)
            .single();

          const newMessage: Message = {
            ...payload.new,
            sender_name: senderProfile
              ? `${senderProfile.first_name} ${senderProfile.last_name}`
              : "Unknown User",
            sender_role: senderProfile?.role || "student",
            sender_admin_level: senderProfile?.admin_level,
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const senderIds = [...new Set(messagesData.map((msg) => msg.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, role, admin_level")
        .in("user_id", senderIds);

      const messagesWithSenders: Message[] = messagesData.map((msg) => {
        const profile = profiles?.find((p) => p.user_id === msg.sender_id);
        return {
          ...msg,
          sender_name: profile
            ? `${profile.first_name} ${profile.last_name}`
            : "Unknown User",
          sender_role: profile?.role || "student",
          sender_admin_level: profile?.admin_level,
        };
      });

      setMessages(messagesWithSenders);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("chat-attachments")
      .upload(fileName, file);
    if (error) throw error;

    const { data } = supabase.storage
      .from("chat-attachments")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachmentFile) return;

    setLoading(true);
    try {
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      if (attachmentFile) {
        setUploadingFile(true);
        attachmentUrl = await uploadFile(attachmentFile);
        attachmentType = attachmentFile.type;
        attachmentName = attachmentFile.name;
      }

      const messageData = {
        content: newMessage.trim() || "[Attachment]",
        sender_id: user.id,
        is_admin_message: !!adminLevel,
        reply_to: replyingTo?.id || null,
        reply_to_content: replyingTo?.content || null,
        reply_to_sender: replyingTo?.sender_name || null,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      };

      const { error } = await supabase.from("messages").insert(messageData);
      if (error) throw error;

      setNewMessage("");
      setReplyingTo(null);
      setAttachmentFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachmentFile(file);
  };
  const removeReply = () => setReplyingTo(null);
  const removeAttachment = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto relative">
      {/* Fixed Chat Header */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50 shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-primary">
              Chat
            </CardTitle>
          </div>
          {adminLevel && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {adminLevel === "principal" && <Crown className="w-3 h-3" />}
              {adminLevel === "teacher" && <Star className="w-3 h-3" />}
              {adminLevel === "coordinator" && <Shield className="w-3 h-3" />}
              {adminLevel === "parent" && <Users className="w-3 h-3" />}
              Admin
            </Badge>
          )}
        </CardHeader>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-32 px-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.sender_id === user.id}
            user={user}
            onReply={() => setReplyingTo(message)}
            onDelete={() => {}}
            adminLevel={adminLevel}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 z-50">
        {replyingTo && (
          <div className="mb-2 p-2 bg-muted/30 border-l-4 border-primary flex items-center justify-between">
            <div className="flex items-start space-x-2">
              <Reply className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Replying to {replyingTo.sender_name}
                </p>
                <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={removeReply}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {attachmentFile && (
          <div className="mb-2 p-2 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4 text-primary" />
              <span className="text-sm">{attachmentFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(attachmentFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={removeAttachment}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileSelect}
            disabled={uploadingFile}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={adminLevel ? "Send message as admin..." : "Type your message..."}
            disabled={loading || uploadingFile}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || uploadingFile || (!newMessage.trim() && !attachmentFile)}
            className="bg-primary hover:bg-primary/90"
          >
            {loading || uploadingFile ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {showVideoCall && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          callType={callType}
          participants={[user.name]}
        />
      )}
    </div>
  );
};
