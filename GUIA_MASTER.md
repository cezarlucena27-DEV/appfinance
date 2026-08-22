# Guia do Usuário Master — FinanceApp

> **Apenas para o dono do workspace (Master)** | Controle total do workspace, membros, assinatura e backups

---

## O que é ser Master?

Ao criar sua conta, você vira **Master** do workspace. Só existe **um Master por workspace**.

**Suas responsabilidades:**
- 👥 Convidar e gerenciar membros da família/equipe
- 💳 Gerenciar assinatura (plano, pagamento, upgrade/downgrade/cancelamento)
- 💾 Criar, baixar e restaurar backups (manual no Premium, automático no PRO)
- 📊 Ver métricas agregadas de todo o workspace
- ⚙️ Configurar preferências do workspace

---

## Acessando o Dashboard Master

**Menu lateral** → **Dashboard Master** (ícone de coroa 👑)  
**Ou**: Avatar → **Dashboard Master**

> **Só você vê essa opção**. Admins e Comuns não têm acesso.

---

## Layout do Dashboard Master

```
┌────────────────────────────────────────────────────────────────────┐
│  FinanceApp                    🔔  👤 João (Master)         ☀️/🌙 │
├──────────────┬────────────────────────────────────────────────────┤
│   SIDEBAR    │              CONTEÚDO PRINCIPAL                    │
│              │                                                    │
│  📊 Visão    │  [Cards] [Gráficos] [Alertas] [Atividade Recente] │
│  👥 Usuários │  [Lista] [Convites] [Permissões]                  │
│  💳 Assin.   │  [Plano] [Upgrade] [Histórico] [Pagamento]        │
│  💾 Backups  │  [Criar] [Histórico] [Restaurar] [Config]         │
│  📈 Métricas │  [Gráficos Uso] [Evolução] [Exportar]             │
│  ⚙️ Config   │  [Workspace] [Notificações] [Segurança]           │
│              │                                                    │
└──────────────┴────────────────────────────────────────────────────┘
```

---

## 1️⃣ Visão Geral (Home)

### Cards Resumo do Workspace

| Card | O que mostra |
|------|--------------|
| **👥 Total de Usuários** | Ativos / Inativos / Convites pendentes |
| **💳 Plano Ativo** | Nome, valor, próxima cobrança, status (ativo/inadimplente/cancelado) |
| **📦 Uso de Módulos** | Barras de progresso: transações, contas, cartões, orçamentos, metas, categorias vs limite do plano |
| **💾 Último Backup** | Data/hora, tipo (manual/automático), status (✅/❌), tamanho |

### Gráfico: Atividade Recente (últimos 30 dias)
- Timeline de ações dos membros: login, transação criada, conta criada, meta atingida, etc.
- Filtro por usuário, tipo de ação, período

### Alertas Importantes
| Alerta | Ação |
|--------|------|
| ⚠️ Pagamento pendente | Clique → vai para Assinatura → atualize pagamento |
| ⚠️ Backup falhou | Clique → Backups → veja erro / refaça manual |
| ⚠️ Membro inativo 30+ dias | Clique → Usuários → decida reativar/remover |
| ⚠️ Limite de módulo perto (90%+) | Planeje upgrade ou oriente membros |

---

## 2️⃣ Gerenciamento de Usuários

### 2.1 Lista de Usuários

Tabela com colunas:
| Coluna | Descrição |
|--------|-----------|
| **Nome / Avatar** | Foto + nome de exibição |
| **E-mail** | E-mail de login |
| **Papel** | Master 👑 | Administrador 🛡️ | Comum 👤 |
| **Status** | 🟢 Ativo | 🔴 Inativo | 🟡 Convite pendente |
| **Entrada** | Data que entrou no workspace |
| **Última atividade** | Último login/ação |
| **Ações** | Menu ⋮ (ver abaixo) |

**Filtros** (topo da tabela):
- Por papel: Todos / Master / Admin / Comum
- Por status: Todos / Ativos / Inativos / Pendentes
- Por data de entrada: intervalo personalizado
- Busca por nome ou e-mail

### 2.2 Ações por Usuário (Menu ⋮)

| Ação | Quem pode | O que faz |
|------|-----------|-----------|
| **Ver detalhes** | Master, Admin | Abre modal com atividade, transações count, contas, metas |
| **Ativar/Desativar** | Master, Admin | Inativo = não entra, dados preservados, não conta no limite de membros |
| **Alterar papel** | Master, Admin | Comum ↔ Admin (Master não muda) |
| **Redefinir senha** | Master | Gera senha temporária → envia e-mail para o usuário |
| **Ver log de atividade** | Master, Admin | Timeline detalhada de ações do usuário |
| **Remover do workspace** | **Apenas Master** | Remove acesso. Dados ficam arquivados no workspace. **Irreversível** |

