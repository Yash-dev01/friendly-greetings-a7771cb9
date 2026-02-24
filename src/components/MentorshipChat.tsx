import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeft, Send } from 'lucide-react';
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

export function MentorshipChat({ conversationId, otherUser, onBack }: MentorshipChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadConversation();

    // Join socket room
    socketService.joinChat(conversationId);

    // Listen for new messages
    socketService.onReceiveMessage((data: any) => {
      if (data.conversationId === conversationId) {
        setConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, {
              _id: data._id || Date.now().toString(),
              senderId: data.senderId,
              content: data.content,
              createdAt: data.createdAt,
            }],
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
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const loadConversation = async () => {
    try {
      const conv = await conversationService.getConversationById(conversationId);
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

    // Optimistic update
    const tempMsg = {
      _id: Date.now().toString(),
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
    };

    setConversation((prev) => {
      if (!prev) return prev;
      return { ...prev, messages: [...prev.messages, tempMsg] };
    });

    // Send via API
    try {
      await conversationService.sendMessage(conversationId, content);
    } catch (err) {
      console.error('Failed to send message', err);
    }

    // Emit via socket for real-time
    socketService.sendMessage({
      conversationId,
      senderId: user.id,
      content,
      createdAt: tempMsg.createdAt,
    });

    // Stop typing
    socketService.emitStopTyping({ conversationId, userId: user.id });
  };

  const handleTyping = () => {
    if (!user) return;
    socketService.emitTyping({
      conversationId,
      userId: user.id,
      fullName: user.fullName || '',
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping({ conversationId, userId: user.id });
    }, 2000);
  };

  const getSenderId = (senderId: string | { _id: string }): string => {
    return typeof senderId === 'object' ? senderId._id : senderId;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <Card>
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3 flex-1">
            {otherUser.avatarUrl && (
              <img src={otherUser.avatarUrl} alt={otherUser.fullName} className="w-10 h-10 rounded-full object-cover" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
              <p className="text-sm text-gray-600">{otherUser.position} at {otherUser.company}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
        {(!conversation?.messages || conversation.messages.length === 0) ? (
          <div className="text-center py-12 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isOwn = getSenderId(msg.senderId) === user?.id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {typingUser && (
          <div className="text-sm text-gray-500 italic">{typingUser} is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <Card>
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()} size="sm" className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
