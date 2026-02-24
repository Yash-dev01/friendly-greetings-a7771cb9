import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { conversationService, Conversation } from '../services/conversationService';
import { socketService } from '../services/socketService';

interface MentorshipChatProps {
  conversationId: string;
  otherUser: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    company?: string;
    position?: string;
  };
  onBack: () => void;
}

export function MentorshipChat({
  conversationId,
  otherUser,
  onBack,
}: MentorshipChatProps) {
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    'http://localhost:5000';

  const getAvatarSrc = (avatarUrl?: string) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE}${avatarUrl}`;
  };

  useEffect(() => {
    loadConversation();

    socketService.joinChat(conversationId);

    socketService.onReceiveMessage((data: any) => {
      if (data.conversationId === conversationId) {
        setConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                _id: data._id || Date.now().toString(),
                senderId: data.senderId,
                content: data.content,
                createdAt: data.createdAt,
              },
            ],
          };
        });
      }
    });

    socketService.onUserTyping((data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUser(data.fullName);
      }
    });

    socketService.onUserStopTyping((data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUser(null);
      }
    });

    return () => {
      socketService.leaveChat(conversationId);
      socketService.offReceiveMessage();
      socketService.offUserTyping?.();
      socketService.offUserStopTyping?.();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const loadConversation = async () => {
    try {
      const conv = await conversationService.getConversationById(
        conversationId
      );
      setConversation(conv);
      await conversationService.markAsRead(conversationId);
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const content = message.trim();
    setMessage('');

    const tempMsg = {
      _id: Date.now().toString(),
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
    };

    setConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev
    );

    try {
      await conversationService.sendMessage(conversationId, content);
    } catch (err) {
      console.error('Failed to send message', err);
    }

    socketService.sendMessage({
      conversationId,
      senderId: user.id,
      content,
      createdAt: tempMsg.createdAt,
    });

    socketService.emitStopTyping({
      conversationId,
      userId: user.id,
    });
  };

  const handleTyping = () => {
    if (!user) return;

    socketService.emitTyping({
      conversationId,
      userId: user.id,
      fullName: user.fullName || '',
    });

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping({
        conversationId,
        userId: user.id,
      });
    }, 2000);
  };

  const getSenderId = (senderId: string | { _id: string }): string =>
    typeof senderId === 'object' ? senderId._id : senderId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-5xl mx-auto">
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                {getAvatarSrc(otherUser.avatarUrl) ? (
                  <img
                    src={getAvatarSrc(otherUser.avatarUrl)!}
                    alt={otherUser.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-50"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {otherUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {otherUser.fullName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {otherUser.position} {otherUser.company && `at ${otherUser.company}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button> */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-6 py-6">
        {!conversation?.messages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start the conversation
            </h3>
            <p className="text-gray-500 max-w-sm">
              Send a message to {otherUser.fullName} to begin your mentorship journey together.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {conversation.messages.map((msg, index) => {
              const isOwn = getSenderId(msg.senderId) === user?.id;
              const showAvatar =
                index === 0 ||
                getSenderId(conversation.messages[index - 1].senderId) !==
                  getSenderId(msg.senderId);

              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${
                    isOwn ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        getAvatarSrc(otherUser.avatarUrl) ? (
                          <img
                            src={getAvatarSrc(otherUser.avatarUrl)!}
                            alt={otherUser.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {otherUser.fullName.charAt(0).toUpperCase()}
                          </div>
                        )
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-md lg:max-w-lg group ${
                      isOwn ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 ${
                        isOwn
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed break-words">
                        {msg.content}
                      </p>
                    </div>
                    <p
                      className={`text-xs mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        isOwn ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {typingUser && (
              <div className="flex gap-3 items-center animate-fade-in">
                <div className="flex-shrink-0">
                  {getAvatarSrc(otherUser.avatarUrl) ? (
                    <img
                      src={getAvatarSrc(otherUser.avatarUrl)!}
                      alt={otherUser.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                      {otherUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-5 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-gray-200 p-4 sticky bottom-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="resize-none border-gray-200 focus:border-blue-500 rounded-xl"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="md"
            className="px-5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
