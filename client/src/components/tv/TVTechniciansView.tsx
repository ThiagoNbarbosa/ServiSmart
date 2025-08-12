import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Trophy, 
  Clock, 
  Target,
  Star,
  TrendingUp,
  Award
} from "lucide-react";

interface TVTechniciansViewProps {
  className?: string;
}

interface TechnicianStats {
  id: number;
  name: string;
  completedOS: number;
  successRate: number;
  averageTime: number;
  efficiency?: number;
  status?: 'active' | 'busy' | 'available';
}

export default function TVTechniciansView({ className }: TVTechniciansViewProps) {
  const { data: technicianStats, isLoading } = useQuery<TechnicianStats[]>({
    queryKey: ["/api/dashboard/technician-stats"],
  });

  const sortedTechnicians = technicianStats?.sort((a, b) => b.completedOS - a.completedOS) || [];
  const topPerformer = sortedTechnicians[0];

  return (
    <div className={`space-y-12 ${className || ''}`}>
      {/* Título da Visão */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">
          RANKING DE TÉCNICOS
        </h1>
        <p className="text-2xl text-gray-300">
          Performance da Equipe MAFFENG
        </p>
      </div>

      {/* Destaque do Top Performer */}
      {topPerformer && (
        <Card className="tv-highlight-card bg-gradient-to-r from-yellow-500 to-yellow-600 border-0 text-black mb-8">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Trophy className="h-20 w-20 text-yellow-800" />
                <Star className="h-8 w-8 absolute -top-2 -right-2 text-yellow-800" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black">
              TÉCNICO DESTAQUE
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-black mb-4">{topPerformer.name}</div>
            <div className="grid grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-3xl font-bold">{topPerformer.completedOS}</div>
                <div className="text-lg opacity-80">OS Concluídas</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{topPerformer.successRate}%</div>
                <div className="text-lg opacity-80">Taxa de Sucesso</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{topPerformer.averageTime.toFixed(1)}h</div>
                <div className="text-lg opacity-80">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking Completo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="tv-technician-card bg-gray-800/90 border-gray-600">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full bg-gray-700" />
              </CardContent>
            </Card>
          ))
        ) : (
          sortedTechnicians.map((technician, index) => (
            <Card 
              key={technician.id} 
              className={`tv-technician-card bg-gray-800/90 border-gray-600 text-white ${
                index === 0 ? 'ring-4 ring-yellow-500' : 
                index === 1 ? 'ring-2 ring-gray-400' : 
                index === 2 ? 'ring-2 ring-yellow-600' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      text-4xl font-black w-16 h-16 rounded-full flex items-center justify-center
                      ${index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-gray-400 text-black' : 
                        index === 2 ? 'bg-yellow-600 text-black' : 
                        'bg-gray-600 text-white'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{technician.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={technician.status === 'active' ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {technician.status === 'active' ? 'Ativo' : 
                           technician.status === 'busy' ? 'Ocupado' : 'Disponível'}
                        </Badge>
                        {index < 3 && (
                          <Award className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* OS Concluídas */}
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-400 mb-1">
                      {technician.completedOS}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-center">
                      <Target className="h-4 w-4 mr-1" />
                      OS Concluídas
                    </div>
                  </div>

                  {/* Taxa de Sucesso */}
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400 mb-1">
                      {technician.successRate}%
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Taxa Sucesso
                    </div>
                  </div>

                  {/* Tempo Médio */}
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-400 mb-1">
                      {technician.averageTime.toFixed(1)}h
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Tempo Médio
                    </div>
                  </div>
                </div>

                {/* Barra de Performance */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Performance Geral</span>
                    <span>{technician.efficiency || 85}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        (technician.efficiency || 85) >= 90 ? 'bg-green-500' :
                        (technician.efficiency || 85) >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${technician.efficiency || 85}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas da Equipe */}
      <Card className="tv-stats-card bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <Users className="h-10 w-10" />
            Estatísticas da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black mb-2">
                {sortedTechnicians.length}
              </div>
              <div className="text-lg opacity-90">Técnicos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">
                {sortedTechnicians.reduce((sum, t) => sum + t.completedOS, 0)}
              </div>
              <div className="text-lg opacity-90">Total de OS</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">
                {sortedTechnicians.length > 0 
                  ? Math.round(sortedTechnicians.reduce((sum, t) => sum + t.successRate, 0) / sortedTechnicians.length)
                  : 0}%
              </div>
              <div className="text-lg opacity-90">Média de Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">
                {sortedTechnicians.length > 0 
                  ? (sortedTechnicians.reduce((sum, t) => sum + t.averageTime, 0) / sortedTechnicians.length).toFixed(1)
                  : 0}h
              </div>
              <div className="text-lg opacity-90">Tempo Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}