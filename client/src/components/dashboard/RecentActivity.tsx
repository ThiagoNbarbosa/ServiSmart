import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, Plus, MessageCircle, AlertTriangle, Upload } from "lucide-react";
import type { ActivityItem } from "@shared/schema";

interface RecentActivityProps {
  data?: ActivityItem[];
  isLoading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'OS_COMPLETED':
      return { icon: CheckCircle, className: 'bg-green-500 text-white' };
    case 'OS_CREATED':
      return { icon: Plus, className: 'bg-blue-500 text-white' };
    case 'COMMENT_ADDED':
      return { icon: MessageCircle, className: 'bg-yellow-500 text-white' };
    case 'OS_OVERDUE':
      return { icon: AlertTriangle, className: 'bg-red-500 text-white' };
    case 'IMPORT_COMPLETED':
      return { icon: Upload, className: 'bg-purple-500 text-white' };
    default:
      return { icon: RefreshCw, className: 'bg-gray-500 text-white' };
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

  const activities = data || [];

  const formatTimeAgo = (date: Date | string | null | undefined) => {
    if (!date) return 'data desconhecida';
    
    try {
      const now = new Date();
      const targetDate = date instanceof Date ? date : new Date(date);
      
      // Check if date is valid
      if (isNaN(targetDate.getTime())) {
        return 'data inválida';
      }
      
      const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'agora mesmo';
      if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`;
      return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'data inválida';
    }
  };

  return (
    <Card className="card-modern-gradient h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Atividade Recente</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="activity-timeline space-y-1 h-full overflow-y-auto">
          {activities.map((activity, index) => {
            const iconData = getActivityIcon(activity.type);
            const IconComponent = iconData.icon;
            
            return (
              <div 
                key={activity.id} 
                className="activity-item animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`activity-icon ${iconData.className}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
