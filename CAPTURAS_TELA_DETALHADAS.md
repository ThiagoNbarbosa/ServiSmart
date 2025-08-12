# 📸 CAPTURAS DE TELA DETALHADAS - SISTEMA MAFFENG

## 🎯 LAYOUT GERAL DO SISTEMA

### 🏗️ ESTRUTURA BASE:
```
┌─────────────────────────────────────────────────────┐
│ [LOGO MAFFENG] DASHBOARD                  🔔 [USER] │ ← Header azul
├─────────────────────────────────────────────────────┤
│ 📊 Dashboard         │                               │
│ 📋 Ordens de Serviço │        CONTEÚDO              │ ← Sidebar +
│ 🔧 Manutenção        │         PRINCIPAL             │   Área principal
│ 👥 Equipe            │                               │
│ 👤 Usuários          │                               │
│ 📊 Relatórios        │                               │
└─────────────────────────────────────────────────────┘
```

---

## 📱 PÁGINA 1: DASHBOARD PRINCIPAL (`/`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│                      📊 DASHBOARD                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │📋 TOTAL │ │⏳ PEND. │ │✅ CONCL.│ │📈 TAXA  │             │
│ │   0     │ │   0     │ │   0     │ │  0%     │             │
│ │OS Totais│ │Pendentes│ │Concluída│ │Conclusão│             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────────────────────┐   │
│ │  📊 STATUS       │ │     📈 TENDÊNCIAS MENSAIS       │   │
│ │                  │ │                                  │   │
│ │    [GRÁFICO      │ │       [GRÁFICO DE LINHAS]        │   │
│ │     DE PIZZA]    │ │   ┌─Criadas  ┌─Concluídas        │   │
│ │                  │ │   │          │                   │   │
│ │ 🟢 Concluída     │ │   Jan Feb Mar Apr Mai Jun        │   │
│ │ 🟡 Em Andamento  │ │                                  │   │
│ │ 🔴 Pendente      │ │                                  │   │
│ └──────────────────┘ └──────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────────────────────┐   │
│ │👨‍🔧 PERFORMANCE   │ │     📋 ATIVIDADES RECENTES      │   │
│ │DOS TÉCNICOS      │ │                                  │   │
│ │                  │ │ 🕐 Nenhuma atividade recente     │   │
│ │[Nenhum técnico   │ │                                  │   │
│ │ cadastrado]      │ │                                  │   │
│ │                  │ │                                  │   │
│ └──────────────────┘ └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **Background**: Cinza claro (#f8fafc)
- **Cards KPI**: Brancos com gradientes sutis, ícones coloridos
- **Gráfico Pizza**: Cores: Verde (#059669), Amarelo (#d97706), Azul (#2563eb)
- **Gráfico Linhas**: Duas linhas (azul e verde) com grid
- **Typography**: Títulos em negrito, números grandes nos KPIs

---

## 📱 PÁGINA 2: ORDENS DE SERVIÇO (`/work-orders`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar  ORDENS DE SERVIÇO           Total: 0  [IMPORTAR] │ ← Header
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️  DADOS IMPORTADOS DA PLANILHA PREVENTIVAS           │ │ ← Card título
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │        📄 Nenhuma ordem de serviço encontrada           │ │
│ │           Importe dados usando a funcionalidade        │ │ ← Empty state
│ │              de importação Excel                        │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

MODAL DE IMPORTAÇÃO:
┌─────────────────────────────────────────────────────────────┐
│ 📊 Importar Ordens de Serviço                         ✕    │
├─────────────────────────────────────────────────────────────┤
│ Faça upload de uma planilha Excel com as ordens...         │
│                                                             │
│ Arquivo Excel                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📁 Escolher arquivo...                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Formatos aceitos: .xlsx, .xls (máximo 10MB)                │
│                                                             │
│ ℹ️ Formato esperado da planilha:                            │
│ • Coluna A: Número da OS                                   │
│ • Coluna B: Título                                         │
│ • Coluna C: Descrição                                      │
│ • Coluna D: Equipamento                                    │
│ • Coluna E: Localização                                    │
│ • Coluna F: Prioridade (BAIXA/MEDIA/ALTA/URGENTE)         │
│ • Coluna G: Status (PENDENTE/AGENDADA/EM_ANDAMENTO/...)   │
│                                                             │
│                                    [Cancelar] [IMPORTAR]   │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **Header**: Botão voltar, título, contador, botão de importação azul
- **Tabela**: Headers com ícones, badges coloridos para status/prioridade
- **Modal**: Design clean, instruções claras, botão de arquivo estilizado

---

## 📱 PÁGINA 3: MANUTENÇÃO PREVENTIVA (`/preventive-maintenance`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│                   🔧 MANUTENÇÃO PREVENTIVA                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              📅 Nenhum plano de manutenção                  │
│                   preventiva encontrado                     │
│                                                             │
│           Use o sistema de gerenciamento para               │
│                 criar planos preventivos                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

COM DADOS (exemplo):
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │🔧 Bomba Central │ │⚙️ Compressor A1 │ │🔋 Gerador Aux  │ │
│ │                 │ │                 │ │                 │ │
│ │🟢 MENSAL        │ │🟡 SEMANAL       │ │🔴 ANUAL         │ │
│ │📍 Setor A       │ │📍 Setor B       │ │📍 Setor C       │ │
│ │📅 Próx: 15/Jan  │ │📅 Próx: 22/Jan  │ │📅 Próx: Mar/25 │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **Cards**: Grid responsivo, ícones por tipo de equipamento
- **Badges**: Cores por frequência (Verde=mensal, Amarelo=semanal, Vermelho=anual)
- **Localização**: Ícone de pin + texto
- **Datas**: Ícone calendário + data formatada

---

## 📱 PÁGINA 4: INFORMAÇÕES DA EQUIPE (`/team`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│                    👥 INFORMAÇÕES DA EQUIPE                 │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────┐ │
│ │    👨‍🔧        │ │    👨‍💻        │ │    👩‍🔧        │ │  👨‍  │ │
│ │ João Silva   │ │ Pedro Costa  │ │ Maria Santos │ │ Carlos│ │
│ │              │ │              │ │              │ │       │ │
│ │🔧 TÉCNICO    │ │💻 AUXILIAR   │ │🔧 TÉCNICO    │ │🔧 TÉC │ │
│ │Elétrica      │ │Sistemas      │ │Mecânica      │ │Hidráu │ │
│ │📞 9999-1234  │ │📞 9999-5678  │ │📞 9999-9012  │ │📞 999 │ │
│ │✅ Disponível │ │✅ Disponível │ │🟡 Ocupado    │ │✅ Dis │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────┘ │
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────┐ │
│ │    👩‍💻        │ │    👨‍🔧        │ │    👩‍💻        │ │  👨‍  │ │
│ │ Ana Lima     │ │ Roberto Dias │ │ Carla Rocha  │ │ Lucas │ │
│ │              │ │              │ │              │ │       │ │
│ │💻 AUXILIAR   │ │🔧 TÉCNICO    │ │💻 AUXILIAR   │ │🔧 TÉC │ │
│ │Documentação  │ │Civil         │ │Logística     │ │Eletrô │ │
│ │📞 9999-3456  │ │📞 9999-7890  │ │📞 9999-2345  │ │📞 999 │ │
│ │✅ Disponível │ │🔴 Ausente    │ │✅ Disponível │ │🟡 Ocu │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **Grid**: 4 cards por linha, responsivo para mobile
- **Avatars**: Círculos coloridos com iniciais ou ícones
- **Badges**: 
  - Azul para TÉCNICO (🔧)
  - Verde para AUXILIAR (💻)
- **Status**: 
  - Verde (✅ Disponível)
  - Amarelo (🟡 Ocupado)  
  - Vermelho (🔴 Ausente)
- **Especialização**: Tags pequenas com área de atuação

---

## 📱 PÁGINA 5: GERENCIAMENTO DE USUÁRIOS (`/users`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│ 👤 GERENCIAMENTO DE USUÁRIOS              [+ ADICIONAR]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─ 🔍 Buscar usuários... ──────────────────────────────────┐ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ NOME      │ EMAIL           │ FUNÇÃO   │ STATUS   │ AÇÕES │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Admin     │ admin@maffeng   │ DIRETOR  │ 🟢 Ativo │ ✏️ 🗑️│ │
│ │ João      │ joao@maffeng    │ SUPERV.  │ 🟢 Ativo │ ✏️ 🗑️│ │
│ │ Maria     │ maria@maffeng   │ USUÁRIO  │ 🟡 Pend. │ ✏️ 🗑️│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ← 1 2 3 ... 10 →                     Mostrando 1-10 de 25  │
└─────────────────────────────────────────────────────────────┘

MODAL ADICIONAR/EDITAR:
┌─────────────────────────────────────────────────────────────┐
│ 👤 Adicionar Novo Usuário                             ✕    │
├─────────────────────────────────────────────────────────────┤
│ Nome Completo *                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Email *                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Função *                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Selecione uma função                                ⌄   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Senha Temporária *                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                    👁    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                    [Cancelar] [SALVAR]     │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **Header**: Título + botão azul de adicionar
- **Busca**: Campo com ícone de lupa
- **Tabela**: Headers fixos, linhas alternadas, ações inline
- **Badges Status**: Verde (Ativo), Amarelo (Pendente), Vermelho (Inativo)
- **Modal**: Formulário limpo com validação visual

---

## 📱 PÁGINA 6: RELATÓRIOS (`/reports`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│                      📊 RELATÓRIOS                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │📋 TOTAL │ │⏱️ TEMPO │ │👨‍🔧 EQUIPE│ │📈 PRODUT│             │
│ │   0     │ │  0h     │ │   8     │ │  0%     │             │
│ │Relatórios│ │Médio OS │ │Membros  │ │Mensal   │             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
├─────────────────────────────────────────────────────────────┤
│ 📊 Filtros:  [🗓️ Jan-Dez 2025] [⚙️ Equipamentos] [👥 Equipe]│
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────────────────────┐   │
│ │📊 PRODUTIVIDADE  │ │     📈 TENDÊNCIA DE CONCLUSÃO    │   │
│ │   POR TÉCNICO    │ │                                  │   │
│ │                  │ │       [GRÁFICO DE ÁREA]          │   │
│ │ João: ████ 85%   │ │                                  │   │
│ │ Maria:███  75%   │ │   📊 120% meta alcançada         │   │
│ │ Pedro:██   60%   │ │                                  │   │
│ └──────────────────┘ └──────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────────────────────┐   │
│ │🎯 DISTRIBUIÇÃO   │ │        📋 EXPORTAR               │   │
│ │POR PRIORIDADE    │ │                                  │   │
│ │                  │ │  [📄 PDF]  [📊 EXCEL]  [📋 CSV] │   │
│ │[GRÁFICO DONUT]   │ │                                  │   │
│ │🔴 Alta: 30%      │ │  ✅ Incluir gráficos             │   │
│ │🟡 Média: 45%     │ │  ✅ Incluir dados detalhados     │   │
│ │🟢 Baixa: 25%     │ │  ✅ Incluir período selecionado  │   │
│ └──────────────────┘ └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **KPIs**: 4 cards superiores com métricas principais
- **Filtros**: Linha de filtros com dropdowns estilizados
- **Gráficos**: Múltiplos tipos (barras, área, donut)
- **Exportação**: Botões para diferentes formatos
- **Cores**: Sistema consistente (verde=sucesso, amarelo=atenção, vermelho=urgente)

---

## 📱 PÁGINA 7: CONFIGURAÇÕES DO SISTEMA (`/system-config`)

### 🖼️ LAYOUT VISUAL:
```
┌─────────────────────────────────────────────────────────────┐
│                    ⚙️ CONFIGURAÇÕES DO SISTEMA              │
├─────────────────────────────────────────────────────────────┤
│ ┌─GERAL─┐ ┌─NOTIF.─┐ ┌─INTEGR.─┐ ┌─BACKUP─┐ ┌─USUÁRIOS─┐  │ ← Abas
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏢 INFORMAÇÕES DA EMPRESA                               │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Nome da Empresa                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ MAFFENG Engenharia                                  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ CNPJ                                                    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 12.345.678/0001-90                                  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🕒 CONFIGURAÇÕES TEMPORAIS                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Fuso Horário: [America/Sao_Paulo          ⌄]           │ │
│ │ Formato Data: [DD/MM/YYYY                 ⌄]           │ │
│ │ Primeiro dia semana: [Segunda-feira       ⌄]           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ ÁREA DE PERIGO                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Limpar todos os dados do sistema                        │ │
│ │ ⚠️ Esta ação não pode ser desfeita!                     │ │
│ │                                    [🗑️ ZERAR DADOS]    │ │ ← Botão vermelho
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                         [Cancelar][SALVAR] │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 ELEMENTOS VISUAIS:
- **Abas**: Sistema de navegação horizontal
- **Seções**: Cards agrupados por categoria
- **Campos**: Inputs com labels claros
- **Área de Perigo**: Background vermelho claro, botão vermelho
- **Dropdowns**: Estilizados com setas

---

## 📱 PÁGINA 8: AUTENTICAÇÃO (Landing/Login/Register)

### 🖼️ LAYOUT LANDING (`/`):
```
┌─────────────────────────────────────────────────────────────┐
│ [LOGO MAFFENG]                      [ENTRAR] [REGISTRAR]   │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              🏢 SISTEMA MAFFENG                             │
│         Sistema de Gerenciamento de Manutenção             │
│                                                             │
│        ✅ Controle de Ordens de Serviço                     │
│        ✅ Manutenção Preventiva                             │
│        ✅ Gestão de Equipe Técnica                          │
│        ✅ Relatórios Avançados                              │
│                                                             │
│              [🚀 COMEÇAR AGORA]                            │ ← CTA
│                                                             │
│    ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│    │   📊    │ │   🔧    │ │   👥    │                     │
│    │Dashboard│ │Manutenç.│ │ Equipe  │                     │
│    │Completo │ │Intelignt│ │Integrada│                     │
│    └─────────┘ └─────────┘ └─────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### 🖼️ LAYOUT LOGIN (`/login`):
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [LOGO MAFFENG]                           │
│                  Sistema de Manutenção                      │
│                                                             │
│            ┌─────────────────────────────────────┐         │
│            │           🔐 ENTRAR                 │         │
│            ├─────────────────────────────────────┤         │
│            │ Email                               │         │
│            │ ┌─────────────────────────────────┐ │         │
│            │ │                                 │ │         │
│            │ └─────────────────────────────────┘ │         │
│            │                                     │         │
│            │ Senha                               │         │
│            │ ┌─────────────────────────────────┐ │         │
│            │ │                            👁   │ │         │
│            │ └─────────────────────────────────┘ │         │
│            │                                     │         │
│            │ ✅ Lembrar-me                       │         │
│            │                                     │         │
│            │          [ENTRAR]                   │         │ ← Botão azul
│            │                                     │         │
│            │      Esqueceu a senha?              │         │
│            │   Não tem conta? Registre-se        │         │
│            └─────────────────────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENTES DE UI REUTILIZÁVEIS

### 🔳 BUTTONS:
```
[PRIMARY]     [SECONDARY]    [OUTLINE]      [DESTRUCTIVE]
Azul sólido   Cinza sólido   Borda azul     Vermelho sólido
Texto branco  Texto branco   Texto azul     Texto branco
```

### 🏷️ BADGES:
```
🟢 SUCCESS    🟡 WARNING     🔴 ERROR       🔵 INFO
Verde         Amarelo        Vermelho       Azul
```

### 📊 CHARTS:
```
PIZZA:        LINHA:         BARRA:         ÁREA:
━━━━━━●       ╱╲             ▄▄             ╱▀▀▀╲
●     ●       ╱  ╲           ▄▄▄▄           ╱     ╲
●━━━━━●       ╱    ╲         ▄▄▄▄▄▄         ╱       ╲
```

### 🃏 CARDS:
```
┌─────────────────────────────┐
│ TÍTULO                    ⚙ │ ← Header com ações
├─────────────────────────────┤
│                             │
│         CONTEÚDO            │ ← Body
│                             │
├─────────────────────────────┤
│ Footer / Actions            │ ← Footer (opcional)
└─────────────────────────────┘
```

---

## 📱 RESPONSIVIDADE

### 📱 MOBILE (< 768px):
- Sidebar collapse para hamburger menu
- Cards em coluna única
- Tabelas com scroll horizontal
- Botões full-width

### 💻 TABLET (768px - 1024px):
- Sidebar visível mas estreita
- Cards em grid 2 colunas
- Formulários ajustados

### 🖥️ DESKTOP (> 1024px):
- Layout completo
- Sidebar fixa
- Grid de 4 colunas para cards
- Todos os componentes visíveis

---

## 🎯 ESTADOS DO SISTEMA

### ⏳ LOADING:
```
┌─────────────────────┐
│ ████████░░░░ 67%    │ ← Skeleton loading
│ ████░░░░░░░░        │
│ ██████████░░        │
└─────────────────────┘
```

### 📭 EMPTY STATES:
```
┌─────────────────────┐
│        📄           │
│  Nenhum dado        │ ← Ícone + mensagem
│   encontrado        │   + ação sugerida
│   [ADICIONAR]       │
└─────────────────────┘
```

### ❌ ERROR STATES:
```
┌─────────────────────┐
│        ⚠️           │
│   Erro ao carregar  │ ← Ícone de erro
│     os dados        │   + botão retry
│   [TENTAR NOVAMENTE]│
└─────────────────────┘
```

---

*Esta documentação visual representa fielmente o estado atual do sistema MAFFENG em Janeiro de 2025.*