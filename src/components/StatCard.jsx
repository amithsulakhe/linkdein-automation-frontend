import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatCard({ label, value, icon: Icon, tone = 'sky' }) {
  const tones = {
    sky: 'bg-sky-500/15 text-sky-500',
    amber: 'bg-amber-500/15 text-amber-500',
    violet: 'bg-violet-500/15 text-violet-500',
    emerald: 'bg-emerald-500/15 text-emerald-500',
    rose: 'bg-rose-500/15 text-rose-500',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {value === undefined || value === null ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          )}
        </div>
        {Icon ? (
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.sky}`}>
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
