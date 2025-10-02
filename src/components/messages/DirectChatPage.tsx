import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Paperclip, X, File, Image as ImageIcon, ZoomIn } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  created_at: string;
}

interface DirectChatPageProps {
  currentUserId: string;
  currentUserName: string;
}

export const DirectChatPage = ({ currentUserId, currentUserName }: DirectChatPageProps) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!conversationId) return;
    fetchConversationDetails();
    fetchMessages();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (attachmentFile) {
      if (attachmentFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setAttachmentPreview(reader.result as string);
        reader.readAsDataURL(attachmentFile);
      } else {
        setAttachmentPreview(null);
      }
    } else {
      setAttachmentPreview(null);
    }
  }, [attachmentFile]);

  const fetchConversationDetails = async () => {
    try {
      const { data: conv, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) throw error;

      const otherUserId = conv.participant_1 === currentUserId ? conv.participant_2 : conv.participant_1;

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone_number")
        .eq("user_id", otherUserId)
        .single();

      setOtherUser(profile);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(fileName, file);
    if (error) throw error;

    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(fileName);
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
        attachmentUrl = await uploadFile(attachmentFile);
        attachmentType = attachmentFile.type;
        attachmentName = attachmentFile.name;
      }

      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: newMessage.trim() || "[Attachment]",
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      });

      if (error) throw error;

      setNewMessage("");
      setAttachmentFile(null);
      setAttachmentPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isImage = (type?: string) => type?.startsWith("image/");

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50 shadow">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
              {otherUser?.first_name[0]}{otherUser?.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{otherUser?.first_name} {otherUser?.last_name}</p>
            <p className="text-xs text-muted-foreground">{otherUser?.phone_number}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-20 pb-32 px-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-2xl px-4 py-2 space-y-2`}>
                {message.attachment_url && isImage(message.attachment_type) && (
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => setZoomedImage(message.attachment_url!)}
                  >
                    <img
                      src={message.attachment_url}
                      alt="Attachment"
                      className="rounded-lg max-w-full max-h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                {message.attachment_url && !isImage(message.attachment_type) && (
                  <a
                    href={message.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm underline"
                  >
                    <File className="w-4 h-4" />
                    {message.attachment_name}
                  </a>
                )}
                <p className="break-words">{message.content}</p>
                <p className={`text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 z-50">
        {attachmentFile && (
          <div className="mb-2 p-3 bg-muted/30 rounded-lg flex items-center gap-3">
            {attachmentPreview ? (
              <img src={attachmentPreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : (
              <File className="w-8 h-8 text-primary" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachmentFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(attachmentFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeAttachment}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button variant="outline" size="icon" onClick={handleFileSelect} disabled={loading}>
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
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || (!newMessage.trim() && !attachmentFile)}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          {zoomedImage && (
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
