import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import RichTextEditor from '../components/RichTextEditor';

export default function ComposePostPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [plainContent, setPlainContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [gmailConnected, setGmailConnected] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [usageId, setUsageId] = useState('');
  const [generateCost, setGenerateCost] = useState(null);

  useEffect(() => {
    api
      .get('/integrations/gmail/status')
      .then((res) => setGmailConnected(res.data.data.connected))
      .catch(() => setGmailConnected(false));
  }, []);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const sendMail = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('topic', topic);
      form.append('content', plainContent.trim());
      if (imageFile) form.append('image', imageFile);
      if (usageId) form.append('usageId', usageId);
      const res = await api.post('/posts/compose/send-mail', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(res.data.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create post</h1>
        <p className="text-sm text-muted-foreground">Rich editor, then an approval email, then confirm before LinkedIn.</p>
      </div>

      {gmailConnected === false && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Connect Gmail in <Link to="/settings" className="font-medium text-sky-500 underline">Settings</Link> first.
        </div>
      )}
      {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title / topic</label>
            <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="JavaScript optimization tips" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium">Post body</label>
              <button
                type="button"
                className="btn-secondary"
                disabled={generating}
                onClick={async () => {
                  setGenerating(true);
                  setError('');
                  try {
                    const res = await api.post('/posts/generate', { hint: topic || undefined });
                    const draft = res.data.data;
                    setTopic(draft.topic || topic);
                    setPlainContent(draft.content || '');
                    setUsageId(draft.usageId || '');
                    setGenerateCost(draft.costUsd);
                    setEditorKey((key) => key + 1);
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setGenerating(false);
                  }
                }}
              >
                {generating ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
            <RichTextEditor
              contentKey={editorKey}
              value={plainContent}
              onChange={(_html, text) => setPlainContent(text)}
              placeholder="Write the exact message for LinkedIn, or generate one from your content type…"
            />
            {generateCost != null ? (
              <p className="mt-1 text-xs text-muted-foreground">This draft used about ${Number(generateCost).toFixed(4)} in OpenAI tokens.</p>
            ) : null}
          </div>
          <div>
            <label className="btn-secondary cursor-pointer">
              Add image
              <input hidden type="file" accept="image/*" onChange={onPickImage} />
            </label>
            {imageFile && <p className="mt-1 text-xs text-slate-500">{imageFile.name}</p>}
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            disabled={loading || plainContent.trim().length < 10 || !topic.trim()}
            onClick={() => setConfirmOpen(true)}
          >
            Send approval email
          </button>
        </div>

        <div className="card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
          <h3 className="text-lg font-semibold">{topic || 'Post title'}</h3>
          {previewUrl && <img src={previewUrl} alt="" className="my-3 max-h-64 w-full rounded-lg object-cover" />}
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{plainContent || 'Your post text…'}</p>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-md p-6">
            <h2 className="text-lg font-semibold">Send approval email?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Email goes to <strong>{user?.email}</strong>. Publishing still requires confirm approve.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={sendMail}>
                Yes, send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
