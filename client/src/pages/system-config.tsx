import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Settings, Database, Shield, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

const systemConfigSchema = z.object({
  systemName: z.string().min(1, "Nome do sistema é obrigatório"),
  maxFileSize: z.number().min(1, "Tamanho máximo deve ser maior que 0"),
  sessionTimeout: z.number().min(1, "Timeout deve ser maior que 0"),
  autoRefreshInterval: z.number().min(30, "Intervalo mínimo de 30 segundos"),
  maintenanceMode: z.boolean(),
  enableNotifications: z.boolean(),
  enableLogging: z.boolean(),
});

type SystemConfigForm = z.infer<typeof systemConfigSchema>;

interface SystemLog {
  id: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  timestamp: string;
  userId?: string;
  component: string;
}

const mockLogs: SystemLog[] = [
  {
    id: 1,
    level: 'INFO',
    message: 'User logged in successfully',
    timestamp: '2025-01-25T15:30:00Z',
    userId: 'dev-user-1',
    component: 'Authentication'
  },
  {
    id: 2,
    level: 'WARNING',
    message: 'High memory usage detected (85%)',
    timestamp: '2025-01-25T15:25:00Z',
    component: 'System Monitor'
  },
  {
    id: 3,
    level: 'ERROR',
    message: 'Failed to connect to external API',
    timestamp: '2025-01-25T15:20:00Z',
    component: 'External Services'
  },
  {
    id: 4,
    level: 'INFO',
    message: 'Database backup completed successfully',
    timestamp: '2025-01-25T14:00:00Z',
    component: 'Database'
  },
];

export default function SystemConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const form = useForm<SystemConfigForm>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      systemName: "MAFFENG - Sistema OS Preventiva",
      maxFileSize: 10,
      sessionTimeout: 120,
      autoRefreshInterval: 60,
      maintenanceMode: false,
      enableNotifications: true,
      enableLogging: true,
    },
  });

  const onSubmit = async (data: SystemConfigForm) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("System config update:", data);
      setSuccess("Configurações do sistema atualizadas com sucesso!");
    } catch (err) {
      setError("Erro ao atualizar configurações do sistema.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const systemStats = [
    { label: 'Uptime', value: '15 dias, 4h 23m', icon: Clock },
    { label: 'Uso de CPU', value: '45%', icon: RefreshCw },
    { label: 'Uso de Memória', value: '68%', icon: Database },
    { label: 'Usuários Ativos', value: '12', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-500">Gerencie configurações globais e monitore o sistema</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Logs do Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="systemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Sistema</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxFileSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho Máximo de Arquivo (MB)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeout de Sessão (minutos)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autoRefreshInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intervalo de Auto-atualização (segundos)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Modo de Manutenção</FormLabel>
                              <div className="text-sm text-gray-500">
                                Bloqueia acesso ao sistema para manutenção
                              </div>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notificações</FormLabel>
                              <div className="text-sm text-gray-500">
                                Habilita sistema de notificações
                              </div>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableLogging"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Logs do Sistema</FormLabel>
                              <div className="text-sm text-gray-500">
                                Registra atividades e eventos do sistema
                              </div>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Política de Senhas</label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa (6+ caracteres)</SelectItem>
                          <SelectItem value="medium">Média (8+ caracteres, números)</SelectItem>
                          <SelectItem value="high">Alta (12+ caracteres, símbolos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tentativas de Login</label>
                      <Select defaultValue="5">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 tentativas</SelectItem>
                          <SelectItem value="5">5 tentativas</SelectItem>
                          <SelectItem value="10">10 tentativas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                      <p className="text-sm text-gray-500">Adiciona camada extra de segurança</p>
                    </div>
                    <Button variant="outline">Configurar 2FA</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Backup Automático</h4>
                      <p className="text-sm text-gray-500">Backup diário do banco de dados</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Logs do Sistema</CardTitle>
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="error">Erros</SelectItem>
                        <SelectItem value="warning">Avisos</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nível</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Componente</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data/Hora</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge className={getLogLevelColor(log.level)}>
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.message}
                          </TableCell>
                          <TableCell>{log.component}</TableCell>
                          <TableCell>{log.userId || '-'}</TableCell>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
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