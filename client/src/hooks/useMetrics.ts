import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics, StatusDistribution, TechnicianStats, ActivityItem, MonthlyTrend } from "@shared/schema";

export interface MetricsFilters {
  startDate?: string;
  endDate?: string;
  technicianId?: number;
  contractId?: number;
  collaboratorId?: string;
}

export function useMetrics(filters: MetricsFilters = {}, refreshInterval: number = 60) {
  // Dashboard metrics with real data from work orders
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    refetch: refetchMetrics 
  } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics', filters],
    refetchInterval: refreshInterval * 1000,
  });

  // Status distribution for pie chart
  const { 
    data: statusDistribution, 
    isLoading: statusLoading, 
    refetch: refetchStatus 
  } = useQuery<StatusDistribution>({
    queryKey: ['/api/dashboard/status-distribution', filters],
    refetchInterval: refreshInterval * 1000,
  });

  // Technician performance stats
  const { 
    data: technicianStats, 
    isLoading: technicianLoading, 
    refetch: refetchTechnician 
  } = useQuery<TechnicianStats[]>({
    queryKey: ['/api/dashboard/technician-stats', filters],
    refetchInterval: refreshInterval * 1000,
  });

  // Recent activity feed
  const { 
    data: recentActivity, 
    isLoading: activityLoading, 
    refetch: refetchActivity 
  } = useQuery<ActivityItem[]>({
    queryKey: ['/api/dashboard/recent-activity'],
    refetchInterval: refreshInterval * 1000,
  });

  // Monthly trends for line chart
  const { 
    data: monthlyTrends, 
    isLoading: trendsLoading, 
    refetch: refetchTrends 
  } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/dashboard/monthly-trends'],
    refetchInterval: refreshInterval * 1000,
  });

  const refetchAll = () => {
    refetchMetrics();
    refetchStatus();
    refetchTechnician();
    refetchActivity();
    refetchTrends();
  };

  const isLoading = metricsLoading || statusLoading || technicianLoading || activityLoading || trendsLoading;

  return {
    // Data
    metrics,
    statusDistribution,
    technicianStats,
    recentActivity,
    monthlyTrends,
    
    // Loading states
    isLoading,
    metricsLoading,
    statusLoading,
    technicianLoading,
    activityLoading,
    trendsLoading,
    
    // Refetch functions
    refetchAll,
    refetchMetrics,
    refetchStatus,
    refetchTechnician,
    refetchActivity,
    refetchTrends,
  };
}