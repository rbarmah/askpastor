import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, MessageCircle, Users, TrendingUp, Calendar, LogOut } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { useChat } from '../hooks/useChat';

interface PastorDashboardProps {
  isLoggedIn: boolean;
  onLogin: (status: boolean) => void;
  onNavigate: (page: string) => void;
}

const PastorDashboard: React.FC<PastorDashboardProps> = ({ isLoggedIn, onLogin, onNavigate }) => {
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const { questions } = useQuestions();
  const { chatRooms } = useChat();

  const pastorPasskeys = [
    'Faith2024!Strong',
    'HopeAnchor#777',
    'GracePower$99',
    'TruthSeeker@123',
    'LoveWins&Always',
    'SpiritLed*456',
    'WisdomPath#888',
    'PrayerWarrior!321',
    'BibleStudy@555',
    'PastorHeart$777'
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastorPasskeys.includes(passkeyInput)) {
      onLogin(true);
    } else {
      alert('Invalid passkey. Please try again.');
    }
  };

  const handleSignOut = () => {
    onLogin(false);
    onNavigate('home');
  };

  const unansweredQuestions = questions.filter(q => !q.answered).length;
  const answeredToday = questions.filter(q => {
    if (!q.answer_timestamp) return false;
    const today = new Date().toDateString();
    return new Date(q.answer_timestamp).toDateString() === today;
  }).length;
  const activeChats = chatRooms.filter(r => r.is_active).length;
  const totalParticipants = chatRooms.reduce((sum, room) => sum + room.participants, 0);

  const stats = [
    { label: 'Unanswered Questions', value: unansweredQuestions.toString(), icon: MessageCircle, color: 'from-teal-100 to-teal-200' },
    { label: 'Answered Today', value: answeredToday.toString(), icon: TrendingUp, color: 'from-orange-100 to-orange-200' },
    { label: 'Active Chat Rooms', value: activeChats.toString(), icon: Users, color: 'from-pink-100 to-pink-200' },
    { label: 'Total Participants', value: totalParticipants.toString(), icon: Calendar, color: 'from-purple-100 to-purple-200' }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-slate-700" />
              </div>
              <h1 className="text-3xl font-light text-slate-900 mb-3">Pastor Login</h1>
              <p className="text-slate-600">Enter your secure passkey to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Passkey
                </label>
                <div className="relative">
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your passkey"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPasskey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300"
              >
                <span className="flex items-center justify-center space-x-3">
                  <Lock className="h-5 w-5" />
                  <span>Access Dashboard</span>
                </span>
              </button>
            </form>

            <div className="mt-12 p-6 bg-slate-50/60 rounded-2xl border border-slate-200/50">
              <h3 className="text-sm font-medium text-slate-700 mb-4 tracking-wide">Quick Access (Demo)</h3>
              <div className="grid grid-cols-2 gap-2">
                {pastorPasskeys.slice(0, 4).map((passkey, index) => (
                  <button
                    key={index}
                    onClick={() => setPasskeyInput(passkey)}
                    className="text-xs text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/80 px-3 py-2 rounded-lg transition-all border border-slate-200/50"
                  >
                    {passkey}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        {/* Header with Sign Out */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-5xl font-light text-slate-900 mb-4">Welcome back, Pastor Stefan!</h1>
            <p className="text-xl text-slate-600">Here's what's happening with your ministry today</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium tracking-wide transition-all duration-300 flex items-center space-x-3"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="h-6 w-6 text-slate-700" />
                </div>
                <div className="text-3xl font-light text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 tracking-wide">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8">
            <h3 className="text-2xl font-light text-slate-900 mb-8">Quick Actions</h3>
            <div className="space-y-4">
              <button
                onClick={() => onNavigate('questions')}
                className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all text-left"
              >
                Answer New Questions
              </button>
              <button
                onClick={() => onNavigate('chat')}
                className="w-full bg-slate-700 text-white px-6 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-600 transition-all text-left"
              >
                Start Live Chat Session
              </button>
              <button className="w-full bg-slate-500 text-white px-6 py-4 rounded-xl font-medium tracking-wide hover:bg-slate-400 transition-all text-left">
                Send Weekly Encouragement
              </button>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8">
            <h3 className="text-2xl font-light text-slate-900 mb-8">Recent Activity</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-slate-50/60 rounded-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-slate-900 font-medium">Answered {answeredToday} questions</div>
                  <div className="text-slate-500 text-sm">Today</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-slate-50/60 rounded-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-slate-900 font-medium">{activeChats} active chat rooms</div>
                  <div className="text-slate-500 text-sm">Right now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Passkeys */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8">
          <h3 className="text-2xl font-light text-slate-900 mb-6">Your Secure Passkeys</h3>
          <p className="text-slate-600 mb-8">
            Keep these passkeys secure. You can use any of them to access your dashboard.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastorPasskeys.map((passkey, index) => (
              <div
                key={index}
                className="bg-slate-50/60 border border-slate-200/50 rounded-xl p-4 font-mono text-sm text-slate-700"
              >
                {passkey}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastorDashboard;