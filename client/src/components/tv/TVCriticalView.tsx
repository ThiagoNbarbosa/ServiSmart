import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User,
  Calendar,
  Zap,
  AlertCircle,
  TriangleAlert,
  Siren
} from "lucide-react";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TVCriticalViewProps {
  className?: string;
}

interface CriticalOS {
  id: number;
  titulo: string;
  descricao: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'critical';
  technician?: string;
  location: string;
  equipment: string;
  status: 'vencida' | 'vencendo' | 'urgente';
  daysOverdue?: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresImmediate: boolean;
}

// Mock data para OS críticas - em produção viria do backend
const mockCriticalOS: CriticalOS[] = [
  {
    id: 1,
    titulo: "FALHA CRÍTICA - Sistema de Segurança",
    descricao: "Sistema de emergência não responde aos testes",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    priority: 'critical',
    technician: "João Silva",
    location: "Central de Segurança",
    equipment: "Painel de Alarme PS-001",
    status: 'vencida',
    daysOverdue: 2,
    impactLevel: 'critical',
    requiresImmediate: true
  },
  {
    id: 2,
    titulo: "Bomba Principal - Vibração Anormal",
    descricao: "Detectada vibração excessiva, risco de falha iminente",
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
    priority: 'urgent',
    technician: "Maria Santos",
    location: "Casa de Máquinas A",
    equipment: "Bomba Centrífuga BP-001",
    status: 'vencendo',
    impactLevel: 'high',
    requiresImmediate: true
  },
  {
    id: 3,
    titulo: "Sistema Elétrico - Sobrecarga",
    descricao: "Painel principal apresenta sobrecarga nos circuitos",
    dueDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
    priority: 'high',
    technician: "Carlos Oliveira",
    location: "Subestação 2",
    equipment: "Painel Elétrico SE-002",
    status: 'vencida',
    daysOverdue: 0,
    impactLevel: 'high',
    requiresImmediate: false
  },
  {
    id: 4,
    titulo: "Sensor de Temperatura - Fora de Range",
    descricao: "Sensor crítico registrando temperaturas anômalas",
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas
    priority: 'urgent',
    location: "Laboratório Central",
    equipment: "Sensor TT-001",
    status: 'urgente',
    impactLevel: 'medium',
    requiresImmediate: false
  }
];

export default function TVCriticalView({ className }: TVCriticalViewProps) {
  // Simula query - em produção usaria dados reais
  const { data: criticalOS = mockCriticalOS, isLoading } = useQuery<CriticalOS[]>({
    queryKey: ["/api/maintenance/critical"],
    queryFn: () => Promise.resolve(mockCriticalOS),
    refetchInterval: 10000, // Atualiza a cada 10 segundos para OS críticas
  });

  const immediateCritical = criticalOS.filter(os => os.requiresImmediate);
  const overdue = criticalOS.filter(os => os.status === 'vencida');
  const urgent = criticalOS.filter(os => os.priority === 'urgent' || os.priority === 'critical');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-600 to-red-800';
      case 'urgent': return 'from-orange-500 to-red-600';
      case 'high': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string, requiresImmediate: boolean) => {
    if (requiresImmediate) {
      return <Siren className="h-8 w-8 animate-pulse" />;
    }
    switch (status) {
      case 'vencida': return <TriangleAlert className="h-8 w-8" />;
      case 'vencendo': return <AlertTriangle className="h-8 w-8" />;
      case 'urgente': return <AlertCircle className="h-8 w-8" />;
      default: return <Clock className="h-8 w-8" />;
    }
  };

  const getTimeStatus = (dueDate: string, status: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    
    if (status === 'vencida') {
      const overdueDays = differenceInDays(now, due);
      const overdueHours = differenceInHours(now, due);
      
      if (overdueDays > 0) {
        return `${overdueDays} dia${overdueDays > 1 ? 's' : ''} em atraso`;
      } else {
        return `${overdueHours}h em atraso`;
      }
    } else {
      const remainingHours = differenceInHours(due, now);
      if (remainingHours < 24) {
        return `${remainingHours}h restantes`;
      } else {
        const remainingDays = Math.ceil(remainingHours / 24);
        return `${remainingDays} dia${remainingDays > 1 ? 's' : ''} restantes`;
      }
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-12 ${className || ''}`}>
      {/* Título da Visão com Alerta */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <AlertTriangle className="h-20 w-20 text-red-500 animate-pulse" />
            <Zap className="h-8 w-8 absolute -top-2 -right-2 text-yellow-500 animate-bounce" />
          </div>
        </div>
        <h1 className="text-6xl font-black text-red-400 mb-4 animate-pulse">
          OS CRÍTICAS
        </h1>
        <p className="text-2xl text-gray-300">
          Atenção Imediata Necessária
        </p>
      </div>

      {/* Alertas Críticos de Ação Imediata */}
      {immediateCritical.length > 0 && (
        <Card className="tv-emergency-card bg-gradient-to-r from-red-600 to-red-800 border-0 text-white animate-pulse">
          <CardHeader>
            <CardTitle className="text-4xl font-black flex items-center gap-4">
              <Siren className="h-12 w-12 animate-spin" />
              AÇÃO IMEDIATA NECESSÁRIA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {immediateCritical.map((os) => (
                <div key={os.id} className="bg-black/30 rounded-lg p-6 border-2 border-red-400">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-3xl font-black mb-3">{os.titulo}</div>
                      <div className="text-xl text-red-100 mb-4">{os.descricao}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-lg">
                          <MapPin className="h-6 w-6" />
                          {os.location}
                        </div>
                        <div className="flex items-center gap-2 text-lg">
                          <User className="h-6 w-6" />
                          {os.technician || 'Técnico não atribuído'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-red-300 mb-2">
                        {os.status === 'vencida' ? '!' : '⚠'}
                      </div>
                      <div className="text-sm">
                        {getTimeStatus(os.dueDate, os.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de OS Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-gray-800/90 border-gray-600">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full bg-gray-700" />
              </CardContent>
            </Card>
          ))
        ) : (
          criticalOS.map((os) => (
            <Card 
              key={os.id} 
              className={`tv-critical-card bg-gradient-to-br ${getPriorityColor(os.priority)} border-0 text-white ${
                os.requiresImmediate ? 'animate-pulse ring-4 ring-red-400' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`${os.requiresImmediate ? 'text-red-200' : 'text-white'}`}>
                      {getStatusIcon(os.status, os.requiresImmediate)}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold mb-2">{os.titulo}</div>
                      <div className="text-lg opacity-90 mb-3">{os.descricao}</div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${getImpactColor(os.impactLevel)} text-white font-bold px-3 py-1`}>
                          {os.impactLevel.toUpperCase()} IMPACT
                        </Badge>
                        <Badge 
                          variant={os.status === 'vencida' ? 'destructive' : 'default'}
                          className="font-bold px-3 py-1"
                        >
                          {os.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Informações da OS */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm opacity-75 mb-1">Equipamento</div>
                    <div className="text-lg font-semibold">{os.equipment}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75 mb-1">Local</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {os.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75 mb-1">Técnico</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {os.technician || 'Não atribuído'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75 mb-1">Prazo</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(new Date(os.dueDate), 'dd/MM HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                </div>

                {/* Status temporal */}
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-black mb-1">
                      {getTimeStatus(os.dueDate, os.status)}
                    </div>
                    <div className="text-sm opacity-75">
                      {os.status === 'vencida' ? 'ATRASADA' : 'TEMPO RESTANTE'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas de Criticidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="tv-stats-card bg-gradient-to-br from-red-600 to-red-800 border-0 text-white">
          <CardContent className="p-6 text-center">
            <TriangleAlert className="h-12 w-12 mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">{overdue.length}</div>
            <div className="text-lg font-semibold">OS Vencidas</div>
          </CardContent>
        </Card>

        <Card className="tv-stats-card bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">{urgent.length}</div>
            <div className="text-lg font-semibold">OS Urgentes</div>
          </CardContent>
        </Card>

        <Card className="tv-stats-card bg-gradient-to-br from-red-500 to-red-700 border-0 text-white">
          <CardContent className="p-6 text-center">
            <Siren className="h-12 w-12 mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">{immediateCritical.length}</div>
            <div className="text-lg font-semibold">Ação Imediata</div>
          </CardContent>
        </Card>

        <Card className="tv-stats-card bg-gradient-to-br from-gray-600 to-gray-800 border-0 text-white">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">{criticalOS.length}</div>
            <div className="text-lg font-semibold">Total Críticas</div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem de Status */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-full text-2xl font-bold ${
          immediateCritical.length > 0 
            ? 'bg-red-600 text-white animate-pulse' 
            : overdue.length > 0 
            ? 'bg-orange-600 text-white'
            : 'bg-green-600 text-white'
        }`}>
          {immediateCritical.length > 0 && <Siren className="h-8 w-8 animate-spin" />}
          {immediateCritical.length > 0 
            ? 'INTERVENÇÃO CRÍTICA NECESSÁRIA'
            : overdue.length > 0 
            ? 'OS EM ATRASO - ATENÇÃO NECESSÁRIA'
            : 'SITUAÇÃO SOB CONTROLE'}
        </div>
      </div>
    </div>
  );
}