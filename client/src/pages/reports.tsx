import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ArrowLeft, Download, FileText, BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsePieChart, Cell } from "recharts";

interface ReportData {
  workOrdersByStatus: Array<{ name: string; value: number; color: string }>;
  workOrdersByPriority: Array<{ name: string; value: number; color: string }>;
  monthlyTrends: Array<{ month: string; completed: number; pending: number; total: number }>;
  technicianPerformance: Array<{ name: string; completed: number; pending: number; efficiency: number }>;
}

const mockReportData: ReportData = {
  workOrdersByStatus: [
    { name: 'Pendente', value: 35, color: '#fbbf24' },
    { name: 'Em Andamento', value: 20, color: '#3b82f6' },
    { name: 'Concluída', value: 40, color: '#10b981' },
    { name: 'Vencida', value: 5, color: '#ef4444' },
  ],
  workOrdersByPriority: [
    { name: 'Baixa', value: 45, color: '#10b981' },
    { name: 'Média', value: 35, color: '#fbbf24' },
    { name: 'Alta', value: 15, color: '#f97316' },
    { name: 'Urgente', value: 5, color: '#ef4444' },
  ],
  monthlyTrends: [
    { month: 'Jan', completed: 45, pending: 12, total: 57 },
    { month: 'Fev', completed: 52, pending: 8, total: 60 },
    { month: 'Mar', completed: 38, pending: 15, total: 53 },
    { month: 'Abr', completed: 61, pending: 9, total: 70 },
    { month: 'Mai', completed: 48, pending: 14, total: 62 },
    { month: 'Jun', completed: 55, pending: 11, total: 66 },
  ],
  technicianPerformance: [
    { name: 'Felipe Santos', completed: 45, pending: 3, efficiency: 93.8 },
    { name: 'Ana Costa', completed: 38, pending: 5, efficiency: 88.4 },
    { name: 'Carlos Silva', completed: 42, pending: 8, efficiency: 84.0 },
    { name: 'Marina Oliveira', completed: 35, pending: 4, efficiency: 89.7 },
  ],
};

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-month");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const { data: technicians } = useQuery({
    queryKey: ['/api/technicians'],
  });

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report with filters:`, {
      period: selectedPeriod,
      contract: selectedContract,
      technician: selectedTechnician,
    });
    // Here you would call the API to generate and download the report
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
              <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
              <p className="text-gray-500">Análise detalhada de performance e dados do sistema</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Última Semana</SelectItem>
                    <SelectItem value="last-month">Último Mês</SelectItem>
                    <SelectItem value="last-quarter">Último Trimestre</SelectItem>
                    <SelectItem value="last-year">Último Ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contrato</label>
                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Contratos</SelectItem>
                    {contracts?.map((contract: any) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Técnico</label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Técnicos</SelectItem>
                    {technicians?.map((technician: any) => (
                      <SelectItem key={technician.id} value={technician.id.toString()}>
                        {technician.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ações</label>
                <div className="flex space-x-2">
                  <Button onClick={() => generateReport('excel')} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={() => generateReport('pdf')} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Detalhado</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Orders by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Serviço por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsePieChart>
                      <RechartsePieChart data={mockReportData.workOrdersByStatus}>
                        {mockReportData.workOrdersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsePieChart>
                      <Tooltip />
                      <Legend />
                    </RechartsePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Work Orders by Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Serviço por Prioridade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockReportData.workOrdersByPriority}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tendência Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockReportData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
                      <Bar dataKey="pending" fill="#fbbf24" name="Pendentes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 gap-6">
              {/* Technician Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance dos Técnicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Técnico</TableHead>
                          <TableHead>Concluídas</TableHead>
                          <TableHead>Pendentes</TableHead>
                          <TableHead>Eficiência</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockReportData.technicianPerformance.map((technician, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{technician.name}</TableCell>
                            <TableCell>{technician.completed}</TableCell>
                            <TableCell>{technician.pending}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${technician.efficiency}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{technician.efficiency}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                technician.efficiency > 90 ? 'bg-green-100 text-green-800' :
                                technician.efficiency > 80 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {technician.efficiency > 90 ? 'Excelente' :
                                 technician.efficiency > 80 ? 'Bom' : 'Precisa Melhorar'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockReportData.technicianPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
                      <Bar dataKey="pending" fill="#fbbf24" name="Pendentes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Detalhado de Ordens de Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Input placeholder="Buscar OS..." className="w-64" />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos Status</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in-progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Lista
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Mostrando resultados filtrados para o período selecionado
                  </div>

                  {/* This would typically show the actual work orders data */}
                  <div className="border rounded-lg p-4 text-center text-gray-500">
                    Lista detalhada de ordens de serviço baseada nos filtros aplicados
                    <br />
                    <span className="text-xs">(Dados carregados dinamicamente)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Pré-configurados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => generateReport('summary')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório Resumo Executivo
                  </Button>
                  <Button className="w-full justify-start" onClick={() => generateReport('performance')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Relatório de Performance
                  </Button>
                  <Button className="w-full justify-start" onClick={() => generateReport('detailed')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatório Detalhado Completo
                  </Button>
                  <Button className="w-full justify-start" onClick={() => generateReport('financial')}>
                    <PieChart className="h-4 w-4 mr-2" />
                    Relatório Financeiro
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agendamento de Relatórios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequência</label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email para Envio</label>
                    <Input placeholder="relatorios@empresa.com" />
                  </div>

                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Configurar Agendamento
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}