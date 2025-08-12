import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  AlertCircle,
  CheckCircle,
  Timer,
  ArrowRight
} from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TVScheduleViewProps {
  className?: string;
}

interface ScheduledOS {
  id: number;
  titulo: string;
  descricao: string;
  scheduledDate: string;
  technician?: string;
  location?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  status: 'agendada' | 'em_andamento' | 'concluida';
  equipment?: string;
}

// Mock data - em produção viria do backend
const mockScheduledOS: ScheduledOS[] = [
  {
    id: 1,
    titulo: "Manutenção Preventiva - Bomba Principal",
    descricao: "Verificação e troca de filtros, análise de vibração",
    scheduledDate: new Date().toISOString(),
    technician: "João Silva",
    location: "Sala de Máquinas A",
    priority: 'high',
    estimatedDuration: 4,
    status: 'agendada',
    equipment: "Bomba Centrífuga BP-001"
  },
  {
    id: 2,
    titulo: "Inspeção Sistema Elétrico",
    descricao: "Verificação de painéis e conexões",
    scheduledDate: new Date().toISOString(),
    technician: "Maria Santos",
    location: "Subestação 1",
    priority: 'medium',
    estimatedDuration: 2,
    status: 'em_andamento',
    equipment: "Painel SE-001"
  },
  {
    id: 3,
    titulo: "Calibração Instrumentos",
    descricao: "Calibração de sensores de pressão e temperatura",
    scheduledDate: addDays(new Date(), 1).toISOString(),
    technician: "Carlos Oliveira",
    location: "Laboratório",
    priority: 'medium',
    estimatedDuration: 3,
    status: 'agendada',
    equipment: "Sensores PT-001 a PT-005"
  },
  {
    id: 4,
    titulo: "Manutenção HVAC",
    descricao: "Limpeza e troca de filtros do sistema de climatização",
    scheduledDate: addDays(new Date(), 1).toISOString(),
    technician: "Ana Costa",
    location: "Telhado - Central",
    priority: 'low',
    estimatedDuration: 2,
    status: 'agendada',
    equipment: "Unidade HVAC-001"
  }
];

export default function TVScheduleView({ className }: TVScheduleViewProps) {
  // Simula query - em produção usaria dados reais
  const { data: scheduledOS = mockScheduledOS, isLoading } = useQuery<ScheduledOS[]>({
    queryKey: ["/api/maintenance/schedule"],
    queryFn: () => Promise.resolve(mockScheduledOS),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const todayOS = scheduledOS.filter(os => isToday(new Date(os.scheduledDate)));
  const tomorrowOS = scheduledOS.filter(os => isTomorrow(new Date(os.scheduledDate)));
  const inProgressOS = scheduledOS.filter(os => os.status === 'em_andamento');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendada': return <Calendar className="h-5 w-5" />;
      case 'em_andamento': return <Timer className="h-5 w-5 animate-spin" />;
      case 'concluida': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-500';
      case 'em_andamento': return 'bg-orange-500';
      case 'concluida': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ptBR });
  };

  return (
    <div className={`space-y-12 ${className || ''}`}>
      {/* Título da Visão */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">
          AGENDA DO DIA
        </h1>
        <p className="text-2xl text-gray-300">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* OS Em Andamento - Destaque */}
      {inProgressOS.length > 0 && (
        <Card className="tv-urgent-card bg-gradient-to-r from-orange-500 to-red-500 border-0 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <Timer className="h-10 w-10 animate-spin" />
              EM ANDAMENTO AGORA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {inProgressOS.map((os) => (
                <div key={os.id} className="flex items-center justify-between bg-black/20 rounded-lg p-6">
                  <div className="flex-1">
                    <div className="text-2xl font-bold mb-2">{os.titulo}</div>
                    <div className="text-lg opacity-90 mb-2">{os.descricao}</div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {os.technician}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {os.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {os.estimatedDuration}h previsto
                      </div>
                    </div>
                  </div>
                  <div className="text-4xl font-black">
                    {formatTime(os.scheduledDate)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agenda de Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="tv-schedule-card bg-gray-800/90 border-gray-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <Calendar className="h-8 w-8 text-blue-400" />
              HOJE ({todayOS.length} OS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full bg-gray-700" />
                ))
              ) : todayOS.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <div className="text-xl">Nenhuma OS agendada para hoje</div>
                </div>
              ) : (
                todayOS.map((os) => (
                  <Card key={os.id} className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full ${getPriorityColor(os.priority)}`} />
                            <div className="text-lg font-bold">{os.titulo}</div>
                          </div>
                          <div className="text-sm text-gray-300 mb-3">{os.descricao}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {os.technician}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {os.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {os.estimatedDuration}h
                            </div>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(os.status)}
                              <Badge className={`${getStatusColor(os.status)} text-white text-xs`}>
                                {os.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-blue-400">
                            {formatTime(os.scheduledDate)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {os.equipment}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agenda de Amanhã */}
        <Card className="tv-schedule-card bg-gray-800/90 border-gray-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <ArrowRight className="h-8 w-8 text-green-400" />
              AMANHÃ ({tomorrowOS.length} OS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {tomorrowOS.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <div className="text-xl">Nenhuma OS agendada para amanhã</div>
                </div>
              ) : (
                tomorrowOS.map((os) => (
                  <Card key={os.id} className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full ${getPriorityColor(os.priority)}`} />
                            <div className="text-lg font-bold">{os.titulo}</div>
                          </div>
                          <div className="text-sm text-gray-300 mb-3">{os.descricao}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {os.technician}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {os.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {os.estimatedDuration}h
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-green-400">
                            {formatTime(os.scheduledDate)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {os.equipment}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo da Semana */}
      <Card className="tv-summary-card bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <Calendar className="h-10 w-10" />
            Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black mb-2">{todayOS.length}</div>
              <div className="text-lg opacity-90">Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">{tomorrowOS.length}</div>
              <div className="text-lg opacity-90">Amanhã</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">
                {scheduledOS.filter(os => os.priority === 'high').length}
              </div>
              <div className="text-lg opacity-90">Alta Prioridade</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">
                {scheduledOS.reduce((sum, os) => sum + os.estimatedDuration, 0)}h
              </div>
              <div className="text-lg opacity-90">Tempo Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}