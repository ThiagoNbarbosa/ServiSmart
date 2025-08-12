# 📋 DOCUMENTAÇÃO COMPLETA DO SISTEMA MAFFENG
**Sistema de Gerenciamento de Manutenção (CMMS)**

## 🎯 VISÃO GERAL DO SISTEMA
O MAFFENG é um sistema CMMS (Computerized Maintenance Management System) desenvolvido para equipes de engenharia, focado na gestão eficiente de ordens de serviço, manutenção preventiva e controle de equipes técnicas.

### 🏗️ ARQUITETURA TÉCNICA
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL com Drizzle ORM
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Autenticação**: Sistema mock (desenvolvimento)
- **Comunicação**: WebSockets para tempo real

---

## 📱 PÁGINAS DO SISTEMA

### 1. 🏠 DASHBOARD PRINCIPAL (`/`)
**Arquivo**: `client/src/pages/dashboard.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Grid responsivo com 6 seções principais
- **Cor de fundo**: Cinza claro (`bg-gray-50`)
- **Cards**: Brancos com sombras suaves e bordas arredondadas
- **Tipografia**: Inter font, títulos em negrito

#### 🔧 COMPONENTES TÉCNICOS:
1. **Métricas KPI** (4 cards superiores):
   - Total de OS, OS Pendentes, OS Concluídas, Taxa de Conclusão
   - Background com gradientes sutis
   - Ícones Lucide React coloridos
   - Animações de carregamento (skeleton)

2. **Gráfico de Status** (pizza):
   - Componente: `StatusChart.tsx`
   - Biblioteca: Recharts
   - Dados: Distribuição por status (PENDENTE, AGENDADA, EM_ANDAMENTO, CONCLUIDA)
   - Cores: Verde, azul, amarelo, cinza

3. **Gráfico de Tendências** (linhas):
   - Componente: `TrendChart.tsx`
   - Dados: Criadas vs Concluídas por mês
   - Período: 6 meses
   - Cores: Azul e verde

4. **Performance dos Técnicos**:
   - Lista com avatares e estatísticas
   - Barras de progresso coloridas
   - Badges de especialização

5. **Atividades Recentes**:
   - Timeline vertical
   - Ícones por tipo de atividade
   - Timestamps relativos

6. **Estatísticas da Equipe**:
   - Cards com métricas de técnicos e auxiliares
   - Ícones diferenciados por função

#### 🔌 INTEGRAÇÕES API:
- `GET /api/dashboard/metrics`
- `GET /api/dashboard/status-distribution`
- `GET /api/dashboard/monthly-trends`
- `GET /api/dashboard/technician-stats`
- `GET /api/dashboard/recent-activity`

---

### 2. 📋 ORDENS DE SERVIÇO (`/work-orders`)
**Arquivo**: `client/src/pages/work-orders.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Cabeçalho + tabela responsiva
- **Header**: Título, descrição e botões de ação
- **Tabela**: Estrutura limpa com colunas organizadas
- **Modal**: Importação Excel com instruções visuais

#### 🔧 FUNCIONALIDADES TÉCNICAS:
1. **Tabela de Dados**:
   - Componente: Shadcn Table
   - Colunas: OS, Título, Equipamento, Local, Prioridade, Status, Data
   - Badges coloridos para status e prioridade
   - Ícones contextual por coluna

2. **Modal de Importação**:
   - Upload de arquivos Excel (.xlsx, .xls)
   - Validação de formato
   - Preview do arquivo selecionado
   - Instruções detalhadas do formato esperado
   - Feedback visual com loading spinner
   - Toast notifications para sucesso/erro

3. **Estados de Loading**:
   - Skeleton loader na tabela
   - Estados vazios informativos
   - Tratamento de erros

#### 🔌 INTEGRAÇÕES API:
- `GET /api/work-orders` - Listagem
- `POST /api/work-orders/import` - Importação Excel

