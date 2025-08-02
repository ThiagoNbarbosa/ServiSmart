import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import type { ActivityItem } from "@shared/schema";

interface RecentActivityProps {
  data?: ActivityItem[];
  isLoading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'OS_COMPLETED':
      return 'h-2 w-2 bg-green-500 rounded-full';
    case 'OS_CREATED':
      return 'h-2 w-2 bg-blue-500 rounded-full';
    case 'COMMENT_ADDED':
      return 'h-2 w-2 bg-yellow-500 rounded-full';
    case 'OS_OVERDUE':
      return 'h-2 w-2 bg-red-500 rounded-full';
    case 'IMPORT_COMPLETED':
      return 'h-2 w-2 bg-purple-500 rounded-full';
    default:
      return 'h-2 w-2 bg-gray-500 rounded-full';
  }
};

export default function RecentActivity({ data, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="flex-shrink-0 h-2 w-2 rounded-full mt-2" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = data && data.length > 0 ? data : [
    {
      id: 1,
      type: 'OS_COMPLETED',
      description: 'Carlos Santos concluiu OS #1247',
      createdAt: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 2,
      type: 'OS_CREATED', 
      description: 'Nova OS #1248 foi criada para Contrato A',
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 3,
      type: 'COMMENT_ADDED',
      description: 'Maria Silva adicionou comentário em OS #1243',
      createdAt: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: 4,
      type: 'OS_OVERDUE',
      description: 'OS #1240 está vencida há 2 dias',
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 5,
      type: 'IMPORT_COMPLETED',
      description: 'Importação de 15 novas OS foi concluída',
      createdAt: new Date(Date.now() - 25 * 60 * 1000)
    }
  ];

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const targetDate = date instanceof Date ? date : new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atividade Recente</CardTitle>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 mt-2 ${getActivityIcon(activity.type)}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
