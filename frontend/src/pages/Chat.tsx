import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Menu, X, MapPin } from 'lucide-react';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import RoadmapSidebar from '../components/RoadmapSidebar';
import { mockRoadmaps, mockChatMessages } from '../data/mockData';
import { ChatMessage as ChatMessageType } from '../types';

const Chat: React.FC = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const roadmap = mockRoadmaps.find(r => r.id === roadmapId);

  useEffect(() => {
    if (roadmapId && mockChatMessages[roadmapId]) {
      setMessages(mockChatMessages[roadmapId]);
    }
  }, [roadmapId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
      roadmapId: roadmapId
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(newMessage, roadmap?.field || ''),
        timestamp: new Date().toISOString(),
        roadmapId: roadmapId
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (message: string, field: string) => {
    const responses = {
      'Software Development': [
        "Great question! In software development, that's a common challenge. Let me break it down for you...",
        "I'd recommend focusing on the fundamentals first. Here's my approach...",
        "That's an excellent topic to explore! In the context of your roadmap, here's what I suggest...",
        "This is where many developers get stuck. Let me share some best practices..."
      ],
      'Marine Recreation': [
        "Absolutely! Safety is paramount in diving. Here's what you need to know...",
        "That's a great question about diving techniques. Let me guide you through this...",
        "In your journey to becoming a diving instructor, this is crucial knowledge...",
        "Marine safety protocols are essential. Here's the proper procedure..."
      ],
      'Marketing': [
        "Digital marketing is constantly evolving. Here's the current best practice...",
        "That's a key insight! In today's market, you'll want to focus on...",
        "Analytics are crucial for marketing success. Let me explain how to interpret this...",
        "Customer engagement is at the heart of marketing. Here's my recommendation..."
      ]
    };

    const fieldResponses = responses[field as keyof typeof responses] || responses['Software Development'];
    return fieldResponses[Math.floor(Math.random() * fieldResponses.length)];
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Roadmap Not Found</h1>
          <p className="text-gray-600 mb-4">The roadmap you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header 
        showBackButton 
        onBack={handleBack} 
        title={roadmap.title}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{roadmap.field} Mentor</h3>
                  <p className="text-sm text-gray-500">Always here to help you learn</p>
                </div>
              </div>
              <button
                onClick={() => setIsRoadmapOpen(true)}
                className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Conversation</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Hello! I'm your AI mentor for {roadmap.field}. Ask me anything about your roadmap, 
                  or let me know what you'd like to work on today.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask your mentor anything..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || isTyping}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Roadmap Sidebar - Only visible on xl screens and larger */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <RoadmapSidebar
            roadmap={roadmap}
            isOpen={true}
            onClose={() => {}}
          />
        </div>
      </div>

      {/* Mobile/Tablet Roadmap Sidebar - Overlay for screens smaller than xl */}
      <div className="xl:hidden">
        <RoadmapSidebar
          roadmap={roadmap}
          isOpen={isRoadmapOpen}
          onClose={() => setIsRoadmapOpen(false)}
        />
      </div>
    </div>
  );
};

export default Chat;