#### 📝 FORMATO DE IMPORTAÇÃO:
```
Coluna A: Número da OS
Coluna B: Título
Coluna C: Descrição
Coluna D: Equipamento
Coluna E: Localização
Coluna F: Prioridade (BAIXA/MEDIA/ALTA/URGENTE)
Coluna G: Status (PENDENTE/AGENDADA/EM_ANDAMENTO/CONCLUIDA)
```

---

### 3. 🔧 MANUTENÇÃO PREVENTIVA (`/preventive-maintenance`)
**Arquivo**: `client/src/pages/preventive-maintenance.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Grid de cards com informações dos planos
- **Cards**: Estrutura consistente com badge de status
- **Cores**: Sistema de cores por frequência e status
- **Tipografia**: Hierarquia clara com títulos e descrições

#### 🔧 FUNCIONALIDADES TÉCNICAS:
1. **Listagem de Planos**:
   - Cards individuais por plano
   - Badges de frequência coloridos
   - Informações de equipamento e localização
   - Datas de próxima manutenção

2. **Estados do Sistema**:
   - Loading states com skeleton
   - Empty states informativos
   - Error handling

#### 🔌 INTEGRAÇÕES API:
- `GET /api/maintenance-plans`

---

### 4. 👥 INFORMAÇÕES DA EQUIPE (`/team`)
**Arquivo**: `client/src/pages/team-information.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Grid de 8 cards (técnicos + auxiliares)
- **Cards**: Design moderno com avatares e informações profissionais
- **Avatars**: Imagens ou iniciais coloridas
- **Badges**: Diferenciação visual por função

#### 🔧 FUNCIONALIDADES TÉCNICAS:
1. **Grid Responsivo**:
   - 4 cards por linha em desktop
   - Adaptação para mobile e tablet
   - Cards com hover effects

2. **Informações por Card**:
   - Avatar personalizado
   - Nome e função
   - Badge de especialização
   - Informações de contato
   - Status de disponibilidade

#### 🔌 INTEGRAÇÕES API:
- `GET /api/technicians`
- `GET /api/auxiliares`

---

### 5. 👤 GERENCIAMENTO DE USUÁRIOS (`/users`)
**Arquivo**: `client/src/pages/user-management.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Tabela administrativa completa
- **Header**: Botões de ação para adicionar usuários
- **Tabela**: Colunas organizadas com ações por linha
- **Modals**: Formulários para CRUD de usuários

#### 🔧 FUNCIONALIDADES TÉCNICAS:
1. **CRUD Completo**:
   - Listagem paginada
   - Adicionar novo usuário
   - Editar usuário existente
   - Excluir usuário
   - Filtros e busca

2. **Formulários**:
   - Validação com Zod
   - React Hook Form
   - Campos obrigatórios destacados
   - Feedback de validação

#### 🔌 INTEGRAÇÕES API:
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

---

### 6. 📊 RELATÓRIOS (`/reports`)
**Arquivo**: `client/src/pages/reports.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Dashboard de relatórios com múltiplas visualizações
- **Cards**: Métricas resumidas no topo
- **Gráficos**: Visualizações diversas (barras, linhas, pizza)
- **Filtros**: Controles de período e categorias

#### 🔧 FUNCIONALIDADES TÉCNICAS:
1. **Tipos de Relatórios**:
   - Relatório de produtividade
   - Análise de tendências
   - Performance por técnico
   - Distribuição por equipamento

2. **Exportação**:
   - PDF
   - Excel
   - CSV

---

### 7. ⚙️ CONFIGURAÇÕES DO SISTEMA (`/system-config`)
**Arquivo**: `client/src/pages/system-config.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Seções organizadas em abas ou cards
- **Formulários**: Campos agrupados por categoria
- **Switches**: Toggle switches para configurações booleanas

#### 🔧 FUNCIONALIDADES TÉCNICAS:
1. **Categorias de Configuração**:
   - Configurações gerais
   - Notificações
   - Integrações
   - Backup e segurança

---

### 8. 🆘 AJUDA E SUPORTE (`/help`)
**Arquivo**: `client/src/pages/help-support.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: FAQ + formulário de contato
- **Seções**: Accordion para perguntas frequentes
- **Formulário**: Design limpo para solicitações

