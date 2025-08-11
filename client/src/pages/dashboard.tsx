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
    <div className={`space-y-8 ${tvMode ? 'tv-mode' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="metric-card metric-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Total de OS
            </CardTitle>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.totalOS || 0}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% desde o mês passado
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card metric-card-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Pendentes
            </CardTitle>
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.pendingOS || 0}
            </div>
            <div className="flex items-center text-xs text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5 desde ontem
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card metric-card-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
              Taxa de Conclusão
            </CardTitle>
            <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : `${metrics?.completionRate || 0}%`}
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3% vs meta
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card metric-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Tempo Médio
            </CardTitle>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
              <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : `${metrics?.averageTime?.toFixed(1) || 0}h`}
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              -15min vs meta
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card className="h-[480px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-1.5">
                    <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0">
                <div className="w-full h-full">
                  <StatusChart data={statusDistribution} isLoading={statusLoading} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4">
            <Card className="h-[480px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-1.5">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  Tendência Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0">
                <div className="w-full h-full">
                  <TrendChart data={monthlyTrends} isLoading={trendsLoading} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
          <div className="lg:col-span-4">
            <Card className="h-[480px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-1.5">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Performance por Técnico
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0 overflow-y-auto">
                <TechnicianPerformance data={technicianStats} isLoading={techLoading} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Card className="h-[480px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 p-1.5">
                    <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0 overflow-y-auto">
                <RecentActivity data={recentActivity} isLoading={activityLoading} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Alert Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="metric-card metric-card-danger group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-300">
              <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-1.5">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              OS Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {metrics?.overdueOS || 0}
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Necessitam atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card metric-card-blue group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-1.5">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Técnicos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {technicianStats?.length || 0}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
              Trabalhando no momento
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card metric-card-success group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-1.5">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {recentActivity?.length || 0}
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              Eventos nas últimas 24h
            </p>
          </CardContent>
        </Card>
        </div>
    </div>
  );
}