### 2.3 Convidar Novo Usuário

Botão **"➕ Convidar Usuário"** (topo direito da lista):

```
┌─────────────────────────────────────┐
│  Convidar membro da família         │
├─────────────────────────────────────┤
│  E-mail:          [_______________] │
│  Papel:           [Comum ▼]         │  ← Comum | Administrador
│  Mensagem:        [_______________] │  ← Opcional, personalizada
│                                   │
│  [Cancelar]     [🟦 Enviar convite] │
└─────────────────────────────────────┘
```

**Fluxo do convite:**
1. Envia e-mail com link único (expira em 7 dias)
2. Convidado clica → cadastra/login → entra no workspace
3. Status muda de "Convite pendente" → "Ativo"
4. **Conta no limite de membros do plano**

### 2.4 Limites de Membros por Plano

| Plano | Membros totais (incluindo Master) |
|-------|-----------------------------------|
| Free | 1 (só você) |
| Premium | 3 |
| PRO | Ilimitado |

> **Atenção**: Se downgrade reduzir limite abaixo do atual:
> - Membros excedentes ficam **inativos** (não removidos)
> - Não contam no limite enquanto inativos
> - Reative quando tiver vagas (upgrade ou remova outros)

### 2.5 Permissões por Papel (Resumo)

| Módulo/Ação | Master | Admin | Comum |
|-------------|--------|-------|-------|
| **Convidar usuário** | ✅ | ✅ | ❌ |
| **Listar usuários** | ✅ | ✅ | ❌ |
| **Alterar papel** | ✅ | ✅ | ❌ |
| **Ativar/Desativar** | ✅ | ✅ | ❌ |
| **Remover do workspace** | ✅ | ❌ | ❌ |
| **Redefinir senha de outro** | ✅ | ❌ | ❌ |
| **Ver atividade de outros** | ✅ | ✅ | ❌ |
| **Gerenciar assinatura** | ✅ | ❌ | ❌ |
| **Backups (criar/baixar/restaurar)** | ✅ | ❌ | ❌ |
| **Dashboard Master** | ✅ | ❌ | ❌ |
| **Ver TODAS transações** | ✅ | ✅ | ❌ (só próprias) |
| **Editar/Excluir transação de outro** | ✅ | ✅ | ❌ (só próprias) |

> **Nota**: Admins veem **métricas agregadas** (totais), não detalhes individuais de transações de outros — exceto se for conta familiar compartilhada (futuro).

---

## 3️⃣ Gerenciamento de Assinatura

### 3.1 Tela de Assinatura

**Aba: Plano Atual**
```
┌─────────────────────────────────────────────────────────────┐
│  📋 PLANO ATUAL: PREMIUM (Mensal)                           │
│                                                             │
│  💰 Valor: R$ 14,90/mês          📅 Próxima cobrança: 15/09 │
│  💳 Método: Cartão •••• 1234 (Visa)                         │
│  🟢 Status: ATIVO                                           │
│                                                             │
│  [🟦 Upgrade para PRO]   [🟨 Downgrade para Free]           │
│  [⚙️ Atualizar pagamento]  [🔴 Cancelar assinatura]        │
└─────────────────────────────────────────────────────────────┘
```

**Aba: Histórico de Cobranças**
Tabela: Data | Valor | Status (Pago/Pendente/Falhou/Estornado) | Método | NF/Recibo

**Aba: Método de Pagamento**
- Cartões salvos (tokenizados Asaas)
- Adicionar novo / Remover / Definir padrão

### 3.2 Upgrade (Free → Premium → PRO)

1. Clique **"Upgrade para [Plano]"**
2. Escolha: **Mensal** ou **Anual** (anual = ~17% off)
3. Escolha pagamento: **Cartão** | **PIX** | **Boleto**
4. Checkout Asaas → confirma → **módulos liberados em segundos**
5. Cobrança pro-rata se no meio do ciclo

### 3.3 Downgrade (PRO → Premium → Free)

1. Clique **"Downgrade para [Plano]"**
2. Modal de confirmação mostra:
   - Quais recursos ficam **somente leitura**
   - Quantos itens excedem o novo limite (ex: "Você tem 8 contas. Free permite 3. 5 ficarão somente leitura.")
   - **Grace period: 30 dias** para reativar plano anterior
