import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { StatusDistribution } from "@shared/schema";

interface StatusChartProps {
  data?: StatusDistribution;
  isLoading: boolean;
}

const COLORS = {
  CONCLUIDA: '#10B981',
  PENDENTE: '#F59E0B', 
  AGENDADA: '#3B82F6',
  VENCIDA: '#EF4444'
};

const STATUS_LABELS = {
  CONCLUIDA: 'Concluída',
  PENDENTE: 'Pendente',
  AGENDADA: 'Agendada',
  VENCIDA: 'Vencida'
};

export default function StatusChart({ data, isLoading }: StatusChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data ? Object.entries(data).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    value: count,
    status: status
  })).filter(item => item.value > 0) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Distribuição por Status</CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center space-x-2">
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: COLORS[status as keyof typeof COLORS] }}
                ></span>
                <span className="text-gray-600">
                  {label} ({data?.[status as keyof StatusDistribution] || 0})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value, name]}
                labelStyle={{ color: '#374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
