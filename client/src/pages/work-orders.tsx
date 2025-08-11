import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, User, AlertCircle, Upload, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workOrders, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['/api/work-orders'],
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest('/api/work-orders/import', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Importação realizada com sucesso",
        description: `${data.imported} ordens de serviço importadas`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      setIsImportModalOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar planilha",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      setIsUploading(true);
      importMutation.mutate(selectedFile);
      setIsUploading(false);
    }
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e importe ordens de serviço do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-3 py-1">
            Total: {workOrders?.length || 0}
          </Badge>
          
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar Planilha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Importar Ordens de Serviço
                </DialogTitle>
                <DialogDescription>
                  Faça upload de uma planilha Excel com as ordens de serviço para importar no sistema.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo Excel</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: .xlsx, .xls (máximo 10MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Formato esperado da planilha:
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Coluna A: Número da OS</li>
                    <li>• Coluna B: Título</li>
                    <li>• Coluna C: Descrição</li>
                    <li>• Coluna D: Equipamento</li>
                    <li>• Coluna E: Localização</li>
                    <li>• Coluna F: Prioridade (BAIXA/MEDIA/ALTA/URGENTE)</li>
                    <li>• Coluna G: Status (PENDENTE/AGENDADA/EM_ANDAMENTO/CONCLUIDA)</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={isUploading || importMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={!selectedFile || isUploading || importMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {(isUploading || importMutation.isPending) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent"></div>
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Importar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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