3. Confirma → efeito **no próximo ciclo de cobrança** (ou imediato se trial)

**Durante grace period (30 dias):**
- Acesso total mantido
- Pode reativar plano anterior → volta tudo normal
- Após 30 dias: itens excedentes **arquivados** (só leitura com upgrade)

### 3.4 Cancelamento

1. Clique **"Cancelar assinatura"**
2. Modal mostra resumo:
   ```
   Ao cancelar:
   • Perde acesso a: Backup, Relatórios avançados, Push, Anexos, Membros extras
   • Seus dados ficam acessíveis (somente leitura) por 90 dias
   • Após 90 dias: dados anonimizados e arquivados
   • Pode reativar a qualquer momento nos 90 dias
   ```
3. Digite **"CANCELAR"** para confirmar
4. Acesso aos recursos pagos mantido até **fim do período pago**

### 3.5 Inadimplência (Pagamento Falhou)

**Fluxo automático (Asaas):**
| Dia | Ação |
|-----|------|
| Dia 0 | Pagamento falha → webhook → notificação Master |
| Dia 1, 3, 7 | Asaas tenta cobrar novamente (retry automático) |
| Dia 3 | Módulos pagos **bloqueados** + notificação + e-mail |
| Dia 10 | Assinatura **cancelada** automaticamente |
| Pós-cancelamento | 90 dias retenção → arquivamento |

**Você pode:**
- Atualizar cartão → Asaas tenta cobrar na hora
- Pagar fatura aberta via PIX/Boleto no Asaas
- Entrar em contato suporte se for erro do banco

---

## 4️⃣ Backups (Premium + PRO)

> **Apenas Master acessa**. Premium: manual. PRO: manual + automático.

### 4.1 Criar Backup Manual

1. Aba **Backups** → **"➕ Criar Backup Manual"**
2. Opcional: **Senha extra** (recomendado!) → criptografia em camada dupla
3. Clique **"Gerar Backup"**
4. Aguarde processamento (pode levar alguns segundos/minutos)
5. **Download automático** do arquivo `.json.enc`
6. **Guarde em local seguro**: Google Drive, OneDrive, HD externo, pendrive

**Arquivo gerado**: `financeapp-backup-2026-08-20T10-30-00Z.json.enc`
- Criptografado AES-256-GCM
- Contém TODOS os dados do workspace (exceto senhas, tokens, logs, dados de outros membros)

### 4.2 Backup Automático (Apenas PRO)

**Configuração** (Aba Backups → Configurações):
- ✅ Ativar backup automático diário
- ⏰ Horário: **3h da manhã** (fixo, menor uso)
- 📦 Retenção: **1 backup por mês** (apaga > 90 dias)
- 🔔 Notificar Master quando concluído (in-app + e-mail opcional)

**Execução automática:**
- Coleta dados → JSON → checksum SHA-256 → criptografa → salva → registra metadados
- Se falhar: log de erro + notifica Master → tenta no dia seguinte

### 4.3 Histórico de Backups

Tabela com:
| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Quando foi criado |
| **Tipo** | 🔄 Automático | 📝 Manual | 🛡️ Pre-Restore |
| **Tamanho** | Ex: 2.4 MB |
| **Status** | ✅ Concluído | ⏳ Em andamento | ❌ Falhou |
| **Criado por** | Seu nome (ou "Sistema" se automático) |
| **Ações** | ⬇️ Baixar | 🔄 Restaurar | 🗑️ Excluir |

### 4.4 Restaurar Backup

⚠️ **PERIGO: Substitui TODOS os dados atuais do workspace**

**Processo:**
1. Aba Backups → **"Restaurar Backup"**
2. Selecione arquivo `.json.enc` ou `.json` (do seu computador)
3. Se tem senha extra: **digite a senha**
4. **Preview**: mostra contagem de registros por tipo
   ```
   Usuários: 3
   Contas: 12
   Transações: 1.247
   Categorias: 28
   Cartões: 4
   Orçamentos: 15
   Metas: 6
   ```
5. **Aviso se backup é mais antigo** que dados atuais:
   > "⚠️ Este backup é de 15/08/2026. Seus dados atuais são de 20/08/2026. Dados dos últimos 5 dias serão perdidos. Continuar?"
6. Digite **"RESTAURAR"** (maiúsculo, obrigatório)
7. **Backup pre-restore automático** criado (segurança)
8. Processa: transação DB → deleta atuais → insere backup → recalcula saldos → commit
9. Notificação: "✅ Backup restaurado com sucesso"

