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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsePieChart, Pie, Cell } from "recharts";

interface StatusDistribution {
  PENDENTE: number;
  AGENDADA: number;
  CONCLUIDA: number;
  VENCIDA: number;
}

interface PriorityDistribution {
  BAIXA: number;
  MEDIA: number;
  ALTA: number;
  URGENTE: number;
}

interface MonthlyTrend {
  month: string;
  created: number;
  completed: number;
}

interface TechnicianStats {
  id: number;
  name: string;
  completedOS: number;
  successRate: number;
  averageTime: number;
}

const STATUS_COLORS = {
  PENDENTE: '#fbbf24',
  AGENDADA: '#3b82f6',
  CONCLUIDA: '#10b981',
  VENCIDA: '#ef4444',
};

const PRIORITY_COLORS = {
  BAIXA: '#10b981',
  MEDIA: '#fbbf24',
  ALTA: '#f97316',
  URGENTE: '#ef4444',
};

const STATUS_LABELS = {
  PENDENTE: 'Pendente',
  AGENDADA: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  VENCIDA: 'Vencida',
};

const PRIORITY_LABELS = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
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

  // Build filters object
  const filters = {
    ...(selectedContract !== "all" && { contractId: selectedContract }),
    ...(selectedTechnician !== "all" && { technicianId: selectedTechnician }),
  };

  // Fetch real data from API
  const { data: statusDistribution, isLoading: statusLoading } = useQuery<StatusDistribution>({
    queryKey: ['/api/dashboard/status-distribution', filters],
  });

  const { data: priorityDistribution, isLoading: priorityLoading } = useQuery<PriorityDistribution>({
    queryKey: ['/api/dashboard/priority-distribution', filters],
  });

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/dashboard/monthly-trends', { months: 6 }],
  });

  const { data: technicianStats, isLoading: techLoading } = useQuery<TechnicianStats[]>({
    queryKey: ['/api/dashboard/technician-stats', filters],
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
                  {statusLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <span className="text-gray-500">Carregando...</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsePieChart>
                        <Pie 
                          data={statusDistribution ? Object.entries(statusDistribution)
                            .filter(([_, value]) => value > 0)
                            .map(([key, value]) => ({
                              name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
                              value,
                              color: STATUS_COLORS[key as keyof typeof STATUS_COLORS]
                            })) : []
                          }
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution && Object.entries(statusDistribution)
                            .filter(([_, value]) => value > 0)
                            .map(([key], index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[key as keyof typeof STATUS_COLORS]} />
                            ))
                          }
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsePieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Work Orders by Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Serviço por Prioridade</CardTitle>
                </CardHeader>
                <CardContent>
                  {priorityLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <span className="text-gray-500">Carregando...</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priorityDistribution ? Object.entries(priorityDistribution)
                        .map(([key, value]) => ({
                          name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
                          value,
                          color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS]
                        })) : []
                      }>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value">
                          {priorityDistribution && Object.entries(priorityDistribution).map(([key], index) => (
                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tendência Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <span className="text-gray-500">Carregando...</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
                        <Bar dataKey="created" fill="#3b82f6" name="Criadas" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
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
                        {technicianStats?.map((technician) => (
                          <TableRow key={technician.id}>
                            <TableCell className="font-medium">{technician.name}</TableCell>
                            <TableCell>{technician.completedOS}</TableCell>
                            <TableCell>{technician.completedOS > 0 ? 0 : 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${technician.successRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{technician.successRate}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                technician.successRate > 90 ? 'bg-green-100 text-green-800' :
                                technician.successRate > 80 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {technician.successRate > 90 ? 'Excelente' :
                                 technician.successRate > 80 ? 'Bom' : 'Precisa Melhorar'}
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