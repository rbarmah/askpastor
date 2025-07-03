import { useState, useEffect } from 'react';
import { supabase, ChatSession, ChatRegistration, ChatParticipant, ChatMessage } from '../lib/supabase';

export const useWeeklyChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [registrations, setRegistrations] = useState<ChatRegistration[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (sessionDate?: string) => {
    try {
      let query = supabase
        .from('chat_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionDate) {
        query = query.eq('session_date', sessionDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchParticipants = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_removed', false)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const registerForSession = async (
    sessionDate: string,
    userName: string,
    email: string,
    phone?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('chat_registrations')
        .insert([{
          session_date: sessionDate,
          user_name: userName,
          email,
          phone: phone || null
        }])
        .select()
        .single();

      if (error) throw error;
      setRegistrations(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error registering for session:', error);
      throw error;
    }
  };

  const joinSession = async (sessionId: string, registrationId: string, userName: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .insert([{
          session_id: sessionId,
          registration_id: registrationId,
          user_name: userName
        }])
        .select()
        .single();

      if (error) throw error;
      setParticipants(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  };

  const sendMessage = async (sessionId: string, text: string, authorName: string, isPastor: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
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

  const deleteMessage = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== messageId));
      return data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .update({ is_removed: true })
        .eq('id', participantId)
        .select()
        .single();

      if (error) throw error;
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      return data;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ is_active: true })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ is_active: false, is_completed: true })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      return data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  };

  const getNextSession = () => {
    const now = new Date();
    return sessions.find(session => {
      const sessionDate = new Date(session.session_date);
      return sessionDate >= now && !session.is_completed;
    });
  };

  const getCurrentSession = () => {
    return sessions.find(session => session.is_active);
  };

  const isSessionLive = (session: ChatSession) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    return now >= startTime && now <= endTime && session.is_active;
  };

  const getTimeUntilSession = (session: ChatSession) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const diffMs = startTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    fetchSessions();

    // Subscribe to real-time updates
    const sessionsSubscription = supabase
      .channel('chat_sessions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessions' },
        () => fetchSessions()
      )
      .subscribe();

    return () => {
      sessionsSubscription.unsubscribe();
    };
  }, []);

  const subscribeToMessages = (sessionId: string) => {
    const messagesSubscription = supabase
      .channel(`session_messages_${sessionId}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(m => m.id !== updatedMessage.id));
          }
        }
      )
      .subscribe();

    return () => messagesSubscription.unsubscribe();
  };

  const subscribeToParticipants = (sessionId: string) => {
    const participantsSubscription = supabase
      .channel(`session_participants_${sessionId}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setParticipants(prev => [...prev, payload.new as ChatParticipant]);
        }
      )
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chat_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const updatedParticipant = payload.new as ChatParticipant;
          if (updatedParticipant.is_removed) {
            setParticipants(prev => prev.filter(p => p.id !== updatedParticipant.id));
          }
        }
      )
      .subscribe();

    return () => participantsSubscription.unsubscribe();
  };

  return {
    sessions,
    registrations,
    participants,
    messages,
    loading,
    registerForSession,
    joinSession,
    sendMessage,
    deleteMessage,
    removeParticipant,
    startSession,
    endSession,
    fetchRegistrations,
    fetchParticipants,
    fetchMessages,
    getNextSession,
    getCurrentSession,
    isSessionLive,
    getTimeUntilSession,
    subscribeToMessages,
    subscribeToParticipants,
    refetch: fetchSessions
  };
};