'use client';

import AgentChat from '@/components/AgentChat';

export default function AgentChatPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm font-semibold text-[#2e4493]">HelloQuip Support</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Customer Service Chat
          </h1>
          <p className="text-slate-600">
            Ask about orders, quotes, shipping, returns, or product details.
          </p>
        </div>

        <div className="h-[680px]">
          <AgentChat />
        </div>
      </div>
    </div>
  );
}
