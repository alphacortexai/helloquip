'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizonal } from 'lucide-react';

export default function AgentChat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // This only runs on the client
    async function initSession() {
      let existing = localStorage.getItem("chat_session_id");
      if (!existing) {
        const res = await fetch("http://127.0.0.1:8000/apps/multi_tool_agent/users/user/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const sessionData = await res.json();
        existing = sessionData.id;
        localStorage.setItem("chat_session_id", existing);
      }
      setSessionId(existing);
    }

    initSession();
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input;
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Prepare request body with session_id if exists
      const body = { 
        message: userMessage
      };
      if (sessionId) body.session_id = sessionId;

      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      // Save/Update sessionId from response
      if (data.session_id) setSessionId(data.session_id);

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.response.message || 'No reply from agent.',
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Error getting response.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-6 space-y-4">
        {messages
          .filter((m) => m.role !== 'system')
          .map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 text-sm px-4 py-3 rounded-2xl rounded-bl-none max-w-[75%] shadow">
              Typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition"
        >
          <SendHorizonal size={18} />
        </button>
      </form>
    </div>
  );
}
