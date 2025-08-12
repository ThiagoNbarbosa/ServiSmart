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
  totalPreventives: number;
  scheduledPreventives: number;
  executedPreventives: number;
  urgentPreventives: number;
  completionRate: number;
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
              Central de controle e métricas das ordens de manutenção preventiva
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
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : (metrics as any)?.totalOS || 0}
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
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : (metrics as any)?.pendingOS || 0}
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
              {metricsLoading ? <Skeleton className="h-8 w-16" /> : `${(metrics as any)?.averageTime?.toFixed(1) || 0}h`}
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              -15min vs meta
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          {/* Status Distribution Chart */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
            <CardHeader className="pb-4 border-b border-blue-100/50 dark:border-blue-800/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distribuição por Status</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Análise visual das ordens de serviço</p>
                  </div>
                </div>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Atualizado</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="w-full h-[400px] flex items-center justify-center">
                <StatusChart data={statusDistribution} isLoading={statusLoading} />
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend Chart */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
            <CardHeader className="pb-4 border-b border-green-100/50 dark:border-green-800/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tendência Mensal</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Evolução das ordens nos últimos 6 meses</p>
                  </div>
                </div>
                <div className="rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">Crescendo</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="w-full h-[400px] flex items-center justify-center">
                <TrendChart data={monthlyTrends} isLoading={trendsLoading} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Technician Performance */}
          <div className="lg:col-span-2">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
              <CardHeader className="pb-4 border-b border-purple-100/50 dark:border-purple-800/30">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance por Técnico</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Produtividade da equipe técnica</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Ativo</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="w-full h-[400px] overflow-y-auto">
                  <TechnicianPerformance data={technicianStats} isLoading={techLoading} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-800 dark:to-orange-900/10">
              <CardHeader className="pb-4 border-b border-orange-100/50 dark:border-orange-800/30">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atividade Recente</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Últimas atualizações</p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full h-[400px] overflow-y-auto">
                  <RecentActivity data={recentActivity} isLoading={activityLoading} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Critical Alerts */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 hover:scale-105">
            <CardHeader className="pb-4 border-b border-red-200/50 dark:border-red-700/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg animate-pulse">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200">OS Vencidas</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">Atenção necessária</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-black text-red-700 dark:text-red-300 mb-2">
                {(metrics as any)?.overdueOS || 0}
              </div>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 font-medium">
                Necessitam intervenção imediata
              </p>
            </CardContent>
          </Card>

          {/* Team Status */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:scale-105">
            <CardHeader className="pb-4 border-b border-blue-200/50 dark:border-blue-700/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Técnicos Ativos</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Equipe em campo</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-black text-blue-700 dark:text-blue-300 mb-2">
                {technicianStats?.length || 0}
              </div>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80 font-medium">
                Profissionais trabalhando agora
              </p>
            </CardContent>
          </Card>

          {/* Activity Monitor */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 hover:scale-105">
            <CardHeader className="pb-4 border-b border-green-200/50 dark:border-green-700/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800 dark:text-green-200">Atividade 24h</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">Movimentação do sistema</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-black text-green-700 dark:text-green-300 mb-2">
                {recentActivity?.length || 0}
              </div>
              <p className="text-sm text-green-600/80 dark:text-green-400/80 font-medium">
                Eventos registrados hoje
              </p>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
