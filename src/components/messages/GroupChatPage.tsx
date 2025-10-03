import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, X, File, Mic, Square, Play, Pause, ArrowLeft } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useNavigate } from "react-router-dom";

interface GroupChatPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  adminLevel?: string | null;
}

export const GroupChatPage = ({ user, adminLevel }: GroupChatPageProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("group-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        if (payload.new.sender_id !== user.id) {
          setUnreadCount((prev) => prev + 1);
        }
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Enrich messages with sender details from profiles
      const enrichedMessages = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, role, admin_level")
            .eq("user_id", msg.sender_id)
            .single();

          return {
            ...msg,
            sender_name: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown User",
            sender_role: profile?.role || "user",
            sender_admin_level: profile?.admin_level || null,
          };
        })
      );

      setMessages(enrichedMessages);
      if (enrichedMessages && enrichedMessages.length > 0) {
        setLastSeenMessageId(enrichedMessages[enrichedMessages.length - 1].id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNewMessages = () => {
    const firstUnreadIndex = messages.findIndex((msg) => 
      lastSeenMessageId && msg.id > lastSeenMessageId
    );
    if (firstUnreadIndex !== -1) {
      const element = document.getElementById(`message-${messages[firstUnreadIndex].id}`);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setUnreadCount(0);
    if (messages.length > 0) {
      setLastSeenMessageId(messages[messages.length - 1].id);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob && !isPlayingAudio) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const deleteAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioBlob(null);
    setIsPlayingAudio(false);
  };

  const uploadFile = async (file: File | Blob, fileName: string): Promise<string> => {
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(uniqueFileName, file);
    if (error) throw error;

    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(uniqueFileName);
    return data.publicUrl;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachmentFile && !audioBlob) return;

    setLoading(true);
    try {
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      if (attachmentFile) {
        attachmentUrl = await uploadFile(attachmentFile, attachmentFile.name);
        attachmentType = attachmentFile.type;
        attachmentName = attachmentFile.name;
      } else if (audioBlob) {
        attachmentUrl = await uploadFile(audioBlob, "voice-message.webm");
        attachmentType = "audio/webm";
        attachmentName = "Voice Message";
      }

      const messageData = {
        content: newMessage.trim() || (audioBlob ? "[Voice Message]" : "[Attachment]"),
        sender_id: user.id,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
        is_admin_message: adminLevel ? true : false,
        reply_to: replyTo?.id || null,
        reply_to_content: replyTo?.content || null,
        reply_to_sender: replyTo?.sender_name || null,
      };

      console.log("Sending group message:", messageData);

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error("Message insert error:", error);
        throw error;
      }

      console.log("Message sent successfully:", data);

      setNewMessage("");
      setAttachmentFile(null);
      setAttachmentPreview(null);
      setAudioBlob(null);
      setReplyTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast({
        title: "Success",
        description: "Message sent",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
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

  const handleReply = (message: any) => setReplyTo(message);

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) throw error;
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast({ title: "Success", description: "Message deleted" });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50 shadow">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold">General Chat</h2>
              <p className="text-xs text-muted-foreground">Everyone can see these messages</p>
            </div>
          </div>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <Button
            size="sm"
            onClick={scrollToNewMessages}
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            {unreadCount} new message{unreadCount > 1 ? "s" : ""}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pt-20 pb-32 px-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} id={`message-${message.id}`}>
            <MessageBubble
              message={message}
              isOwnMessage={message.sender_id === user.id}
              user={user}
              adminLevel={adminLevel}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 z-50">
        {replyTo && (
          <div className="mb-2 p-2 bg-muted/30 rounded-lg flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary">Replying to {replyTo.sender_name}</p>
              <p className="text-sm truncate">{replyTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {attachmentFile && (
          <div className="mb-2 p-3 bg-muted/30 rounded-lg flex items-center gap-3">
            {attachmentPreview ? (
              <img src={attachmentPreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : (
              <File className="w-8 h-8 text-primary" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachmentFile.name}</p>
              <p className="text-xs text-muted-foreground">{(attachmentFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeAttachment}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {audioBlob && (
          <div className="mb-2 p-3 bg-muted/30 rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isPlayingAudio ? pauseAudio : playAudio}
                className="h-8 w-8 p-0"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <p className="text-sm font-medium">Voice Message</p>
            </div>
            <Button variant="ghost" size="sm" onClick={deleteAudio} className="ml-auto">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button variant="outline" size="icon" onClick={handleFileSelect} disabled={loading || isRecording}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="outline"
            size="icon"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={loading}
            className={isRecording ? "bg-red-500 text-white" : ""}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || (!newMessage.trim() && !attachmentFile && !audioBlob)}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
