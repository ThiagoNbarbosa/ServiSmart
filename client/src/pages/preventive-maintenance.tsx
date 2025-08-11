import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Date utility functions
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addWeeks = (date: Date, weeks: number) => {
  return addDays(date, weeks * 7);
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date: Date, years: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR');
};

interface MaintenancePlan {
  id: number;
  name: string;
  description?: string;
  assetId?: number;
  frequency: string;
  frequencyValue: number;
  triggerType: string;
  lastExecuted?: string;
  nextDue?: string;
  isActive: boolean;
  checklistTemplate?: any;
  estimatedDuration?: number;
  priority: string;
  technicianId?: number;
}

const FREQUENCIES = [
  { value: "DAILY", label: "Diário" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "YEARLY", label: "Anual" }
];

const PRIORITIES = [
  { value: "BAIXA", label: "Baixa", color: "green" },
  { value: "MEDIA", label: "Média", color: "yellow" },
  { value: "ALTA", label: "Alta", color: "orange" },
  { value: "URGENTE", label: "Urgente", color: "red" }
];

export default function PreventiveMaintenance() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/maintenance-plans'],
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets'],
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['/api/technicians'],
  });

  const { data: auxiliares = [] } = useQuery({
    queryKey: ['/api/auxiliares'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<MaintenancePlan>) => {
      return await apiRequest('/api/maintenance-plans', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-plans'] });
      setIsCreateOpen(false);
      toast({
        title: "Sucesso",
        description: "Plano de manutenção criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar plano de manutenção",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MaintenancePlan> }) => {
      return await apiRequest(`/api/maintenance-plans/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-plans'] });
      setEditingPlan(null);
      toast({
        title: "Sucesso",
        description: "Plano de manutenção atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar plano de manutenção",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/maintenance-plans/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-plans'] });
      toast({
        title: "Sucesso",
        description: "Plano de manutenção removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover plano de manutenção",
        variant: "destructive",
      });
    },
  });

  const executePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      // Create a work order based on the maintenance plan
      const plan = plans.find((p: MaintenancePlan) => p.id === planId);
      if (!plan) return;

      const workOrderData = {
        title: `Manutenção Preventiva - ${plan.name}`,
        description: plan.description,
        priority: plan.priority,
        technicianId: plan.technicianId,
        status: 'PENDENTE',
        type: 'PREVENTIVA',
        maintenancePlanId: planId
      };

      return await apiRequest('/api/work-orders', 'POST', workOrderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      toast({
        title: "Sucesso",
        description: "Ordem de serviço de manutenção criada!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao executar plano de manutenção",
        variant: "destructive",
      });
    },
  });

  const calculateNextDue = (frequency: string, frequencyValue: number, lastDate?: Date) => {
    const baseDate = lastDate || new Date();
    switch (frequency) {
      case 'DAILY':
        return addDays(baseDate, frequencyValue);
      case 'WEEKLY':
        return addWeeks(baseDate, frequencyValue);
      case 'MONTHLY':
        return addMonths(baseDate, frequencyValue);
      case 'QUARTERLY':
        return addMonths(baseDate, frequencyValue * 3);
      case 'YEARLY':
        return addYears(baseDate, frequencyValue);
      default:
        return baseDate;
    }
  };

  const filteredPlans = plans.filter((plan: MaintenancePlan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && plan.isActive) ||
      (activeTab === 'inactive' && !plan.isActive) ||
      (activeTab === 'overdue' && plan.nextDue && new Date(plan.nextDue) < new Date());
    return matchesSearch && matchesTab;
  });

  const getPriorityBadge = (priority: string) => {
    const priorityInfo = PRIORITIES.find(p => p.value === priority);
    if (!priorityInfo) return <Badge>{priority}</Badge>;
    
    return (
      <Badge className={`
        ${priorityInfo.color === 'green' ? 'bg-green-500' : ''}
        ${priorityInfo.color === 'yellow' ? 'bg-yellow-500' : ''}
        ${priorityInfo.color === 'orange' ? 'bg-orange-500' : ''}
        ${priorityInfo.color === 'red' ? 'bg-red-500' : ''}
      `}>
        {priorityInfo.label}
      </Badge>
    );
  };

  const getStatusIcon = (plan: MaintenancePlan) => {
    if (!plan.nextDue) return <Clock className="h-4 w-4 text-gray-500" />;
    
    const dueDate = new Date(plan.nextDue);
    const today = new Date();
    const isOverdue = dueDate < today;
    const isUpcoming = dueDate > today && dueDate <= addDays(today, 7);
    
    if (isOverdue) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (isUpcoming) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const MaintenancePlanForm = ({ plan, onSubmit, onCancel }: {
    plan?: MaintenancePlan | null;
    onSubmit: (data: Partial<MaintenancePlan>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<MaintenancePlan>>(plan || {
      isActive: true,
      frequencyValue: 1,
      triggerType: 'TIME',
      priority: 'MEDIA'
    });

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Plano</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Manutenção do Ar Condicionado"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva as atividades a serem realizadas..."
          />
        </div>

        <div>
          <Label htmlFor="assetId">Ativo Associado</Label>
          <Select
            value={formData.assetId?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, assetId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um ativo" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset: any) => (
                <SelectItem key={asset.id} value={asset.id.toString()}>
                  {asset.assetCode} - {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="frequency">Frequência</Label>
            <Select
              value={formData.frequency || ''}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="frequencyValue">A cada</Label>
            <Input
              id="frequencyValue"
              type="number"
              min="1"
              value={formData.frequencyValue || 1}
              onChange={(e) => setFormData({ ...formData, frequencyValue: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority || 'MEDIA'}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estimatedDuration">Duração Estimada (min)</Label>
            <Input
              id="estimatedDuration"
              type="number"
              min="0"
              value={formData.estimatedDuration || ''}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
              placeholder="60"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="technicianId">Responsável</Label>
          <Select
            value={formData.technicianId?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, technicianId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              {technicians.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-500">Técnicos</div>
                  {technicians.map((tech: any) => (
                    <SelectItem key={`tech-${tech.id}`} value={tech.id.toString()}>
                      {tech.name} (Técnico)
                    </SelectItem>
                  ))}
                </>
              )}
              {auxiliares.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-500">Auxiliares</div>
                  {auxiliares.map((aux: any) => (
                    <SelectItem key={`aux-${aux.id}`} value={aux.id.toString()}>
                      {aux.name} (Auxiliar)
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => {
            const nextDue = calculateNextDue(
              formData.frequency || 'MONTHLY',
              formData.frequencyValue || 1,
              formData.lastExecuted ? new Date(formData.lastExecuted) : undefined
            );
            onSubmit({ ...formData, nextDue: nextDue.toISOString() });
          }}>
            {plan ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manutenção Preventiva</h1>
          <p className="text-muted-foreground">Gerencie planos de manutenção preventiva</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano de Manutenção</DialogTitle>
            </DialogHeader>
            <MaintenancePlanForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Planos de Manutenção</CardTitle>
            <Input
              placeholder="Buscar planos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
              <TabsTrigger value="overdue">Vencidos</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Frequência</TableHead>
                        <TableHead>Próxima Execução</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlans.map((plan) => {
                        const asset = assets.find((a: any) => a.id === plan.assetId);
                        const frequency = FREQUENCIES.find(f => f.value === plan.frequency);
                        
                        return (
                          <TableRow key={plan.id}>
                            <TableCell>{getStatusIcon(plan)}</TableCell>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{asset ? `${asset.assetCode} - ${asset.name}` : '-'}</TableCell>
                            <TableCell>
                              {frequency?.label} 
                              {plan.frequencyValue > 1 && ` (a cada ${plan.frequencyValue})`}
                            </TableCell>
                            <TableCell>
                              {plan.nextDue
                                ? formatDate(new Date(plan.nextDue))
                                : '-'}
                            </TableCell>
                            <TableCell>{getPriorityBadge(plan.priority)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => executePlanMutation.mutate(plan.id)}
                                >
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Executar
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingPlan(plan)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate(plan.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plano de Manutenção</DialogTitle>
          </DialogHeader>
          <MaintenancePlanForm
            plan={editingPlan}
            onSubmit={(data) => editingPlan && updateMutation.mutate({ id: editingPlan.id, data })}
            onCancel={() => setEditingPlan(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}