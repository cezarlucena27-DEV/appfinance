# Políticas do FinanceApp — Termos, Privacidade, Cancelamento e LGPD

> **Versão 1.0** | **Vigência: Agosto 2026** | Leitura estimada: 15 min

---

## Sumário

1. [Termos de Uso](#1-termos-de-uso)
2. [Política de Privacidade e Proteção de Dados (LGPD)](#2-política-de-privacidade-e-proteção-de-dados-lgpd)
3. [Política de Cancelamento, Reembolso e Retenção](#3-política-de-cancelamento-reembolso-e-retenção)
4. [Política de Uso Aceitável](#4-política-de-uso-aceitável)
5. [Acordo de Nível de Serviço (SLA)](#5-acordo-de-nível-de-serviço-sla)
6. [Contato e Encarregado de Dados (DPO)](#6-contato-e-encarregado-de-dados-dpo)

---

## 1. Termos de Uso

### 1.1 Aceitação
Ao criar conta ou usar o FinanceApp ("Serviço"), você ("Usuário") concorda com estes Termos, a Política de Privacidade e a Política de Cancelamento. Se não concorda, **não use o Serviço**.

### 1.2 Descrição do Serviço
O FinanceApp é uma plataforma SaaS de gestão financeira pessoal/familiar com:
- Controle de despesas, receitas, contas, cartões, orçamentos, metas
- Relatórios e dashboards
- Sistema de backup/restore criptografado
- Workspace multi-usuário (Master, Admin, Comum)
- Planos Free, Premium, PRO com limites progressivos
- Integração de pagamento via Asaas (gateway homologado BACEN)

### 1.3 Elegibilidade
- **Idade mínima**: 18 anos (ou 16 com assistência legal)
- **Capacidade civil**: Plena capacidade para contratar
- **Localização**: Residente no Brasil (pagamentos em BRL, LGPD aplicável)
- **Uso lícito**: Apenas para fins pessoais/familiares/pequeno empreendedorismo

### 1.4 Conta e Workspace
- Cada cadastro cria **um Workspace** com **um Master** (dono)
- Master convida membros (Admin/Comum) — limites por plano
- **Você é responsável** por: senha, convites, dados inseridos, conformidade LGPD dos membros
- **Não compartilhe** seu login. Use convites para dar acesso.

### 1.5 Planos e Assinatura

| Plano | Valor Mensal | Valor Anual | Principais Diferenças |
|-------|--------------|-------------|----------------------|
| **Free** | R$ 0,00 | R$ 0,00 | Limites básicos, sem backup, sem relatórios avançados |
| **Premium** | R$ 14,90 | R$ 149,90 (2 meses grátis) | Ilimitado básico, backup manual, relatórios avançados, 3 membros |
| **PRO** | R$ 29,90 | R$ 299,90 (2 meses grátis) | Tudo ilimitado, backup automático, projeção IA, membros ilimitados |

**Regras de Assinatura:**
- Cobrança **recorrente** (mensal ou anual) via Asaas
- **Upgrade**: Imediato, pro-rata, módulos liberados na hora
- **Downgrade**: Próximo ciclo, grace period 30 dias, dados excedentes só leitura
- **Cancelamento**: Fim do período pago, 90 dias retenção somente leitura
- **Inadimplência**: 3 dias → bloqueio módulos pagos; 10 dias → cancelamento automático
- **Sem reembolso** por período não usado (exceto lei consumerista 7 dias para assinatura anual — ver seção 3)

### 1.6 Pagamentos via Asaas
- Processador: **Asaas** (Instituição de Pagamento homologada BACEN)
- **Nós NUNCA recebemos/armazenamos** dados de cartão de crédito
- Tokenização direta no Asaas (PCI DSS Level 1)
- Métodos: Cartão, PIX, Boleto
- Comprovantes: Emitidos pelo Asaas (NF-e quando aplicável)

### 1.7 Propriedade Intelectual
- **Seus dados**: São seus. Você concede licença para processarmos (backup, relatórios, sync)
- **Nosso código/design**: Propriedade do FinanceApp. Não pode copiar, engenharia reversa, competir
- **Feedback**: Sugestões viram nossa propriedade (sem compensação)

### 1.8 Isenção de Responsabilidade
**O FinanceApp NÃO é:**
- Instituição financeira, banco, corretora
- Consultor financeiro, contábil, tributário, jurídico
- Garantidor de precisão de cálculos (você confere com extratos reais)

**Não nos responsabilizamos por:**
- Decisões financeiras baseadas no app
- Erros de digitação do usuário
- Falhas de internet, energia, dispositivo
- Atrasos/falhas de terceiros (Asaas, provedor cloud, e-mail)
- Perda de dados se **você não fez backup** (Free não tem backup)

### 1.9 Limitação de Responsabilidade
Máxima: **Valor pago nos últimos 12 meses** (ou R$ 100 se Free).
Não cobrimos: danos indiretos, lucros cessantes, danos morais (exceto dolo/culpa grave).

### 1.10 Vigência e Rescisão
- **Prazo indeterminado** enquanto usar
- **Você rescinde**: Cancelando assinatura + excluindo conta
- **Nós rescindimos**: Violação grave, inatividade > 1 ano (Free), ordem judicial
- **Efeito**: Acesso cortado, dados retidos 90 dias → arquivamento

### 1.11 Alterações nos Termos
- Notificamos **30 dias antes** (e-mail + in-app)
- Continuar usando = aceita novos termos
- Discorda? Exporte dados e cancele antes da vigência

### 1.12 Lei Aplicável e Foro
- **Lei brasileira** (LGPD, CDC, Marco Civil, Lei de Pagamentos)
- **Foro**: Comarca de São Paulo/SP (exceto consumidor: foro do domicílio)

---

## 2. Política de Privacidade e Proteção de Dados (LGPD)

### 2.1 Controlador e Encarregado
- **Controlador**: FinanceApp Tecnologia Ltda. (CNPJ fictício para doc)
- **Encarregado (DPO)**: Lucas Silva — **dpo@financeapp.com.br**

### 2.2 Dados Coletados

| Categoria | Exemplos | Finalidade | Base Legal (LGPD Art. 7º) |
|-----------|----------|------------|---------------------------|
| **Identificação** | Nome, e-mail, foto, Google ID | Autenticação, perfil, convites | Consentimento (I) / Contrato (V) |
| **Autenticação** | Hash senha, tokens JWT, refresh tokens | Segurança, sessão | Contrato (V) / Legítimo (IX) |
| **Financeiros (seus)** | Transações, contas, cartões, saldos, orçamentos, metas, categorias, anexos | Core do serviço | Contrato (V) / Consentimento (I) |
| **Financeiros (outros membros)** | Mesmo acima, de outros usuários do workspace | Gestão familiar/workspace | Contrato (V) / Legítimo (IX) |
| **Assinatura/Pagamento** | Plano, status, Asaas customer ID, histórico cobranças (sem dados cartão) | Cobrança, acesso módulos | Contrato (V) / Obrigação legal (II) |
| **Técnicos/Logs** | IP, user-agent, timestamps, audit logs, erros | Segurança, debug, compliance | Legítimo (IX) / Obrigação legal (II) |
| **Preferências** | Tema, idioma, notificações ligadas/desligadas | UX, comunicação | Consentimento (I) / Legítimo (IX) |

**NÃO coletamos:** Dados sensíveis (Art. 11 LGPD) — origem racial, opinião política, religião, saúde, vida sexual, biométricos, filiação sindical.

### 2.3 Finalidades do Tratamento
1. **Prestação do serviço** (core): CRUD financeiro, relatórios, backup, sync
2. **Gestão de conta**: Auth, recuperação senha, convites, roles
3. **Cobrança/Assinatura**: Asaas webhooks, liberação módulos, faturas
4. **Comunicação**: Transacionais (confirmação, alertas, falhas), marketing (opt-in)
5. **Segurança**: Rate limit, audit log, detecção fraude, backup criptografado
6. **Melhoria**: Analytics anonimizado, performance, bug tracking
7. **Legal**: LGPD (acesso, exclusão, portabilidade), obrigações fiscais/contábeis

### 2.4 Compartilhamento de Dados

| Destinatário | Dados Compartilhados | Finalidade | Base Legal | Safeguards |
|--------------|---------------------|------------|------------|------------|
| **Asaas** | Nome, e-mail, CPF, plano, valor, customer ID | Processar pagamentos, webhooks | Contrato (V) / Obrigação (II) | DPA assinado, PCI DSS, LGPD compliant |
| **Provedor Cloud (AWS/GCP/Azure)** | Todos (armazenamento) | Hospedagem, banco, Redis, storage | Contrato (V) | DPA, ISO 27001, SOC 2, criptografia at rest |
| **Provedor E-mail (SendGrid/SMTP)** | E-mail, nome, conteúdo transacional | Enviar e-mails | Contrato (V) | DPA, TLS, opt-out links |
| **Google OAuth** | Nome, e-mail, foto (se login Google) | Autenticação social | Consentimento (I) | Google Privacy Policy |
| **Autoridades** | Dados solicitados | Ordem judicial, ANPD, BACEN | Obrigação legal (II) | Apenas o estritamente necessário |

**NÃO vendemos, alugamos ou compartilhamos para marketing de terceiros.**

### 2.5 Transferência Internacional
- Servidores **no Brasil** (região São Paulo) — preferencial
- Se subprocessador fora do BR: **Cláusulas Contratuais Padrão (SCC)** + adequação ANPD
- Google/Asaas podem processar fora — ambos com adequação LGPD

### 2.6 Retenção e Exclusão

| Dado | Período de Retenção | Pós-Período |
|------|---------------------|-------------|
| **Dados ativos (conta ativa)** | Enquanto conta ativa + 90 dias pós-cancelamento | Anonimização + arquivamento criptografado |
| **Backups (manual/auto)** | Conforme plano: Free (não tem) / Premium (manual, você apaga) / PRO (auto: 1/mês, >90d apaga) | Exclusão segura (shred) |
| **Logs de auditoria** | 5 anos (obrigação legal Art. 10 LGPD + contabilidade) | Exclusão segura |
| **Dados de pagamento (Asaas)** | Conforme Asaas (mínimo 5 anos fiscal) | Responsabilidade Asaas |
| **E-mails transacionais** | 2 anos (compliance) | Exclusão |
| **Dados anonimizados** | Indefinido (estatísticas agregadas, não identificáveis) | Não se aplica |

**Anonimização irreversível**: Remove IDs diretos, generaliza datas (mês/ano), agrega valores, remove textos livres.

### 2.7 Seus Direitos (LGPD Art. 18)

| Direito | Como Exercer | Prazo |
|---------|--------------|-------|
| **Confirmação/ Acesso** | Configurações → Exportar dados (JSON/CSV) | Imediato (auto) / 15 dias (manual) |
| **Correção** | Edite no app (perfil, transações, contas) | Imediato |
| **Anonimização/Bloqueio/Eliminação desnecessários** | Solicite via e-mail DPO | 15 dias |
| **Portabilidade** | Exportar dados (JSON/CSV) | Imediato (auto) |
| **Eliminação (direito ao esquecimento)** | Configurações → Solicitar exclusão → confirmação e-mail | 30 dias (processamento) |
| **Informação sobre compartilhamento** | Esta política + solicite detalhes ao DPO | 15 dias |
| **Revogação consentimento** | Desative notificações marketing / revogue OAuth Google | Imediato |
| **Oposição** | Contate DPO para tratamento baseado em legítimo interesse | 15 dias |
| **Revisão decisão automatizada** | Não temos decisões puramente automatizadas com efeito legal | N/A |

**Exceções**: Não podemos apagar logs de auditoria, backups criptografados (até expiração), dados de pagamento (obrigação fiscal), dados de outros membros do workspace (eles controlam os próprios).

### 2.8 Segurança da Informação

**Medidas Técnicas:**
- **Criptografia em trânsito**: TLS 1.3 (HTTPS forçado, HSTS)
- **Criptografia em repouso**: AES-256 (banco, storage, backups)
- **Senhas**: bcrypt (cost 12), nunca logadas, nunca em texto
- **Tokens**: JWT RS256, access 15min + refresh 30d (rotação, revogação)
- **Backups**: AES-256-GCM + senha opcional do usuário (PBKDF2 100k iterações)
- **Banco**: PostgreSQL, prepared statements (anti-SQLi), RLS (row-level security) por workspace
- **Rate limiting**: Por IP e por usuário (configurável)
- **Headers de segurança**: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Dependências**: Audit semanal (npm audit, Snyk), atualizações de segurança em 48h

**Medidas Organizacionais:**
- Acesso mínimo necessário (princípio least privilege)
- Logs de acesso a produção (auditoria)
- Plano de resposta a incidentes (testado semestralmente)
- Treinamento LGPD/Segurança da equipe (anual)
- DPA com todos subprocessadores
- Backup testado (restore testado trimestralmente no PRO)

### 2.9 Incidentes de Segurança (Vazamento)
1. **Detecção**: Alertas automáticos + monitoramento
2. **Contenção**: Isolamento, revogação tokens, rotação chaves
3. **Avaliação**: Gravidade, dados afetados, riscos aos titulares
4. **Notificação ANPD**: Até **2 dias úteis** (Art. 48 LGPD) se risco relevante
5. **Notificação Titulares**: E-mail + in-app em até **5 dias úteis** se risco alto
6. **Remediação**: Correção causa raiz, melhoria controles
7. **Registro**: Documentação completa para auditoria

### 2.10 Cookies e Tecnologias Similares

| Tipo | Finalidade | Consentimento |
|------|------------|---------------|
| **Essenciais (session, auth, csrf)** | Login, segurança, carrinho checkout | Não (legítimo interesse) |
| **Preferências (theme, locale)** | UX personalizada | Sim (banner) |
| **Analytics (anônimo, Plausible/Umami)** | Métricas uso agregado | Sim (banner) |
| **Marketing (pixel, se houver)** | Retargeting | Sim (opt-in explícito) |

**Gerencie**: Banner no primeiro acesso → Configurações → Privacidade → Cookies

### 2.11 Crianças e Adolescentes
- **Não direcionado a menores de 18**
- Se detectarmos < 18 sem assistência: bloqueio + exclusão em 30 dias
- Pais/responsáveis: contate DPO para exercer direitos do menor

---

## 3. Política de Cancelamento, Reembolso e Retenção

### 3.1 Cancelamento por Vontade do Usuário

**Como cancelar:**
1. Configurações → Assinatura → **Cancelar assinatura**
2. Confirma no modal (mostra o que perde, retenção 90 dias)
3. Digita "CANCELAR" → confirma

**Efeitos:**
| Momento | Acesso a Recursos Pagos | Seus Dados |
|---------|------------------------|------------|
| **Imediato** | Mantido até fim do período pago | Intactos, editáveis |
| **Fim do período pago** | **Bloqueado** (módulos pagos = só leitura) | Intactos, só leitura |
| **90 dias pós-fim** | Bloqueado | **Arquivados** (anônimos, criptografados) |
| **Após 90 dias** | Bloqueado | **Restaurável apenas via backup** que você guardou |

**Reativação nos 90 dias:** 1 clique → dados restaurados integrais + assinatura reativada.

### 3.2 Cancelamento por Inadimplência (Auto)

| Dia | Evento |
|-----|--------|
| D+0 | Pagamento falha (cartão recusado, PIX não pago, boleto vencido) |
| D+1, D+3, D+7 | Asaas retry automático |
| D+3 | Módulos pagos **bloqueados** + notificação Master |
| D+10 | Assinatura **cancelada** automaticamente |
| D+10 a D+100 | 90 dias retenção somente leitura |
| D+100+ | Arquivamento/anonymização |

**Para reverter:** Atualize pagamento em Configurações → Assinatura antes de D+10.

### 3.3 Reembolso (Direito de Arrependimento - CDC Art. 49)

**Aplicável APENAS para assinatura ANUAL (contratação fora do estabelecimento):**
- **Prazo**: **7 dias corridos** a partir da contratação/renovação anual
- **Condição**: Não ter usado recursos PRO/Premium de forma substancial (backup, relatórios avançados, projeção IA)
- **Como pedir**: suporte@financeapp.com.br com assunto "Reembolso Arrependimento - [seu e-mail]"
- **Processamento**: 10 dias úteis → estorno no mesmo método (Asaas)
- **Valor**: 100% do valor anual pago
- **Após 7 dias ou plano mensal**: **Sem reembolso** (serviço prestado, uso contínuo)

**Não reembolsamos:**
- Planos mensais (uso contínuo, cancele a renovação)
- Período não usado no meio do ciclo (upgrade/downgrade pro-rata já ajustado)
- Taxas de gateway (PIX/boleto não têm estorno parcial automático)

### 3.4 Downgrade (Mudança para Plano Menor)

| Fase | O que acontece |
|------|----------------|
| **Solicitação** | Próximo ciclo de cobrança (ou imediato se trial) |
| **Grace Period (30 dias)** | Acesso TOTAL mantido. Pode reativar plano anterior 1 clique |
| **Após 30 dias** | Itens excedentes → **somente leitura/arquivados** |
| **Exemplo** | 8 contas no Premium → downgrade Free (limite 3) → 5 contas ficam só leitura após 30d |

**Dados NUNCA são deletados** por downgrade — apenas acesso à edição.

### 3.5 Upgrade (Mudança para Plano Maior)

- **Imediato**: Módulos liberados na hora
- **Cobrança**: Pro-rata (diferença proporcional aos dias restantes)
- **Ciclo**: Mantém data de cobrança original (alinha no próximo ciclo)
- **Anual → Anual superior**: Diferença cobrada pro-rata, nova data anual

### 3.6 Retenção de Dados Pós-Cancelamento/Exclusão

| Cenário | Dados Mantidos | Prazo | Ação Final |
|---------|----------------|-------|------------|
| **Cancelamento assinatura** | Todos (só leitura) | 90 dias | Anonimização + arquivamento criptografado |
| **Exclusão conta (LGPD)** | Logs auditoria, backups criptografados (até expiração), dados pagamento (fiscal) | Conforme tabela seção 2.6 | Exclusão segura (shred) |
| **Inatividade Free > 1 ano** | Todos | Notificação 30d antes → 90d retenção → arquivamento | Anonimização |
| **Ordem judicial/ANPD** | Conforme determinação | Conforme determinação | Conforme determinação |

**Backup do usuário**: Se você fez backup manual (Premium/PRO) e guardou — **você pode restaurar a qualquer momento**, independente de nossa retenção.

---

## 4. Política de Uso Aceitável

### 4.1 Proibições
**Você NÃO pode:**
- Usar para fins ilegais, fraudulentos, lavagem de dinheiro, evasão fiscal
- Inserir dados falsos intencionalmente para enganar terceiros (bancos, receita, sócios)
- Tentar acessar dados de outros workspaces (IDOR, enumeração, força bruta)
- Fazer engenharia reversa, decompilar, copiar código/design
- Sobrecarregar intencionalmente (DoS, scrapers agressivos, bots)
- Compartilhar login (use convites — cada pessoa sua conta)
- Usar para spam, phishing, malware, conteúdo ilegal
- Violar propriedade intelectual de terceiros no app

### 4.2 Conteúdo do Usuário
- **Você é dono** do que insere (transações, descrições, anexos)
- **Não moderamos** conteúdo financeiro privado (não lemos suas transações)
- **Podemos remover** se: ordem judicial, violação clara desta política, malware em anexo
- **Anexos**: Máx 5MB, JPG/PNG/PDF. Vírus → quarentena + notificação

### 4.3 Sanções
| Violação | Sanção |
|----------|--------|
| Leve (tentativa acesso indevido, rate limit) | Bloqueio temporário (15min a 24h), aviso |
| Média (dados falsos, compartilhamento login) | Suspensão 7-30 dias, notificação |
| Grave (fraude, ataque, ilegal) | **Banimento permanente**, retenção dados para autoridades, ação judicial |
| Reincidente | Escalação automática |

**Recurso**: contate suporte em até 10 dias. Análise em 5 dias úteis.

---

## 5. Acordo de Nível de Serviço (SLA)

### 5.1 Disponibilidade
| Plano | SLA Mensal | Crédito se Violado |
|-------|------------|-------------------|
| **Free** | Best effort (sem SLA) | N/A |
| **Premium** | **99,5%** (≤ 3,6h downtime/mês) | 10% da mensalidade |
| **PRO** | **99,9%** (≤ 43min downtime/mês) | 20% da mensalidade |

**Excluído do downtime:**
- Manutenção programada (aviso 48h, janela 02h-06h BRT domingo)
- Falhas de terceiros (Asaas, provedor cloud, DNS, internet do usuário)
- Força maior, caso fortuito

### 5.2 Suporte
| Plano | Canal | Tempo Resposta (úteis) |
|-------|-------|------------------------|
| Free | Comunidade (GitHub/Discord) | Best effort |
| Premium | E-mail | ≤ 24h |
| PRO | E-mail + WhatsApp | ≤ 4h (e-mail) / ≤ 2h (WhatsApp) |

### 5.3 Backup e Recuperação (PRO)
- **RPO (Recovery Point Objective)**: 24h (backup diário 3h)
- **RTO (Recovery Time Objective)**: ≤ 4h (restore testado)
- **Teste de restore**: Trimestral (automatizado + manual)

### 5.4 Monitoramento
- Uptime: Pingdom / UptimeRobot (público: status.financeapp.com.br)
- APM: Sentry (erros), Prometheus/Grafana (métricas)
- Alertas: PagerDuty (equipe plantão PRO)

---

## 6. Contato e Encarregado de Dados (DPO)

### 6.1 Canais Oficiais

| Assunto | E-mail | Telefone/WhatsApp |
|---------|--------|-------------------|
| **Suporte Geral** | suporte@financeapp.com.br | — |
| **Suporte Master/PRO** | master@financeapp.com.br | +55 11 99999-0001 (PRO apenas) |
| **Privacidade/LGPD/DPO** | **dpo@financeapp.com.br** | — |
| **Segurança/Vazamento** | security@financeapp.com.br | — |
| **Cobrança/Asaas** | billing@financeapp.com.br | — |
| **Imprensa/Parcerias** | press@financeapp.com.br | — |

### 6.2 Endereço (Sede)
FinanceApp Tecnologia Ltda.  
Av. Paulista, 1000 - 10º andar - Bela Vista  
São Paulo/SP - CEP 01310-100  
Brasil

### 6.3 Encarregado de Dados (DPO - Art. 41 LGPD)
**Lucas Silva**  
E-mail: **dpo@financeapp.com.br**  
Telefone: +55 11 3000-0001 (ramal DPO)  
Certificação: EXIN Privacy & Data Protection Essentials (PDPE)

### 6.4 Autoridade Nacional de Proteção de Dados (ANPD)
Caso não resolvamos sua reclamação de privacidade:
- **Site**: https://www.gov.br/anpd/pt-br
- **Canal do Titular**: https://www.gov.br/anpd/pt-br/canais_atendimento/canal-do-titular
- **E-mail**: titular@anpd.gov.br

---

## Anexos Referenciados

| Documento | Localização |
|-----------|-------------|
| Especificação Técnica Completa | `especificacao_tecnica_financeapp.md` |
| Manual do Usuário | `MANUAL_USUARIO.md` |
| Guia de Onboarding | `GUIA_ONBOARDING.md` |
| FAQ | `FAQ.md` |
| Guia do Usuário Master | `GUIA_MASTER.md` |

---

## Histórico de Versões

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | Agosto 2026 | Versão inicial (MVP) |

---

**Última atualização: 20 de Agosto de 2026**

*Ao usar o FinanceApp, você confirma ter lido, entendido e concordado com este documento. Se tem dúvidas, contate dpo@financeapp.com.br ANTES de prosseguir.*