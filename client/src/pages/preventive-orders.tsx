import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Calendar, MapPin, Wrench, AlertCircle, Search, CheckCircle, Lightbulb } from "lucide-react";
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

export default function MaintenanceOrders() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showMapping, setShowMapping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch preventive maintenance orders
  const { data: orders = [], isLoading } = useQuery<PreventiveMaintenanceOrder[]>({
    queryKey: ['/api/preventive-maintenance-orders'],
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/preventive-maintenance-orders/analyze`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Analysis failed');
      return await response.json();
    },
    onSuccess: (data: any) => {
      setAnalysis(data);
      setShowMapping(true);
      toast({
        title: "Análise Concluída",
        description: `Encontrados ${data.headers?.length || 0} colunas e ${data.totalRows || 0} linhas de dados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Análise",
        description: error.message || "Erro ao analisar arquivo Excel",
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async ({ file, mapping }: { file: File; mapping?: any }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (mapping) {
        formData.append('columnMapping', JSON.stringify(mapping));
        formData.append('headerRow', '1');
      }
      const response = await fetch(`/api/preventive-maintenance-orders/import`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Import failed');
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Importação Concluída",
        description: `${data.imported || 0} ordens de manutenção preventiva foram importadas com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-maintenance-orders'] });
      setImportDialogOpen(false);
      setFile(null);
      setAnalysis(null);
      setShowMapping(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Importação",
        description: error.message || "Erro ao importar arquivo Excel",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setShowMapping(false);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      toast({
        title: "Nenhum Arquivo",
        description: "Selecione um arquivo Excel para analisar.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    analysisMutation.mutate(file, {
      onSettled: () => setAnalyzing(false)
    });
  };

  const handleImport = (useMapping = false) => {
    if (!file) {
      toast({
        title: "Nenhum Arquivo",
        description: "Selecione um arquivo Excel para importar.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    const importData = {
      file,
      mapping: useMapping && analysis ? analysis.suggestedMapping : undefined
    };
    
    importMutation.mutate(importData, {
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
          <h1 className="text-3xl font-bold tracking-tight">Manutenção</h1>
          <p className="text-muted-foreground">
            Central de controle de todas as ordens de manutenção preventiva
          </p>
        </div>
        
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Importar Preventivas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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

              {file && !showMapping && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleAnalyze} 
                    disabled={analyzing}
                    className="flex-1"
                  >
                    {analyzing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Analisar Estrutura
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleImport(false)} 
                    disabled={importing}
                    className="flex-1"
                  >
                    {importing ? "Importando..." : "Importar Diretamente"}
                  </Button>
                </div>
              )}

              {showMapping && analysis && (
                <div className="space-y-4">
                  {/* Status Success Header */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-800 dark:text-green-200">
                        Análise Concluída com Sucesso
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {analysis.headers.length} colunas detectadas • {analysis.sampleRows?.length || 0} linhas de amostra
                      </div>
                    </div>
                  </div>

                  {/* Columns Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-sm">Colunas Identificadas</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {analysis.headers.map((header: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                          <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                          <span className="text-xs font-medium truncate">{header}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Data Section */}
                  {analysis.sampleRows && analysis.sampleRows.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <h4 className="font-medium text-sm">Amostra dos Dados</h4>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              {analysis.headers.slice(0, 4).map((header: string, index: number) => (
                                <th key={index} className="text-left p-1 font-medium text-slate-600 dark:text-slate-300 truncate">
                                  {header}
                                </th>
                              ))}
                              {analysis.headers.length > 4 && (
                                <th className="text-left p-1 font-medium text-slate-400">...</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.sampleRows.slice(0, 3).map((row: any[], rowIndex: number) => (
                              <tr key={rowIndex} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                                {row.slice(0, 4).map((cell: any, cellIndex: number) => (
                                  <td key={cellIndex} className="p-1 text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                                    {cell || '-'}
                                  </td>
                                ))}
                                {row.length > 4 && (
                                  <td className="p-1 text-slate-400">+{row.length - 4}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tips Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                      Sistema Inteligente de Importação
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1 mt-1">
                      <div>• Detecção automática de colunas</div>
                      <div>• Compatível com planilhas fora do padrão</div>
                      <div>• Campos obrigatórios: OS e Agência</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setImportDialogOpen(false);
                setAnalysis(null);
                setShowMapping(false);
                setFile(null);
              }}>
                Cancelar
              </Button>
              
              {showMapping && analysis ? (
                <Button 
                  onClick={() => handleImport(true)} 
                  disabled={importing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {importing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Confirmar Importação
                    </>
                  )}
                </Button>
              ) : null}
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