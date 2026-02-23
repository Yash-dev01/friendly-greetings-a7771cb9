import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ChatBox } from '../components/ChatBox';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import { motion } from 'framer-motion';

interface Conversation {
  id: string;
  participants: string[];
  last_message?: string;
  last_message_time?: string;
  unread_count?: { [key: string]: number };
}

export function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (showNewChat) {
      loadAvailableUsers();
    }
  }, [showNewChat, user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const session = await (window as any).__auth?.getSession?.();
      if (!session?.session?.access_token) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.sort((a: Conversation, b: Conversation) => {
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          return timeB - timeA;
        }));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadAvailableUsers = () => {
    if (!user) return;
    const allUsers = storage.getUsers();
    const usersToShow = allUsers.filter(u => {
      if (u.id === user.id) return false;
      if (user.role === 'student') return u.role === 'alumni';
      if (user.role === 'alumni') return u.role === 'student' || u.role === 'alumni';
      return false;
    });
    setAvailableUsers(usersToShow);
  };

  const getOtherUser = (conversation: Conversation): User | undefined => {
    const otherUserId = conversation.participants.find(id => id !== user?.id);
    return storage.getUserById(otherUserId || '');
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const selectedOtherUser = selectedConversation ? getOtherUser(selectedConversation) : null;

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const session = await (window as any).__auth?.getSession?.();
      if (!session?.session?.access_token) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/messages/conversations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId }),
      });

      if (response.ok) {
        const conversation = await response.json();
        setSelectedConversationId(conversation.id);
        setShowNewChat(false);
        loadConversations();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Connect and chat with {user?.role === 'student' ? 'alumni mentors' : 'students and alumni'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="New conversation"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showNewChat ? (
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-700 px-3 py-2">Start New Chat</h3>
                {availableUsers.map((availableUser, index) => (
                  <motion.button
                    key={availableUser.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleStartChat(availableUser.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    {availableUser.avatarUrl && (
                      <img
                        src={availableUser.avatarUrl}
                        alt={availableUser.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{availableUser.fullName}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {availableUser.role === 'alumni' ? availableUser.position : availableUser.department}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No conversations yet</p>
                    <p className="text-sm text-gray-400">
                      Click the + button to start a new chat
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const isSelected = conversation.id === selectedConversationId;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'
                        }`}
                      >
                        {otherUser?.avatarUrl && (
                          <img
                            src={otherUser.avatarUrl}
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {otherUser?.fullName}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.last_message_time)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden p-0">
          {selectedConversation && selectedOtherUser ? (
            <ChatBox
              conversationId={selectedConversation.id}
              otherUser={selectedOtherUser}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list or start a new one
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
