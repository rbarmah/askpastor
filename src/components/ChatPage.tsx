import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Clock, Settings, Bell, Calendar, UserPlus, UserMinus, Trash2, Play, Square, AlertCircle } from 'lucide-react';
import { useWeeklyChat } from '../hooks/useWeeklyChat';
import { useEmailSubscription } from '../hooks/useEmailSubscription';

interface ChatPageProps {
  isPastorLoggedIn: boolean;
}

const ChatPage: React.FC<ChatPageProps> = ({ isPastorLoggedIn }) => {
  const { 
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
    subscribeToParticipants
  } = useWeeklyChat();
  
  const { subscribe } = useEmailSubscription();
  
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [registrationId, setRegistrationId] = useState<string>('');
  const [emailForNotifications, setEmailForNotifications] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
      fetchParticipants(currentSessionId);
      const unsubscribeMessages = subscribeToMessages(currentSessionId);
      const unsubscribeParticipants = subscribeToParticipants(currentSessionId);
      return () => {
        unsubscribeMessages();
        unsubscribeParticipants();
      };
    }
  }, [currentSessionId]);

  const handleRegister = async (e: React.FormEvent, sessionDate: string) => {
    e.preventDefault();
    if (userName.trim() && email.trim()) {
      try {
        const registration = await registerForSession(sessionDate, userName, email, phone);
        setRegistrationId(registration.id);
        setIsRegistered(true);
        alert('Successfully registered! You will receive an email reminder before the session.');
      } catch (error: any) {
        if (error.code === '23505') {
          alert('You are already registered for this session with this email.');
        } else {
          alert('Failed to register. Please try again.');
        }
      }
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (registrationId && userName.trim()) {
      try {
        await joinSession(sessionId, registrationId, userName);
        setCurrentSessionId(sessionId);
        setIsJoined(true);
      } catch (error) {
        alert('Failed to join session. Please try again.');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentSessionId) {
      try {
        await sendMessage(currentSessionId, newMessage, userName, isPastorLoggedIn);
        setNewMessage('');
      } catch (error) {
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        alert('Failed to delete message.');
      }
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (confirm('Are you sure you want to remove this participant?')) {
      try {
        await removeParticipant(participantId);
      } catch (error) {
        alert('Failed to remove participant.');
      }
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(sessionId);
    } catch (error) {
      alert('Failed to start session.');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to end this session?')) {
      try {
        await endSession(sessionId);
      } catch (error) {
        alert('Failed to end session.');
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

  const formatSessionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSessionTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
      </div>
    );
  }

  const nextSession = getNextSession();
  const currentSession = getCurrentSession();
  const activeSession = currentSession || (nextSession && isSessionLive(nextSession) ? nextSession : null);

  if (isJoined && activeSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl h-[500px] sm:h-[600px] flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 sm:p-6 border-b border-slate-200/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-light text-slate-900">Weekly Live Chat</h2>
                      <p className="text-slate-600 text-sm sm:text-base">
                        {formatSessionDate(activeSession.session_date)} • {participants.length} participants
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                      {isPastorLoggedIn && (
                        <button
                          onClick={() => handleEndSession(activeSession.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="flex justify-start">
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-6 ${
                          message.is_pastor
                            ? 'bg-gradient-to-br from-teal-50/80 to-orange-50/80 border border-teal-200/50'
                            : 'bg-white/80 border border-slate-200/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`font-medium tracking-wide text-sm sm:text-base ${
                              message.is_pastor ? 'text-slate-900' : 'text-slate-900'
                            }`}>
                              {message.author_name}
                            </span>
                            {message.is_pastor && (
                              <span className="bg-slate-900 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                                PASTOR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500">{formatTimestamp(message.created_at)}</span>
                            {isPastorLoggedIn && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 sm:p-6 border-t border-slate-200/50">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Participants Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Participants ({participants.length})</span>
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                      <span className="text-sm font-medium text-slate-900">{participant.user_name}</span>
                      {isPastorLoggedIn && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-all"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-4 lg:mb-6">Weekly Live Chat</h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Join Pastor Stefan every Saturday from 7-8 PM GMT for live conversations about faith, life, and everything in between.
          </p>
        </div>

        {/* Current/Next Session Info */}
        {nextSession && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-6 w-6 text-slate-600" />
                  <h3 className="text-xl sm:text-2xl font-light text-slate-900">Next Session</h3>
                  {isSessionLive(nextSession) && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE NOW</span>
                    </div>
                  )}
                </div>
                <p className="text-lg text-slate-900 mb-2">{formatSessionDate(nextSession.session_date)}</p>
                <p className="text-slate-600 mb-4">
                  {formatSessionTime(nextSession.start_time)} - {formatSessionTime(nextSession.end_time)}
                </p>
                {!isSessionLive(nextSession) && (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Starts in {getTimeUntilSession(nextSession)}</span>
                  </div>
                )}
              </div>

              <div className="text-center lg:text-right">
                {isSessionLive(nextSession) && isRegistered ? (
                  <button
                    onClick={() => handleJoinSession(nextSession.id)}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-all flex items-center space-x-3 mx-auto lg:mx-0"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Join Live Session</span>
                  </button>
                ) : isPastorLoggedIn && !nextSession.is_active && isSessionLive(nextSession) ? (
                  <button
                    onClick={() => handleStartSession(nextSession.id)}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center space-x-3 mx-auto lg:mx-0"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Session</span>
                  </button>
                ) : (
                  <div className="text-slate-600">
                    <div className="text-2xl font-light text-slate-900 mb-1">
                      {registrations.filter(r => r.session_date === nextSession.session_date).length}
                    </div>
                    <div className="text-sm">Registered</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {nextSession && !isRegistered && !isSessionLive(nextSession) && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">Register for Next Session</h3>
            <p className="text-slate-600 mb-6">
              Secure your spot for the upcoming live chat session. Registration is free and helps us manage capacity.
            </p>
            
            <form onSubmit={(e) => handleRegister(e, nextSession.session_date)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <UserPlus className="h-5 w-5" />
                <span>Register for Session</span>
              </button>
            </form>
          </div>
        )}

        {/* Registration Confirmation */}
        {isRegistered && !isSessionLive(nextSession!) && (
          <div className="bg-green-50/60 backdrop-blur-sm border border-green-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-green-900">Registration Confirmed!</h3>
            </div>
            <p className="text-green-700 mb-4">
              You're all set for the live chat session on {formatSessionDate(nextSession!.session_date)}. 
              We'll send you a reminder email before the session starts.
            </p>
            <div className="bg-green-100/60 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>What's next?</strong> Return to this page 5-10 minutes before the session starts. 
                The "Join Live Session" button will appear when Pastor Stefan begins the chat.
              </p>
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">Upcoming Sessions</h3>
          
          <div className="space-y-4">
            {sessions.slice(0, 4).map((session) => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50/60 rounded-2xl space-y-3 sm:space-y-0">
                <div>
                  <div className="font-medium text-slate-900">{formatSessionDate(session.session_date)}</div>
                  <div className="text-sm text-slate-600">
                    {formatSessionTime(session.start_time)} - {formatSessionTime(session.end_time)}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-600">
                    {registrations.filter(r => r.session_date === session.session_date).length} registered
                  </div>
                  {session.is_completed && (
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  )}
                  {session.is_active && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Live Now
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-4">Get Notified</h3>
          <p className="text-slate-600 mb-6 text-base sm:text-lg">
            Never miss a live session! We'll email you reminders and updates about upcoming chats.
          </p>
          
          {!notificationsEnabled ? (
            <form onSubmit={handleEnableNotifications} className="space-y-4">
              <input
                type="email"
                value={emailForNotifications}
                onChange={(e) => setEmailForNotifications(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                required
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all flex items-center space-x-3"
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
};

export default ChatPage;