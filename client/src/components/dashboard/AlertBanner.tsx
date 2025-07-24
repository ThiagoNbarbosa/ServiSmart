import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardMetrics } from "@shared/schema";

interface AlertBannerProps {
  metrics?: DashboardMetrics;
}

export default function AlertBanner({ metrics }: AlertBannerProps) {
  if (!metrics || (metrics.overdueOS === 0 && metrics.pendingOS === 0)) {
    return null;
  }

  const hasAlerts = metrics.overdueOS > 0 || metrics.pendingOS > 5;
  
  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800">Alertas Importantes</h3>
        <p className="text-sm text-red-700 mt-1">
          {metrics.overdueOS > 0 && (
            <span>{metrics.overdueOS} OS vencidas</span>
          )}
          {metrics.overdueOS > 0 && metrics.pendingOS > 5 && " • "}
          {metrics.pendingOS > 5 && (
            <span>{metrics.pendingOS} OS pendentes</span>
          )}
        </p>
      </div>
      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
        Ver detalhes
      </Button>
    </div>
  );
}
