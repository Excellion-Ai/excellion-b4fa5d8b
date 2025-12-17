import { useState, useEffect } from 'react';
import { BarChart3, Eye, Users, Globe, Smartphone, Monitor, Tablet, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  viewsByDay: { date: string; views: number }[];
}

interface AnalyticsPanelProps {
  projectId: string | null;
  className?: string;
}

const EMPTY_DATA: AnalyticsData = {
  totalViews: 0,
  uniqueVisitors: 0,
  topPages: [],
  topReferrers: [],
  deviceBreakdown: [],
  browserBreakdown: [],
  viewsByDay: [],
};

type TimeRange = '7d' | '30d' | '90d';

export function AnalyticsPanel({ projectId, className }: AnalyticsPanelProps) {
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const fetchAnalytics = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: rawData, error } = await supabase
        .from('site_analytics')
        .select('*')
        .eq('project_id', projectId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch analytics:', error);
        return;
      }

      if (!rawData || rawData.length === 0) {
        setData(EMPTY_DATA);
        return;
      }

      // Calculate metrics
      const totalViews = rawData.length;
      const uniqueSessions = new Set(rawData.map((r) => r.session_id).filter(Boolean));
      const uniqueVisitors = uniqueSessions.size || Math.ceil(totalViews * 0.7); // Estimate if no sessions

      // Top pages
      const pageCounts: Record<string, number> = {};
      rawData.forEach((r) => {
        pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Top referrers
      const referrerCounts: Record<string, number> = {};
      rawData.filter((r) => r.referrer).forEach((r) => {
        try {
          const hostname = new URL(r.referrer).hostname;
          referrerCounts[hostname] = (referrerCounts[hostname] || 0) + 1;
        } catch {
          referrerCounts[r.referrer] = (referrerCounts[r.referrer] || 0) + 1;
        }
      });
      const topReferrers = Object.entries(referrerCounts)
        .map(([referrer, views]) => ({ referrer, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Device breakdown
      const deviceCounts: Record<string, number> = {};
      rawData.forEach((r) => {
        const device = r.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const deviceBreakdown = Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Browser breakdown
      const browserCounts: Record<string, number> = {};
      rawData.forEach((r) => {
        const browser = r.browser || 'unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      const browserBreakdown = Object.entries(browserCounts)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Views by day
      const dayMap: Record<string, number> = {};
      rawData.forEach((r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        dayMap[date] = (dayMap[date] || 0) + 1;
      });
      const viewsByDay = Object.entries(dayMap)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7);

      setData({
        totalViews,
        uniqueVisitors,
        topPages,
        topReferrers,
        deviceBreakdown,
        browserBreakdown,
        viewsByDay,
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, timeRange]);

  const DeviceIcon = ({ device }: { device: string }) => {
    if (device === 'mobile') return <Smartphone className="w-4 h-4" />;
    if (device === 'tablet') return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  if (!projectId) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Save your project to view analytics</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="h-7 text-xs w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs">Page Views</span>
          </div>
          <p className="text-xl font-bold">{data.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs">Visitors</span>
          </div>
          <p className="text-xl font-bold">{data.uniqueVisitors.toLocaleString()}</p>
        </div>
      </div>

      {/* Mini Chart - Views by Day */}
      {data.viewsByDay.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">Views Trend</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {data.viewsByDay.map((day, i) => {
              const maxViews = Math.max(...data.viewsByDay.map((d) => d.views));
              const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 bg-primary/60 rounded-t transition-all hover:bg-primary"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${day.date}: ${day.views} views`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">
              {data.viewsByDay[0]?.date.slice(5)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {data.viewsByDay[data.viewsByDay.length - 1]?.date.slice(5)}
            </span>
          </div>
        </div>
      )}

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Top Pages</span>
          </div>
          <div className="space-y-1">
            {data.topPages.map((page) => (
              <div
                key={page.path}
                className="flex items-center justify-between text-xs py-1 px-2 bg-muted/30 rounded"
              >
                <span className="truncate max-w-[150px]">{page.path}</span>
                <span className="text-muted-foreground">{page.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Breakdown */}
      {data.deviceBreakdown.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Devices</span>
          </div>
          <div className="flex gap-2">
            {data.deviceBreakdown.map((item) => (
              <div
                key={item.device}
                className="flex items-center gap-1.5 text-xs bg-muted/30 rounded px-2 py-1"
              >
                <DeviceIcon device={item.device} />
                <span className="capitalize">{item.device}</span>
                <span className="text-muted-foreground">({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {data.topReferrers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Top Referrers</span>
          </div>
          <div className="space-y-1">
            {data.topReferrers.map((ref) => (
              <div
                key={ref.referrer}
                className="flex items-center justify-between text-xs py-1 px-2 bg-muted/30 rounded"
              >
                <span className="truncate max-w-[150px]">{ref.referrer}</span>
                <span className="text-muted-foreground">{ref.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.totalViews === 0 && !isLoading && (
        <div className="text-center py-6 text-muted-foreground">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No analytics data yet</p>
          <p className="text-xs mt-1">Publish your site to start tracking</p>
        </div>
      )}
    </div>
  );
}
