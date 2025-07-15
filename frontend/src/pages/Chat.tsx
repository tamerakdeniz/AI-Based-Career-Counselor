import { AlertCircle, Menu, Send, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ChatMessage from '../components/ChatMessage';
import Header from '../components/Header';
import RoadmapSidebar from '../components/RoadmapSidebar';
import type { Roadmap } from '../types';
import { ChatMessage as ChatMessageType } from '../types';

interface ConversationStage {
  stage: string;
  message_count: number;
  roadmap_ready: boolean;
}

const Chat: React.FC = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationStage, setConversationStage] =
    useState<ConversationStage | null>(null);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRoadmapAndMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch roadmap data
        const roadmapRes = await axiosInstance.get(`/roadmaps/${roadmapId}`);
        setRoadmap(roadmapRes.data);

        // Fetch chat messages
        const messagesRes = await axiosInstance.get(
          `/chat/roadmap/${roadmapId}`
        );
        const chatMessages = messagesRes.data.map(
          (msg: {
            id: number;
            type: string;
            content: string;
            timestamp: string;
          }) => ({
            id: msg.id.toString(),
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp,
            roadmapId: roadmapId
          })
        );
        setMessages(chatMessages);

        // Fetch conversation status
        const statusRes = await axiosInstance.get(
          `/ai/conversation-status/${roadmapId}`
        );
        setConversationStage(statusRes.data);
      } catch (error: unknown) {
        console.error('Failed to load chat data:', error);
        setError('Failed to load chat data.');
      } finally {
        setLoading(false);
      }
    };

    if (roadmapId) {
      fetchRoadmapAndMessages();
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
    if (!newMessage.trim() || isTyping) return;

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

    try {
      // Send message to AI
      const response = await axiosInstance.post('/ai/chat', {
        message: newMessage,
        roadmap_id: parseInt(roadmapId || '0')
      });

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.message,
        timestamp: new Date().toISOString(),
        roadmapId: roadmapId
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update conversation stage
      setConversationStage({
        stage: response.data.stage,
        roadmap_ready: response.data.roadmap_ready,
        message_count: conversationStage?.message_count || 0
      });

      // If roadmap is ready, refetch roadmap data to show updated milestones
      if (response.data.roadmap_ready && roadmap) {
        const updatedRoadmapRes = await axiosInstance.get(
          `/roadmaps/${roadmapId}`
        );
        setRoadmap(updatedRoadmapRes.data);
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);

      // Handle rate limiting
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          setRateLimitWarning(true);
          setTimeout(() => setRateLimitWarning(false), 5000);

          const errorMessage: ChatMessageType = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content:
              "I'm sorry, but you've reached the rate limit for AI requests. Please wait a moment before sending another message.",
            timestamp: new Date().toISOString(),
            roadmapId: roadmapId
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          const errorMessage: ChatMessageType = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content:
              "I'm sorry, there was an error processing your message. Please try again.",
            timestamp: new Date().toISOString(),
            roadmapId: roadmapId
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        const errorMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content:
            "I'm sorry, there was an error processing your message. Please try again.",
          timestamp: new Date().toISOString(),
          roadmapId: roadmapId
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getStageDescription = (stage: string) => {
    const stageDescriptions: { [key: string]: string } = {
      interests_strengths: 'Discovering your interests and strengths',
      preferred_field: 'Exploring your preferred field',
      values_motivation: 'Understanding your values and motivations',
      work_style: 'Defining your work style preferences',
      long_term_vision: 'Envisioning your long-term career goals',
      roadmap_generation: 'Generating your personalized roadmap',
      mentoring: 'Ongoing mentorship and guidance'
    };
    return stageDescriptions[stage] || 'Career guidance conversation';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mentor chat...</p>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chat Not Available
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The chat you're looking for doesn't exist."}
          </p>
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
      <Header showBackButton onBack={handleBack} title={roadmap.title} />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {roadmap.field} AI Mentor
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversationStage
                      ? getStageDescription(conversationStage.stage)
                      : 'Always here to help you learn'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {rateLimitWarning && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>Rate limit reached</span>
                  </div>
                )}
                <button
                  onClick={() => setIsRoadmapOpen(true)}
                  title="Open roadmap sidebar"
                  className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Conversation Progress */}
          {conversationStage && conversationStage.stage !== 'mentoring' && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800">
                    {getStageDescription(conversationStage.stage)}
                  </span>
                </div>
                <span className="text-xs text-blue-600">
                  {conversationStage.message_count}/10 questions
                </span>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start Your AI Conversation
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Hello! I'm your AI mentor for {roadmap.field}. I'll ask you a
                  few questions to understand your background and create a
                  personalized roadmap for your career journey.
                </p>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
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
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={
                    isTyping
                      ? 'AI is thinking...'
                      : 'Share your thoughts with your mentor...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                title="Send message"
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
          <RoadmapSidebar roadmap={roadmap} isOpen={true} onClose={() => {}} />
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
