import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  otherUser?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  lastMessage?: {
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
  };
  unreadCount?: number;
}

interface ConversationsListProps {
  currentUserId: string;
}

export const ConversationsList = ({ currentUserId }: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();

    // Listen for new conversations
    const conversationsChannel = supabase
      .channel("conversations-list-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          console.log("Conversations changed, refetching...");
          fetchConversations();
        }
      )
      .subscribe();

    // Listen for new messages to update last message
    const messagesChannel = supabase
      .channel("direct-messages-list-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        () => {
          console.log("New message received, refetching conversations...");
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      const { data: convData, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          const otherUserId =
            conv.participant_1 === currentUserId ? conv.participant_2 : conv.participant_1;

          console.log("Fetching details for conversation:", conv.id, "other user:", otherUserId);

          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, phone_number")
            .eq("user_id", otherUserId)
            .single();

          const { data: lastMsg } = await supabase
            .from("direct_messages")
            .select("content, created_at, is_read, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from("direct_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", currentUserId);

          return {
            ...conv,
            otherUser: profile || undefined,
            lastMessage: lastMsg || undefined,
            unreadCount: unreadCount || 0,
          };
        })
      );

      console.log("Conversations with details:", conversationsWithDetails);

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50 shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90 rounded-full"
              onClick={() => navigate("/messages/contacts")}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/messages/group")}
              className="flex-1 border-2"
            >
              Group Chat
            </Button>
            <Button variant="default" className="flex-1">
              Private Chats
            </Button>
          </div>
        </CardHeader>
      </div>

      <div className="pt-32 px-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : conversations.length === 0 ? (
          <Card className="text-center py-12 mt-8">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">No Messages Yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation by tapping the + button above
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                onClick={() => navigate(`/messages/chat/${conv.id}`)}
              >
                {conv.unreadCount && conv.unreadCount > 0 && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                    {conv.unreadCount}
                  </div>
                )}
                <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-academy-gold text-foreground text-lg font-bold">
                    {conv.otherUser?.first_name?.[0]}
                    {conv.otherUser?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold truncate ${conv.unreadCount && conv.unreadCount > 0 ? "text-foreground" : ""}`}>
                      {conv.otherUser?.first_name} {conv.otherUser?.last_name}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage ? (
                    <p className={`text-sm truncate ${conv.unreadCount && conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {conv.lastMessage.sender_id === currentUserId && "You: "}
                      {conv.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No messages yet</p>
                  )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
