import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, HelpCircle, Mail, Phone, MessageCircle, Book, Video, Search } from "lucide-react";
import { Link } from "wouter";

const supportSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  category: z.string().min(1, "Selecione uma categoria"),
  priority: z.string().min(1, "Selecione uma prioridade"),
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(20, "Mensagem deve ter pelo menos 20 caracteres"),
});

type SupportForm = z.infer<typeof supportSchema>;

const faqData = [
  {
    question: "Como importar dados da planilha PREVENTIVAS?",
    answer: "Acesse o menu Dashboard e clique no botão 'Importar Excel'. Selecione sua planilha PREVENTIVAS no formato .xlsx ou .csv. O sistema processará automaticamente os dados e criará as ordens de serviço correspondentes."
  },
  {
    question: "Como visualizar as ordens de serviço importadas?",
    answer: "No Dashboard principal, clique no botão '📋 OS Importadas' para ver todas as ordens de serviço que foram importadas da planilha PREVENTIVAS. Você pode filtrar por status, prioridade e outras opções."
  },
  {
    question: "Como alterar o status de uma ordem de serviço?",
    answer: "Na página de gestão (Management), acesse a aba 'Ordens de Serviço'. Clique no botão de editar ao lado da OS desejada e altere o status conforme necessário."
  },
  {
    question: "Como adicionar novos técnicos ao sistema?",
    answer: "Vá para a página de Gestão do Sistema e selecione a aba 'Técnicos'. Clique em 'Novo Técnico' e preencha as informações necessárias incluindo nome, email, telefone e especialidades."
  },
  {
    question: "Como gerar relatórios do sistema?",
    answer: "Acesse a página de Relatórios através do menu principal. Selecione os filtros desejados (período, contrato, técnico) e escolha o tipo de relatório. Você pode exportar em formato Excel ou PDF."
  },
  {
    question: "O que fazer se o sistema apresentar erro de conexão?",
    answer: "Verifique sua conexão com a internet. Se o problema persistir, tente atualizar a página (F5). Se ainda assim não resolver, entre em contato com o suporte técnico."
  },
  {
    question: "Como configurar notificações do sistema?",
    answer: "Acesse seu Perfil de Usuário e vá para a aba 'Notificações'. Lá você pode configurar quais tipos de notificações deseja receber por email ou no sistema."
  },
  {
    question: "Posso usar o sistema em dispositivos móveis?",
    answer: "Sim! O sistema MAFFENG é totalmente responsivo e funciona perfeitamente em smartphones e tablets. Todas as funcionalidades estão disponíveis na versão mobile."
  }
];

const tutorialVideos = [
  {
    title: "Introdução ao Sistema MAFFENG",
    duration: "5:30",
    description: "Visão geral das funcionalidades principais do sistema",
    thumbnail: "tutorial-intro.jpg"
  },
  {
    title: "Como Importar Planilhas PREVENTIVAS",
    duration: "3:45",
    description: "Passo a passo para importar dados Excel/CSV",
    thumbnail: "tutorial-import.jpg"
  },
  {
    title: "Gestão de Ordens de Serviço",
    duration: "7:20",
    description: "Como criar, editar e gerenciar ordens de serviço",
    thumbnail: "tutorial-orders.jpg"
  },
  {
    title: "Configurações do Sistema",
    duration: "4:15",
    description: "Como configurar preferências e parâmetros do sistema",
    thumbnail: "tutorial-config.jpg"
  }
];

export default function HelpSupport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const form = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "",
      priority: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: SupportForm) => {
    setIsSubmitting(true);
    setSuccess("");
    
    try {
      console.log("Support ticket:", data);
      setSuccess("Ticket de suporte enviado com sucesso! Entraremos em contato em breve.");
      form.reset();
    } catch (err) {
      console.error("Error submitting support ticket:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaq = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Ajuda e Suporte</h1>
            <p className="text-gray-500">Encontre respostas, tutoriais e entre em contato conosco</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-gray-500">suporte@maffeng.com</p>
              <p className="text-xs text-gray-400">Resposta em até 24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-medium">Telefone</h3>
              <p className="text-sm text-gray-500">(11) 99999-9999</p>
              <p className="text-xs text-gray-400">Seg-Sex 8h-18h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-medium">Chat Online</h3>
              <p className="text-sm text-gray-500">Suporte em tempo real</p>
              <Button size="sm" className="mt-2">Iniciar Chat</Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Tabs */}
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq" className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Tutoriais</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>Documentação</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Contato</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar nas perguntas frequentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredFaq.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma pergunta encontrada para "{searchTerm}"
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorialVideos.map((video, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{video.duration}</Badge>
                      <Button size="sm">Assistir</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manual do Usuário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Guia de Início Rápido
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Funcionalidades Avançadas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Importação de Dados
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Relatórios e Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recursos Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Configurações Avançadas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Troubleshooting
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Release Notes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Entrar em Contato</CardTitle>
                <p className="text-sm text-gray-600">
                  Não encontrou a resposta que procurava? Envie-nos uma mensagem.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Seu nome completo" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="seu@email.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="technical">Problema Técnico</SelectItem>
                                <SelectItem value="feature">Solicitação de Funcionalidade</SelectItem>
                                <SelectItem value="bug">Relatório de Bug</SelectItem>
                                <SelectItem value="account">Questão de Conta</SelectItem>
                                <SelectItem value="other">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assunto</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Descreva brevemente o problema" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Descreva detalhadamente sua questão ou problema..."
                              rows={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                      {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}