---

### 9. 👤 PERFIL DO USUÁRIO (`/profile`)
**Arquivo**: `client/src/pages/user-profile.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Layout**: Informações pessoais + configurações
- **Avatar**: Upload de foto de perfil
- **Formulários**: Edição de dados pessoais

---

### 10. 🔐 AUTENTICAÇÃO
**Arquivos**: `client/src/pages/login.tsx`, `client/src/pages/register.tsx`, `client/src/pages/landing.tsx`

#### 📊 APARÊNCIA VISUAL:
- **Landing**: Página inicial com apresentação do sistema
- **Login/Register**: Formulários centrados com branding

---

## 🎨 SISTEMA DE DESIGN

### 🎨 PALETA DE CORES:
```css
/* Cores Principais */
--primary: #2563eb (azul)
--secondary: #64748b (cinza azulado)
--success: #059669 (verde)
--warning: #d97706 (laranja)
--error: #dc2626 (vermelho)

/* Backgrounds */
--background: #ffffff
--muted: #f8fafc
--border: #e2e8f0
```

### 📱 RESPONSIVIDADE:
- **Mobile First**: Design adaptativo
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid + Flexbox
- **Components**: 100% responsivos

### 🔧 COMPONENTES REUTILIZÁVEIS:
- **Cards**: Estrutura padrão para conteúdo
- **Buttons**: Variantes primary, secondary, outline
- **Forms**: Validação integrada
- **Tables**: Responsive com paginação
- **Modals**: Dialog system padronizado
- **Badges**: Status e categorização
- **Charts**: Recharts integrado

---

## 🚀 FUNCIONALIDADES TÉCNICAS AVANÇADAS

### 📡 REAL-TIME:
- **WebSockets**: Atualizações em tempo real
- **Notifications**: Sistema de notificações
- **Live Updates**: Dashboard atualizado automaticamente

### 📊 IMPORTAÇÃO/EXPORTAÇÃO:
- **Excel Import**: Biblioteca ExcelJS
- **PDF Export**: Geração de relatórios
- **CSV Export**: Dados tabulares

### 🔒 SEGURANÇA:
- **Validação**: Zod schema validation
- **Sanitização**: Input sanitization
- **CORS**: Configurado corretamente
- **Rate Limiting**: Proteção contra spam

### 🏃‍♂️ PERFORMANCE:
- **Lazy Loading**: Componentes carregados sob demanda
- **Code Splitting**: Bundle otimizado
- **Caching**: TanStack Query para cache inteligente
- **Memoization**: React.memo em componentes críticos

---

## 📈 MÉTRICAS E ANALYTICS

### 📊 KPIs MONITORADOS:
- Total de Ordens de Serviço
- Taxa de Conclusão
- Tempo Médio de Resolução
- Performance por Técnico
- Distribuição por Prioridade
- Tendências Mensais

### 🎯 OBJETIVOS DE PERFORMANCE:
- **Loading Time**: < 2s primeira carga
- **Interação**: < 100ms resposta UI
- **Bundle Size**: < 1MB otimizado
- **Lighthouse Score**: > 90 performance

---

## 🔮 ROADMAP FUTURO

### 📅 PRÓXIMAS IMPLEMENTAÇÕES:
1. **Mobile App**: React Native
2. **Offline Support**: PWA capabilities
3. **Advanced Analytics**: BI dashboard
4. **API Integration**: Sistemas terceiros
5. **AI/ML**: Predição de manutenções
6. **Multi-tenant**: Suporte múltiplas empresas

---

*Documentação gerada em: Janeiro 2025*
*Versão do Sistema: 1.0.0*
*Última atualização: Dashboard charts optimization & Import modal fix*