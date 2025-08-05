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
    <Card className="card-modern-gradient h-fit">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-lg font-bold">Distribuição por Status</CardTitle>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center space-x-2">
                <span 
                  className="status-indicator-modern"
                  style={{ backgroundColor: COLORS[status as keyof typeof COLORS] }}
                ></span>
                <span className="text-foreground font-medium">
                  {label}
                </span>
                <span className="text-muted-foreground font-bold">
                  ({data?.[status as keyof StatusDistribution] || 0})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={90}
                paddingAngle={3}
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
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
