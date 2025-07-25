import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { Link } from "wouter";

interface WorkOrder {
  id: number;
  osNumber: string;
  title: string;
  description: string;
  equipmentName: string;
  location: string;
  priority: string;
  status: string;
  scheduledDate: string | null;
  createdAt: string;
}

const priorityColors = {
  'BAIXA': 'bg-green-100 text-green-800',
  'MEDIA': 'bg-yellow-100 text-yellow-800', 
  'ALTA': 'bg-red-100 text-red-800',
  'URGENTE': 'bg-red-500 text-white'
};

const statusColors = {
  'PENDENTE': 'bg-gray-100 text-gray-800',
  'AGENDADA': 'bg-blue-100 text-blue-800',
  'EM_ANDAMENTO': 'bg-yellow-100 text-yellow-800',
  'CONCLUIDA': 'bg-green-100 text-green-800',
  'VENCIDA': 'bg-red-100 text-red-800'
};

export default function SimpleWorkOrders() {
  const { data: workOrders, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['/api/work-orders'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço Importadas</h1>
              <p className="text-gray-500">Dados da planilha PREVENTIVAS</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Total: {workOrders?.length || 0}
          </Badge>
        </div>

        {/* Work Orders Grid */}
        {!workOrders || workOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma ordem de serviço encontrada</p>
              <p className="text-gray-400 mt-2">Use o sistema de importação para carregar dados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {workOrders.map((workOrder) => (
              <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-mono">
                        OS: {workOrder.osNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {workOrder.title}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge 
                        className={priorityColors[workOrder.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}
                      >
                        {workOrder.priority}
                      </Badge>
                      <Badge 
                        className={statusColors[workOrder.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                      >
                        {workOrder.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">Equipamento</div>
                        <div className="text-gray-600">{workOrder.equipmentName}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">Local</div>
                        <div className="text-gray-600">{workOrder.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">Data Agendada</div>
                        <div className="text-gray-600">
                          {workOrder.scheduledDate ? 
                            new Date(workOrder.scheduledDate).toLocaleDateString('pt-BR') : 
                            'Não agendada'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  {workOrder.description && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="font-medium text-sm">Descrição:</div>
                      <div className="text-gray-600 text-sm mt-1">{workOrder.description}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {workOrders && workOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{workOrders.length}</div>
                <div className="text-sm text-gray-500">Total de OS</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {workOrders.filter(wo => wo.status === 'PENDENTE').length}
                </div>
                <div className="text-sm text-gray-500">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {workOrders.filter(wo => wo.status === 'CONCLUIDA').length}
                </div>
                <div className="text-sm text-gray-500">Concluídas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {workOrders.filter(wo => wo.priority === 'ALTA' || wo.priority === 'URGENTE').length}
                </div>
                <div className="text-sm text-gray-500">Alta Prioridade</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}