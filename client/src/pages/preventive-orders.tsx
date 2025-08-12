import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Calendar, MapPin, Wrench, AlertCircle } from "lucide-react";
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

export default function PreventiveOrders() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch preventive maintenance orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/preventive-maintenance-orders'],
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest(`/api/preventive-maintenance-orders/import`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Importação Concluída",
        description: `${data.imported} ordens de manutenção preventiva foram importadas com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-maintenance-orders'] });
      setImportDialogOpen(false);
      setFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Importação",
        description: error.details || "Erro ao importar arquivo Excel",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: "Nenhum Arquivo",
        description: "Selecione um arquivo Excel para importar.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    importMutation.mutate(file, {
      onSettled: () => setImporting(false)
    });
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return 'R$ 0,00';
    const number = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens Preventivas</h1>
          <p className="text-muted-foreground">
            Gerenciar ordens de manutenção preventiva e importações RAT
          </p>
        </div>
        
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Importar Preventivas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Importar Ordens Preventivas
              </DialogTitle>
              <DialogDescription>
                Faça upload de uma planilha Excel com as ordens de manutenção preventiva (PREVENTIVAS)
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Arquivo Excel</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="text-sm text-muted-foreground">
                    Arquivo selecionado: {file.name}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Formato esperado da planilha PREVENTIVAS:</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div>• Coluna A: ELABORADOR DE RELATÓRIO</div>
                  <div>• Coluna B: DATA LEVANTAMENTO</div>
                  <div>• Coluna C: CONTRATO</div>
                  <div>• Coluna D: OS (obrigatório)</div>
                  <div>• Coluna E: PREFIXO</div>
                  <div>• Coluna F: AGÊNCIA (obrigatório)</div>
                  <div>• Coluna G: VALOR PREVENTIVA ORÇAMENTO</div>
                  <div>• Coluna H: VENCIMENTO PORTAL</div>
                  <div>• Coluna I: SITUAÇÃO</div>
                  <div>• Coluna J: TÉCNICO PREVENTIVA</div>
                  <div>• Coluna K: DATA AGENDAMENTO</div>
                  <div>• Coluna L: DIFICULDADES</div>
                  <div>• Coluna M: STATUS</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ordens de Manutenção Preventiva
          </CardTitle>
          <CardDescription>
            Lista de todas as ordens de manutenção preventiva importadas. 
            Total: {orders.length} ordens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Nenhuma ordem preventiva encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Importe dados usando a funcionalidade de importação Excel
              </p>
              <Button onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Importar Primeira Planilha
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Agência</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Agendamento</TableHead>
                    <TableHead>Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: PreventiveMaintenanceOrder) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.workOrderNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {order.agencyName}
                        </div>
                      </TableCell>
                      <TableCell>{order.equipmentPrefix || '-'}</TableCell>
                      <TableCell>{formatCurrency(order.preventiveBudgetValue)}</TableCell>
                      <TableCell>
                        {order.situationStatus && (
                          <Badge variant="secondary" className={statusColors[order.situationStatus as keyof typeof statusColors]}>
                            {statusLabels[order.situationStatus as keyof typeof statusLabels] || order.situationStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.executionStatus && (
                          <Badge variant="outline" className={executionStatusColors[order.executionStatus as keyof typeof executionStatusColors]}>
                            {order.executionStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(order.scheduledDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.portalDeadline && new Date(order.portalDeadline) < new Date() ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : null}
                          {formatDate(order.portalDeadline)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}