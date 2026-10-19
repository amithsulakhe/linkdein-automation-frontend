import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PostBody } from '@/components/post-body';

export default function ApprovalReviewPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    api
      .get('/approvals/review', { params: { token } })
      .then(async (res) => {
        setReview(res.data.data);
        const post = res.data.data.post;
        if (post?.imageStorageKey && post._id) {
          const img = await api.get(`/posts/${post._id}/image`, { responseType: 'blob' });
          setImageUrl(URL.createObjectURL(img.data));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    return undefined;
  }, [token]);

  if (!token) return <Navigate to="/approval-queue" replace />;

  const confirm = async (decision) => {
    setSubmitting(true);
    try {
      const res = await api.post('/approvals/confirm', { token, decision });
      setDone(res.data.data.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Confirm approval</h1>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
        Confirm approve queues the LinkedIn publish. You get a published email after it goes live.
      </div>
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </div>
      ) : null}
      {done ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
          Decision recorded: {done}
        </div>
      ) : null}
      {loading ? (
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      ) : review ? (
        <Card>
          <CardHeader>
            <CardTitle>{review.post?.topic}</CardTitle>
            <p className="text-xs text-muted-foreground">Expires {new Date(review.expiresAt).toLocaleString()}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUrl ? <img src={imageUrl} alt="" className="max-h-80 w-full rounded-lg object-cover" /> : null}
            <PostBody content={review.post?.content} />
          </CardContent>
        </Card>
      ) : null}
      {!done && review?.status === 'PENDING' ? (
        <div className="flex gap-2">
          <Button disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => confirm('approve')}>
            {submitting ? 'Saving…' : 'Confirm approve'}
          </Button>
          <Button variant="destructive" disabled={submitting} onClick={() => confirm('reject')}>
            Reject
          </Button>
        </div>
      ) : null}
    </div>
  );
}
