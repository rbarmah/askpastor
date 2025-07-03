import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Clock, Settings, Bell } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useEmailSubscription } from '../hooks/useEmailSubscription';

interface ChatPageProps {
  isPastorLoggedIn: boolean;
}

const ChatPage: React.FC<ChatPageProps> = ({ isPastorLoggedIn }) => {
  const { chatRooms, messages, loading, fetchMessages, createChatRoom, sendMessage, updateRoomParticipants, subscribeToMessages } = useChat();
  const { subscribe } = useEmailSubscription();
  
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [emailForNotifications, setEmailForNotifications] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentRoomId) {
      fetchMessages(currentRoomId);
      const unsubscribe = subscribeToMessages(currentRoomId);
      return unsubscribe;
    }
  }, [currentRoomId]);

  const handleJoinChat = async (e: React.FormEvent, roomId: string) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsJoined(true);
      setCurrentRoomId(roomId);
      await updateRoomParticipants(roomId, true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentRoomId) {
      try {
        await sendMessage(currentRoomId, newMessage, userName, isPastorLoggedIn);
        setNewMessage('');
      } catch (error) {
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomTitle.trim() && newRoomDescription.trim()) {
      try {
        await createChatRoom(newRoomTitle, newRoomDescription);
        setNewRoomTitle('');
        setNewRoomDescription('');
        setShowCreateRoom(false);
      } catch (error) {
        alert('Failed to create room. Please try again.');
      }
    }
  };

  const handleEnableNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailForNotifications.trim()) {
      try {
        await subscribe(emailForNotifications);
        setNotificationsEnabled(true);
        setEmailForNotifications('');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to subscribe');
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCreatedAt = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Started ${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Started ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `Started ${date.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light text-slate-900 mb-6">Live Chat Sessions</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join the conversation and connect with Pastor Stefan in real-time
            </p>
          </div>

          {/* Available Rooms */}
          <div className="space-y-6 mb-12">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                className={`bg-white/60 backdrop-blur-sm border rounded-3xl p-8 ${
                  room.is_active ? 'border-teal-200/50 bg-gradient-to-br from-teal-50/30 to-orange-50/30' : 'border-slate-200/50'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-light text-slate-900 flex items-center space-x-3 mb-2">
                      <span>{room.title}</span>
                      {room.is_active && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          LIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-600 text-lg">{room.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 font-medium flex items-center space-x-2 mb-1">
                      <Users className="h-5 w-5" />
                      <span>{room.participants}</span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatCreatedAt(room.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {room.is_active && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                    <h4 className="text-slate-900 font-medium mb-4 tracking-wide">Join this chat</h4>
                    <form onSubmit={(e) => handleJoinChat(e, room.id)} className="space-y-4">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300"
                      >
                        Join Chat
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pastor Room Creation */}
          {isPastorLoggedIn && (
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 mb-12">
              <h3 className="text-2xl font-light text-slate-900 mb-6">Create New Chat Room</h3>
              
              {!showCreateRoom ? (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all"
                >
                  + Create Room
                </button>
              ) : (
                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <input
                    type="text"
                    value={newRoomTitle}
                    onChange={(e) => setNewRoomTitle(e.target.value)}
                    placeholder="Room title"
                    className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    required
                  />
                  <textarea
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="Room description"
                    className="w-full h-24 px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-800 transition-all"
                    >
                      Create Room
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateRoom(false)}
                      className="bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-medium hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Email Notifications */}
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8">
            <h3 className="text-2xl font-light text-slate-900 mb-4">Get Notified</h3>
            <p className="text-slate-600 mb-6 text-lg">
              Never miss a live session! We'll email you when Pastor Stefan starts a new chat.
            </p>
            
            {!notificationsEnabled ? (
              <form onSubmit={handleEnableNotifications} className="space-y-4">
                <input
                  type="email"
                  value={emailForNotifications}
                  onChange={(e) => setEmailForNotifications(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all flex items-center space-x-3"
                >
                  <Bell className="h-5 w-5" />
                  <span>Enable Notifications</span>
                </button>
              </form>
            ) : (
              <div className="text-teal-600 flex items-center space-x-3">
                <Bell className="h-5 w-5" />
                <span>Notifications enabled! You'll get an email when we go live.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentRoom = chatRooms.find(room => room.id === currentRoomId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl h-[600px] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-slate-900">{currentRoom?.title}</h2>
                <p className="text-slate-600">{currentRoom?.participants} participants • Live now</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-3 bg-slate-100/60 rounded-xl hover:bg-slate-200/60 transition-all">
                  <Settings className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex justify-start"
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-6 ${
                    message.is_pastor
                      ? 'bg-gradient-to-br from-teal-50/80 to-orange-50/80 border border-teal-200/50'
                      : 'bg-white/80 border border-slate-200/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span
                      className={`font-medium tracking-wide ${
                        message.is_pastor ? 'text-slate-900' : 'text-slate-900'
                      }`}
                    >
                      {message.author_name}
                    </span>
                    {message.is_pastor && (
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                        PASTOR
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{formatTimestamp(message.created_at)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-slate-200/50">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 py-4 rounded-xl hover:bg-slate-800 transition-all"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;