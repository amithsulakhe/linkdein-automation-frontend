import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ChatbotPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.post('/chat/conversations', {}).then((res) => setConversationId(res.data.data._id));
  }, []);

  const send = async () => {
    if (!input.trim() || !conversationId || sending) return;
    setSending(true);
    setError('');
    const content = input;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content }]);
    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
      setMessages((m) => [...m, res.data.data.message]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ask your PDFs</h1>
        <p className="text-sm text-muted-foreground">
          This chat searches the files in your <Link to="/knowledge-base" className="text-sky-500 hover:underline">Knowledge base</Link> and answers from them.
        </p>
      </div>
      <div className="card flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Try: “What does jscst101.pdf say about closures?” Only a document marked completed can be used.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'ml-8 bg-sky-500/15 text-foreground' : 'mr-8 bg-muted text-foreground'}`}>
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.sources?.length ? (
              <p className="mt-2 text-xs text-muted-foreground">From { [...new Set(m.sources.map((s) => s.label))].join(', ') }</p>
            ) : null}
          </div>
        ))}
        {sending ? <p className="text-sm text-muted-foreground">Searching your PDFs…</p> : null}
      </div>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask a question about an uploaded PDF"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button type="button" className="btn-primary" disabled={sending || !conversationId} onClick={send}>
          {sending ? 'Asking…' : 'Ask'}
        </button>
      </div>
    </div>
  );
}
