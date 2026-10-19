import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== 'light';
  return {
    grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    tick: dark ? '#a1a1aa' : '#64748b',
    line: '#0ea5e9',
    area: 'rgba(14,165,233,0.28)',
    bar: '#8b5cf6',
    tooltip: {
      contentStyle: {
        background: dark ? '#18181b' : '#ffffff',
        border: `1px solid ${dark ? '#3f3f46' : '#e4e4e7'}`,
        borderRadius: 10,
        color: dark ? '#fafafa' : '#18181b',
        fontSize: 12,
      },
    },
  };
}

export function fillDailySeries(points, days = 30) {
  const map = new Map((points || []).map((point) => [point.date, point]));
  const rows = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const found = map.get(key);
    rows.push({
      date: key.slice(5),
      posts: found?.posts || 0,
      impressions: found?.impressions || 0,
      reactions: found?.reactions || 0,
    });
  }
  return rows;
}

export function ChartBox({ loading, height = 280, children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const width = Math.floor(el.clientWidth);
      if (width > 0) setSize({ width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [height, loading]);

  if (loading) {
    return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  }

  return (
    <div ref={ref} className="w-full min-w-0 max-w-full overflow-hidden" style={{ height }}>
      {size.width > 0 ? children(size.width, size.height) : <Skeleton className="h-full w-full rounded-xl" />}
    </div>
  );
}
