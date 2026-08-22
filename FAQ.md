# Perguntas Frequentes (FAQ) — FinanceApp

> **Atualizado: Agosto 2026** | Busque com `Ctrl/Cmd + F`

---

## 📱 Geral e Acesso

### **O FinanceApp é gratuito?**
Sim! O plano **Free** é gratuito para sempre. Tem limites (50 transações/mês, 3 contas, 2 cartões, 3 orçamentos, 1 meta, 5 categorias personalizadas, relatórios básicos). Planos **Premium** (R$ 14,90/mês) e **PRO** (R$ 29,90/mês) removem limites e adicionam recursos avançados.

### **Preciso instalar algo?**
Não. Funciona no navegador (Chrome, Firefox, Safari, Edge). **Recomendamos instalar como PWA** (adicione à tela inicial) para experiência de app nativo, offline e notificações push.

### **Funciona no celular e no computador?**
Sim! Design **100% responsivo**. Use no desktop, tablet ou celular. Dados sincronizam automaticamente na nuvem.

### **Meus dados ficam salvos se eu trocar de celular?**
Sim. Tudo fica na nuvem (servidores seguros). É só logar no novo dispositivo com seu e-mail/senha ou Google.

### **O app funciona offline?**
Sim, **parcialmente**. Como PWA instalado: pode **visualizar** dados já carregados e **criar transações** offline. Sincroniza automaticamente quando volta a conexão.

### **Como faço login?**
- **E-mail + senha** (cadastrados)
- **Google** (um clique)
- **Recuperação de senha**: tela de login → "Esqueci a senha" → recebe link por e-mail

### **Posso ter mais de uma conta (workspace)?**
Cada cadastro cria **um workspace**. Para ter outro workspace separado, crie outro cadastro com e-mail diferente. Não suportamos múltiplos workspaces no mesmo login.

---

## 💰 Transações

### **Qual a diferença entre Despesa, Receita e Transferência?**
- **Despesa 🔴**: Dinheiro saindo (compras, contas, lazer) — reduz saldo
- **Receita 🟢**: Dinheiro entrando (salário, freelance, Pix) — aumenta saldo
- **Transferência 🔄**: Move dinheiro **entre suas contas** — sai de uma, entra na outra. **Não conta** como receita/despesa no relatório.

### **Como faço uma transferência entre contas?**
Nova transação → Tipo: **Transferência** → Conta de origem → Conta de destino → Valor. Cria 2 registros automáticos.

### **Posso parcelar uma despesa?**
Sim. Marque "Parcelado" → escolha 2 a 48 parcelas. Cria 1 confirmada agora + parcelas futuras agendadas. No cartão: cada parcela vai na fatura do mês **daquela parcela**.

### **O que são transações recorrentes?**
Repetem automaticamente: semanal, quinzenal, mensal ou anual. Ex: aluguel mensal, academia, mesada. Crie uma vez → app gera todo mês. Pode pausar/cancelar quando quiser.

### **Posso anexar comprovante (nota fiscal, foto)?**
Sim, **apenas Premium e PRO**. Até 5MB (JPG, PNG, PDF). Anexa na criação/edição da transação.

### **Como excluir uma transação parcelada?**
Exclui a **transação principal** → **todas as parcelas futuras são canceladas automaticamente**. Parcelas já passadas (confirmadas) ficam.

### **O que acontece se eu editar uma transação antiga?**
Saldo da conta é **recalculado automaticamente** desde aquela data até hoje. Faturas, orçamentos e relatórios atualizam na hora.

### **Limite de 50 transações/mês no Free — conta transferência?**
Sim. **Todas** transações contam (despesa, receita, transferência). Parcelas futuras agendadas **não contam** até virarem confirmadas.

---

## 🏦 Contas e Saldos

### **Quantas contas posso ter?**
| Plano | Limite |
|-------|--------|
| Free | 3 |
| Premium | 10 |
| PRO | Ilimitado |

### **O que é "Conta Principal"?**
A conta **padrão** pré-selecionada ao criar transações rápidas. Só pode ter **uma** por vez. Marque na edição da conta.

### **Posso excluir uma conta com transações?**
**Não.** Primeiro mova as transações para outra conta (edite cada uma) ou exclua as transações. Depois exclua a conta.

### **Como o saldo é calculado?**
`Saldo Atual = Saldo Inicial + Receitas - Despesas - Transferências enviadas + Transferências recebidas`
- Atualiza **em tempo real** a cada transação
- **Saldo Consolidado** (dashboard) = soma de TODAS as suas contas

