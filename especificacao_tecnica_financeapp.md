# ESPECIFICAÇÃO TÉCNICA COMPLETA — FinanceApp

## Aplicativo de Gestão Financeira Pessoal — Documento de Especificação e Plano de Desenvolvimento v1.0

---

# SUMÁRIO

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Funcionalidades Principais](#2-funcionalidades-principais)
3. [Perfis e Níveis de Acesso de Usuários](#3-perfis-e-níveis-de-acesso-de-usuários)
4. [Regras de Liberação de Módulos por Assinatura](#4-regras-de-liberação-de-módulos-por-assinatura)
5. [Dashboard do Usuário Master](#5-dashboard-do-usuário-master)
6. [Sistema de Backups e Restauração](#6-sistema-de-backups-e-restauração)
7. [Integração com Pagamento via Asaas](#7-integração-com-pagamento-via-asaas)
8. [Estrutura Técnica para Aplicação em Hospedagem](#8-estrutura-técnica-para-aplicação-em-hospedagem)
9. [Requisitos para Testes](#9-requisitos-para-testes)
10. [Requisitos de Interface, Usabilidade e Experiência do Usuário](#10-requisitos-de-interface-usabilidade-e-experiência-do-usuário)
11. [Requisitos Adicionais](#11-requisitos-adicionais)

---

# 1. VISÃO GERAL DO PRODUTO

## 1.1 Proposta de Valor

O **FinanceApp** é um aplicativo de gestão financeira pessoal voltado para pessoas físicas e pequenas famílias brasileiras. O app permite controle completo de despesas, receitas, contas bancárias, cartões de crédito, orçamentos, metas financeiras e relatórios detalhados — com a diferencial de oferecer um modelo freemium estruturado, onde funcionalidades são desbloqueadas conforme o plano de assinatura, e um dashboard de gerenciamento para o usuário master que controla a conta familiar.

## 1.2 Problema que Resolve

- Falta de visibilidade sobre para onde o dinheiro vai mensalmente.
- Dificuldade em planejar orçamentos e acompanhar metas financeiras.
- Gestão fragmentada entre planilhas, cadernos e múltiplos apps.
- Ausência de um app brasileiro que combine controle financeiro com gestão familiar por assinatura de forma acessível.
- Falta de backup seguro e restauração de dados financeiros.

## 1.3 Público-Alvo

| Segmento | Descrição |
|----------|-----------|
| **Primário** | Pessoas físicas (18-45 anos) com renda mensal que desejam controle financeiro pessoal |
| **Secundário** | Pequenas famílias (2-5 membros) que compartilham finanças domésticas |
| **Terciário** | Pequenos empreendedores que precisam de controle simples de fluxo de caixa pessoal |

## 1.4 Escopo do MVP (Versão 1)

### Funcionalidades do MVP
- Cadastro e autenticação de usuários (e-mail/senha, Google OAuth)
- Controle de despesas e receitas com categorização
- Gestão de contas (carteiras, contas bancárias manuais)
- Gestão de cartões de crédito e faturas
- Planejamento de orçamento por categoria
- Metas financeiras
- Relatórios básicos (fluxo de caixa, despesas por categoria)
- Dashboard do usuário master
- Sistema de backups (manual + automático para PRO)
- Integração com Asaas para assinaturas (Free/Premium/PRO)
- Design responsivo (web + mobile via PWA)

### Funcionalidades para Versões Futuras
- Sincronização bancária via Open Banking/APIs de terceiros
- Assistente financeiro com IA (análise de gastos, sugestões)
- Investimentos e patrimônio completo
- Contas compartilhadas entre famílias com sync real-time
- Exportação para declaração de IR
- Gamificação (conquistas, rankings)
- App nativo mobile (React Native)
- Integração com Pix e boletos

## 1.5 Diferenciais Competitivos

| Diferencial | FinanceApp | Mobills | Outros Conc. |
|-------------|-----------|---------|--------------|
| Dashboard de usuário master | Sim | Não | Não |
| Módulos liberados por assinatura | Sim | Parcial | Parcial |
| Sistema de backup/restore completo | Sim | Não | Não |
| Gestão familiar multiusuário | Sim | Sim | Limitado |
| Pagamento integrado (Asaas) | Sim | Sim | Variavel |
| PWA responsivo (mobile + desktop) | Sim | Nativo | Nativo |
| Preço BRL com pagamento local | Sim | Sim | Variavel |
| Backup criptografado exportavel | Sim | Não | Não |

---

# 2. FUNCIONALIDADES PRINCIPAIS

## 2.1 Controle de Despesas e Receitas

### Comportamento Esperado
O usuario pode registrar transacoes de despesa (saida) e receita (entrada) com data, valor, categoria, descricao, conta de origem/destino e, no caso de despesas com cartao, vinculacao ao cartao de credito.

### Entradas
- **Tipo**: Despesa | Receita | Transferencia entre contas
- **Valor**: decimal (BRL), obrigatorio, positivo
- **Data**: date, obrigatoria, nao pode ser futura (exceto agendadas)
- **Categoria**: selecao de lista, obrigatoria
- **Descricao**: texto livre, opcional (max. 255 caracteres)
- **Conta**: selecao de conta vinculada, obrigatoria
- **Cartao**: selecao de cartao (somente para despesas), opcional
- **Parcelado**: checkbox + numero de parcelas (2-48)
- **Recorrente**: checkbox + periodicidade (semanal, quinzenal, mensal, anual)
- **Anexo**: upload de foto/comprovante (max. 5MB, JPG/PNG/PDF)

### Saidas
- Transacao criada com status confirmada
- Saldo da conta atualizado automaticamente
- Se parcelada, cria N transacoes futuras com status agendada
- Se recorrente, cria regra de recorrencia

### Regras de Negocio
- Valor nao pode ser zero ou negativo
- Data nao pode ser superior a 1 dia a menos no futuro (agendamentos limitados a 12 meses)
- Ao excluir uma despesa parcelada, todas as parcelas futuras sao canceladas
- Transferencia entre contas gera 2 registros (saida em uma, entrada em outra)
- Categorias do sistema nao podem ser excluidas; categorias customizadas sim
- Usuario Free: maximo 50 transacoes/mes; Premium/PRO: ilimitado

## 2.2 Gestao de Contas e Saldos

### Comportamento Esperado
O usuario pode criar multiplas contas (carteira fisica, conta bancaria manual, poupanca) e acompanhar o saldo consolidado.

### Entradas
- **Nome**: texto, obrigatorio (max. 50 caracteres)
- **Tipo**: Carteira | Conta Corrente | Poupanca | Investimento | Outro
- **Saldo Inicial**: decimal, obrigatorio
- **Moeda**: BRL (fixo na v1)
- **Icone/Cores**: selecao visual
- **Conta Principal**: toggle (apenas uma por vez)

### Saidas
- Conta criada com saldo igual ao saldo inicial
- Saldo atualizado a cada transacao vinculada
- Dashboard mostra saldo consolidado de todas as contas

### Regras de Negocio
- Usuario Free: maximo 3 contas; Premium: 10; PRO: ilimitado
- Exclusao de conta so e possivel se nao houver transacoes vinculadas (ou mover transacoes antes)
- Conta principal nao pode ser excluida
- Saldo calculado = saldo inicial + receitas - despesas - transferencias enviadas + transferencias recebidas

## 2.3 Gestao de Cartoes de Credito e Faturas

### Comportamento Esperado
O usuario pode cadastrar cartoes de credito, registrar despesas vinculadas ao cartao e acompanhar faturas por mes de referencia.

### Entradas
- **Nome do Cartao**: texto, obrigatorio
- **Bandeira**: Visa | Mastercard | Elo | Amex | Outro
- **Limite Total**: decimal, obrigatorio
- **Dia de Fechamento**: inteiro (1-31)
- **Dia de Vencimento**: inteiro (1-31)
- **Conta vinculada**: selecao de conta para pagamento da fatura

### Saidas
- Cartao cadastrado
- Despesas vinculadas ao cartao aparecem na fatura do mes correspondente
- Fatura gerada automaticamente por mes de referencia
- Dashboard mostra total faturado e disponivel

### Regras de Negocio
- Usuario Free: maximo 2 cartoes; Premium: 5; PRO: ilimitado
- Fatura e calculada: soma das despesas entre fechamento do mes anterior e fechamento do mes atual
- Pagamento de fatura gera uma despesa vinculada a conta bancaria
- Parcelas de despesas no cartao sao alocadas na fatura do mes da parcela, nao da compra
- Limite disponivel = limite total - soma das despesas na fatura atual (nao pago)

## 2.4 Planejamento de Orcamento por Categoria

### Comportamento Esperado
O usuario define um limite mensal por categoria de despesa e acompanha o consumo em tempo real.

### Entradas
- **Categoria**: selecao, obrigatoria
- **Valor Limite mensal**: decimal, obrigatorio
- **Mes de Referencia**: auto (mes atual) ou manual

### Saidas
- Orcamento definido por categoria
- Dashboard mostra barra de progresso (gasto / limite)
- Alerta quando atingir 80% e 100% do limite

### Regras de Negocio
- Usuario Free: maximo 3 orcamentos; Premium/PRO: ilimitado
- Orcamentos sao por mes; ao mudar de mes, zera automaticamente (pode copiar do mes anterior)
- Se ultrapassar o limite, app exibe alerta mas nao impede registro
- Categorias sem orcamento definido aparecem como sem limite

## 2.5 Metas Financeiras

### Comportamento Esperado
O usuario cria metas (ex.: Reserva de emergencia, Viagem) com valor alvo e prazo, e acompanha o progresso.

### Entradas
- **Nome**: texto, obrigatorio
- **Valor Alvo**: decimal, obrigatorio
- **Data Alvo**: date, obrigatoria
- **Conta vinculada**: selecao (onde o dinheiro esta acumulado)
- **Icone/Cores**: selecao visual

### Saidas
- Meta criada com progresso calculado automaticamente
- Dashboard mostra barra de progresso e previsao de conclusao
- Notificacao quando meta atingida

### Regras de Negocio
- Usuario Free: 1 meta ativa; Premium: 5; PRO: ilimitado
- Progresso = soma de depositos na conta vinculada (pode ser manual ou automatico)
- Meta pode ser pausada, retomada ou cancelada
- Ao atingir 100%, app emite congratulacoes e sugere nova meta

## 2.6 Relatorios e Graficos

### Comportamento Esperado
Dashboard com graficos interativos e relatorios filtraveis por periodo, categoria, conta e cartao.

### Tipos de Relatorio

| Relatorio | Descricao | Free | Premium | PRO |
|-----------|-----------|------|---------|-----|
| Fluxo de Caixa | Receitas vs Despesas por mes | Sim | Sim | Sim |
| Despesas por Categoria | Pizza/barras com proporcao | Sim | Sim | Sim |
| Evolucao de Patrimonio | Linha temporal do saldo total | Nao | Sim | Sim |
| Comparativo Mensal | Mes a mes | Nao | Sim | Sim |
| Despesas por Cartao | Fatura por cartao | Nao | Sim | Sim |
| Projecao de Saldo | IA sugere projecao | Nao | Nao | Sim |
| Relatorio Personalizado | Filtros avancados, export PDF | Nao | Nao | Sim |

### Entradas
- Periodo (data inicio e fim)
- Filtros: categoria, conta, cartao, tipo
- Formato de saida: tela, PDF, CSV

### Regras de Negocio
- Periodo padrao: mes atual
- Dados sempre em tempo real (calculados on-the-fly)
- Exportacao PDF/CSV: Premium+ para relatorios simples; PRO para todos

## 2.7 Lembretes e Notificacoes

### Comportamento Esperado
Notificacoes para contas a pagar, faturas vencendo, orcamento estourado e metas.

### Tipos

| Notificacao | Trigger | Canal |
|-------------|---------|-------|
| Conta a pagar vencendo | 3 dias antes do vencimento | Push + In-App |
| Fatura proxima | 5 dias antes do vencimento | Push + In-App |
| Orcamento estourado | Gasto > 80% do limite | In-App |
| Meta atingida | Progresso = 100% | In-App + Push |
| Backup concluido | Backup automatico finalizado | In-App |
| Pagamento falhou | Webhook Asaas falha | In-App + E-mail |

### Regras de Negocio
- Usuario pode desativar notificacoes por tipo
- Push notifications: Premium+ (requer service worker no PWA)
- E-mails transacionais: todos os planos
- Frequencia maxima de push: 1 por tipo por dia (evitar spam)

---

# 3. PERFIS E NIVEIS DE ACESSO DE USUARIOS

## 3.1 Definicao dos Papeis

| Papel | Descricao | Quantidade por Workspace |
|-------|-----------|--------------------------|
| **Master** | Dono da conta principal. Controle total sobre workspace, usuarios, assinatura e dados. | Exatamente 1 |
| **Administrador** | Usuario com permissoes amplas (gerenciar membros, relatorios), mas sem acesso a assinatura. | 0 ou mais |
| **Comum (Membro)** | Usuario que registra e visualiza suas proprias transacoes dentro do workspace. | 0 ou mais |

## 3.2 Matriz de Permissoes por Papel e Modulo

| Modulo / Acao | Master | Administrador | Comum |
|---------------|--------|---------------|-------|
| **AUTH** | | | |
| Login/Logout | Sim | Sim | Sim |
| Alterar propria senha | Sim | Sim | Sim |
| Recuperar senha | Sim | Sim | Sim |
| **USERS** | | | |
| Convidar usuario | Sim | Sim | Nao |
| Listar usuarios do workspace | Sim | Sim | Nao |
| Alterar papel de usuario | Sim | Sim | Nao |
| Ativar/Desativar usuario | Sim | Sim | Nao |
| Remover usuario do workspace | Sim | Nao | Nao |
| Redefinir senha de outro usuario | Sim | Nao | Nao |
| Visualizar atividade de outros | Sim | Sim | Nao |
| **ACCOUNTS** | | | |
| Criar conta | Sim | Sim | Sim (proprias) |
| Editar conta | Sim (todas) | Sim (todas) | Sim (proprias) |
| Excluir conta | Sim (todas) | Sim (todas) | Sim (proprias) |
| Visualizar saldos | Sim (todos) | Sim (todos) | Sim (proprios) |
| **TRANSACTIONS** | | | |
| Criar transacao | Sim | Sim | Sim (proprias) |
| Editar transacao | Sim (todas) | Sim (todas) | Sim (proprias) |
| Excluir transacao | Sim (todas) | Sim (todas) | Sim (proprias) |
| Visualizar transacoes | Sim (todas) | Sim (todas) | Sim (proprias) |
| **CATEGORIES** | | | |
| Criar categoria customizada | Sim | Sim | Sim |
| Editar categoria customizada | Sim (todas) | Sim (todas) | Sim (proprias) |
| Excluir categoria customizada | Sim (todas) | Sim (todas) | Sim (proprias) |
| Visualizar categorias padrao | Sim | Sim | Sim |
| **CARDS** | | | |
| Criar cartao | Sim | Sim | Sim (proprios) |
| Editar cartao | Sim (todos) | Sim (todos) | Sim (proprios) |
| Excluir cartao | Sim (todos) | Sim (todos) | Sim (proprios) |
| Visualizar faturas | Sim (todas) | Sim (todas) | Sim (proprias) |
| **BUDGETS** | | | |
| Criar orcamento | Sim | Sim | Sim |
| Editar orcamento | Sim (todos) | Sim (todos) | Sim (proprios) |
| Excluir orcamento | Sim (todos) | Sim (todos) | Sim (proprios) |
| Visualizar progresso | Sim (todos) | Sim (todos) | Sim (proprios) |
| **GOALS** | | | |
| Criar meta | Sim | Sim | Sim |
| Editar meta | Sim (todas) | Sim (todas) | Sim (proprias) |
| Excluir meta | Sim (todas) | Sim (todas) | Sim (proprias) |
| **REPORTS** | | | |
| Relatorios basicos | Sim | Sim | Sim (proprios) |
| Relatorios avancados | Sim | Sim | Nao (requer Premium) |
| Exportar PDF/CSV | Sim | Sim | Nao (requer Premium) |
| **BACKUPS** | | | |
| Criar backup manual | Sim | Nao | Nao |
| Baixar backup | Sim | Nao | Nao |
| Restaurar backup | Sim | Nao | Nao |
| Ver historico de backups | Sim | Nao | Nao |
| **SUBSCRIPTIONS** | | | |
| Visualizar plano atual | Sim | Nao | Nao |
| Alterar plano | Sim | Nao | Nao |
| Cancelar assinatura | Sim | Nao | Nao |
| Gerenciar pagamento | Sim | Nao | Nao |
| **MASTER DASHBOARD** | | | |
| Acessar dashboard master | Sim | Nao | Nao |
| Metricas agregadas | Sim | Nao | Nao |
| Gerenciar workspace | Sim | Nao | Nao |

## 3.3 Modelo de Relacionamento

`
Workspace (1) ------- (1) Master
    |
    +--- (N) Administradores
    +--- (N) Comuns
    |
    +--- (N) Contas
    +--- (N) Transacoes
    +--- (N) Categorias
    +--- (N) Cartoes
    +--- (N) Orcamentos
    +--- (N) Metas
    +--- (N) Backups
    |
    +--- (1) Assinatura
`

- **Um workspace** e criado pelo Master no registro.
- **Um Master** pode convidar usuarios (administradores e comuns).
- **Cada usuario** tem seu proprio conjunto de dados (contas, transacoes, etc.) dentro do workspace.
- **Transacoes** sao sempre vinculadas ao usuario que as criou.
- **Master e Administradores** podem visualizar dados agregados, mas nao o conteudo individual de transacoes de outros (a menos que seja conta familiar compartilhada).

---

# 4. REGRAS DE LIBERACAO DE MODULOS POR ASSINATURA

## 4.1 Planos

| Caracteristica | Free | Premium (R$ 14,90/mes ou R$ 149,90/ano) | PRO (R$ 29,90/mes ou R$ 299,90/ano) |
|----------------|------|----------------------------------------|-------------------------------------|
| **Transacoes** | 50/mes | Ilimitado | Ilimitado |
| **Contas** | 3 | 10 | Ilimitado |
| **Cartoes de Credito** | 2 | 5 | Ilimitado |
| **Orcamentos** | 3 | Ilimitado | Ilimitado |
| **Metas** | 1 | 5 | Ilimitado |
| **Categorias Customizadas** | 5 | Ilimitado | Ilimitado |
| **Relatorios Basicos** | Sim | Sim | Sim |
| **Relatorios Avancados** | Nao | Sim | Sim |
| **Exportacao PDF/CSV** | Nao | Sim | Sim |
| **Evolucao de Patrimonio** | Nao | Sim | Sim |
| **Comparativo Mensal** | Nao | Sim | Sim |
| **Dashboard Master** | Basico | Completo | Completo |
| **Backup Manual** | Nao | Sim | Sim |
| **Backup Automatico** | Nao | Nao | Sim |
| **Restauracao de Backup** | Nao | Sim | Sim |
| **Push Notifications** | Nao | Sim | Sim |
| **Suporte** | Comunidade | E-mail | Prioritario |
| **Membros no Workspace** | 1 | 3 | Ilimitado |
| **Anexos em Transacoes** | Nao | Sim | Sim |

## 4.2 Matriz de Recursos Detalhada

| Modulo / Recurso | Free | Premium | PRO |
|------------------|------|---------|-----|
| Autenticacao (e-mail/senha) | Sim | Sim | Sim |
| Google OAuth | Sim | Sim | Sim |
| Controle de despesas/receitas | Sim (limite) | Sim | Sim |
| Categorias padrao | Sim | Sim | Sim |
| Categorias customizadas | 5 | Ilimitado | Ilimitado |
| Contas manuais | 3 | 10 | Ilimitado |
| Cartoes de credito | 2 | 5 | Ilimitado |
| Faturas | Sim | Sim | Sim |
| Orcamentos | 3 | Ilimitado | Ilimitado |
| Metas financeiras | 1 | 5 | Ilimitado |
| Relatorios basicos | Sim | Sim | Sim |
| Relatorios avancados | Nao | Sim | Sim |
| Exportacao (PDF/CSV) | Nao | Sim | Sim |
| Evolucao de patrimonio | Nao | Sim | Sim |
| Comparativo mensal | Nao | Sim | Sim |
| Despesas por cartao | Nao | Sim | Sim |
| Projecao de saldo (IA) | Nao | Nao | Sim |
| Relatorio personalizado | Nao | Nao | Sim |
| Backup manual | Nao | Sim | Sim |
| Backup automatico | Nao | Nao | Sim |
| Restauracao de backup | Nao | Sim | Sim |
| Backup criptografado | Nao | Sim | Sim |
| Lembretes in-app | Sim | Sim | Sim |
| Push notifications | Nao | Sim | Sim |
| Notificacoes por e-mail | Sim | Sim | Sim |
| Dashboard master basico | Sim | Sim | Sim |
| Dashboard master completo | Nao | Sim | Sim |
| Metricas agregadas | Nao | Sim | Sim |
| Gestao de membros | 1 | 3 | Ilimitado |
| Suporte | Comunidade | E-mail | Prioritario |
| Anexos/comprovantes | Nao | Sim | Sim |
| Transferencias entre contas | Sim | Sim | Sim |
| Transacoes recorrentes | Sim | Sim | Sim |
| Transacoes parceladas | Sim | Sim | Sim |

## 4.3 Comportamento ao Acessar Modulo Bloqueado

Quando o usuario tenta acessar um recurso bloqueado pelo seu plano:

1. **Card Visual**: O modulo aparece na interface com icone de cadeado e tag Premium ou PRO
2. **Clique no Modulo**: Exibe modal explicativo:
   - Titulo: Recurso indisponivel no seu plano
   - Descricao do recurso e beneficios
   - Comparativo: No plano Premium, voce teria acesso a...
   - Botao: Fazer upgrade -> redireciona para tela de assinatura
   - Link secundario: Mais tarde -> fecha o modal
3. **Sem Interrupcao**: O fluxo do usuario nao e interrompidos bruscamente; o modal e informativo, nao impeditivo
4. **Upsell Sutil**: Na sidebar e no dashboard, badges indicam recursos disponiveis em planos superiores

## 4.4 Comportamento no Downgrade

Quando o usuario muda de plano superior para inferior:

1. **Dados preservados**: Todos os dados (transacoes, categorias, contas, metas) sao mantidos intactos
2. **Recursos desativados**: Funcionalidades exclusivas do plano anterior ficam somente leitura (visualizacao sem edicao)
3. **Bloqueio de criacao**: Nao e possivel criar novos itens que excedam o limite do novo plano
4. **Mensagem informativa**: Alguns dados estao somente leitura. Faca upgrade para editar novamente.
5. **Prazo de grace period**: 30 dias para reativar o plano anterior e manter acesso total
6. **Apos grace period**: Dados excedentes ficam arquivados (nao deletados) e acessiveis apenas com upgrade

## 4.5 Comportamento no Cancelamento

1. **Confirmacao**: Modal com resumo: Ao cancelar, voce perdera acesso a [recursos]. Seus dados serao mantidos por 90 dias.
2. **Periodo de retencao**: 90 dias apos cancelamento, dados sao mantidos e acessiveis (somente leitura)
3. **Apos 90 dias**: Dados sao anonimizados e arquivados (podem ser restaurados com backup)
4. **Reativacao**: Pode reativar a qualquer momento nos 90 dias; dados sao restaurados integralmente
---

# 5. DASHBOARD DO USUARIO MASTER

## 5.1 Visao Geral do Painel

O dashboard master e acessivel apenas ao usuario com papel Master e oferece controle total sobre o workspace.

### Layout

`
+-----------------------------------------------------+
|  HEADER: Logo | Workspace Name | Avatar | Notificacoes |
+----------+------------------------------------------+
|          |                                          |
|  SIDEBAR |         CONTEUDO PRINCIPAL              |
|          |                                          |
|  Dashboard                                                |
|  Usuarios                                                 |
|  Assinatura                                               |
|  Backups                                                  |
|  Metricas                                                 |
|  Configuracoes                                            |
|          |                                          |
+----------+------------------------------------------+
|  FOOTER                                                 |
+-----------------------------------------------------+
`

## 5.2 Funcionalidades do Dashboard

### 5.2.1 Visao Geral (Home)
- **Card: Total de Usuarios** - quantitativo de membros ativos/inativos
- **Card: Plano Ativo** - nome do plano, data de vencimento, status
- **Card: Uso de Modulos** - barras de progresso de cada modulo
- **Card: Ultimo Backup** - data/hora do ultimo backup e status
- **Grafico: Atividade Recente** - timeline de acoes dos membros (ultimos 30 dias)
- **Alertas**: Pagamentos pendentes, backups falhos, membros inativos

### 5.2.2 Gerenciamento de Usuarios
- **Listar Usuarios**: Tabela com nome, e-mail, papel, status, data de entrada, ultima atividade
- **Acoes por Usuario**: Ativar/Desativar, Alterar papel, Redefinir senha, Visualizar atividade, Remover do workspace
- **Convidar Usuario**: Modal com e-mail, papel e mensagem personalizada
- **Filtros**: Por papel, status, data de entrada

### 5.2.3 Gerenciamento de Assinatura
- **Plano Atual**: Nome, valor, data de cobranca, metodo de pagamento
- **Historico de Cobrancas**: Tabela com data, valor, status
- **Acoes**: Upgrade, downgrade, cancelar, atualizar metodo de pagamento

### 5.2.4 Metricas Agregadas do Workspace

| Metrica | Descricao |
|---------|-----------|
| Total de usuarios | Quantidade total e ativos |
| Transacoes este mes | Soma de todas as transacoes do workspace |
| Volume financeiro | Total de receitas e despesas do workspace |
| Uso por modulo | Percentual de utilizacao de cada funcionalidade |
| Plano mais usado | Distribuicao de planos entre membros |
| Backups realizados | Quantidade e ultimo backup |
### 5.2.5 Hierarquia de Navegacao

Master Dashboard
  Visao Geral
    Metricas do Workspace
    Alertas
    Atividade Recente
  Usuarios
    Lista de Usuarios
      Detalhes do Usuario
        Ativar/Desativar
        Alterar Papel
        Redefinir Senha
        Log de Atividade
      Convidar Usuario
    Permissoes
  Assinatura
    Plano Atual
    Upgrade/Downgrade
    Historico de Cobrancas
    Metodo de Pagamento
  Backups
    Criar Backup Manual
    Historico de Backups
    Restaurar Backup
    Configuracoes de Backup
  Metricas
    Graficos de Uso
    Evolucao Temporal
    Exportar Relatorio
  Configuracoes
    Dados do Workspace
    Preferencias de Notificacao
    Seguranca

---

# 6. SISTEMA DE BACKUPS E RESTAURACAO

## 6.1 Tipos de Backup

| Tipo | Disponivel em | Frequencia | Conteudo |
|------|---------------|------------|----------|
| **Automatico** | PRO | Diario (3h da manha) | Todos os dados do workspace |
| **Manual** | Premium+ | Sob demanda | Todos os dados do workspace |
| **Antes de Restore** | Todos | Automatico (pre-restore) | Snapshot dos dados atuais |

## 6.2 Formato do Backup

O backup e exportado como arquivo **JSON criptografado** com a seguinte estrutura:

```json
{
  "version": "1.0.0",
  "createdAt": "2026-08-17T10:00:00Z",
  "workspaceId": "uuid",
  "masterUserId": "uuid",
  "checksum": "sha256_hash",
  "encryption": "aes-256-gcm",
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "plan": "free|premium|pro"
    },
    "accounts": [],
    "transactions": [],
    "categories": [],
    "cards": [],
    "budgets": [],
    "goals": [],
    "settings": {}
  }
}
```

### Dados Incluidos no Backup
- Dados do usuario (nome, e-mail, configuracoes)
- Todas as contas com saldos
- Todas as transacoes (historico completo)
- Categorias (padrao + customizadas)
- Cartoes de credito
- Orcamentos
- Metas financeiras
- Configuracoes (notificacoes, preferencias)

### Dados Excluidos do Backup
- Senhas (hash)
- Tokens de sessao
- Logs de auditoria
- Dados de outros membros do workspace

## 6.3 Processo de Backup Automatico (PRO)

```
Cron Job (3h da manha) ->
  1. Seleciona workspaces com backup automatico ativo
  2. Para cada workspace:
     a. Coleta todos os dados
     b. Serializa em JSON
     c. Calcula checksum SHA-256
     d. Criptografa com AES-256-GCM (chave derivada do workspace)
     e. Salva no storage (local ou S3-compatible)
     f. Registra metadados no banco
     g. Notifica master via in-app
  3. Limpa backups com mais de 90 dias (mantem 1 por mes)
```

## 6.4 Upload e Restauracao de Backup

### Processo de Upload
1. Usuario seleciona arquivo JSON
2. Sistema valida:
   - Formato do arquivo (deve ser JSON valido)
   - Versao compativel (1.x.x)
   - Checksum integra (recalcula e compara)
   - Chave de descriptografia (usuario fornece senha do backup)
3. Sistema exibe preview dos dados (quantidade de registros por tipo)
4. Usuario confirma restauracao

### Processo de Restauracao

```
1. Criar snapshot dos dados atuais (backup automatico pre-restore)
2. Iniciar transacao no banco
3. Para cada tipo de dado:
   a. Deletar registros atuais do workspace
   b. Inserir registros do backup
4. Atualizar configuracoes
5. Recalcular saldos
6. Commit da transacao
7. Registrar log de auditoria
8. Notificar master
```

### Regras de Restauracao
- **Confirmacao explicita**: Usuario deve digitar RESTAURAR para confirmar
- **Aviso de sobrescrita**: Todos os dados atuais serao substituidos. Um backup automatico sera criado antes da restauracao.
- **Validacao de dados mais recentes**: Se backup for anterior aos dados atuais, exibe aviso: O backup e de [data]. Seus dados atuais sao de [data]. Deseja continuar?
- **Rollback**: Se falha durante a restauracao, todos os dados sao revertidos via transacao do banco

## 6.5 Historico de Versoes

| Campo | Descricao |
|-------|-----------|
| ID | UUID do backup |
| Tipo | Automatico / Manual / Pre-Restore |
| Data/Hora | Timestamp da criacao |
| Tamanho | Tamanho do arquivo em bytes |
| Checksum | SHA-256 do arquivo |
| Status | Concluido / Em andamento / Falhou |
| Criado por | UUID do usuario que gerou |

## 6.6 Criptografia e Protecao

- **Algoritmo**: AES-256-GCM (autenticado)
- **Chave**: Derivada do workspace ID + chave secreta do ambiente (via PBKDF2)
- **Arquivo**: Conteudo dos dados criptografado; metadados em claro
- **Senha do backup**: Opcional; se definida, adiciona camada extra de criptografia
- **Armazenamento**: Storage local (ou S3-compatible com encryption at rest)
- **Transmissao**: Sempre via HTTPS

---

# 7. INTEGRACAO COM PAGAMENTO VIA ASAAS

## 7.1 Visao Geral da Integracao

O Asaas e utilizado para gerenciar assinaturas recorrentes (mensal e anual), cobrancas, webhooks e metodos de pagamento.

## 7.2 Fluxos de Assinatura

### 7.2.1 Criacao de Assinatura

```
Usuario clica Assinar ->
  1. Frontend envia: plano, periodicidade, dados do cliente
  2. Backend cria/busca customer no Asaas (CPF/CNPJ + e-mail)
  3. Backend cria subscription no Asaas:
     - planId: mapeamento interno -> Asaas plan
     - billingType: CREDIT_CARD ou PIX
     - value: valor do plano
     - nextDueDate: data do primeiro vencimento
  4. Backend retorna: checkoutUrl ou dados do cartao
  5. Usuario completa pagamento
  6. Asaas confirma via webhook
  7. Backend atualiza status da assinatura no app
  8. Modulos sao liberados conforme o plano
```

### 7.2.2 Checkout
- **Cartao de Credito**: Formulario seguro (iframe Asaas ou SDK) -> tokenizacao -> envio ao backend
- **PIX**: QR Code gerado pelo Asaas -> exibido ao usuario -> pagamento confirmado via webhook
- **Boleto**: Gerado pelo Asaas -> exibido/baixado pelo usuario -> confirmacao via webhook

### 7.2.3 Webhooks

| Evento | Acao no App |
|--------|-------------|
| PAYMENT_RECEIVED | Ativar/confirmar assinatura; liberar modulos |
| PAYMENT_OVERDUE | Marcar como inadimplente; enviar notificacao; iniciar bloqueio apos 3 dias |
| PAYMENT_FAILED | Notificar master; sugerir retry; bloquear apos 2 falhas consecutivas |
| SUBSCRIPTION_CREATED | Registrar nova assinatura no banco |
| SUBSCRIPTION_UPDATED | Atualizar dados da assinatura |
| SUBSCRIPTION_CANCELLED | Desativar assinatura; iniciar grace period |
| SUBSCRIPTION_REACTIVATED | Reativar assinatura; restaurar acesso |

### 7.2.4 Verificacao de Webhooks
- **Assinatura HTTP**: Validar header asaas-access-token com token armazenado em variavel de ambiente
- **Idempotencia**: Cada evento tem um paymentId ou subscriptionId + event como chave de idempotencia
- **Retry**: Asaas faz retry automaticos; app deve processar idempotentemente
- **Logging**: Todos os webhooks recebidos sao logados (evento, payload, status de processamento)

## 7.3 Mapeamento de Planos

| Plano no App | Plan ID no Asaas | Valor Mensal | Valor Anual |
|--------------|-------------------|-------------|-------------|
| Free | (nenhum) | R$ 0,00 | R$ 0,00 |
| Premium | plan_premium_monthly | R$ 14,90 | R$ 149,90 |
| PRO | plan_pro_monthly | R$ 29,90 | R$ 299,90 |

## 7.4 Tratamento de Falhas

- **Inadimplencia**: Apos 3 dias sem pagamento -> notificacao + bloqueio de modulos pagos
- **Retry automatico**: Asaas tenta cobrar novamente em 1, 3 e 7 dias
- **Cancelamento por inadimplencia**: Apos 10 dias sem sucesso -> assinatura cancelada
- **Dados preservados**: Bloqueio de acesso, nao exclusao de dados

## 7.5 Seguranca

- Chave da API Asaas armazenada em variavel de ambiente (nunca em codigo)
- Webhooks verificados com token de assinatura
- Dados de cartao de credito nunca passam pelo backend do FinanceApp (tokenizacao via Asaas)
- TLS obrigatorio em todas as comunicacoes
- Logs de pagamento nao expoe dados sensiveis do cartao

---

# 8. ESTRUTURA TECNICA PARA APLICACAO EM HOSPEDAGEM

## 8.1 Arquitetura em Camadas

```
+-----------------------------------------------+
|           CAMADA DE APRESENTACAO               |
|   Frontend SPA (React) + PWA                   |
|   Design Responsivo (Mobile + Desktop)         |
+----------------------+------------------------+
                       | HTTP/HTTPS (API REST)
+----------------------v------------------------+
|           CAMADA DE APLICACAO                  |
|   API REST (Node.js / NestJS)                  |
|   Controllers -> Services -> Domain            |
|   Validacao, Autenticacao, Autorizacao         |
+----------------------+------------------------+
                       |
+----------------------v------------------------+
|            CAMADA DE DOMINIO                   |
|   Entidades de Negocio                         |
|   Regras de Negocio Puros                      |
|   Interfaces de Repositorios                   |
+----------------------+------------------------+
                       |
+----------------------v------------------------+
|          CAMADA DE INFRAESTRUTURA              |
|   Banco de Dados (PostgreSQL)                  |
|   ORM (Prisma)                                 |
|   Fila de Jobs (Bull/BullMQ)                   |
|   Storage de Arquivos (local/S3)               |
|   Cache (Redis)                                |
|   Email Service (SMTP/SendGrid)                |
+-----------------------------------------------+
```

## 8.2 Stack Tecnologica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | React 18 + TypeScript + Vite | Ecossistema maduro, performance, tipagem |
| **UI Framework** | Tailwind CSS + shadcn/ui | Design responsivo, componentizacao, leveza |
| **State Management** | Zustand ou TanStack Query | Simplicidade + cache de server state |
| **Backend** | Node.js + NestJS | Arquitetura modular, TypeScript compartilhado, DI |
| **API** | REST + OpenAPI (Swagger) | Simplicidade, documentacao automatica |
| **Banco de Dados** | PostgreSQL 16 | Robustez, JSON support, performance |
| **ORM** | Prisma | Type safety, migracoes, DX excelente |
| **Cache/Sessao** | Redis | Sessoes, rate limiting, filas |
| **Filas** | BullMQ (Redis) | Webhooks Asaas, backups, notificacoes |
| **Agendador** | node-cron (interno ao NestJS) | Backups automaticos, limpeza |
| **Storage** | Local (upload) / S3-compatible | Backups, anexos |
| **Autenticacao** | JWT (access + refresh tokens) | Stateless, escalavel |
| **PWA** | Workbox + Service Worker | Offline basico, push notifications |
| **Testes** | Jest + Supertest | Unit + Integration |
| **CI/CD** | GitHub Actions | Deploy automatizado |
| **Desktop/Mobile** | PWA responsiva (mobile + PC) | Funcional em qualquer dispositivo |

## 8.3 Modelo de Dados (Entidades Principais)

### User (Usuario)
- id (PK, UUID)
- workspaceId (FK)
- name (string)
- email (string, unique per workspace)
- passwordHash (string)
- role (enum: master, admin, common)
- isActive (boolean)
- createdAt, updatedAt

### Workspace
- id (PK, UUID)
- name (string)
- masterUserId (FK)
- plan (enum: free, premium, pro)
- asaasCustomerId (string, nullable)
- createdAt, updatedAt

### Account (Conta)
- id (PK, UUID)
- userId (FK)
- name (string)
- type (enum: wallet, checking, savings, investment, other)
- initialBalance (decimal)
- currentBalance (decimal)
- icon (string)
- color (string)
- isPrimary (boolean)
- createdAt, updatedAt

### Transaction (Transacao)
- id (PK, UUID)
- userId (FK)
- accountId (FK)
- cardId (FK, nullable)
- categoryId (FK)
- type (enum: income, expense, transfer)
- amount (decimal)
- description (string, nullable)
- date (date)
- isRecurring (boolean)
- recurrenceType (enum: weekly, biweekly, monthly, yearly, nullable)
- totalInstallments (int, nullable)
- currentInstallment (int, nullable)
- dueDate (date, nullable)
- isPaid (boolean)
- attachmentUrl (string, nullable)
- createdAt, updatedAt

### Category (Categoria)
- id (PK, UUID)
- userId (FK, nullable - null para categorias do sistema)
- name (string)
- icon (string)
- color (string)
- type (enum: income, expense)
- isDefault (boolean)
- createdAt

### Card (Cartao)
- id (PK, UUID)
- userId (FK)
- name (string)
- brand (enum: visa, mastercard, elo, amex, other)
- limit (decimal)
- closingDay (int)
- dueDay (int)
- accountId (FK)
- createdAt, updatedAt

### Budget (Orcamento)
- id (PK, UUID)
- userId (FK)
- categoryId (FK)
- month (int)
- year (int)
- limitAmount (decimal)
- createdAt, updatedAt

### Goal (Meta)
- id (PK, UUID)
- userId (FK)
- name (string)
- targetAmount (decimal)
- currentAmount (decimal)
- targetDate (date)
- accountId (FK)
- icon (string)
- color (string)
- status (enum: active, paused, completed, cancelled)
- createdAt, updatedAt

### Subscription (Assinatura)
- id (PK, UUID)
- userId (FK)
- asaasId (string)
- plan (enum: free, premium, pro)
- billingType (enum: credit_card, pix, boleto)
- status (enum: active, pending, cancelled, overdue)
- nextDueDate (date)
- value (decimal)
- createdAt, updatedAt

### Backup
- id (PK, UUID)
- workspaceId (FK)
- type (enum: automatic, manual, pre_restore)
- filePath (string)
- fileSize (int)
- checksum (string)
- status (enum: completed, in_progress, failed)
- createdAt
- expiresAt (date, nullable)

### AuditLog
- id (PK, UUID)
- userId (FK)
- action (string)
- entity (string)
- entityId (UUID)
- oldValues (JSON, nullable)
- newValues (JSON, nullable)
- ipAddress (string)
- userAgent (string)
- createdAt

## 8.4 Fluxo de Requisicao Tipica (Criar Transacao)

```
1. FRONTEND (React)
   -> Usuario preenche formulario de transacao
   -> Validations (Zod schema) -> POST /api/transactions
   -> Authorization header (JWT)

2. NGINX/REVERSE PROXY
   -> Rate limiting
   -> SSL termination
   -> Proxy para NestJS (porta 3000)

3. NESTJS - Controller (TransactionsController)
   -> Guard de autenticacao (JWT validation)
   -> Guard de autorizacao (RBAC check)
   -> ValidationPipe (DTO validation)
   -> Chama TransactionsService.create()

4. NESTJS - Service (TransactionsService)
   -> Valida regras de negocio:
     - Limite de transacoes do plano
     - Conta existe e pertence ao usuario
     - Categoria valida
     - Valor positivo
   -> Chama TransactionsRepository.create()

5. NESTJS - Repository (TransactionsRepository)
   -> Prisma ORM -> SQL INSERT
   -> Transacao no banco (BEGIN/COMMIT/ROLLBACK)
   -> Atualiza saldo da conta (UPDATE accounts SET currentBalance)

6. INFRAESTRUTURA
   -> PostgreSQL: INSERT + UPDATE
   -> Redis: Invalida cache de saldos
   -> BullMQ: Envia job de notificacao (se orcamento atingido)

7. RESPOSTA
   -> 201 Created { transaction: {...} }
   -> Frontend atualiza state (TanStack Query invalidation)
   -> Toast de sucesso
```

## 8.5 Servicos Auxiliares

| Servico | Responsabilidade | Implementacao |
|---------|-----------------|---------------|
| **Fila de Webhooks** | Processar webhooks do Asaas de forma assincrona | BullMQ + Redis |
| **Agendador de Backups** | Executar backups automaticos | node-cron dentro do NestJS |
| **Armazenamento de Arquivos** | Backups, anexos, comprovantes | Upload local (v1) ou S3-compatible |
| **Cache** | Saldos, sessoes, rate limiting | Redis |
| **Email Service** | Notificacoes, confirmacoes, lembretes | Nodemailer + SMTP ou SendGrid |
| **Push Notifications** | Notificacoes web/mobile | Web Push API (via service worker) |

## 8.6 Requisitos de Infraestrutura

| Item | Especificacao |
|------|---------------|
| **Dominio** | Registro emRegistro.br + DNS |
| **SSL** | Let's Encrypt (gratuito) via Certbot |
| **Servidor** | VPS (4 vCPU, 8GB RAM, 80GB SSD) ou hospedagem compartilhada Node.js |
| **Banco** | PostgreSQL 16 (local ou managed) |
| **Redis** | Redis 7 (local ou managed) |
| **Node.js** | v20 LTS |
| **Nginx** | Reverse proxy + static files |
| **Variaveis de Ambiente** | DATABASE_URL, REDIS_URL, JWT_SECRET, ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN, STORAGE_PATH, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL |
| **Deploy** | PM2 (process manager) + GitHub Actions (CI/CD) |
| **Escalabilidade Inicial** | Vertical (mais RAM/CPU); horizontal via load balancer quando necessario |

---

# 9. REQUISITOS PARA TESTES

## 9.1 Testes Unitarios

| Modulo | O que testar | Criterios |
|--------|-------------|-----------|
| **Auth** | Hash de senha, validacao JWT, geracao de tokens | 100% cobertura |
| **RBAC** | Verificacao de papeis, permissoes por modulo | 100% cobertura |
| **Transactions** | Calculo de parcelas, validacao de valores, regras de recorrencia | 100% cobertura |
| **Accounts** | Calculo de saldo, validacao de exclusao | 100% cobertura |
| **Cards** | Calculo de fatura, limite disponivel | 100% cobertura |
| **Budgets** | Progresso, alertas, validacao de limite | 100% cobertura |
| **Goals** | Progresso, status, previsao | 100% cobertura |
| **Subscriptions** | Mapeamento de planos, verificacao de acesso | 100% cobertura |
| **Backups** | Serializacao, checksum, validacao de integridade | 100% cobertura |
| **Modules** | Liberacao por plano, bloqueio, downgrade | 100% cobertura |

## 9.2 Testes de Integracao

| Cenario | Descricao |
|---------|-----------|
| **Fluxo completo de registro** | Criar conta -> verificar email -> login -> criar workspace |
| **CRUD de transacao** | Criar -> listar -> editar -> excluir -> verificar saldo |
| **Fluxo de pagamento** | Criar assinatura -> webhook confirmar -> verificar acesso |
| **Fluxo de downgrade** | Assinar Premium -> downgrade -> verificar bloqueio |
| **Webhook do Asaas** | Simular evento -> verificar processamento idempotente |
| **Autenticacao** | Login -> token expired -> refresh -> logout |
| **RBAC** | Usuario comum tenta acessar rota admin -> 403 |
| **Rate limiting** | Enviar 100 req/min -> verificar bloqueio |

## 9.3 Testes de Backup/Restore

| Cenario | Descricao |
|---------|-----------|
| **Backup manual** | Criar backup -> verificar arquivo JSON valido |
| **Backup automatico** | Simular cron -> verificar criacao + upload |
| **Restore valido** | Upload backup -> confirmar -> verificar dados restaurados |
| **Restore com dados anteriores** | Backup antigo -> exibir aviso -> confirmar |
| **Restore com arquivo corrompido** | Upload arquivo invalido -> erro amigavel |
| **Rollback** | Simular falha durante restore -> verificar rollback |
| **Integridade** | Verificar checksum apos restore |
| **Criptografia** | Backup criptografado -> sem chave -> erro |

## 9.4 Testes de Seguranca

| Area | Teste |
|------|-------|
| **Autenticacao** | Brute force (bloqueio apos 5 tentativas), token forge, session fixation |
| **Autorizacao** | Acesso cross-tenant (user A acessa dados de user B), escalonamento de privilegio |
| **Injecao SQL** | Payloads maliciosos em todos os inputs |
| **XSS** | Injecao de scripts em campos de texto |
| **CSRF** | Requisicoes cross-origin sem token |
| **IDOR** | Acessar recursos de outros usuarios via ID manipulado |
| **Vazamento de dados** | Verificar que API nunca retorna dados de outros usuarios |
| **Backup** | Tentar restaurar backup de outro workspace |
| **Rate limiting** | Testar limites de requisicao por IP e por usuario |

## 9.5 Testes de Usabilidade e Responsividade

| Dispositivo | Resolucao | Teste |
|-------------|-----------|-------|
| Desktop Chrome | 1920x1080 | Layout completo, todas as funcionalidades |
| Desktop Firefox | 1920x1080 | Compatibilidade cross-browser |
| Tablet iPad | 768x1024 | Layout adaptativo, touch |
| Mobile Android | 360x800 | PWA, navegacao, formularios |
| Mobile iPhone | 375x667 | PWA, safe areas, teclado |
| Mobile Android Landscape | 360x800 | Orientacao landscape |

## 9.6 Criterios de Aceite por Funcionalidade

### Controle de Transacoes
- Criar despesa com todos os campos obrigatorios -> 201
- Criar receita -> saldo da conta aumenta
- Criar transferencia -> saldas de ambas as contas atualizados
- Parcelar despesa em 3x -> 3 transacoes futuras criadas
- Editar transacao -> saldo recalculado
- Excluir transacao parcelada -> parcelas futuras canceladas
- Tentar criar transacao sem categoria -> 400 com mensagem
- Usuario Free tenta criar 51a transacao -> bloqueio com upsell

### Gestao de Contas
- Criar conta com saldo inicial -> saldo reflete valor
- Criar 4a conta no plano Free -> bloqueio
- Excluir conta sem transacoes -> OK
- Excluir conta com transacoes -> erro com sugestao
- Saldo consolidado = soma de todas as contas

### Cartoes de Credito
- Criar cartao -> aparece na lista
- Registrar despesa no cartao -> aparece na fatura do mes
- Calcular fatura -> soma correta das despesas
- Limite disponivel = limite total - fatura atual

### Orcamentos
- Criar orcamento de R$ 500 para Alimentacao
- Gastar R$ 400 -> barra em 80% + alerta
- Gastar R$ 550 -> barra em 110% + alerta de estouro

### Metas
- Criar meta de R$ 10.000 -> progresso em 0%
- Adicionar R$ 5.000 -> progresso em 50%
- Atingir R$ 10.000 -> notificacao de conclusao

### Backup/Restore
- Criar backup manual -> arquivo JSON valido baixado
- Upload backup valido -> preview dos dados -> confirmar -> dados restaurados
- Upload arquivo invalido -> erro amigavel
- Restore com dados mais recentes -> aviso exibido

### Assinatura
- Assinar Premium via PIX -> QR Code exibido -> pagamento confirmado -> acesso liberado
- Assinar PRO via cartao -> checkout -> confirmacao -> acesso liberado
- Webhook de pagamento recebido -> status atualizado
- Cancelar assinatura -> grace period iniciado
- Downgrade -> dados preservados, modulos bloqueados

---

# 10. REQUISITOS DE INTERFACE, USABILIDADE E EXPERIENCIA DO USUARIO

## 10.1 Design Responsivo

O app deve ser acessivel e funcional em:
- **Desktop**: resolucao minima de 1024x768
- **Tablet**: resolucao minima de 768x1024
- **Mobile**: resolucao minima de 320x568
- **PWA**: instalavel em ambos os ambientes

## 10.2 Padrao Visual

### Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primaria** | #2563EB (azul) | botoes principais, links, acoes |
| **Secundaria** | #10B981 (verde) | receitas, sucesso, positivo |
| **Perigo** | #EF4444 (vermelho) | despesas, erros, exclusao |
| **Aviso** | #F59E0B (amarelo) | alertas, orcamento proximo do limite |
| **Background** | #F8FAFC (cinza claro) | fundo principal |
| **Surface** | #FFFFFF (branco) | cards, modais |
| **Text Primary** | #1E293B (cinza escuro) | texto principal |
| **Text Secondary** | #64748B (cinza medio) | texto secundario, legendas |
| **Border** | #E2E8F0 (cinza borda) | bordas de cards e inputs |

### Dark Mode
- Background: #0F172A
- Surface: #1E293B
- Text Primary: #F8FAFC
- Text Secondary: #94A3B8
- Cores de status mantidas

### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Titulos**: 600-700 weight
- **Corpo**: 400 weight
- **Tamanho base**: 16px

### Espacamento
- **Sistema de 8px**: todos os espacamentos sao multiplos de 8
- **Padding de cards**: 16px-24px
- **Gap entre cards**: 16px
- **Margin de secoes**: 24px-32px

### Componentes
- **Botoes**: Primario (filled), Secundario (outlined), Fantasma (text)
- **Cards**: Bordas arredondadas (8px), sombra sutil
- **Inputs**: Borda 1px, focus ring azul, label flutuante
- **Tabelas**: Zebra striping, responsivas (scroll horizontal no mobile)
- **Graficos**: Biblioteca Recharts ou Chart.js
- **Modais**: Overlay escuro, conteudo centralizado, close no X e ESC
- **Toasts**: Posicao top-right, auto-dismiss 5s

## 10.3 Fluxos de Onboarding

### 1. Tela de Boas-Vindas (App Splash)
- Logo + Controle suas financas
- Botao: Comecar -> Registro
- Botao: Ja tenho conta -> Login

### 2. Registro
- E-mail + Senha + Confirmar Senha
- Ou: Continue com Google
- Validacao de e-mail (link magico)

### 3. Configuracao Inicial
- Passo 1: Qual seu nome? [input]
- Passo 2: Crie sua primeira conta [card com opcoes]
- Passo 3: Adicione sua primeira transacao [form simplificado]
- Passo 4: Escolha seu plano [cards de planos]
- Checkout via Asaas (se Premium/PRO)
- Dashboard

### 4. Escolha de Plano
- Cards comparativos lado a lado
- Free: Comecar gratis
- Premium: Assinar -> Checkout
- PRO: Assinar -> Checkout
- Mudar depois a qualquer momento

## 10.4 Estados de Interface

### Loading
- Skeleton screens (estrutura da tela com animacao shimmer)
- Spinner inline para acoes pontuais (salvar, excluir)
- Progress bar para uploads (backup)

### Vazio
- Ilustracao + texto explicativo + CTA
- Ex: Nenhuma transacao ainda. Comece adicionando sua primeira receita ou despesa.
- Botao: Adicionar transacao

### Erro
- Mensagem amigavel: Algo deu errado. Tente novamente.
- Botao: Tentar novamente
- Para erros de rede: Verifique sua conexao com a internet.

## 10.5 Acessibilidade

- **Contraste**: WCAG AA minimo (4.5:1 para texto normal)
- **Navegacao por teclado**: Todas as funcionalidades acessiveis via Tab/Enter/Esc
- **Rotulos**: Todos os inputs devem ter label associada
- **aria-labels**: Botoes e icones sem texto devem ter aria-label
- **Skip navigation**: Link Pular para conteudo principal
- **Responsividade**: Funcional em 320px (mobile minimo)
- **Fonte**: Tamanho minimo 14px em mobile, 16px em desktop

## 10.6 Microinteracoes e Feedback

| Acao | Feedback |
|------|----------|
| Criar transacao | Toast verde Transacao criada + animacao de card |
| Excluir | Modal de confirmacao -> toast Transacao excluida |
| Salvar | Botao muda para Salvando... -> Salvo (check) |
| Erro | Toast vermelho com mensagem + botao Tentar novamente |
| Sync | Indicador animado no canto |
| Pull to refresh | Animacao de loading no mobile |
| Swipe para excluir | Card desliza, revela vermelho Excluir |
| Progresso de meta | Barra anima ao preencher |
| Notificacao | Slide-in do canto + badge no sino |
| Dark mode toggle | Transicao suave de cores |

---

# 11. REQUISITOS ADICIONAIS

## 11.1 Arquitetura em Camadas (Detalhamento)

### Separacao de Responsabilidades

```
+---------------------------------------------------+
| APRESENTACAO (Frontend)                            |
| - Componentes React                               |
| - Hooks personalizados                             |
| - Services (chamadas API)                         |
| - Stores (estado local)                            |
| - Sem logica de negocio pura                       |
+----------------------+----------------------------+
                       | HTTP/REST
+----------------------v----------------------------+
| APLICACAO (Controllers + Services)                 |
| - Controllers: recebe request, valida, chama svc   |
| - Services: orquestra logica, chama domain + infra |
| - DTOs: formato de entrada/saida                   |
| - Guards: autenticacao, autorizacao                |
| - Pipes: validacao de entrada                      |
+----------------------+----------------------------+
                       |
+----------------------v----------------------------+
| DOMINIO (Entidades + Regras + Interfaces)           |
| - Entidades: User, Account, Transaction, etc.      |
| - Value Objects: Money, DateRange, etc.            |
| - Domain Services: calculos puros                  |
| - Repository Interfaces: IAccountRepo, ITransRepo  |
| - Sem dependencia de infraestrutura!               |
+----------------------+----------------------------+
                       |
+----------------------v----------------------------+
| INFRAESTRUTURA (Implementacoes)                     |
| - PrismaAccountRepository implements IAccountRepo  |
| - BullMQJobQueue implements IJobQueue              |
| - LocalFileStorage implements IFileStorage         |
| - RedisCache implements ICache                     |
| - NodemailerEmailService implements IEmailService  |
+---------------------------------------------------+
```

### Fluxo de uma Requisicao (Criar Transacao)

```
HTTP POST /api/transactions
       |
       v
[AuthGuard] -> Valida JWT -> Decodifica userId
       |
       v
[RBACGuard] -> Verifica se usuario tem permissao transactions:create
       |
       v
[ValidationPipe] -> Valida DTO com class-validator/Zod
       |
       v
[TransactionsController] -> Extrai dados, chama Service
       |
       v
[TransactionsService]
  -> Chama AccountRepository.findById() -> Verifica conta existe
  -> Chama CategoryRepository.findById() -> Verifica categoria
  -> Chama SubscriptionService.checkLimit() -> Verifica limite do plano
  -> Chama DomainService.calculateInstallments() -> Calcula parcelas
  -> Chama TransactionRepository.create() -> Salva no banco
  -> Chama AccountRepository.updateBalance() -> Atualiza saldo
  -> Chama CacheService.invalidate() -> Limpa cache
  -> Chama JobQueue.add('check-budget', {...}) -> Verifica orcamento
       |
       v
[Response] -> 201 Created { transaction: {...} }
```

## 11.2 Organizacao de Modulos

### Estrutura de Pastas (NestJS)

```
src/
+-- modules/
|   +-- auth/
|   |   +-- auth.module.ts
|   |   +-- auth.controller.ts
|   |   +-- auth.service.ts
|   |   +-- strategies/
|   |   |   +-- jwt.strategy.ts
|   |   |   +-- google.strategy.ts
|   |   +-- guards/
|   |   |   +-- jwt-auth.guard.ts
|   |   |   +-- roles.guard.ts
|   |   +-- dto/
|   |   +-- auth.module.ts
|   |
|   +-- users/
|   |   +-- users.module.ts
|   |   +-- users.controller.ts
|   |   +-- users.service.ts
|   |   +-- dto/
|   |   +-- entities/
|   |
|   +-- accounts/
|   |   +-- accounts.module.ts
|   |   +-- accounts.controller.ts
|   |   +-- accounts.service.ts
|   |   +-- dto/
|   |   +-- entities/
|   |
|   +-- transactions/
|   |   +-- transactions.module.ts
|   |   +-- transactions.controller.ts
|   |   +-- transactions.service.ts
|   |   +-- dto/
|   |   +-- entities/
|   |
|   +-- categories/
|   +-- cards/
|   +-- budgets/
|   +-- goals/
|   +-- reports/
|   +-- subscriptions/
|   +-- backups/
|   +-- payments/
|
+-- domain/
|   +-- entities/
|   +-- value-objects/
|   +-- services/
|   +-- interfaces/
|
+-- infrastructure/
|   +-- database/
|   |   +-- prisma/
|   |   |   +-- prisma.service.ts
|   |   |   +-- migrations/
|   |   |   +-- prisma.schema
|   |   +-- repositories/
|   |       +-- prisma-account.repository.ts
|   |       +-- prisma-transaction.repository.ts
|   |       +-- ...
|   +-- cache/
|   |   +-- redis-cache.service.ts
|   +-- queue/
|   |   +-- bullmq-queue.service.ts
|   +-- storage/
|   |   +-- local-file-storage.service.ts
|   +-- email/
|   |   +-- nodemailer-email.service.ts
|   +-- asaas/
|       +-- asaas-payment.service.ts
|
+-- common/
|   +-- decorators/
|   +-- filters/
|   +-- interceptors/
|   +-- pipes/
|   +-- utils/
|
+-- main.ts
```

### Contratos de Interface entre Modulos

```typescript
// Exemplo: TransactionModule nao depende diretamente de AccountModule
// Usa interfaces para desacoplar

// domain/interfaces/account-repository.interface.ts
export interface IAccountRepository {
  findById(id: string, userId: string): Promise<Account | null>;
  updateBalance(id: string, amount: number): Promise<void>;
  countByUser(userId: string): Promise<number>;
}

// domain/interfaces/subscription-service.interface.ts
export interface ISubscriptionService {
  checkTransactionLimit(userId: string): Promise<boolean>;
  getPlanFeatures(userId: string): Promise<PlanFeatures>;
}

// modules/transactions/transactions.module.ts
@Module({
  imports: [
    PrismaModule,
    AccountsModule,
    SubscriptionsModule,
  ],
  providers: [
    TransactionsService,
    { provide: 'ITransactionRepository', useClass: PrismaTransactionRepository },
  ],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
```

## 11.3 Requisitos de Seguranca

### Autenticacao

| Requisito | Implementacao |
|-----------|---------------|
| Hash de senha | bcrypt com salt rounds 12 |
| Token de acesso | JWT HS256, expira em 15 minutos |
| Token de refresh | JWT, expira em 7 dias, armazenado em httpOnly cookie |
| Google OAuth | Passport.js + Google Strategy |
| Bloqueio de conta | Apos 5 tentativas falhas -> bloqueio 15 min |
| Senha minima | 8 caracteres, 1 maiuscula, 1 numero, 1 especial |

### Autorizacao

| Requisito | Implementacao |
|-----------|---------------|
| RBAC | Guards NestJS com decors @Roles() |
| Verificacao de propriedade | Query sempre inclui userId; middleware verifica ownership |
| Assinatura ativa | Middleware verifica status da subscription antes de liberar modulo |

### Protecao OWASP Top 10

| Vulnerabilidade | Mitigacao |
|-----------------|-----------|
| A01 Broken Access Control | RBAC + ownership check em todas as rotas |
| A02 Cryptographic Failures | bcrypt (senhas), AES-256-GCM (backups), TLS (transito) |
| A03 Injection | Prisma ORM (parameterized queries) + input validation |
| A04 Insecure Design | Threat modeling, least privilege |
| A05 Security Misconfiguration | Variaveis de ambiente, CORS restrito, Helmet.js |
| A06 Vulnerable Components | Dependabot + npm audit |
| A07 Auth Failures | Rate limiting, JWT curto, refresh tokens |
| A08 Data Integrity | Checksum em backups, validacao de webhooks |
| A09 Logging Failures | Audit logs para acoes sensiveis |
| A10 SSRF | Validacao de URLs, restricao de access |

### Protecao de Dados
- **Em transito**: TLS 1.3 obrigatorio (HSTS)
- **Em repouso**: PostgreSQL com encryption at rest; backups criptografados
- **Isolamento**: Todas as queries filtram por userId; nunca expor dados cross-tenant
- **Rate Limiting**: 100 req/min por IP; 20 req/min por rota de auth
- **Sanitizacao**: DOMPurify no frontend; class-validator no backend
- **Headers de seguranca**: Helmet.js (CSP, X-Frame-Options, etc.)
- **Logs de auditoria**: Para acoes sensiveis (login, criacao/exclusao de dados, alteracao de papel)

### Exemplo de Log de Auditoria

```json
{
  "id": "uuid",
  "userId": "uuid",
  "action": "TRANSACTION_CREATED",
  "entity": "transaction",
  "entityId": "uuid",
  "oldValues": null,
  "newValues": { "amount": 150.00, "category": "Alimentacao" },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-08-17T10:00:00Z"
}
```

## 11.4 Controle de Permissoes (RBAC - Implementacao)

### Definicao de Permissoes

```typescript
// common/constants/permissions.ts
export const Permissions = {
  TRANSACTIONS: {
    CREATE: 'transactions:create',
    READ_OWN: 'transactions:read:own',
    READ_ALL: 'transactions:read:all',
    UPDATE_OWN: 'transactions:update:own',
    UPDATE_ALL: 'transactions:update:all',
    DELETE_OWN: 'transactions:delete:own',
    DELETE_ALL: 'transactions:delete:all',
  },
  ACCOUNTS: {
    CREATE: 'accounts:create',
    READ_OWN: 'accounts:read:own',
    READ_ALL: 'accounts:read:all',
    UPDATE_OWN: 'accounts:update:own',
    UPDATE_ALL: 'accounts:update:all',
    DELETE_OWN: 'accounts:delete:own',
    DELETE_ALL: 'accounts:delete:all',
  },
  USERS: {
    INVITE: 'users:invite',
    LIST: 'users:list',
    CHANGE_ROLE: 'users:change-role',
    DEACTIVATE: 'users:deactivate',
    REMOVE: 'users:remove',
  },
  BACKUPS: {
    CREATE: 'backups:create',
    DOWNLOAD: 'backups:download',
    RESTORE: 'backups:restore',
    LIST: 'backups:list',
  },
  SUBSCRIPTIONS: {
    VIEW: 'subscriptions:view',
    CHANGE_PLAN: 'subscriptions:change-plan',
    CANCEL: 'subscriptions:cancel',
  },
} as const;
```

### Mapeamento de Papeis

```typescript
// common/constants/roles.ts
export const RolePermissions = {
  master: [
    ...Object.values(Permissions.TRANSACTIONS),
    ...Object.values(Permissions.ACCOUNTS),
    ...Object.values(Permissions.USERS),
    ...Object.values(Permissions.BACKUPS),
    ...Object.values(Permissions.SUBSCRIPTIONS),
  ],
  admin: [
    Permissions.TRANSACTIONS.CREATE,
    Permissions.TRANSACTIONS.READ_ALL,
    Permissions.TRANSACTIONS.UPDATE_ALL,
    Permissions.TRANSACTIONS.DELETE_ALL,
    Permissions.ACCOUNTS.CREATE,
    Permissions.ACCOUNTS.READ_ALL,
    Permissions.ACCOUNTS.UPDATE_ALL,
    Permissions.ACCOUNTS.DELETE_ALL,
    Permissions.USERS.INVITE,
    Permissions.USERS.LIST,
    Permissions.USERS.CHANGE_ROLE,
    Permissions.USERS.DEACTIVATE,
  ],
  common: [
    Permissions.TRANSACTIONS.CREATE,
    Permissions.TRANSACTIONS.READ_OWN,
    Permissions.TRANSACTIONS.UPDATE_OWN,
    Permissions.TRANSACTIONS.DELETE_OWN,
    Permissions.ACCOUNTS.CREATE,
    Permissions.ACCOUNTS.READ_OWN,
    Permissions.ACCOUNTS.UPDATE_OWN,
    Permissions.ACCOUNTS.DELETE_OWN,
  ],
};
```

### Guard de Autorizacao

```typescript
// common/guards/rbac.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredPermissions.every(permission =>
      user.permissions.includes(permission),
    );
  }
}

// Uso no controller
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Permissions.TRANSACTIONS.CREATE)
async create(@Body() dto: CreateTransactionDto) { ... }
```

### Verificacao de Assinatura

```typescript
// common/guards/subscription.guard.ts
@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<string>(
      'requiredPlan',
      context.getHandler(),
    );
    if (!requiredPlan) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const planHierarchy = { free: 0, premium: 1, pro: 2 };
    return planHierarchy[user.plan] >= planHierarchy[requiredPlan];
  }
}

// Uso
@Get('advanced-reports')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiredPlan('premium')
async getAdvancedReports() { ... }
```

## 11.5 Tratamento de Erros

### Padronizacao de Respostas de Erro

```typescript
// common/dto/error-response.dto.ts
export interface ErrorResponse {
  statusCode: number;           // HTTP status code
  message: string;              // Mensagem amigavel em portugues
  error: string;                // Codigo interno do erro
  details?: Record<string, string>; // Detalhes por campo (validacao)
  timestamp: string;            // ISO timestamp
  path: string;                 // Rota que gerou o erro
}
```

### Codigo de Erro Internos

| Codigo | HTTP Status | Mensagem |
|--------|-------------|----------|
| AUTH_INVALID_CREDENTIALS | 401 | E-mail ou senha invalidos |
| AUTH_TOKEN_EXPIRED | 401 | Sessao expirada, faca login novamente |
| AUTH_ACCOUNT_LOCKED | 423 | Conta bloqueada temporariamente |
| RBAC_INSUFFICIENT_PERMISSIONS | 403 | Voce nao tem permissao para esta acao |
| RESOURCE_NOT_FOUND | 404 | Recurso nao encontrado |
| RESOURCE_FORBIDDEN | 403 | Voce nao tem acesso a este recurso |
| VALIDATION_ERROR | 400 | Dados invalidos |
| TRANSACTION_LIMIT_EXCEEDED | 403 | Limite de transacoes do plano atingido |
| ACCOUNT_LIMIT_EXCEEDED | 403 | Limite de contas do plano atingido |
| CARD_LIMIT_EXCEEDED | 403 | Limite de cartoes do plano atingido |
| BUDGET_LIMIT_EXCEEDED | 403 | Limite de orcamentos do plano atingido |
| GOAL_LIMIT_EXCEEDED | 403 | Limite de metas do plano atingido |
| BACKUP_FAILED | 500 | Falha ao criar backup |
| RESTORE_FAILED | 500 | Falha ao restaurar backup |
| PAYMENT_WEBHOOK_ERROR | 500 | Erro ao processar pagamento |
| RATE_LIMIT_EXCEEDED | 429 | Muitas requisicoes, tente novamente |
| INTERNAL_SERVER_ERROR | 500 | Erro interno do servidor |

### Tratamento de Erros no Frontend

- **Toast de erro**: Mensagem amigavel + botao Tentar novamente
- **Pagina de erro 404**: Ilustracao + link para home
- **Pagina de erro 500**: Mensagem + link para suporte
- **Erros de rede**: Verifique sua conexao com a internet
- **Erros de autenticacao**: Redirecionar para login automaticamente
- **Erros de permissao**: Mensagem + link para upgrade

### Logging Estruturado

```typescript
// Exemplo de logging estruturado
{
  "level": "error",
  "timestamp": "2026-08-17T10:00:00Z",
  "context": "TransactionsService",
  "message": "Failed to create transaction",
  "error": "TRANSACTION_LIMIT_EXCEEDED",
  "userId": "uuid",
  "metadata": {
    "currentCount": 50,
    "limit": 50,
    "plan": "free"
  }
}
```

## 11.6 Criterios de Validacao

### Validacao de Dados de Entrada

| Campo | Regra | Exemplo |
|-------|-------|---------|
| email | Formato valido, max 255 chars | usuario@email.com |
| senha | Min 8, max 128, 1 maiuscula, 1 numero, 1 especial | Abcdef1! |
| valor | Decimal positivo, max 2 casas, max 99999999.99 | 150.00 |
| data | Formato YYYY-MM-DD, nao futura (exceto agendadas) | 2026-08-17 |
| descricao | Max 255 chars, sanitizada | Almoco no restaurante |
| nome | Min 2, max 100 chars | Joao Silva |

### Validacao de Regras de Negocio

| Regra | Validacao |
|-------|-----------|
| Saldo da conta | Nunca permite saldo negativo (a menos que configurado) |
| Limite de orcamento | Alerta aos 80%, aviso aos 100%, nunca impede |
| Duplicidade | Nao impede (usuario pode registrar mesma despesa 2x) |
| Parcelas | Total de parcelas >= 2 e <= 48 |
| Recorrencia | Periodo valido (weekly, biweekly, monthly, yearly) |

### Testes de Regressao
- Antes de cada release, executar suite completa de testes
- Cobertura minima: 80% geral, 100% em regras de negocio criticas
- Verificacao de compatibilidade com versoes anteriores do banco

## 11.7 Orientacao para Implantacao e Testes em Ambiente de Hospedagem

### Passo a Passo de Deploy

1. **Configuracao do Servidor**
   - Provisionar VPS (Ubuntu 22.04 LTS recomendado)
   - Instalar Node.js v20 LTS via NVM
   - Instalar PostgreSQL 16
   - Instalar Redis 7
   - Configurar firewall (UFW): portas 22, 80, 443
   - Configurar SSH com chave publica

2. **Configuracao do Banco**
   - Criar banco de dados e usuario
   - Configurar pg_hba.conf para acesso remoto (se necessario)
   - Executar migracoes: npx prisma migrate deploy
   - Verificar schema: npx prisma db pull

3. **Variaveis de Ambiente**
   - Criar arquivo .env na raiz do projeto
   - Configurar todas as variaveis listadas na secao 8.6
   - Verificar que JWT_SECRET e ASAAS_API_KEY estao seguros

4. **Build e Deploy**
   - npm run build (gera dist/)
   - Copiar dist/ para o servidor
   - npm install --production
   - Configurar PM2: pm2 start dist/main.js --name financeapp
   - Configurar PM2 para iniciar com o sistema: pm2 startup

5. **Nginx**
   - Configurar reverse proxy para porta 3000
   - Configurar SSL via Certbot
   - Configurar cache estatico para assets
   - Configurar headers de seguranca

6. **SSL**
   - certbot --nginx -d financeapp.com.br -d www.financeapp.com.br
   - Configurar renovacao automatica: certbot renew --quiet

### Migracoes de Banco

- Versionamento via Prisma Migrate
- Migracoes executadas automaticamente no deploy
- Backup obrigatorio antes de migracoes em producao
- Rollback planejado para cada migracao

### Estrategia de Testes em Homologacao

1. **Ambiente de Homologacao**: Copia do banco de producao com dados anonimizados
2. **Testes Automaticos**: Suite completa antes de deploy
3. **Testes Manuais**: Checklist de funcionalidades criticas
4. **Teste de Pagamento**: Transacoes reais via Asaas em modo sandbox
5. **Teste de Webhook**: Simular todos os eventos do Asaas
6. **Teste de Performance**: Load testing com k6 ou artillery
7. **Teste de Backup**: Criar e restaurar backup no ambiente de homologacao

### Checklist de Go-Live

- [ ] Banco de dados migrado e verificado
- [ ] Variaveis de ambiente configuradas
- [ ] SSL ativo e funcionando
- [ ] DNS configurado e propagado
- [ ] Backup inicial criado
- [ ] Monitoramento configurado (Uptime Robot, Pingdom)
- [ ] Logs configurados e acessiveis
- [ ] Testes de pagamento reais via Asaas em sandbox
- [ ] Testes de webhook concluidos
- [ ] Testes de backup/restore concluidos
- [ ] Testes de seguranca (OWASP) concluidos
- [ ] Testes de responsividade concluidos
- [ ] Documentacao de deploy atualizada
- [ ] Conta de suporte configurada
- [ ] Plano de rollback documentado

### Plano de Rollback

1. **Antes do deploy**: Backup completo do banco + codigo atual
2. **Durante o deploy**: Manter versao anterior rodando em paralelo (blue-green)
3. **Apos o deploy**: Monitorar por 30 minutos
4. **Se problema detectado**:
   - Reverter codigo para versao anterior
   - Restaurar banco do backup (se necessario)
   - Reiniciar servicos via PM2
   - Notificar equipe
5. **Apos rollback**: Investigar causa raiz, corrigir, testar em homologacao, re-deploy

## 11.8 Compatibilidade Multiplataforma (Celular + PC)

### Abordagem: PWA Responsiva

O FinanceApp sera implementado como uma Progressive Web App (PWA) responsiva, funcionando nativamente em navegadores de desktop e mobile, com instalacao opcional como app.

### Requisitos de Responsividade

| Aspecto | Desktop (>= 1024px) | Tablet (768-1023px) | Mobile (< 768px) |
|---------|---------------------|---------------------|------------------|
| Layout | Sidebar fixa + conteudo | Sidebar colapsavel | Bottom navigation |
| Tabelas | Completas | Scroll horizontal | Cards em vez de tabelas |
| Graficos | Largura total | Adaptados | Largura total, touch |
| Formularios | Dois ou mais campos por linha | Dois campos por linha | Um campo por linha |
| Modais | Centralizados | Centralizados | Full-screen no mobile |
| Pull to refresh | Nao | Sim | Sim |
| Swipe actions | Nao | Sim | Sim |

### Breakpoints CSS

```css
/* Mobile first approach */
/* Base: < 768px (mobile) */
/* md: >= 768px (tablet) */
/* lg: >= 1024px (desktop) */
/* xl: >= 1280px (desktop grande) */
```

### Componentes Adaptativos

- **Sidebar**: Fixa no desktop, drawer no mobile, bottom nav no mobile
- **Cards de transacao**: Lista em desktop, cards empilhados no mobile
- **Formularios**: Layout horizontal em desktop, vertical em mobile
- **Graficos**: Responsivos com Recharts (redimensionam automaticamente)
- **Tabelas**: Tabela em desktop, cards em mobile
- **Modais**: Dialog em desktop, bottom sheet no mobile

### Service Worker (PWA)

```json
// manifest.json
{
  "name": "FinanceApp",
  "short_name": "FinanceApp",
  "description": "Gestao financeira pessoal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Funcionalidades Offline (PWA)

- Cache de dados recentes (ultimas 50 transacoes)
- Criacao de transacoes offline (sincronizacao quando online)
- Visualizacao de saldo e ultimas transacoes
- Notificacoes push via service worker
- Atualizacao automatica quando online
