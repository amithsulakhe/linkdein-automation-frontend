import { useState } from 'react';
import api from '../services/api';

export default function GeneratorPage() {
  const [topic, setTopic] = useState('JavaScript performance optimization');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const saveDraft = async () => {
    await api.post('/posts/drafts', { topic, content });
    setMessage('Draft saved — request approval from Approval Queue.');
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">AI post generator</h1>
      <p className="text-sm text-muted-foreground">Scheduled times are configured in Settings. Save drafts here for manual approval.</p>
      {message && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-900 dark:text-emerald-100">{message}</div>}
      <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <textarea className="input min-h-[200px]" value={content} onChange={(e) => setContent(e.target.value)} />
      <button type="button" className="btn-primary" onClick={saveDraft}>
        Save draft
      </button>
    </div>
  );
}
