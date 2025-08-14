'use client';

import AgentChat from '@/components/AgentChat';

export default function AgentChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Agent Chat</h1>
              <p className="text-gray-600 mt-1">Connect with our intelligent AI assistant</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm h-[600px] flex flex-col">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat with AI Agent</h2>
            <p className="text-sm text-gray-600">Powered by advanced AI technology</p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <AgentChat />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-800 text-sm">
            Start chatting with our AI agent! Simply type your message and press Enter or click the send button.
            The AI will respond to your questions and help you with various tasks.
          </p>
        </div>
      </div>
    </div>
  );
}
