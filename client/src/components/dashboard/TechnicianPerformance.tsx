import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ExternalLink } from "lucide-react";
import type { TechnicianStats } from "@shared/schema";

interface TechnicianPerformanceProps {
  data?: TechnicianStats[];
  isLoading: boolean;
}

export default function TechnicianPerformance({ data, isLoading }: TechnicianPerformanceProps) {
  if (isLoading) {
    return (
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Técnico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const technicianData = data || [];

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="card-modern-gradient h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Performance por Técnico</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
            <ExternalLink className="h-4 w-4 mr-1" />
            Ver relatório completo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 h-full">
          {technicianData.map((technician, index) => (
            <div 
              key={technician.id} 
              className="team-member-card animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={technician.profileImageUrl || `https://images.unsplash.com/photo-${1500 + technician.id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80`}
                      alt={technician.name}
                      className="team-member-avatar"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-card ${
                      technician.successRate >= 90 ? 'bg-green-500' : 
                      technician.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-foreground truncate">{technician.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {technician.completedOS} OS concluídas
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getSuccessRateColor(technician.successRate)}`}>
                        {technician.successRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Taxa de sucesso</p>
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="progress-modern">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${technician.successRate}%`,
                          background: technician.successRate >= 90 ? 'var(--gradient-success)' :
                                    technician.successRate >= 80 ? 'var(--gradient-warning)' :
                                    'var(--gradient-danger)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
