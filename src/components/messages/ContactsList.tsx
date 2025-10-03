import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Contact {
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

interface ContactsListProps {
  currentUserId: string;
}

export const ContactsList = ({ currentUserId }: ContactsListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, phone_number, role")
        .neq("user_id", currentUserId);

      if (error) throw error;
      setContacts(data || []);
      setFilteredContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(
      (contact) =>
        contact.first_name.toLowerCase().includes(query) ||
        contact.last_name.toLowerCase().includes(query) ||
        contact.phone_number.includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleStartChat = async (contact: Contact) => {
    try {
      // Check for existing conversation in both directions
      const { data: existingConv, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${currentUserId},participant_2.eq.${contact.user_id}),and(participant_1.eq.${contact.user_id},participant_2.eq.${currentUserId})`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let conversationId = existingConv?.id;

      if (!conversationId) {
        // Create new conversation with consistent ordering
        const participant1 = currentUserId < contact.user_id ? currentUserId : contact.user_id;
        const participant2 = currentUserId < contact.user_id ? contact.user_id : currentUserId;

        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({ participant_1: participant1, participant_2: participant2 })
          .select("id")
          .single();

        if (createError) {
          console.error("Create conversation error:", createError);
          throw createError;
        }
        conversationId = newConv.id;
      }

      navigate(`/messages/chat/${conversationId}`);
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle>New Message</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="pt-32 px-4 space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No contacts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card
              key={contact.user_id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleStartChat(contact)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                    {contact.first_name[0]}{contact.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {contact.first_name} {contact.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                </div>
                <Badge variant="secondary">{contact.role}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
