import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';

function formatUploadedOn(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusTone = {
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  processing: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  pending: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  failed: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
};

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const { user } = useAuth();

  const load = useCallback(() => {
    return api.get('/documents', { params: { page } }).then((res) => {
      setDocs(res.data.data.items || []);
      if (res.data.data.pagination) setPagination(res.data.data.pagination);
    });
  }, [page]);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  useEffect(() => {
    if (!docs.some((doc) => doc.processingStatus === 'pending' || doc.processingStatus === 'processing')) return undefined;
    const timer = setInterval(() => {
      load().catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [docs, load]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/documents/upload', form);
      if (page !== 1) setPage(1);
      else await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge base</h1>
        <p className="text-sm text-muted-foreground">Ask a completed PDF. The chat answers only from that file.</p>
      </div>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <label className={`btn-primary cursor-pointer ${uploading ? 'opacity-60' : ''}`}>
        {uploading ? 'Uploading…' : 'Upload document'}
        <input hidden type="file" accept=".pdf,.docx,.txt,.md" onChange={onUpload} disabled={uploading} />
      </label>
      <div className="card w-full max-w-full overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Uploaded by</th>
              <th className="px-4 py-3">Uploaded on</th>
              <th className="px-4 py-3">Pages</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No documents yet.
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
                <tr key={doc._id} className="border-t border-border">
                  <td className="max-w-xs truncate px-4 py-3 font-medium" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.uploadedBy || user?.displayName || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatUploadedOn(doc.createdAt)}</td>
                  <td className="px-4 py-3">{doc.pageCount ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatSize(doc.fileSize)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusTone[doc.processingStatus] || statusTone.pending}`}>
                      {doc.processingStatus}
                    </span>
                    {doc.errorInformation ? (
                      <p className="mt-1 max-w-xs text-xs text-rose-500">{doc.errorInformation}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="font-medium text-sky-500 hover:underline"
                        onClick={async () => {
                          if (doc.fileUrl) {
                            window.open(doc.fileUrl, '_blank', 'noopener');
                            return;
                          }
                          const file = await api.get(`/documents/${doc._id}/file`, { responseType: 'blob' });
                          const url = URL.createObjectURL(file.data);
                          window.open(url, '_blank', 'noopener');
                        }}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="font-medium text-sky-500 hover:underline disabled:opacity-40"
                        disabled={doc.processingStatus !== 'completed'}
                        onClick={async () => {
                          setActiveDoc(doc);
                          setMessages([]);
                          setError('');
                          const conv = await api.post('/chat/conversations', { title: doc.originalFilename });
                          setConversationId(conv.data.data._id);
                        }}
                      >
                        Ask
                      </button>
                      <button
                        type="button"
                        className="font-medium text-rose-500 hover:underline disabled:opacity-40"
                        disabled={deletingId === doc._id}
                        onClick={() => remove(doc)}
                      >
                        {deletingId === doc._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {pagination.total === 0
            ? '0'
            : `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)}`}{' '}
          of {pagination.total}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage((current) => current - 1)}>
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {activeDoc ? (
        <div className="card flex h-[28rem] flex-col p-4">
          <div className="mb-3">
            <h2 className="font-semibold">{activeDoc.originalFilename}</h2>
            <p className="text-sm text-muted-foreground">Answers come only from this PDF.</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ask what this PDF explains.</p>
            ) : null}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'ml-8 bg-sky-500/15' : 'mr-8 bg-muted'}`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {asking ? <p className="text-sm text-muted-foreground">Reading the PDF…</p> : null}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input flex-1"
              placeholder={`Ask about ${activeDoc.originalFilename}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
            />
            <button type="button" className="btn-primary" disabled={asking || !conversationId} onClick={ask}>
              Ask
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  async function remove(doc) {
    if (deletingId) return;
    if (!window.confirm(`Delete ${doc.originalFilename}? This cannot be undone.`)) return;
    setDeletingId(doc._id);
    setError('');
    try {
      await api.delete(`/documents/${doc._id}`);
      if (activeDoc?._id === doc._id) {
        setActiveDoc(null);
        setConversationId(null);
        setMessages([]);
      }
      if (docs.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function ask() {
    if (!input.trim() || !conversationId || !activeDoc || asking) return;
    const content = input;
    setInput('');
    setAsking(true);
    setError('');
    setMessages((current) => [...current, { role: 'user', content }]);
    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        documentId: activeDoc._id,
      });
      setMessages((current) => [...current, res.data.data.message]);
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  }
}
