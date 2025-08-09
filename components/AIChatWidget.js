"use client";

import { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to HelloQuip! I'm your AI assistant and I can help you with:\n\n• Product information and pricing\n• Order status and tracking\n• Shipping and delivery questions\n• Returns and refunds\n• General customer support\n\nHow can I assist you today?",
      sender: "agent",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanAvailable, setIsHumanAvailable] = useState(false);
  const messagesEndRef = useRef(null);
  const pushedStateRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close chat on browser back if it was opened
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        setIsOpen(false);
        pushedStateRef.current = false;
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen]);

  const openChat = () => {
    // Push a history state so back button will close the chat instead of leaving the page
    try {
      window.history.pushState({ chatOpen: true }, "", window.location.href);
      pushedStateRef.current = true;
    } catch {}
    setIsOpen(true);
  };

  const closeChat = () => {
    if (pushedStateRef.current) {
      pushedStateRef.current = false;
      // Go back one step to consume the pushed state without leaving the page
      try {
        window.history.back();
        return;
      } catch {}
    }
    setIsOpen(false);
  };

  const callGemini = async (userMessage) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Gemini:', error);
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact our human support team.";
    }
  };

  const logConversation = async (userMessage, aiResponse) => {
    try {
      await fetch('/api/log-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          aiResponse,
          timestamp: new Date().toISOString(),
          sessionId: Date.now().toString() // Simple session ID
        }),
      });
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Check if human handoff is needed
    const handoffKeywords = ['human', 'agent', 'representative', 'speak to someone', 'real person', 'live person'];
    const needsHuman = handoffKeywords.some(keyword => 
      inputMessage.toLowerCase().includes(keyword)
    );

    if (needsHuman && isHumanAvailable) {
      const handoffMessage = {
        id: messages.length + 2,
        text: "I'm connecting you to a human agent now. Please wait a moment...",
        sender: "agent",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, handoffMessage]);
      setIsTyping(false);
      return;
    }

    // Get AI response
    const aiResponse = await callGemini(inputMessage);
    
    const agentMessage = {
      id: messages.length + 2,
      text: aiResponse,
      sender: "agent",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, agentMessage]);
    setIsTyping(false);

    // Log the conversation for admin monitoring
    await logConversation(inputMessage, aiResponse);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => (isOpen ? closeChat() : openChat())}
        className="fixed bottom-24 md:bottom-4 right-4 z-50 bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
        aria-label="Open AI chat"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeChat} />
          <div className="fixed inset-0 md:inset-auto md:bottom-20 md:right-4 z-50 w-full md:w-96 h-full md:h-[500px] bg-white md:rounded-lg shadow-xl border border-gray-200 flex flex-col pb-20 md:pb-0">
          {/* Header */}
          <div className="bg-[#2e4493] text-white p-4 md:rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg md:text-base">HelloQuip AI Assistant</h3>
                <p className="text-sm opacity-90">
                  {isHumanAvailable ? "🤖 AI + 👨‍💼 Human Available" : "🤖 AI Assistant"}
                </p>
              </div>
              <button
                onClick={closeChat}
                className="text-white hover:text-[#e5f3fa] transition p-2"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm md:text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 md:px-3 md:py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 pb-8 md:pb-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 text-white px-4 py-3 md:px-3 md:py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