### **Posso ter contas em moeda estrangeira?**
**Não na v1**. Apenas **BRL (Real)**. Moedas estrangeiras previstas para versão futura.

---

## 💳 Cartões de Crédito

### **Como o app calcula a fatura?**
**Período**: do dia **após o fechamento anterior** até o **fechamento atual**.
- Ex: Fechamento dia 15 → Fatura de 16/07 a 15/08 vence dia 10/09
- **Parcelas**: cada parcela vai na fatura do mês **daquela parcela**, não da compra original

### **O que é "Limite Disponível"?**
`Limite Disponível = Limite Total - Fatura Atual (não paga)`
- Atualiza em tempo real conforme registra despesas no cartão

### **Como pago a fatura no app?**
Na tela do cartão → aba Faturas → clique na fatura aberta → **"Pagar Fatura"**
- Cria uma **despesa** na conta vinculada ao cartão
- Fatura muda para "Paga"
- Limite disponível volta ao total

### **Quantos cartões posso cadastrar?**
| Plano | Limite |
|-------|--------|
| Free | 2 |
| Premium | 5 |
| PRO | Ilimitado |

### **O app sincroniza com o banco (Open Banking)?**
**Não na v1**. Entrada manual. Sincronização bancária via Open Banking/APIs prevista para versão futura.

---

## 📊 Orçamentos

### **Como funciona o alerta de orçamento?**
- **80%**: Notificação in-app "Orçamento X em 80%"
- **100%**: Notificação "Orçamento X estourou!"
- **Não impede** registrar mais despesas — só avisa

### **O orçamento zera sozinho todo mês?**
Sim! **Virada do mês zera automaticamente**. Pode clicar em "Copiar mês anterior" para replicar rápido.

### **Posso ter orçamento para "Todas as despesas"?**
Não. Orçamento é **por categoria**. Para controle geral, use o "Fluxo de Caixa" no dashboard/relatórios.

---

## 🎯 Metas Financeiras

### **Como o progresso da meta é calculado?**
**Automaticamente** pelo **saldo da conta vinculada**.
- Se meta = R$ 10.000 e conta vinculada tem R$ 4.000 → 40%
- Também pode editar manualmente o "Valor Atual" da meta

### **O que acontece quando atinjo 100%?**
App mostra **parabéns** 🎉 + notificação + sugere criar nova meta. Meta fica status "Concluída".

### **Posso pausar uma meta?**
Sim. Botão "Pausar" → status "Pausada" → para de contar progresso. Depois "Retomar".

---

## 📈 Relatórios

### **Quais relatórios tenho no Free?**
- ✅ Fluxo de Caixa (Receitas vs Despesas por mês)
- ✅ Despesas por Categoria (pizza/barras)

### **O que ganho no Premium/PRO?**
| Relatório | Premium | PRO |
|-----------|---------|-----|
| Evolução do Patrimônio | ✅ | ✅ |
| Comparativo Mensal | ✅ | ✅ |
| Despesas por Cartão | ✅ | ✅ |
| Projeção de Saldo (IA) | ❌ | ✅ |
| Relatório Personalizado (filtros avançados, export PDF) | ❌ | ✅ |

### **Posso exportar para Excel/PDF?**
- **Premium**: PDF/CSV nos relatórios básicos
- **PRO**: PDF/CSV em **todos** os relatórios (incluindo personalizado)
- **Free**: Não

---

## 🔔 Notificações

### **Quais notificações existem?**
| Tipo | Quando | Canal |
|------|--------|-------|
| Conta a pagar | 3 dias antes | Push + In-App |
| Fatura vencendo | 5 dias antes | Push + In-App |
| Orçamento 80% | Atinge 80% | In-App |
| Orçamento 100% | Atinge 100% | In-App |
| Meta atingida | 100% | Push + In-App |
| Backup concluído | Automático | In-App |
| Pagamento falhou | Webhook Asaas | In-App + E-mail |

### **Push notifications funcionam no Free?**
**Não**. Apenas **Premium e PRO** (requer permissão do navegador + service worker PWA).

### **E-mails transacionais funcionam no Free?**
**Sim**. Todos os planos recebem e-mails (confirmação, recuperação senha, falha pagamento, etc).

### **Como desativo notificações?**
Configurações → Notificações → ligue/desligue cada tipo individualmente.

---

## 💾 Backup e Restauração

### **Backup está disponível no Free?**
**Não**. Apenas **Premium** (manual) e **PRO** (manual + automático diário).

