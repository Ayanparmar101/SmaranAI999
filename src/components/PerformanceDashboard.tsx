import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { requestCache } from '@/utils/requestCache';
import { resourceManager } from '@/utils/resourceManager';

/**
 * Performance Dashboard for monitoring application performance in real-time
 */
const PerformanceDashboard: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState<any>({});
  const [resourceStats, setResourceStats] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  // Update metrics periodically
  useEffect(() => {
    const updateStats = () => {
      const summary = performanceMonitor.getSummary();
      const unacknowledgedAlerts = performanceMonitor.getUnacknowledgedAlerts();
      const cacheData = requestCache.getStats();
      const resourceData = resourceManager.getStats();

      setMetrics(Object.entries(summary.averageTimings).map(([name, value]) => ({
        name,
        value: Math.round(value as number),
        type: 'timing'
      })));

      setAlerts(unacknowledgedAlerts);
      setCacheStats(cacheData);
      setResourceStats(resourceData);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Setup alert listener
  useEffect(() => {
    const unsubscribe = performanceMonitor.onAlert((alert) => {
      setAlerts(prev => [...prev, alert]);
    });

    return unsubscribe;
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    performanceMonitor.acknowledgeAlert(alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const getMetricColor = (name: string, value: number) => {
    const thresholds: Record<string, { warning: number; error: number }> = {
      page_load_time: { warning: 3000, error: 5000 },
      first_contentful_paint: { warning: 1800, error: 3000 },
      largest_contentful_paint: { warning: 2500, error: 4000 },
      first_input_delay: { warning: 100, error: 300 },
      cumulative_layout_shift: { warning: 0.1, error: 0.25 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'default';

    if (value >= threshold.error) return 'destructive';
    if (value >= threshold.warning) return 'secondary';
    return 'default';
  };

  const formatValue = (name: string, value: number) => {
    if (name.includes('time') || name.includes('paint') || name.includes('delay')) {
      return `${value}ms`;
    }
    if (name.includes('shift')) {
      return value.toFixed(3);
    }
    return value.toString();
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-auto bg-background border rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
        >
          ×
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="p-4 space-y-3">
          <div className="text-sm font-medium">Core Web Vitals & Timings</div>
          {metrics.length === 0 ? (
            <div className="text-sm text-muted-foreground">No metrics available</div>
          ) : (
            metrics.map((metric) => (
              <div key={metric.name} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {metric.name.replace(/_/g, ' ')}
                </span>
                <Badge variant={getMetricColor(metric.name, metric.value)}>
                  {formatValue(metric.name, metric.value)}
                </Badge>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="alerts" className="p-4 space-y-3">
          <div className="text-sm font-medium">Performance Alerts</div>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              No active alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{alert.metric}</div>
                    <div className="text-xs">
                      {formatValue(alert.metric, alert.value)} exceeds {formatValue(alert.metric, alert.threshold)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    ✓
                  </Button>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="cache" className="p-4 space-y-3">
          <div className="text-sm font-medium">Request Cache Stats</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cache Size:</span>
              <span>{cacheStats.cacheSize || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pending Requests:</span>
              <span>{cacheStats.pendingRequests || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Hit Rate:</span>
              <span>
                {cacheStats.entries?.length > 0 
                  ? `${Math.round((cacheStats.entries.filter((e: any) => !e.isExpired).length / cacheStats.entries.length) * 100)}%`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="p-4 space-y-3">
          <div className="text-sm font-medium">Resource Management</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Resources:</span>
              <span>{resourceStats.total || 0}</span>
            </div>
            {resourceStats.byType && Object.entries(resourceStats.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="capitalize">{type}:</span>
                <span>{count as number}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;
