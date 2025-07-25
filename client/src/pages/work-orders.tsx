import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  technicianId: number | null;
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

export default function WorkOrders() {
  const { data: workOrders, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['/api/work-orders'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Total: {workOrders?.length || 0}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dados Importados da Planilha PREVENTIVAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!workOrders || workOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma ordem de serviço encontrada</p>
              <p className="text-gray-400 mt-2">Importe dados usando a funcionalidade de importação Excel</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Título/Descrição</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Agendada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((workOrder) => (
                    <TableRow key={workOrder.id}>
                      <TableCell className="font-mono text-sm">
                        {workOrder.osNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{workOrder.title}</div>
                          {workOrder.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {workOrder.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {workOrder.equipmentName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {workOrder.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={priorityColors[workOrder.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}
                        >
                          {workOrder.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[workOrder.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                        >
                          {workOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {workOrder.scheduledDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(new Date(workOrder.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        ) : (
                          <span className="text-gray-400">Não agendada</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {workOrders && workOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {workOrders.filter(wo => wo.status === 'PENDENTE').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {workOrders.filter(wo => wo.status === 'CONCLUIDA').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}