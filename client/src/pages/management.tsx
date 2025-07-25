import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Users, FileText, Building2, Settings } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  status: string;
  createdAt: string;
}

interface Contract {
  id: number;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  value: number;
  status: string;
}

interface WorkOrder {
  id: number;
  osNumber: string;
  title: string;
  status: string;
  priority: string;
  technicianId: number | null;
  contractId: number | null;
  createdAt: string;
}

export default function Management() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("technicians");

  // Fetch data
  const { data: technicians } = useQuery<Technician[]>({
    queryKey: ['/api/technicians'],
  });

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
  });

  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ['/api/work-orders'],
  });

  // Delete mutations
  const deleteTechnicianMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/technicians/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technicians'] });
      toast({
        title: "Sucesso",
        description: "Técnico removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover técnico.",
        variant: "destructive",
      });
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/contracts/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: "Sucesso",
        description: "Contrato removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover contrato.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/work-orders/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      toast({
        title: "Sucesso",
        description: "Ordem de serviço removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover ordem de serviço.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'active':
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'pendente':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inativo':
      case 'inactive':
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Gestão do Sistema</h1>
              <p className="text-gray-500">Gerencie técnicos, contratos e ordens de serviço</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{technicians?.length || 0}</div>
              <div className="text-sm text-gray-500">Técnicos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{contracts?.length || 0}</div>
              <div className="text-sm text-gray-500">Contratos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{workOrders?.length || 0}</div>
              <div className="text-sm text-gray-500">Ordens de Serviço</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Settings className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold">
                {workOrders?.filter(wo => wo.status === 'PENDENTE').length || 0}
              </div>
              <div className="text-sm text-gray-500">Pendentes</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="technicians" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Técnicos</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Contratos</span>
            </TabsTrigger>
            <TabsTrigger value="work-orders" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Ordens de Serviço</span>
            </TabsTrigger>
          </TabsList>

          {/* Technicians Tab */}
          <TabsContent value="technicians">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestão de Técnicos</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Técnico
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technicians?.map((technician) => (
                        <TableRow key={technician.id}>
                          <TableCell className="font-medium">{technician.name}</TableCell>
                          <TableCell>{technician.email}</TableCell>
                          <TableCell>{technician.phone}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(technician.status)}>
                              {technician.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteTechnicianMutation.mutate(technician.id)}
                                disabled={deleteTechnicianMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestão de Contratos</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Contrato
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts?.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.name}</TableCell>
                          <TableCell>{contract.client}</TableCell>
                          <TableCell>
                            {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(contract.value)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteContractMutation.mutate(contract.id)}
                                disabled={deleteContractMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Orders Tab */}
          <TabsContent value="work-orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestão de Ordens de Serviço</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova OS
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OS</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workOrders?.map((workOrder) => (
                        <TableRow key={workOrder.id}>
                          <TableCell className="font-mono text-sm">
                            {workOrder.osNumber}
                          </TableCell>
                          <TableCell className="font-medium">{workOrder.title}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(workOrder.status)}>
                              {workOrder.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(workOrder.priority)}>
                              {workOrder.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(workOrder.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteWorkOrderMutation.mutate(workOrder.id)}
                                disabled={deleteWorkOrderMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}