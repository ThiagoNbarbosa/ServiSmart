import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  UserPlus, 
  Users, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PreventiveMaintenanceOrder {
  id: number;
  reportCreatorId: number | null;
  surveyDate: string | null;
  contractNumber: string | null;
  workOrderNumber: string;
  equipmentPrefix: string | null;
  agencyName: string;
  preventiveBudgetValue: string | null;
  portalDeadline: string | null;
  situationStatus: string | null;
  preventiveTechnicianId: number | null;
  scheduledDate: string | null;
  scheduledStatus: string | null;
  difficultiesNotes: string | null;
  executionStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderAssignment {
  id: number;
  workOrderNumber: string;
  elaboradorId: string | null;
  tecnicoCampoId: string | null;
  observacoes: string | null;
  status: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  userLevel: string;
}

const statusColors = {
  ENVIADA_ORCAMENTO: 'bg-blue-100 text-blue-800',
  FORNECEDOR_ACIONADO: 'bg-yellow-100 text-yellow-800',
  LEVANTAMENTO_OK: 'bg-green-100 text-green-800',
  ORCAMENTO_APROVADO_RETORNO_FORNECEDOR: 'bg-purple-100 text-purple-800',
  RETORNO_FORNECEDOR: 'bg-orange-100 text-orange-800',
  SERVICO_CONCLUIDO: 'bg-emerald-100 text-emerald-800',
  SERVICO_CONCLUIDO_PENDENTE_RELATORIO: 'bg-cyan-100 text-cyan-800'
};

const executionStatusColors = {
  ABERTA: 'bg-red-100 text-red-800',
  CONCLUIDA: 'bg-green-100 text-green-800',
  PARCIAL: 'bg-yellow-100 text-yellow-800'
};

const statusLabels = {
  ENVIADA_ORCAMENTO: 'Enviada p/ Orçamento',
  FORNECEDOR_ACIONADO: 'Fornecedor Acionado',
  LEVANTAMENTO_OK: 'Levantamento OK',
  ORCAMENTO_APROVADO_RETORNO_FORNECEDOR: 'Orçamento Aprovado',
  RETORNO_FORNECEDOR: 'Retorno Fornecedor',
  SERVICO_CONCLUIDO: 'Serviço Concluído',
  SERVICO_CONCLUIDO_PENDENTE_RELATORIO: 'Pendente Relatório'
};

export default function WorkOrders() {
  const [selectedOrder, setSelectedOrder] = useState<PreventiveMaintenanceOrder | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'elaborador' | 'campo'>('elaborador');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work orders
  const { data: orders = [], isLoading } = useQuery<PreventiveMaintenanceOrder[]>({
    queryKey: ['/api/preventive-maintenance-orders'],
  });

  // Fetch team members for assignments
  const { data: teamMembers = [] } = useQuery<User[]>({
    queryKey: ['/api/team/members'],
  });

  // Get elaboradores and campo technicians
  const elaboradores = teamMembers.filter(member => member.userLevel === 'ELABORADOR');
  const campoTechnicians = teamMembers.filter(member => member.userLevel === 'CAMPO');

  // Assignment mutation
  const assignmentMutation = useMutation({
    mutationFn: async ({ orderNumber, type, userId, observacoes }: {
      orderNumber: string;
      type: 'elaborador' | 'campo';
      userId: string;
      observacoes?: string;
    }) => {
      const endpoint = type === 'elaborador' 
        ? `/api/order-assignments/${orderNumber}/assign-elaborador`
        : `/api/order-assignments/${orderNumber}/assign-campo`;
      
      const body = type === 'elaborador' 
        ? { elaboradorId: userId, observacoes }
        : { tecnicoCampoId: userId, observacoes };
      
      return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Atribuição realizada",
        description: `${assignmentType === 'elaborador' ? 'Elaborador' : 'Técnico de campo'} atribuído com sucesso.`,
      });
      setAssignmentDialogOpen(false);
      setSelectedUserId('');
      setObservacoes('');
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-maintenance-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na atribuição",
        description: error.message || "Erro ao atribuir membro",
        variant: "destructive",
      });
    },
  });

  const handleAssignment = (order: PreventiveMaintenanceOrder, type: 'elaborador' | 'campo') => {
    setSelectedOrder(order);
    setAssignmentType(type);
    setAssignmentDialogOpen(true);
  };

  const handleSubmitAssignment = () => {
    if (!selectedOrder || !selectedUserId) return;

    assignmentMutation.mutate({
      orderNumber: selectedOrder.workOrderNumber,
      type: assignmentType,
      userId: selectedUserId,
      observacoes
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="bg-white rounded-lg shadow">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-gray-600 mt-1">Gerencie ordens de serviço e atribuições da equipe</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {orders.length} ordens ativas
        </Badge>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as ordens de serviço com opções de atribuição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OS</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Execução</TableHead>
                <TableHead>Data Limite</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.workOrderNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {order.agencyName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.situationStatus && (
                      <Badge className={statusColors[order.situationStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                        {statusLabels[order.situationStatus as keyof typeof statusLabels] || order.situationStatus}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.executionStatus && (
                      <Badge className={executionStatusColors[order.executionStatus as keyof typeof executionStatusColors] || 'bg-gray-100 text-gray-800'}>
                        {order.executionStatus}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.portalDeadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(order.portalDeadline).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAssignment(order, 'elaborador')}>
                          <User className="mr-2 h-4 w-4" />
                          Atribuir Elaborador
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignment(order, 'campo')}>
                          <Users className="mr-2 h-4 w-4" />
                          Atribuir Técnico de Campo
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Ordem
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Atribuir {assignmentType === 'elaborador' ? 'Elaborador' : 'Técnico de Campo'}
            </DialogTitle>
            <DialogDescription>
              Selecione um membro da equipe para atribuir à ordem {selectedOrder?.workOrderNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="member">
                {assignmentType === 'elaborador' ? 'Elaborador' : 'Técnico de Campo'}
              </Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione um ${assignmentType === 'elaborador' ? 'elaborador' : 'técnico de campo'}`} />
                </SelectTrigger>
                <SelectContent>
                  {(assignmentType === 'elaborador' ? elaboradores : campoTechnicians).map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre a atribuição..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitAssignment}
              disabled={!selectedUserId || assignmentMutation.isPending}
            >
              {assignmentMutation.isPending ? 'Atribuindo...' : 'Atribuir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}