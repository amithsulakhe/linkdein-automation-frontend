import { useEffect, useState } from 'react';
import api from '../services/api';

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => api.get('/documents').then((res) => setDocs(res.data.data.items));

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/documents/upload', form);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Knowledge base</h1>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <label className="btn-primary cursor-pointer">
        Upload document
        <input hidden type="file" onChange={onUpload} disabled={uploading} />
      </label>
      <div className="card w-full max-w-full overflow-x-auto">
        <table className="w-max min-w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d._id} className="border-t border-border">
                <td className="px-4 py-2">{d.originalName}</td>
                <td className="px-4 py-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
