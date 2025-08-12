import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Settings, 
  X, 
  Wifi,
  WifiOff,
  Clock,
  SkipForward,
  Play,
  Pause
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTVMode, type TVView } from "@/hooks/useTVMode";
import { useWebSocket } from "@/hooks/useWebSocket";
import TVOverviewView from "./TVOverviewView";
import TVTechniciansView from "./TVTechniciansView";
import TVScheduleView from "./TVScheduleView";
import TVCriticalView from "./TVCriticalView";
import TVConfigModal from "./TVConfigModal";

interface TVModeContainerProps {
  className?: string;
}

export default function TVModeContainer({ className }: TVModeContainerProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const {
    isActive,
    currentView,
    config,
    timeRemaining,
    activateTVMode,
    deactivateTVMode,
    goToView,
    updateConfig,
    views
  } = useTVMode();

  const { connectionStatus } = useWebSocket();

  const viewTitles: Record<TVView, string> = {
    overview: 'Visão Geral',
    technicians: 'Ranking Técnicos', 
    schedule: 'Agenda do Dia',
    critical: 'OS Críticas'
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <TVOverviewView />;
      case 'technicians':
        return <TVTechniciansView />;
      case 'schedule':
        return <TVScheduleView />;
      case 'critical':
        return <TVCriticalView />;
      default:
        return <TVOverviewView />;
    }
  };

  if (!isActive) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className || ''}`}>
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Monitor className="h-16 w-16 mx-auto mb-6 text-blue-500" />
            <h2 className="text-2xl font-bold mb-4">Modo TV</h2>
            <p className="text-muted-foreground mb-6">
              Ative o modo TV para exibição em monitores e displays grandes
            </p>
            <Button onClick={activateTVMode} size="lg" className="w-full">
              <Monitor className="h-5 w-5 mr-2" />
              Ativar Modo TV
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`tv-mode-container min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white ${className || ''}`}>
      {/* Header de Controle */}
      <div className="tv-header fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          {/* Info da Visão Atual */}
          <div className="flex items-center gap-6">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-600 text-white">
              {viewTitles[currentView]}
            </Badge>
            
            {/* Navegação entre visões */}
            <div className="flex items-center gap-2">
              {views.map((view) => (
                <Button
                  key={view}
                  variant={currentView === view ? "default" : "ghost"}
                  size="sm"
                  onClick={() => goToView(view)}
                  className="text-xs"
                >
                  {viewTitles[view]}
                </Button>
              ))}
            </div>

            {/* Contador de rotação */}
            {!isPaused && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <SkipForward className="h-4 w-4" />
                <span>Próxima em {timeRemaining}s</span>
              </div>
            )}
          </div>

          {/* Controles e Status */}
          <div className="flex items-center gap-4">
            {/* Clock */}
            {config.showClock && (
              <div className="flex items-center gap-2 text-xl font-mono">
                <Clock className="h-5 w-5" />
                {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
              </div>
            )}

            {/* Status de Conexão */}
            <div className="flex items-center gap-2">
              {connectionStatus === 'Open' ? (
                <Wifi className="h-5 w-5 text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-400" />
              )}
              <span className="text-sm">
                {connectionStatus === 'Open' ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Controle de Pausa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="text-white hover:bg-white/10"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? 'Continuar' : 'Pausar'}
            </Button>

            {/* Configurações */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Sair do Modo TV */}
            <Button
              variant="ghost"
              size="sm"
              onClick={deactivateTVMode}
              className="text-white hover:bg-red-500/20 hover:text-red-300"
            >
              <X className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="tv-content pt-20 p-8">
        {renderCurrentView()}
      </div>

      {/* Indicador de Status no Rodapé */}
      <div className="tv-footer fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <div>Sistema MAFFENG • Modo TV Ativo</div>
            <div>Atualização automática: {config.autoRefresh ? 'Ligada' : 'Desligada'}</div>
            <div>Intervalo: {config.rotationInterval}s</div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div>Pressione ESC para sair</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Sistema operacional
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configurações */}
      <TVConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onConfigChange={updateConfig}
      />
    </div>
  );
}