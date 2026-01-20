'use client';

import AgentChat from '@/components/AgentChat';

export default function AgentChatPage() {
  return (
    <div className="flex flex-col min-h-0 h-screen md:h-auto md:min-h-screen bg-slate-50 overflow-hidden md:overflow-visible">
      <div className="flex-1 min-h-0 flex flex-col max-w-6xl mx-auto w-full pt-0 pb-4 px-0 lg:p-8">
        <div className="flex-1 min-h-0 md:flex-none md:h-[680px]">
          <AgentChat />
        </div>
      </div>
    </div>
  );
}
