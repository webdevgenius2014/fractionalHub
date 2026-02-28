"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatDate } from "@/lib/utils";
import { Send } from "lucide-react";
import type { Message, User } from "@/types/database";

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (profile) fetchConversations();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const subscription = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.sender_id === selectedConv?.id || newMsg.recipient_id === selectedConv?.id) {
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [profile, selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from("messages")
      .select("*, sender:users!messages_sender_id_fkey(*), recipient:users!messages_recipient_id_fkey(*)")
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const convMap = new Map<string, Conversation>();
    data.forEach((msg: any) => {
      const otherUser = msg.sender_id === profile.id ? msg.recipient : msg.sender;
      if (!convMap.has(otherUser.id)) {
        convMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: msg.recipient_id === profile.id && !msg.is_read ? 1 : 0,
        });
      }
    });

    setConversations(Array.from(convMap.values()));
    setLoading(false);
  };

  const fetchMessages = async (otherUser: User) => {
    if (!profile) return;

    const { data } = await supabase
      .from("messages")
      .select("*, sender:users!messages_sender_id_fkey(*)")
      .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},recipient_id.eq.${profile.id})`)
      .order("created_at", { ascending: true });

    setMessages((data as unknown as Message[]) ?? []);

    // Mark as read
    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("recipient_id", profile.id)
      .eq("sender_id", otherUser.id)
      .eq("is_read", false);
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv.user);
    fetchMessages(conv.user);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !selectedConv) return;
    setSending(true);

    await supabase.from("messages").insert({
      sender_id: profile.id,
      recipient_id: selectedConv.id,
      message_text: newMessage.trim(),
    });

    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="p-8 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-4rem)]">
        {/* Conversations List */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted text-left border-b transition-colors ${
                    selectedConv?.id === conv.user.id ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={conv.user.profile_photo_url} />
                    <AvatarFallback>
                      {getInitials(conv.user.first_name, conv.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conv.user.first_name} {conv.user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage.message_text}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              <CardHeader className="pb-2 border-b shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConv.profile_photo_url} />
                    <AvatarFallback>{getInitials(selectedConv.first_name, selectedConv.last_name)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-base">
                    {selectedConv.first_name} {selectedConv.last_name}
                  </CardTitle>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === profile?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        <p>{msg.message_text}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex gap-2 shrink-0">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No conversation selected</p>
                <p className="text-sm">Choose a conversation from the left</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
