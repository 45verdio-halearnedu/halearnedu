
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ChamaMessage = {
  id: string;
  sender_id: string | null;
  message: string;
  sent_at: string;
};

interface ChamaChatProps {
  chamaId: string;
  memberId: string | null;
}

const ChamaChat: React.FC<ChamaChatProps> = ({ chamaId, memberId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChamaMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !chamaId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chama_messages")
          .select("*")
          .eq("chama_id", chamaId)
          .order("sent_at", { ascending: false })
          .limit(15);
        
        if (error) {
          console.error("Error fetching messages:", error);
          setMessages([]);
          return;
        }
        
        setMessages(data ? data.reverse() : []);
      } catch (error) {
        console.error("Unexpected error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chama-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chama_messages',
          filter: `chama_id=eq.${chamaId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as ChamaMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, chamaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !memberId || sending) {
      if (!memberId) {
        toast({ 
          title: "Error", 
          description: "You must be a member to send messages", 
          variant: "destructive" 
        });
      }
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("chama_messages").insert({
        chama_id: chamaId,
        sender_id: memberId,
        message: input.trim(),
      });
      
      if (error) {
        console.error("Error sending message:", error);
        toast({ 
          title: "Send Failed", 
          description: error.message, 
          variant: "destructive" 
        });
        return;
      }
      
      setInput("");
      toast({ 
        title: "Message sent", 
        description: "Your message has been sent successfully" 
      });
    } catch (error) {
      console.error("Unexpected error sending message:", error);
      toast({ 
        title: "Send Failed", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chama Group Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-80 overflow-y-auto space-y-2 border p-2 mb-2 bg-background rounded">
          {loading ? (
            <span>Loading messages...</span>
          ) : messages.length === 0 ? (
            <CardDescription>No messages yet. Start the conversation!</CardDescription>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="text-xs">
                <span className="font-medium">
                  {msg.sender_id === memberId ? "You" : msg.sender_id?.slice(0, 8) ?? "User"}:
                </span>{" "}
                {msg.message}
                <span className="ml-2 text-[10px] text-muted-foreground">
                  {new Date(msg.sent_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef}></div>
        </div>
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            placeholder="Type message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={sending || !memberId}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || !memberId || sending}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChamaChat;