**Regras de Restauração:**
- Apenas Master
- Rollback automático se falha no meio
- Log de auditoria registrado
- Dados de outros membros **não** são restaurados (backup só tem seus dados)

### 4.5 Boas Práticas de Backup

| Frequência | Plano | Recomendação |
|------------|-------|--------------|
| **Diário** | PRO | Automático (configure e esqueça) |
| **Semanal** | Premium | Manual toda segunda-feira |
| **Antes de mudanças grandes** | Ambos | Sempre: antes de restaurar, antes de downgrade, antes de limpeza |
| **Armazenamento** | Ambos | **3 lugares**: nuvem (Drive) + local (PC) + externo (HD/pendrive) |
| **Teste de restauração** | PRO | Trimestral: restaure em ambiente de teste (ou workspace secundário) |

---

## 5️⃣ Métricas Agregadas do Workspace

> Visão gerencial para o Master acompanhar saúde financeira da família/equipe.

### 5.1 Métricas Disponíveis

| Métrica | Descrição | Frequência |
|---------|-----------|------------|
| **Total de usuários** | Quantidade total / ativos / inativos | Tempo real |
| **Transações este mês** | Soma de todas transações (todos membros) | Tempo real |
| **Volume financeiro** | Total receitas / total despesas / saldo líquido do workspace | Tempo real |
| **Uso por módulo** | % de utilização: transações, contas, cartões, orçamentos, metas vs limite do plano | Tempo real |
| **Distribuição de planos** | Se membros têm planos individuais diferentes (futuro) | Tempo real |
| **Backups realizados** | Quantidade total / último backup / status | Tempo real |

### 5.2 Gráficos de Uso

- **Evolução temporal**: Transações/mês, usuários ativos/mês, volume financeiro/mês
- **Heatmap de atividade**: Dias/horários de maior uso
- **Top categorias**: Onde o workspace mais gasta (agregado)

### 5.3 Exportar Relatório de Métricas

Botão **"📥 Exportar"** → PDF ou CSV com:
- Resumo executivo (últimos 12 meses)
- Tabelas detalhadas por mês
- Gráficos embutidos (PDF)
- **Disponível no Premium+**

---

## 6️⃣ Configurações do Workspace

### 6.1 Dados do Workspace
- **Nome do workspace** (ex: "Finanças Família Silva")
- **Moeda padrão** (BRL fixo na v1)
- **Fuso horário** (para relatórios, notificações)
- **Formato de data/número** (BR: dd/mm/aaaa, 1.234,56)

### 6.2 Preferências de Notificação (Workspace)
- E-mail de alertas para **Master** (backup falhou, pagamento falhou, membro inativo)
- Frequência de resumo semanal (Segunda 9h): "Sua semana financeira" — ativo/inativo

### 6.3 Segurança do Workspace
- **Sessões ativas de todos**: veja dispositivos logados de todos membros
- **Forçar logout geral**: revoga todas as sessões (exceto a sua) — use se suspeita de acesso indevido
- **Política de senha**: exigir complexidade, rotação (futuro)
- **2FA obrigatório para Admins/Master** (futuro)

### 6.4 LGPD / Privacidade
- **Exportar dados do workspace** (Master + todos membros) — JSON/CSV
- **Solicitar exclusão do workspace** — irreversível, 30 dias para confirmar, remove tudo

---

## 7️⃣ Cenários Comuns do Master

### Cenário 1: Convidar cônjuge (Comum)
1. Dashboard Master → Usuários → Convidar
2. E-mail do cônjuge + Papel: **Comum** + Mensagem: "Amor, entra no nosso controle financeiro 💕"
3. Cônjuge aceita → cria login → vê **só os dados dele**
4. Você (Master) vê métricas agregadas (total gasto, etc.)

### Cenário 2: Filhos adolescentes (Comum)
1. Convidar com papel **Comum**
2. Eles gerenciam **mesada, metas de jogo, economias**
3. Você vê **resumo**: "João gastou R$ 150 em Jogos este mês"
4. Ensina educação financeira na prática

### Cenário 3: Contador/Assessor (Administrador)
1. Convidar contador como **Administrador**
2. Ele vê **relatórios agregados, exporta PDF/CSV** para declaração IR
3. **Não mexe em assinatura, não faz backup, não remove usuários**
4. Remove acesso quando termina o trabalho (Desativar)

