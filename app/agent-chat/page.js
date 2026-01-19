'use client';

import AgentChat from '@/components/AgentChat';

export default function AgentChatPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="h-[680px]">
          <AgentChat />
        </div>
      </div>
    </div>
  );
}
