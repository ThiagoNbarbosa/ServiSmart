import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Timer, 
  TrendingUp,
  Users,
  AlertTriangle,
  Activity,
  Plus
} from "lucide-react";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import StatusChart from "@/components/dashboard/StatusChart";
import TechnicianPerformance from "@/components/dashboard/TechnicianPerformance";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TrendChart from "@/components/dashboard/TrendChart";
import type { ActivityItem } from "@shared/schema";

interface DashboardMetrics {
  totalOS: number;
  pendingOS: number;
  completionRate: number;
  averageTime: number;
  overdueOS: number;
}

interface StatusDistribution {
  PENDENTE: number;
  AGENDADA: number;
  CONCLUIDA: number;
  VENCIDA: number;
}

interface TechnicianStats {
  id: number;
  name: string;
  completedOS: number;
  successRate: number;
  averageTime: number;
}

interface MonthlyTrend {
  month: string;
  created: number;
  completed: number;
}



export default function Dashboard() {
  const [tvMode, setTvMode] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: statusDistribution, isLoading: statusLoading } = useQuery<StatusDistribution>({
    queryKey: ["/api/dashboard/status-distribution"],
  });

  const { data: technicianStats, isLoading: techLoading } = useQuery<TechnicianStats[]>({
    queryKey: ["/api/dashboard/technician-stats"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ["/api/dashboard/monthly-trends"],
  });

  return (
    <div className={`space-y-6 ${tvMode ? 'tv-mode' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de ordens de serviço
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTvMode(!tvMode)}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {tvMode ? 'Modo Normal' : 'Modo TV'}
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total de OS
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.totalOS || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.pendingOS || 0}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              +5 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Taxa de Conclusão
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : `${metrics?.completionRate || 0}%`}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +3% vs meta
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Tempo Médio
            </CardTitle>
            <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : `${metrics?.averageTime?.toFixed(1) || 0}h`}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              -15min vs meta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <StatusChart data={statusDistribution} isLoading={statusLoading} />
        </div>
        <div className="lg:col-span-4">
          <TrendChart data={monthlyTrends} isLoading={trendsLoading} />
        </div>
      </div>

      {/* Performance and Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <TechnicianPerformance data={technicianStats} isLoading={techLoading} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity data={recentActivity} isLoading={activityLoading} />
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              OS Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics?.overdueOS || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Users className="h-4 w-4" />
              Técnicos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {technicianStats?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Trabalhando no momento
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
              <Activity className="h-4 w-4" />
              Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {recentActivity?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Eventos nas últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
