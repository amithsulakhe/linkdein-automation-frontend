import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PostBody } from '@/components/post-body';

const statusClass = {
  PUBLISHED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  PENDING_APPROVAL: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  REJECTED: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  PUBLISH_FAILED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  APPROVED: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  DRAFT: 'bg-muted text-muted-foreground',
};

export default function CalendarPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/posts', { params: { limit: 100 } }).then((res) => setPosts(res.data.data.items));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const retryPublish = async (id) => {
    await api.post(`/posts/${id}/retry-publish`);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader title="Content calendar" description="Every draft, approval, and published post in one timeline." />
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <article key={i} className="card space-y-3 p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-16 w-full" />
              </article>
            ))
          : posts.map((post) => (
              <article key={post._id} className="card p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`badge ${statusClass[post.status] || statusClass.DRAFT}`}>{post.status}</span>
                  <span className="font-medium">{post.topic}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {post.createdAt ? new Date(post.createdAt).toLocaleString() : '—'}
                  {post.publishedAt ? ` · Published ${new Date(post.publishedAt).toLocaleString()}` : ''}
                </p>
                <div className="mt-3 text-muted-foreground">
                  <PostBody content={post.content} />
                </div>
                {post.status === 'PUBLISH_FAILED' ? (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => retryPublish(post._id)}>
                    Retry publish
                  </Button>
                ) : null}
                {post.publishedUrl ? (
                  <a href={post.publishedUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-sky-500 hover:underline">
                    View on LinkedIn
                  </a>
                ) : null}
              </article>
            ))}
        {!loading && posts.length === 0 ? <p className="text-sm text-muted-foreground">No posts yet.</p> : null}
      </div>
    </div>
  );
}
