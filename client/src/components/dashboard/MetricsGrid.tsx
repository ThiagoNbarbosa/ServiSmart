import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Clock, CheckCircle, Timer, ArrowUp, ArrowDown } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export default function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricItems = [
    {
      title: "Total de OS",
      value: metrics?.totalOS || 0,
      change: "+12% vs mês anterior",
      trend: "up",
      icon: ClipboardList,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Pendentes",
      value: metrics?.pendingOS || 0,
      change: "+5 desde ontem",
      trend: "up",
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "Taxa de Conclusão",
      value: `${metrics?.completionRate || 0}%`,
      change: "+3% vs meta",
      trend: "up",
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Tempo Médio",
      value: `${metrics?.averageTime?.toFixed(1) || 0}h`,
      change: "-15min vs meta",
      trend: "down",
      icon: Timer,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metricItems.map((item, index) => (
        <Card key={index} className="metric-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <p className={`text-sm mt-1 flex items-center ${
                  item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {item.change}
                </p>
              </div>
              <div className={`h-12 w-12 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                <item.icon className={`${item.iconColor} h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