### Cenário 4: Upgrade antes de viagem (família toda)
1. Verifica "Uso de Módulos" → contas 9/10, cartões 4/5
2. Upgrade para PRO → membros ilimitados + backup automático
3. Convida mais 2 parentes para viagem compartilhada
4. Backup automático diário garante segurança

### Cenário 5: Troca de cartão de crédito (pagamento)
1. Assinatura → Método de Pagamento → "Adicionar cartão"
2. Novo checkout Asaas → tokeniza → define como padrão
3. Remove cartão antigo
4. Próxima cobrança usa o novo

### Cenário 6: Recuperação após erro (restaurar backup)
1. Alguém apagou transações importantes por engano
2. Backups → Histórico → escolhe backup de ontem → Restaurar
3. Digita "RESTAURAR" → pronto, dados voltam
4. Backup pre-restore garante que pode voltar se arrepender

### Cenário 7: Downgrade planejado (corte de custos)
1. Verifica uso: "Temos 8 contas, Free permite 3"
2. Combo: move transações de 5 contas para as 3 principais → exclui 5 contas vazias
3. Downgrade para Free → grace period 30 dias
4. Se precisar voltar: reativa Premium em 1 clique

---

## 8️⃣ Checklist Mensal do Master

| Item | Frequência | Ação |
|------|------------|------|
| ✅ Verificar status da assinatura | Mensal | Ativo? Próxima cobrança OK? Cartão válido? |
| ✅ Verificar último backup | Mensal | Concluído? Tamanho OK? Baixou cópia externa? |
| ✅ Revisar membros inativos | Mensal | >30 dias sem login → desativar/remover? |
| ✅ Checar uso vs limites | Mensal | Perto de 90% em algum módulo? Planejar upgrade? |
| ✅ Verificar alertas de pagamento | Semanal | Dashboard Master → alertas |
| ✅ Exportar relatório métricas | Trimestral | PDF para arquivo / contador |
| ✅ Testar restauração (PRO) | Trimestral | Restore em workspace teste |

---

## 9️⃣ Solução de Problemas do Master

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| **Não vejo "Dashboard Master"** | Não é Master / workspace corrompido | Verifique se é o dono original. Suporte se necessário. |
| **Convite não enviado** | Limite de membros atingido / e-mail inválido | Verifique limite do plano. Teste e-mail diferente. |
| **Backup manual falha** | Muitos dados / timeout / storage cheio | Tente horário de menor uso. Contate suporte se persistir. |
| **Restauração falhou** | Arquivo corrompido / senha errada / versão incompatível | Use backup anterior. Verifique senha. Suporte se nada funcionar. |
| **Downgrade não deixou fazer** | Itens excedentes não movidos/excluídos | Mova/exclua itens acima do limite do novo plano primeiro. |
| **Membro não consegue editar** | Papel "Comum" tentando editar conta de outro | Admin/Master edita por ele, ou muda papel para Admin. |
| **Cobrança duplicada** | Retry Asaas + pagamento manual | Verifique histórico. Se duplicado: suporte Asaas + FinanceApp. |

---

## 🔟 Responsabilidades Legais do Master

Como **controlador de dados** do workspace (LGPD Art. 5º, VI):

1. **Consentimento**: Ao convidar membros, você garante que eles concordam com o processamento
2. **Acesso**: Membros podem pedir exportação dos **próprios** dados (você atende via Dashboard Master)
3. **Exclusão**: Membro pode pedir exclusão dos próprios dados (você executa via "Remover" + solicitação LGPD)
4. **Segurança**: Deve manter senha forte, 2FA (quando disponível), não compartilhar login
5. **Notificação de incidente**: Se houver vazamento, deve notificar membros e ANPD (nós ajudamos)

> **Dúvidas LGPD**: privacidade@financeapp.com.br

---

## Suporte Exclusivo Master

| Canal | Tempo | Quando usar |
|-------|-------|-------------|
| **E-mail prioritário** | ≤ 4h úteis | Qualquer dúvida/problema Master |
| **WhatsApp Business** | ≤ 2h úteis | Urgências: pagamento falhou, restore falhou, vazamento |
| **Gerente de conta** (PRO) | Agendado | Planejamento, migração, treinamento equipe |

**Contatos:**
- master@financeapp.com.br
- WhatsApp: +55 11 99999-0001 (apenas PRO)
- Horário: Seg-Sex 9h-18h, Sáb 9h-12h (BRT)

---

*Você é o guardião das finanças da sua família/equipe. Use esse poder com sabedoria! 👑*