import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeft, Send } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import type { MentorshipChat as MentorshipChatType } from '../types';

interface MentorshipChatProps {
  chat: MentorshipChatType;
  onBack: () => void;
}

export function MentorshipChat({ chat, onBack }: MentorshipChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserId = currentChat.studentId === user?.id ? currentChat.alumniId : currentChat.studentId;
  const otherUser = storage.getUserById(otherUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    const updatedChat = storage.getOrCreateMentorshipChat(
      currentChat.mentorshipRequestId,
      currentChat.studentId,
      currentChat.alumniId
    );

    storage.addMentorshipMessage(updatedChat.id, user.id, message.trim());

    const freshChat = storage.getMentorshipChatByRequestId(currentChat.mentorshipRequestId);
    if (freshChat) {
      setCurrentChat(freshChat);
    }

    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <Card>
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            {otherUser?.avatarUrl && (
              <img
                src={otherUser.avatarUrl}
                alt={otherUser.fullName}
                className="w-10 h-10 rounded-full object-cover inline-block mr-3"
              />
            )}
            <div className="inline-block">
              <h3 className="font-semibold text-gray-900">{otherUser?.fullName}</h3>
              <p className="text-sm text-gray-600">{otherUser?.position} at {otherUser?.company}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
        {currentChat.messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          currentChat.messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            const sender = storage.getUserById(msg.senderId);
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
        <div ref={messagesEndRef} />
      </div>

      <Card>
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