### **O que entra no backup?**
✅ Contas, transações, categorias, cartões, orçamentos, metas, configurações
❌ Senhas, tokens, logs de auditoria, **dados de outros membros do workspace**

### **O backup é criptografado?**
Sim! **AES-256-GCM** (padrão bancário). Opcional: senha extra na criação do backup manual.

### **Como funciona o backup automático (PRO)?**
- Todo dia **às 3h da manhã**
- Criptografado, salvo no storage
- Mantém **1 por mês** (apaga > 90 dias)
- Notifica o Master quando pronto

### **Restaurar backup apaga meus dados atuais?**
**SIM!** ⚠️ **Substitui TUDO** pelos dados do backup.
- Antes de restaurar: **backup automático "pre-restore"** é criado (segurança)
- Se falhar no meio: **rollback automático** (volta como era)
- Digite **"RESTAURAR"** (maiúsculo) para confirmar

### **Posso restaurar backup de outro workspace?**
**Não**. Backup é vinculado ao **workspace ID**. Tentar restaurar backup de outro workspace dá erro.

### **Perco dados se cancelar a assinatura?**
- **90 dias**: dados mantidos, acesso somente leitura
- **Após 90 dias**: dados anonimizados e arquivados (restauráveis se tiver backup)
- **Reative nos 90 dias**: dados voltam integrais

---

## 👨‍👩‍👧‍👦 Família / Workspace

### **Como convido minha família?**
Apenas o **Master** (dono do workspace) pode convidar:
Configurações → Usuários → **Convidar Usuário** → e-mail + papel (Administrador ou Comum) + mensagem

### **Quais papéis existem?**
| Papel | Permissões |
|-------|------------|
| **Master** (você) | Tudo: gerencia usuários, assinatura, backups, vê tudo |
| **Administrador** | Gerencia membros, vê relatórios agregados, **não** mexe em assinatura/backup |
| **Comum** | Só vê e gerencia **seus próprios** dados (contas, transações, metas) |

### **Membros da família veem minhas transações?**
**Não por padrão**. Cada um vê **só o seu**.
- Master e Admins veem **métricas agregadas** (totais, não detalhes)
- Conta familiar compartilhada (sync real-time) prevista para versão futura

### **Quantos membros por plano?**
| Plano | Membros (incluindo você) |
|-------|--------------------------|
| Free | 1 (só você) |
| Premium | 3 |
| PRO | Ilimitado |

### **Posso remover um membro?**
- **Master**: pode remover qualquer um
- **Admin**: **não** pode remover (só ativar/desativar, alterar papel)
- Dados do membro removido ficam no workspace (arquivados)

---

## 💳 Assinatura e Pagamento

### **Como assino Premium/PRO?**
Configurações → Assinatura → Escolha plano → Mensal/Anual → Cartão/PIX/Boleto → Checkout Asaas (seguro)

### **Meus dados de cartão ficam no FinanceApp?**
**NUNCA**. Pagamento processado pelo **Asaas** (gateway homologado pelo Banco Central). Seus dados de cartão **não passam pelo nosso servidor** — tokenização direta no Asaas.

### **Qual a diferença Mensal vs Anual?**
- **Mensal**: cobrado todo mês, cancele quando quiser
- **Anual**: **~17% desconto** (paga 10 meses, leva 12). Cobrado uma vez ao ano. Cancele a renovação automática a qualquer momento.

### **Como faço upgrade/downgrade?**
Configurações → Assinatura → "Alterar plano" → escolhe novo → confirma.
- **Upgrade**: imediato, módulos liberados na hora, cobra diferença pro-rata
- **Downgrade**: dados preservados, recursos exclusivos ficam somente leitura, grace period 30 dias

### **O que é "Grace Period" (período de graça)?**
Ao fazer **downgrade**: 30 dias para **reativar o plano anterior** e manter acesso total aos dados excedentes. Após 30 dias: dados excedentes ficam arquivados (só leitura com upgrade).

### **Meu pagamento falhou. E agora?**
Asaas tenta cobrar novamente em **1, 3 e 7 dias**.
- **3 dias sem pagar**: módulos pagos bloqueados + notificação
- **10 dias sem sucesso**: assinatura cancelada
- **Dados sempre preservados** — só acesso bloqueado

### **Como cancelo a assinatura?**
Configurações → Assinatura → **Cancelar Assinatura** → confirma no modal.
- Acesso aos recursos pagos mantido até **fim do período pago**
- Depois: 90 dias somente leitura → arquivamento

### **Posso reativar depois de cancelar?**
Sim! **Nos 90 dias**: reativa → dados restaurados integrais.
**Após 90 dias**: precisa de backup para restaurar (dados anonimizados).

