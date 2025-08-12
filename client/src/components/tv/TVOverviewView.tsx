import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Timer, 
  TrendingUp,
  AlertTriangle,
  Users,
  Activity
} from "lucide-react";
import StatusChart from "@/components/dashboard/StatusChart";
import TrendChart from "@/components/dashboard/TrendChart";

interface TVOverviewViewProps {
  className?: string;
}

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

interface MonthlyTrend {
  month: string;
  created: number;
  completed: number;
}

export default function TVOverviewView({ className }: TVOverviewViewProps) {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: statusDistribution, isLoading: statusLoading } = useQuery<StatusDistribution>({
    queryKey: ["/api/dashboard/status-distribution"],
  });

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ["/api/dashboard/monthly-trends"],
  });

  return (
    <div className={`space-y-12 ${className || ''}`}>
      {/* Título da Visão */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">
          VISÃO GERAL
        </h1>
        <p className="text-2xl text-gray-300">
          Central de Controle MAFFENG
        </p>
      </div>

      {/* KPIs Principais - Otimizados para TV */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Total de OS */}
        <Card className="tv-kpi-card bg-gradient-to-br from-blue-500 to-blue-700 border-0 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div>
                <ClipboardList className="h-12 w-12 mb-4 opacity-80" />
                <div className="text-lg font-semibold opacity-90">Total de OS</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black mb-2">
              {metricsLoading ? (
                <Skeleton className="h-12 w-24 bg-blue-300/30" />
              ) : (
                metrics?.totalOS || 0
              )}
            </div>
            <div className="flex items-center text-blue-200">
              <TrendingUp className="h-5 w-5 mr-2" />
              +12% este mês
            </div>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className="tv-kpi-card bg-gradient-to-br from-amber-500 to-amber-700 border-0 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div>
                <Clock className="h-12 w-12 mb-4 opacity-80" />
                <div className="text-lg font-semibold opacity-90">Pendentes</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black mb-2">
              {metricsLoading ? (
                <Skeleton className="h-12 w-24 bg-amber-300/30" />
              ) : (
                metrics?.pendingOS || 0
              )}
            </div>
            <div className="flex items-center text-amber-200">
              <Clock className="h-5 w-5 mr-2" />
              Aguardando execução
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conclusão */}
        <Card className="tv-kpi-card bg-gradient-to-br from-green-500 to-green-700 border-0 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div>
                <CheckCircle className="h-12 w-12 mb-4 opacity-80" />
                <div className="text-lg font-semibold opacity-90">Taxa de Conclusão</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black mb-2">
              {metricsLoading ? (
                <Skeleton className="h-12 w-24 bg-green-300/30" />
              ) : (
                `${metrics?.completionRate || 0}%`
              )}
            </div>
            <div className="flex items-center text-green-200">
              <TrendingUp className="h-5 w-5 mr-2" />
              +3% vs meta
            </div>
          </CardContent>
        </Card>

        {/* OS Vencidas (Alerta) */}
        <Card className="tv-kpi-card bg-gradient-to-br from-red-500 to-red-700 border-0 text-white animate-pulse">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div>
                <AlertTriangle className="h-12 w-12 mb-4 opacity-80" />
                <div className="text-lg font-semibold opacity-90">OS Vencidas</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black mb-2">
              {metricsLoading ? (
                <Skeleton className="h-12 w-24 bg-red-300/30" />
              ) : (
                metrics?.overdueOS || 0
              )}
            </div>
            <div className="flex items-center text-red-200">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Atenção necessária
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Status Distribution */}
        <Card className="tv-chart-card bg-gray-800/90 border-gray-600 text-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <div className="rounded-xl bg-blue-600 p-3">
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <StatusChart data={statusDistribution} isLoading={statusLoading} />
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="tv-chart-card bg-gray-800/90 border-gray-600 text-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <div className="rounded-xl bg-green-600 p-3">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <TrendChart data={monthlyTrends} isLoading={trendsLoading} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Footer */}
      <div className="flex justify-center items-center space-x-12 text-2xl text-gray-300">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-500 rounded-full mr-3"></div>
          Sistema Operacional
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 rounded-full mr-3"></div>
          Dados Atualizados
        </div>
        <div className="flex items-center">
          <Activity className="h-6 w-6 mr-3" />
          Tempo Real
        </div>
      </div>
    </div>
  );
}