import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarClock, CheckCircle2, Clock3, DollarSign, Eye } from 'lucide-react';
import StatCard from '../components/StatCard';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartBox, fillDailySeries, useChartColors } from '@/components/chart-box';
import { PostBody } from '@/components/post-body';
import api from '../services/api';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const colors = useChartColors();

  useEffect(() => {
    Promise.all([api.get('/analytics/overview'), api.get('/analytics/timeseries?days=30')])
      .then(([overview, ts]) => {
        setData(overview.data.data);
        setSeries(ts.data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const nextRun = data?.nextScheduledGeneration
    ? new Date(data.nextScheduledGeneration).toLocaleString()
    : '—';

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6">
      <PageHeader title="Overview" description="Publishing pipeline, approvals, and activity at a glance." />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Published" value={loading ? undefined : (data?.publishedCount ?? 0)} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Pending approval" value={loading ? undefined : (data?.pendingApprovals ?? 0)} icon={Clock3} tone="amber" />
        <StatCard label="Impressions" value={loading ? undefined : (data?.totals?.impressions ?? 0)} icon={Eye} tone="violet" />
        <StatCard
          label="AI spend this month"
          value={loading ? undefined : `$${(data?.aiUsage?.monthCostUsd || 0).toFixed(4)}`}
          icon={DollarSign}
          tone="rose"
        />
        <StatCard label="Next scheduled" value={loading ? undefined : nextRun} icon={CalendarClock} tone="sky" />
      </div>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">Publishing activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartBox loading={loading} height={280}>
            {(width, height) => (
              <LineChart width={width} height={height} data={fillDailySeries(series)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis dataKey="date" interval={4} tick={{ fontSize: 11, fill: colors.tick }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: colors.tick }} tickLine={false} axisLine={false} width={32} />
                <Tooltip {...colors.tooltip} />
                <Line type="monotone" dataKey="posts" stroke={colors.line} strokeWidth={2.5} dot={{ r: 3, fill: colors.line }} />
              </LineChart>
            )}
          </ChartBox>
        </CardContent>
      </Card>
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ) : data?.aiInsights ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI insights</CardTitle>
          </CardHeader>
          <CardContent>
            <PostBody content={data.aiInsights} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
