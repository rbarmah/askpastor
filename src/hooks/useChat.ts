import { useState, useEffect } from 'react';
import { supabase, ChatRoom, ChatMessage } from '../lib/supabase';

export const useChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatRooms(data || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createChatRoom = async (title: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert([{ title, description, is_active: true, participants: 0 }])
        .select()
        .single();

      if (error) throw error;
      setChatRooms(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  };

  const sendMessage = async (roomId: string, text: string, authorName: string, isPastor: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          room_id: roomId,
          text,
          author_name: authorName,
          is_pastor: isPastor
        }])
        .select()
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const updateRoomParticipants = async (roomId: string, increment: boolean) => {
    try {
      const room = chatRooms.find(r => r.id === roomId);
      if (!room) return;

      const newCount = increment ? room.participants + 1 : Math.max(0, room.participants - 1);
      
      const { data, error } = await supabase
        .from('chat_rooms')
        .update({ participants: newCount })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      setChatRooms(prev => prev.map(r => r.id === roomId ? data : r));
    } catch (error) {
      console.error('Error updating participants:', error);
    }
  };

  useEffect(() => {
    fetchChatRooms();

    // Subscribe to real-time updates for chat rooms
    const roomsSubscription = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_rooms' },
        () => fetchChatRooms()
      )
      .subscribe();

    return () => {
      roomsSubscription.unsubscribe();
    };
  }, []);

  const subscribeToMessages = (roomId: string) => {
    const messagesSubscription = supabase
      .channel(`messages_${roomId}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => messagesSubscription.unsubscribe();
  };

  return {
    chatRooms,
    messages,
    loading,
    fetchMessages,
    createChatRoom,
    sendMessage,
    updateRoomParticipants,
    subscribeToMessages,
    refetch: fetchChatRooms
  };
};