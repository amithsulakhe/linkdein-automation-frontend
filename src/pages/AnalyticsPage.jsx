import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartBox, fillDailySeries, useChartColors } from '@/components/chart-box';

function fmtDateTime(v) {
  if (!v) return '—';
  return new Date(v).toLocaleString();
}

function fmtUsd(value) {
  const amount = Number(value || 0);
  if (!amount) return '$0.00';
  return amount < 0.01 ? `$${amount.toFixed(4)}` : `$${amount.toFixed(2)}`;
}

const statusTone = {
  PUBLISHED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  PENDING_APPROVAL: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  APPROVED: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  REJECTED: 'bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30 dark:text-rose-300',
  EXPIRED: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  PUBLISH_FAILED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  GENERATION_FAILED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  DRAFT: 'bg-muted text-muted-foreground',
};

const statusLabel = {
  PENDING_APPROVAL: 'Pending',
  PUBLISH_FAILED: 'Publish failed',
  GENERATION_FAILED: 'Generation failed',
};

const metricsLabel = {
  linkedin_api: 'LinkedIn',
  partial: 'Partial',
  unavailable: 'Not synced',
};

function prettyStatus(status) {
  if (!status) return '—';
  if (statusLabel[status]) return statusLabel[status];
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function AnalyticsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState(null);
  const colors = useChartColors();

  const load = async () => {
    setLoading(true);
    try {
      const [postsRes, tsRes, overviewRes] = await Promise.all([
        api.get('/analytics/posts', { params: { page: page + 1, limit: 10, search: search || undefined } }),
        api.get('/analytics/timeseries', { params: { days: 30 } }),
        api.get('/analytics/usage'),
      ]);
      setRows(postsRes.data.data.items);
      setTotal(postsRes.data.data.pagination.total);
      setSeries(tsRes.data.data || []);
      setUsage(overviewRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6">
      <PageHeader title="Post analytics" description="Created, published, LinkedIn metrics, and estimated OpenAI cost." />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">AI spend this month</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? '…' : fmtUsd(usage?.monthCostUsd)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">AI spend all time</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? '…' : fmtUsd(usage?.totalCostUsd)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">OpenAI calls</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? '…' : usage?.totalCalls ?? 0}</p>
        </div>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Posts published (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartBox loading={loading} height={240}>
              {(width, height) => (
                <AreaChart width={width} height={height} data={fillDailySeries(series)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="date" interval={4} tick={{ fontSize: 11, fill: colors.tick }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: colors.tick }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip {...colors.tooltip} />
                  <Area type="monotone" dataKey="posts" stroke={colors.line} fill={colors.area} strokeWidth={2} />
                </AreaChart>
              )}
            </ChartBox>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Impressions by day</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartBox loading={loading} height={240}>
              {(width, height) => (
                <BarChart width={width} height={height} data={fillDailySeries(series)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="date" interval={4} tick={{ fontSize: 11, fill: colors.tick }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: colors.tick }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip {...colors.tooltip} />
                  <Bar dataKey="impressions" fill={colors.bar} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ChartBox>
          </CardContent>
        </Card>
      </div>

      <Input
        className="max-w-sm"
        placeholder="Search posts"
        value={search}
        onChange={(e) => {
          setPage(0);
          setSearch(e.target.value);
        }}
      />

      <div className="card w-full max-w-full overflow-x-auto">
        <table className="w-max min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right" title="Estimated OpenAI cost to generate this post">
                AI cost
              </th>
              <th className="px-4 py-3 text-right">Impr.</th>
              <th className="px-4 py-3 text-right">React.</th>
              <th className="px-4 py-3" title="Where impression and reaction numbers came from">
                Metrics
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
                ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                        No posts yet.
                      </td>
                    </tr>
                  )
                : rows.map((row) => (
                    <tr key={row._id} className="border-b hover:bg-muted/40">
                      <td className="max-w-xs truncate px-4 py-3" title={row.content}>
                        {row.topic || row.content?.slice(0, 60)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDateTime(row.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDateTime(row.publishedAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge whitespace-nowrap ${statusTone[row.status] || statusTone.DRAFT}`}>
                          {prettyStatus(row.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right" title="Estimated from token prices">
                        {row.aiCostUsd ? fmtUsd(row.aiCostUsd) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">{row.analytics?.impressions ?? '—'}</td>
                      <td className="px-4 py-3 text-right">{row.analytics?.reactions ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className="badge whitespace-nowrap bg-muted text-muted-foreground"
                          title="LinkedIn has not returned impressions or reactions for this post yet"
                        >
                          {metricsLabel[row.analytics?.metricsSource] || 'Not synced'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.publishedUrl ? (
                          <a href={row.publishedUrl} target="_blank" rel="noreferrer" className="font-medium text-sky-500 hover:underline">
                            Open
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total === 0 ? '0' : `${page * 10 + 1}–${Math.min((page + 1) * 10, total)}`} of {total}</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={(page + 1) * 10 >= total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
