import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MonthlyTrend } from "@shared/schema";

interface TrendChartProps {
  data?: MonthlyTrend[];
  isLoading: boolean;
}

export default function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sample data if none provided
  const chartData = data || [];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Tendência Mensal</h3>
          <Select defaultValue="6months">
            <SelectTrigger className="w-40 border-gray-200/50 dark:border-gray-700/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
              <SelectItem value="year">Ano atual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="flex-1 w-full min-h-0 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--muted-foreground))" 
              strokeOpacity={0.2}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              name="OS Concluídas"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
            />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#10B981"
              strokeWidth={3}
              name="OS Criadas"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
