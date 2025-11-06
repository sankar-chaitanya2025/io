import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/supabase';

export function useChat(sessionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data && isMounted) {
        setMessages(data);
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const sendMessage = async (content: string, senderId: string) => {
    if (!sessionId) return;

    const { error } = await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: senderId,
      content,
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return { messages, loading, sendMessage };
}