### **Como atualizo o cartão de crédito do pagamento?**
Configurações → Assinatura → "Atualizar método de pagamento" → novo checkout Asaas.

---

## 🔒 Segurança e Privacidade

### **Meus dados são seguros?**
- **Criptografia**: TLS 1.3 (transporte) + AES-256 (backup)
- **Senhas**: Hash bcrypt (nunca armazenamos senha em texto)
- **Autenticação**: JWT (access + refresh tokens), expiração curta
- **Banco**: PostgreSQL com prepared statements (previne SQL injection)
- **LGPD**: Conforme Lei Geral de Proteção de Dados (Brasil)

### **Vocês vendem meus dados?**
**NUNCA**. Seu dado é seu. Não vendemos, não compartilhamos com terceiros para marketing. Apenas processadores essenciais (Asaas para pagamento, provedor de e-mail, cloud hosting) sob contrato de proteção de dados.

### **Posso exportar TODOS meus dados?**
Sim! Configurações → Dados e Privacidade → **Exportar meus dados** (JSON/CSV). Todos os planos.

### **Como peço exclusão da minha conta (LGPD)?**
Configurações → Dados e Privacidade → **Solicitar exclusão**.
- Confirmação por e-mail
- Dados excluídos em até 30 dias (exceto obrigações legais: logs de auditoria, backups criptografados por 90 dias)
- **Irreversível** após confirmação final

### **O que é 2FA (autenticação de dois fatores)?**
**Em breve**. Camada extra: senha + código no app autenticador (Google Authenticator, Authy) ou SMS.

---

## 🐛 Problemas Comuns

### **App não carrega / tela branca**
1. Force refresh: `Ctrl/Cmd + Shift + R`
2. Limpe cache do navegador
3. Tente modo anônimo/privado
4. Se persistir: suporte@financeapp.com.br

### **Transação não salvou / erro 500**
1. Verifique conexão
2. Tente novamente
3. Se erro persistir: anote horário + o que fazia → suporte

### **Saldo da conta não bate**
1. Verifique se tem transações **não confirmadas** (agendadas/recorrentes futuras)
2. Confira se **todas** contas estão criadas
3. Transferências: confira se criou nos dois lados (app faz automático, mas confira)
4. Ainda errado: suporte com print do extrato real vs app

### **Notificação push não chega**
1. Verifique se deu permissão no navegador (ícone de cadeado na barra de endereço)
2. Configurações → Notificações → veja se tipo está ligado
3. Premium/PRO apenas
4. Mobile: verifique "Não perturbe" / modo foco do sistema

### **Backup não baixa / arquivo corrompido**
1. Tente navegador diferente
2. Desative bloqueador de pop-up/download
3. Se arquivo `.json.enc` não abre: é criptografado — use "Restaurar Backup" no app
4. Se erro de checksum: arquivo corrompido no download → refaça backup

### **Convite para familiar não chega**
1. Peça para ver **spam/lixo eletrônico**
2. Reenvie convite (Configurações → Usuários → reenviar)
3. E-mail digitado correto?
4. Se nada: suporte

---

## 📞 Suporte

| Plano | Canal | Tempo de Resposta |
|-------|-------|-------------------|
| **Free** | Comunidade (GitHub Discussions / Discord) | Melhor esforço |
| **Premium** | E-mail: suporte@financeapp.com.br | ≤ 24h úteis |
| **PRO** | E-mail prioritário + WhatsApp Business | ≤ 4h úteis |

**Horário comercial**: Seg-Sex, 9h-18h (BRT)

**Antes de contatar**: verifique este FAQ, a Central de Ajuda (menu → Ajuda) e tente reiniciar o app.

---

## 🗓️ Roadmap (O que vem por aí)

| Funcionalidade | Previsão |
|----------------|----------|
| Sincronização bancária (Open Banking) | Q1 2027 |
| Assistente financeiro com IA | Q2 2027 |
| Investimentos e patrimônio completo | Q3 2027 |
| Contas compartilhadas (sync real-time familiar) | Q3 2027 |
| Exportação para Declaração de IR | Q4 2027 |
| Gamificação (conquistas, rankings) | 2028 |
| App nativo (React Native iOS/Android) | 2028 |
| Integração Pix/Boletos direta | Q1 2027 |

> Vote em funcionalidades: GitHub Discussions → "Feature Requests"

---

*Não achou sua dúvida? mande para **faq@financeapp.com.br** — adicionamos na próxima atualização!*