'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import {
  BadgeCheck,
  Bot,
  CircleDot,
  CornerDownLeft,
  Loader2,
  Send,
  Sparkles,
  User,
} from 'lucide-react';

const DEFAULT_GREETING =
  "Hi! I'm the HelloQuip support assistant. Ask me about orders, quotes, shipping, or products.";

const QUICK_STARTS = [
  'Where is my order?',
  'How do I request a quote?',
  'What is your return policy?',
  'Do you ship to my location?',
];

export default function AgentChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: DEFAULT_GREETING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const canSend = input.trim().length > 0 && !loading;
  const lastMessages = useMemo(() => messages.slice(-10), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(overrideMessage) {
    const outgoing = (overrideMessage ?? input).trim();
    if (!outgoing) return;

    const newMessages = [...messages, { role: 'user', content: outgoing }];
    setMessages(newMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: outgoing,
          messages: lastMessages,
        }),
      });

      const data = await res.json();
      const reply =
        typeof data.reply === 'string' && data.reply.trim().length > 0
          ? data.reply
          : 'Sorry, I did not get a response. Please try again.';

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError('Connection error. Please try again.');
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I hit a connection error.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-full w-full flex-col lg:flex-row gap-4">
      <aside className="lg:w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Sparkles className="h-5 w-5 text-[#2e4493]" />
          Support Assistant
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Fast, accurate answers powered by Gemini + LangChain.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            Order & shipping help
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            Quotes & product info
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            Returns & account support
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
          Tip: Share your order number and email for faster help.
        </div>
      </aside>

      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e4493]/10">
              <Bot className="h-5 w-5 text-[#2e4493]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                HelloQuip Support
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CircleDot className="h-3 w-3 text-emerald-500" />
                Online now
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setMessages([{ role: 'assistant', content: DEFAULT_GREETING }])
            }
            className="text-xs font-medium text-slate-500 hover:text-[#2e4493] transition"
          >
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow ${
                  msg.role === 'user'
                    ? 'bg-[#2e4493] text-white rounded-br-md'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-md'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  {msg.role === 'user' ? (
                    <>
                      <User className="h-3 w-3" />
                      You
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3 text-[#2e4493]" />
                      Support
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#2e4493]" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="border-t border-slate-100 px-5 py-4 bg-white">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Quick starts
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_STARTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-[#2e4493] hover:text-[#2e4493] transition"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="border-t border-slate-100 bg-white px-5 py-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about your order, quotes, or shipping..."
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4493]/30"
                disabled={loading}
              />
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <CornerDownLeft className="h-3 w-3" />
                Press Enter to send, Shift+Enter for a new line
              </div>
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2e4493] px-5 text-sm font-medium text-white transition hover:bg-[#1d2b66] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
