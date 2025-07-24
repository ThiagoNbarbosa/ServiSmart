import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "./useWebSocket";
import { useEffect } from "react";

export function useDashboardData(filters: any = {}, refreshInterval: number = 60) {
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    refetch: refetchMetrics 
  } = useQuery({
    queryKey: ['/api/dashboard/metrics', filters],
    refetchInterval: refreshInterval * 1000,
  });

  const { 
    data: statusDistribution, 
    isLoading: statusLoading, 
    refetch: refetchStatus 
  } = useQuery({
    queryKey: ['/api/dashboard/status-distribution', filters],
    refetchInterval: refreshInterval * 1000,
  });

  const { 
    data: technicianStats, 
    isLoading: technicianLoading, 
    refetch: refetchTechnician 
  } = useQuery({
    queryKey: ['/api/dashboard/technician-stats', filters],
    refetchInterval: refreshInterval * 1000,
  });

  const { 
    data: recentActivity, 
    isLoading: activityLoading, 
    refetch: refetchActivity 
  } = useQuery({
    queryKey: ['/api/dashboard/recent-activity'],
    refetchInterval: refreshInterval * 1000,
  });

  const { 
    data: monthlyTrends, 
    isLoading: trendsLoading, 
    refetch: refetchTrends 
  } = useQuery({
    queryKey: ['/api/dashboard/monthly-trends'],
    refetchInterval: refreshInterval * 1000,
  });

  const { 
    data: notifications, 
    refetch: refetchNotifications 
  } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30 * 1000, // Check notifications every 30 seconds
  });

  // WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.type === 'DASHBOARD_UPDATE') {
          // Refresh all dashboard data when receiving update signal
          refetchMetrics();
          refetchStatus();
          refetchTechnician();
          refetchActivity();
          refetchTrends();
          refetchNotifications();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, refetchMetrics, refetchStatus, refetchTechnician, refetchActivity, refetchTrends, refetchNotifications]);

  const refetch = () => {
    refetchMetrics();
    refetchStatus();
    refetchTechnician();
    refetchActivity();
    refetchTrends();
    refetchNotifications();
  };

  const isLoading = metricsLoading || statusLoading || technicianLoading || activityLoading || trendsLoading;

  return {
    metrics,
    statusDistribution,
    technicianStats,
    recentActivity,
    monthlyTrends,
    notifications,
    isLoading,
    refetch,
  };
}
