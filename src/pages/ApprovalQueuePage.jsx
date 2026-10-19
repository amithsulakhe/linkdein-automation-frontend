import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function RowSkeleton() {
  return (
    <div className="card mb-2 flex items-center justify-between p-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

export default function ApprovalQueuePage() {
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [p, pending] = await Promise.all([
      api.get('/posts', { params: { status: 'DRAFT', limit: 20 } }),
      api.get('/posts', { params: { status: 'PENDING_APPROVAL', limit: 20 } }),
    ]);
    setPendingPosts(pending.data.data.items);
    setPosts(p.data.data.items);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const requestApproval = async (postId) => {
    await api.post(`/posts/${postId}/request-approval`);
    setInfo('Approval email sent.');
    load();
  };

  const resendEmail = async (postId) => {
    await api.post(`/posts/${postId}/resend-approval-email`);
    setInfo('Email resent.');
    load();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader title="Approval queue" description="Drafts waiting to be emailed, and posts waiting for your decision." />
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      {info ? <p className="text-sm text-emerald-500">{info}</p> : null}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Pending approval</h2>
        {loading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : pendingPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting for approval.</p>
        ) : (
          pendingPosts.map((p) => (
            <div key={p._id} className="card flex items-center justify-between gap-3 p-4">
              <span className="truncate font-medium">{p.topic}</span>
              <Button variant="outline" size="sm" onClick={() => resendEmail(p._id)}>
                Resend email
              </Button>
            </div>
          ))
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Drafts</h2>
        {loading ? (
          <RowSkeleton />
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No drafts.</p>
        ) : (
          posts.map((p) => (
            <div key={p._id} className="card flex items-center justify-between gap-3 p-4">
              <span className="truncate font-medium">{p.topic}</span>
              <Button size="sm" onClick={() => requestApproval(p._id)}>
                Request approval
              </Button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
