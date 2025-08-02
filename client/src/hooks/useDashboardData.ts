import { useMetrics } from "./useMetrics";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "./useWebSocket";
import { useEffect } from "react";

export function useDashboardData(filters: any = {}, refreshInterval: number = 60) {
  // Use the new useMetrics hook for dashboard metrics
  const {
    metrics,
    statusDistribution,
    technicianStats,
    recentActivity,
    monthlyTrends,
    isLoading: metricsIsLoading,
    refetchAll: refetchMetrics,
  } = useMetrics(filters, refreshInterval);

  // Notifications are fetched separately as they're user-specific
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
          refetchNotifications();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, refetchMetrics, refetchNotifications]);

  const refetch = () => {
    refetchMetrics();
    refetchNotifications();
  };

  return {
    // Data from useMetrics hook
    metrics,
    statusDistribution,
    technicianStats,
    recentActivity,
    monthlyTrends,
    
    // User-specific data
    notifications,
    
    // Loading and refetch functions
    isLoading: metricsIsLoading,
    refetch,
  };
}
