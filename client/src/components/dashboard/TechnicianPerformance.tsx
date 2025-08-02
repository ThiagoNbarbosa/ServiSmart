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
    <div className="xl:col-span-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance por Técnico</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver relatório completo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicianData.map((technician) => (
              <div key={technician.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <img 
                    src={technician.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40`}
                    alt={technician.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{technician.name}</p>
                    <p className="text-sm text-gray-600">{technician.completedOS} OS concluídas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getSuccessRateColor(technician.successRate)}`}>
                      {technician.successRate}%
                    </p>
                    <p className="text-xs text-gray-500">Taxa de sucesso</p>
                  </div>
                  <div className="w-20">
                    <Progress 
                      value={technician.successRate} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
