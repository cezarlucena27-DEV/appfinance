# Manual do Usuário — FinanceApp

> **Versão 1.0** | Aplicável a todos os planos (Free, Premium, PRO)

---

## Sumário

1. [Primeiros Passos](#1-primeiros-passos)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Transações (Despesas e Receitas)](#3-transações-despesas-e-receitas)
4. [Contas e Saldos](#4-contas-e-saldos)
5. [Cartões de Crédito e Faturas](#5-cartões-de-crédito-e-faturas)
6. [Orçamentos](#6-orçamentos)
7. [Metas Financeiras](#7-metas-financeiras)
8. [Relatórios e Gráficos](#8-relatórios-e-gráficos)
9. [Categorias](#9-categorias)
10. [Configurações e Perfil](#10-configurações-e-perfil)
11. [Notificações e Lembretes](#11-notificações-e-lembretes)
12. [Backup e Restauração](#12-backup-e-restauração)
13. [Planos e Assinatura](#13-planos-e-assinatura)
14. [Atalhos e Dicas](#14-atalhos-e-dicas)

---

## 1. Primeiros Passos

### 1.1 Criando sua Conta

1. Acesse o FinanceApp no navegador ou instale como PWA (adicione à tela inicial)
2. Clique em **"Começar"** ou **"Criar conta"**
3. Escolha uma opção:
   - **E-mail e senha**: Preencha nome, e-mail, senha e confirme
   - **Google**: Clique em "Continuar com Google" e autorize
4. Verifique seu e-mail (se cadastrou com e-mail/senha) e clique no link de confirmação
5. Faça login

### 1.2 Configuração Inicial (Onboarding)

Após o primeiro login, você será guiado em 4 passos rápidos:

| Passo | O que fazer | Obrigatório? |
|-------|-------------|--------------|
| 1. Seu nome | Digite como quer ser chamado no app | Sim |
| 2. Primeira conta | Crie uma conta (carteira, conta corrente, poupança) com saldo inicial | Sim |
| 3. Primeira transação | Adicione uma receita ou despesa de exemplo | Não (pode pular) |
| 4. Escolha do plano | Veja os planos e escolha Free, Premium ou PRO | Não (pode ficar no Free) |

> **Dica**: Você pode alterar tudo isso depois em **Configurações**.

### 1.3 Entendendo o Conceito de Workspace

- Ao se cadastrar, você cria um **Workspace** (espaço de trabalho)
- Você é o **Master** (dono) desse workspace
- Pode convidar familiares (Administradores ou Comuns)
- Cada pessoa tem seus próprios dados (contas, transações, metas) dentro do mesmo workspace
- O plano de assinatura é **do workspace**, não individual

---

## 2. Dashboard Principal

O dashboard é sua visão geral financeira. Ele mostra:

### Cards Resumo (Topo)
- **Saldo Total**: Soma de todas as suas contas
- **Receitas do Mês**: Total de entradas no mês atual
- **Despesas do Mês**: Total de saídas no mês atual
- **Saldo do Mês**: Receitas - Despesas

### Gráficos Rápidos
- **Fluxo de Caixa**: Barras mensais (receitas vs despesas)
- **Despesas por Categoria**: Pizza ou barras
- **Evolução do Patrimônio**: Linha temporal (Premium/PRO)

### Alertas e Avisos
- Orçamentos próximos do limite (80%+)
- Faturas de cartão vencendo
- Metas próximas da conclusão
- Backup pendente (se configurado)

### Ações Rápidas (Botões Flutuantes)
- ➕ **Nova Transação**
- 💳 **Novo Cartão**
- 🏦 **Nova Conta**
- 🎯 **Nova Meta**

---

## 3. Transações (Despesas e Receitas)

### 3.1 Criando uma Transação

1. Clique em **➕ Nova Transação** (botão flutuante ou menu)
2. Preencha:

| Campo | Obrigatório? | Detalhes |
|-------|--------------|----------|
| **Tipo** | Sim | Despesa 🔴 | Receita 🟢 | Transferência 🔄 |
| **Valor** | Sim | Apenas números positivos (ex: 150.50) |
| **Data** | Sim | Não pode ser futura (exceto agendadas) |
| **Categoria** | Sim | Selecione da lista ou crie nova |
| **Conta** | Sim | De onde sai/entra o dinheiro |
| **Cartão** | Só despesa | Vincule a um cartão cadastrado |
| **Descrição** | Não | Até 255 caracteres (ex: "Almoço no restaurante X") |
| **Parcelado** | Não | Marque e escolha 2 a 48 parcelas |
| **Recorrente** | Não | Semanal, quinzenal, mensal ou anual |
| **Anexo** | Não | Foto/comprovante (JPG, PNG, PDF até 5MB) — **Premium+** |

3. Clique em **Salvar**

### 3.2 Tipos Especiais de Transação

#### Transferência entre Contas
- Tipo: **Transferência**
- Gera **2 registros automáticos**: saída na conta de origem, entrada na conta de destino
- Não afeta receitas/despesas do mês (apenas move dinheiro)

#### Transação Parcelada
- Marque "Parcelado" e escolha número de parcelas (2-48)
- Cria **1 transação confirmada agora** + **N-1 transações agendadas** (status "agendada")
- Parcelas futuras aparecem no calendário e nas faturas do cartão (se vinculado)
- **Ao excluir a transação principal**: todas as parcelas futuras são canceladas

#### Transação Recorrente
- Marque "Recorrente" e escolha periodicidade
- Cria uma **regra de recorrência** que gera transações automaticamente
- Pode ser pausada/cancelada a qualquer momento

### 3.3 Editando e Excluindo

- **Editar**: Clique na transação → ícone de lápis → altere → Salvar
  - O saldo da conta é recalculado automaticamente
- **Excluir**: Clique na transação → ícone de lixeira → confirme
  - Se for parcelada: exclui todas as parcelas futuras
  - Se for transferência: exclui os 2 registros

### 3.4 Filtros e Busca

Na lista de transações, use:
- **Período**: Mês atual, mês anterior, últimos 3 meses, personalizado
- **Tipo**: Despesa, Receita, Transferência, Todas
- **Categoria**: Selecione uma ou mais
- **Conta**: Filtre por conta específica
- **Cartão**: Filtre por cartão
- **Busca por texto**: Procura na descrição

### 3.5 Limites por Plano

| Plano | Transações/mês |
|-------|----------------|
| Free | 50 |
| Premium | Ilimitado |
| PRO | Ilimitado |

> Ao atingir o limite Free: transações ficam **somente leitura**. Faça upgrade para continuar.

---

## 4. Contas e Saldos

### 4.1 Criando uma Conta

1. Menu lateral → **Contas** → **➕ Nova Conta**
2. Preencha:
   - **Nome**: Ex: "Nubank", "Carteira", "Poupança Itaú"
   - **Tipo**: Carteira 💵 | Conta Corrente 🏦 | Poupança 💰 | Investimento 📈 | Outro
   - **Saldo Inicial**: Quanto tem hoje nessa conta
   - **Ícone/Cor**: Escolha visual para identificar rápido
   - **Conta Principal**: Marque uma como principal (apenas uma por vez)
3. Salve

### 4.2 Entendendo os Saldos

- **Saldo Inicial**: Valor que você informou ao criar
- **Saldo Atual**: Calculado automaticamente = Saldo Inicial + Receitas - Despesas - Transferências enviadas + Transferências recebidas
- **Saldo Consolidado**: Soma de **todas** as suas contas (mostrado no dashboard)

### 4.3 Conta Principal

- Serve como **conta padrão** ao criar transações rápidas
- Não pode ser excluída enquanto for principal
- Para trocar: edite outra conta e marque "Conta Principal"

### 4.4 Excluindo uma Conta

Só é possível se **não houver transações vinculadas**.
- Se houver transações: mova-as para outra conta primeiro (edite cada uma) ou exclua as transações
- Conta principal: torne outra conta principal antes de excluir

### 4.5 Limites por Plano

| Plano | Contas máximas |
|-------|----------------|
| Free | 3 |
| Premium | 10 |
| PRO | Ilimitado |

---

## 5. Cartões de Crédito e Faturas

### 5.1 Cadastrando um Cartão

1. Menu → **Cartões** → **➕ Novo Cartão**
2. Preencha:
   - **Nome**: Ex: "Nubank Visa", "Itaú Mastercard"
   - **Bandeira**: Visa, Mastercard, Elo, Amex, Outro
   - **Limite Total**: Limite do cartão (ex: 5000)
   - **Dia de Fechamento**: 1 a 31 (ex: 15)
   - **Dia de Vencimento**: 1 a 31 (ex: 10)
   - **Conta Vinculada**: Qual conta paga a fatura (para sugestão de pagamento)
3. Salve

### 5.2 Como Funciona a Fatura

- **Período da fatura**: Do dia **após o fechamento anterior** até o **fechamento atual**
  - Ex: Fechamento dia 15 → Fatura de 16/07 a 15/08 vence dia 10/09
- Despesas parceladas: cada parcela vai para a fatura do mês **daquela parcela**, não da compra
- **Limite Disponível** = Limite Total - Fatura Atual (não paga)

### 5.3 Visualizando Faturas

Menu → **Cartões** → clique no cartão → aba **Faturas**
- Lista todas as faturas (abertas, fechadas, pagas)
- Mostra: mês de referência, valor total, status, data de vencimento
- Clique na fatura para ver **todas as transações** que a compõem

### 5.4 Pagando a Fatura

1. Na fatura aberta, clique em **Pagar Fatura**
2. Confirma: cria uma **despesa** na conta vinculada ao cartão
3. Fatura muda para status "Paga"
- **Dica**: Pague antes do vencimento para evitar juros!

### 5.5 Limites por Plano

| Plano | Cartões máximos |
|-------|-----------------|
| Free | 2 |
| Premium | 5 |
| PRO | Ilimitado |

---

## 6. Orçamentos

### 6.1 Criando um Orçamento

1. Menu → **Orçamentos** → **➕ Novo Orçamento**
2. Escolha:
   - **Categoria**: Ex: "Alimentação", "Transporte", "Lazer"
   - **Valor Limite Mensal**: Quanto quer gastar no mês (ex: 800)
   - **Mês de Referência**: Atual (padrão) ou escolha outro
3. Salve

### 6.2 Acompanhando o Progresso

- No dashboard e na tela de orçamentos: **barra de progresso** (gasto / limite)
- **Cores da barra**:
  - 🟢 Verde: até 50%
  - 🟡 Amarelo: 50% a 80%
  - 🟠 Laranja: 80% a 100% (alerta!)
  - 🔴 Vermelho: acima de 100% (estourou!)

### 6.3 Alertas de Orçamento

- **80%**: Notificação in-app "Orçamento de Alimentação em 80%"
- **100%**: Notificação "Orçamento de Alimentação estourou!"
- **Não impede** registrar novas despesas — apenas avisa

### 6.4 Regras Importantes

- Orçamentos **zeram automaticamente** ao virar o mês
- Pode **copiar do mês anterior** (botão "Copiar mês passado")
- Categorias sem orçamento aparecem como "Sem limite"
- **Limites por plano**:

| Plano | Orçamentos máximos |
|-------|-------------------|
| Free | 3 |
| Premium | Ilimitado |
| PRO | Ilimitado |

---

## 7. Metas Financeiras

### 7.1 Criando uma Meta

1. Menu → **Metas** → **➕ Nova Meta**
2. Preencha:
   - **Nome**: Ex: "Reserva de Emergência", "Viagem para Praia"
   - **Valor Alvo**: Quanto quer juntar (ex: 10000)
   - **Data Alvo**: Quando quer atingir
   - **Conta Vinculada**: Onde o dinheiro está acumulado
   - **Ícone/Cor**: Visual para identificar
3. Salve

### 7.2 Atualizando o Progresso

**Automático**: O progresso é calculado pelo **saldo da conta vinculada**.
- Se a conta tem R$ 5.000 e a meta é R$ 10.000 → 50%

**Manual**: Também pode editar a meta e alterar "Valor Atual" diretamente.

### 7.3 Status da Meta

| Status | Quando ocorre |
|--------|---------------|
| **Ativa** | Normal, acompanhando |
| **Pausada** | Você pausou (botão "Pausar") |
| **Concluída** | Atingiu 100% — app parabeniza e sugere nova meta |
| **Cancelada** | Você cancelou |

### 7.4 Limites por Plano

| Plano | Metas ativas simultâneas |
|-------|-------------------------|
| Free | 1 |
| Premium | 5 |
| PRO | Ilimitado |

---

## 8. Relatórios e Gráficos

### 8.1 Acessando Relatórios

Menu → **Relatórios**

### 8.2 Tipos de Relatório por Plano

| Relatório | Free | Premium | PRO |
|-----------|------|---------|-----|
| **Fluxo de Caixa** (Receitas vs Despesas por mês) | ✅ | ✅ | ✅ |
| **Despesas por Categoria** (Pizza/barras) | ✅ | ✅ | ✅ |
| **Evolução do Patrimônio** (Linha temporal do saldo total) | ❌ | ✅ | ✅ |
| **Comparativo Mensal** (Mês a mês) | ❌ | ✅ | ✅ |
| **Despesas por Cartão** (Fatura por cartão) | ❌ | ✅ | ✅ |
| **Projeção de Saldo** (IA sugere projeção) | ❌ | ❌ | ✅ |
| **Relatório Personalizado** (Filtros avançados, export PDF) | ❌ | ❌ | ✅ |

### 8.3 Filtros Comuns

- **Período**: Data início e fim (padrão: mês atual)
- **Categorias**: Selecione uma ou várias
- **Contas**: Filtre por conta
- **Cartões**: Filtre por cartão
- **Tipo**: Despesa, Receita, Transferência

### 8.4 Exportação

- **PDF/CSV**: Disponível no **Premium+** para relatórios básicos; **PRO** para todos
- Clique no ícone **⬇️ Exportar** no canto superior direito do relatório
- Escolha formato e confirme

---

## 9. Categorias

### 9.1 Categorias do Sistema (Padrão)

Já vêm prontas e **não podem ser excluídas**:
- **Despesas**: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Outros
- **Receitas**: Salário, Freelance, Investimentos, Vendas, Outros

### 9.2 Categorias Personalizadas

Você pode criar as suas:
1. Menu → **Categorias** → **➕ Nova Categoria**
2. Nome, ícone, cor, tipo (despesa ou receita)
3. **Limites por plano**:

| Plano | Categorias personalizadas |
|-------|--------------------------|
| Free | 5 |
| Premium | Ilimitado |
| PRO | Ilimitado |

### 9.3 Editando/Excluindo Personalizadas

- **Editar**: Clique → lápis → altere nome, ícone, cor
- **Excluir**: Clique → lixeira → confirme
  - Transações que usavam a categoria ficam com "Sem categoria" (você pode reatribuir em massa)

---

## 10. Configurações e Perfil

Acesse clicando no seu **avatar** (canto superior direito) → **Configurações**

### 10.1 Perfil
- Nome de exibição
- Foto/avatar (upload)
- E-mail (pode alterar — requer confirmação)
- Senha (alterar senha atual)
- **Idioma**: Português (BR) | English
- **Tema**: Claro | Escuro | Sistema (segue o SO)

### 10.2 Notificações
Ative/desative por tipo:
- Contas a pagar (3 dias antes)
- Faturas vencendo (5 dias antes)
- Orçamento estourado (80% e 100%)
- Meta atingida
- Backup concluído
- Pagamento falhou

**Push notifications**: Apenas **Premium+** (requer permissão do navegador)
**E-mails**: Todos os planos

### 10.3 Segurança
- Ver sessões ativas (dispositivos logados)
- Revogar sessões antigas
- Autenticação de 2 fatores (2FA) — **em breve**

### 10.4 Dados e Privacidade
- **Exportar meus dados** (JSON/CSV) — todos os planos
- **Solicitar exclusão da conta** (LGPD)
- Ver política de privacidade

### 10.5 Assinatura (apenas Master)
Ver plano atual, gerenciar pagamento, upgrade/downgrade, cancelar

---

## 11. Notificações e Lembretes

### 11.1 Tipos de Notificação

| Notificação | Quando dispara | Canal |
|-------------|----------------|-------|
| Conta a pagar vencendo | 3 dias antes | Push + In-App |
| Fatura do cartão próxima | 5 dias antes | Push + In-App |
| Orçamento em 80% | Gasto > 80% do limite | In-App |
| Orçamento em 100% | Gasto ≥ 100% do limite | In-App |
| Meta atingida | Progresso = 100% | Push + In-App |
| Backup concluído | Automático finalizado | In-App |
| Pagamento falhou | Webhook Asaas falha | In-App + E-mail |

### 11.2 Centro de Notificações

- Ícone de **sino** no header → clique para ver histórico
- **Badge vermelho** = não lidas
- Clique na notificação para ir à tela relacionada
- Marcar todas como lidas: botão no topo

### 11.3 Configurando

Vá em **Configurações → Notificações** para ligar/desligar cada tipo.

---

## 12. Backup e Restauração

> **Disponível apenas no Premium e PRO**

### 12.1 Backup Manual (Premium+)

1. Menu → **Backups** (ou Configurações → Backups)
2. Clique em **Criar Backup Manual**
3. Opcional: defina uma **senha extra** para criptografar (recomendado!)
4. Aguarde processar → **Download do arquivo .json.enc**
5. Guarde em local seguro (Google Drive, pendrive, nuvem)

### 12.2 Backup Automático (Apenas PRO)

- Executa **diariamente às 3h da manhã**
- Criptografado com AES-256-GCM (chave derivada do workspace)
- Mantém histórico: **1 por mês** (apaga os mais antigos > 90 dias)
- Notifica o Master quando concluído

### 12.3 O que entra no Backup

✅ **Incluído**:
- Suas contas com saldos
- Todas as transações (histórico completo)
- Categorias (padrão + personalizadas)
- Cartões de crédito
- Orçamentos
- Metas financeiras
- Configurações (notificações, preferências)

❌ **NÃO incluído** (por segurança):
- Senhas (hash)
- Tokens de sessão
- Logs de auditoria
- Dados de **outros membros** do workspace

### 12.4 Restaurando um Backup

⚠️ **ATENÇÃO**: Restauração **substitui TODOS os seus dados atuais**.

1. Menu → **Backups** → **Restaurar Backup**
2. Selecione o arquivo `.json.enc` ou `.json`
3. Se tem senha: digite a senha do backup
4. **Preview**: sistema mostra quantos registros de cada tipo
5. Digite **"RESTAURAR"** (maiúsculo) para confirmar
6. **Backup automático pré-restore** é criado antes (segurança)
7. Aguarde finalizar → dados restaurados

### 12.5 Regras de Restauração

- Se o backup for **mais antigo** que seus dados atuais: aviso "Seus dados atuais são de X. Backup é de Y. Continuar?"
- Se falhar no meio: **rollback automático** (volta tudo como era)
- Apenas o **Master** pode restaurar

---

## 13. Planos e Assinatura

### 13.1 Comparativo Rápido

| Recurso | Free | Premium (R$ 14,90/mês) | PRO (R$ 29,90/mês) |
|---------|------|------------------------|-------------------|
| Transações/mês | 50 | ∞ | ∞ |
| Contas | 3 | 10 | ∞ |
| Cartões | 2 | 5 | ∞ |
| Orçamentos | 3 | ∞ | ∞ |
| Metas ativas | 1 | 5 | ∞ |
| Categorias personalizadas | 5 | ∞ | ∞ |
| Relatórios avançados | ❌ | ✅ | ✅ |
| Exportar PDF/CSV | ❌ | ✅ | ✅ |
| Evolução de patrimônio | ❌ | ✅ | ✅ |
| Backup manual | ❌ | ✅ | ✅ |
| Backup automático | ❌ | ❌ | ✅ |
| Restaurar backup | ❌ | ✅ | ✅ |
| Push notifications | ❌ | ✅ | ✅ |
| Anexos (comprovantes) | ❌ | ✅ | ✅ |
| Membros no workspace | 1 | 3 | ∞ |

### 13.2 Assinando um Plano

1. Menu → **Assinatura** (ou botão de upgrade nos limites)
2. Escolha: **Mensal** ou **Anual** (anual = 2 meses grátis)
3. Escolha pagamento: **Cartão de Crédito** | **PIX** | **Boleto**
4. Complete no checkout do Asaas (seguro, não vemos seus dados de cartão)
5. Confirmação via webhook → módulos liberados em segundos

### 13.3 Downgrade (Mudar para plano menor)

- **Dados preservados**: Nada é apagado
- **Recursos exclusivos**: Ficam **somente leitura** (visualiza, não edita)
- **Criação bloqueada**: Não consegue criar itens acima do limite do novo plano
- **Grace period**: 30 dias para reativar o plano anterior e ter acesso total
- Após 30 dias: dados excedentes ficam **arquivados** (acessíveis só com upgrade)

### 13.4 Cancelamento

1. Menu → **Assinatura** → **Cancelar Assinatura**
2. Modal de confirmação mostra: "Ao cancelar, você perderá acesso a [recursos]. Seus dados ficam por 90 dias."
3. Confirme
- **90 dias de retenção**: Dados mantidos, acesso somente leitura
- **Após 90 dias**: Dados anonimizados e arquivados (restauráveis via backup)
- **Reativação**: A qualquer momento nos 90 dias → dados restaurados integralmente

### 13.5 Inadimplência (Pagamento Falhou)

- Asaas tenta cobrar novamente em **1, 3 e 7 dias**
- **3 dias sem pagamento**: Notificação + módulos pagos bloqueados
- **10 dias sem sucesso**: Assinatura cancelada automaticamente
- **Dados sempre preservados** — apenas acesso bloqueado

---

## 14. Atalhos e Dicas

### 14.1 Atalhos de Teclado (Desktop)

| Atalho | Ação |
|--------|------|
| `N` | Nova transação |
| `C` | Nova conta |
| `G` | Nova meta |
| `B` | Novo orçamento |
| `/` | Foco na busca global |
| `Esc` | Fechar modal / cancelar |
| `Ctrl/Cmd + S` | Salvar formulário atual |
| `D` | Alternar tema claro/escuro |

### 14.2 Gestos Mobile (PWA)

| Gesto | Ação |
|-------|------|
| **Pull down** (puxar para baixo) | Atualizar dados (sync) |
| **Swipe left** na transação | Revela "Excluir" |
| **Swipe right** na transação | Revela "Editar" |
| **Long press** no card | Menu de contexto |

### 14.3 Dicas de Produtividade

1. **Use a conta principal** para transações rápidas — ela é pré-selecionada
2. **Copie orçamento do mês anterior** — botão no topo da tela de orçamentos
3. **Filtros salvos** — em relatórios, salve combinações de filtro frequentes
4. **Anexos em compras grandes** — fotografe a nota fiscal (Premium+)
5. **Revise faturas semanalmente** — evite surpresas no vencimento
6. **Backup semanal manual** (Premium) ou confie no automático (PRO)
7. **Convide a família** — Master convida, cada um vê só o seu (ou compartilhado)

### 14.4 Modo Offline (PWA)

- Funciona **offline** para visualização e criação de transações
- Dados sincronizam automaticamente quando volta a conexão
- **Instale como app**: Chrome/Edge → menu → "Instalar FinanceApp"

---

## Suporte

| Plano | Suporte |
|-------|---------|
| Free | Comunidade (GitHub/Discord) |
| Premium | E-mail (resposta em até 24h úteis) |
| PRO | Prioritário (resposta em até 4h úteis) |

**E-mail**: suporte@financeapp.com.br  
**Documentação técnica**: `especificacao_tecnica_financeapp.md`  
**Status do sistema**: status.financeapp.com.br

---

*Última atualização: Agosto 2026 | FinanceApp v1.0*