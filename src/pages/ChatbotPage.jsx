import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ChatbotPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.post('/chat/conversations', {}).then((res) => setConversationId(res.data.data._id));
  }, []);

  const send = async () => {
    if (!input.trim() || !conversationId) return;
    setSending(true);
    const content = input;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content }]);
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
    setMessages((m) => [...m, res.data.data.message]);
    setSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3">
      <h1 className="text-2xl font-bold">AI chatbot</h1>
      <div className="card flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'ml-8 bg-sky-500/15 text-foreground' : 'mr-8 bg-muted text-foreground'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button type="button" className="btn-primary" disabled={sending} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
