// Example User Profiles for Each Plan
// These demonstrate how users would appear in the system

export const EXAMPLE_USERS = {
  // ===== FREE PLAN USER =====
  freeUser: {
    id: 'usr_free_001',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    role: 'member',
    globalRole: 'user',
    workspaceId: 'ws_free_001',
    onboardingCompleted: true,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    
    // Plan info
    workspace: {
      id: 'ws_free_001',
      name: 'Finanças Pessoais do João',
      plan: 'free',
      createdAt: '2024-01-15T10:30:00Z',
    },
    
    // Current usage (what they've created)
    usage: {
      accounts: 3,        // MAX: 3 (at limit)
      transactionsThisMonth: 18,  // MAX: 20
      cards: 1,           // MAX: 1 (at limit)
      budgets: 1,         // MAX: 1 (at limit)
      goals: 1,           // MAX: 1 (at limit)
      users: 1,           // MAX: 1 (at limit - just themselves)
    },
    
    // What they CAN do
    can: {
      createAccount: false,      // At limit (3/3)
      createCard: false,         // At limit (1/1)
      createBudget: false,       // At limit (1/1)
      createGoal: false,         // At limit (1/1)
      createTransaction: true,   // 18/20 transactions
      inviteUser: false,         // At limit (1/1)
      exportPDF: false,          // Not available
      exportExcel: false,        // Not available
      useAPI: false,             // Not available
      autoBackup: false,         // Not available
    },
    
    // What they see in UI
    uiBadges: [
      '⚠️ Contas: 3/3 - Limite atingido',
      '💳 Cartão: 1/1 - Limite atingido',
      '📊 Orçamento: 1/1 - Limite atingido',
      '🎯 Meta: 1/1 - Limite atingido',
      '👤 Usuário: 1/1 - Somente você',
      '📄 Relatórios: Básicos (sem PDF/Excel)',
    ],
    
    // Upgrade prompts they'd see
    upgradePrompts: [
      'Precisa de mais contas? Faça upgrade para Premium',
      'Quer adicionar seu cônjuge? Premium permite 2 usuários',
      'Precisa de relatórios em PDF? Disponível no Premium',
    ],
  },

  // ===== PREMIUM PLAN USER =====
  premiumUser: {
    id: 'usr_premium_001',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    role: 'admin',
    globalRole: 'user',
    workspaceId: 'ws_premium_001',
    onboardingCompleted: true,
    isActive: true,
    createdAt: '2024-02-20T14:00:00Z',
    
    workspace: {
      id: 'ws_premium_001',
      name: 'Finanças da Família Santos',
      plan: 'premium',
      createdAt: '2024-02-20T14:00:00Z',
    },
    
    usage: {
      accounts: 7,           // Unlimited
      transactionsThisMonth: 156,  // Unlimited
      cards: 4,              // Unlimited
      budgets: 8,            // Unlimited
      goals: 5,              // Unlimited
      users: 2,              // MAX: 2 (Maria + spouse)
    },
    
    can: {
      createAccount: true,
      createCard: true,
      createBudget: true,
      createGoal: true,
      createTransaction: true,
      inviteUser: false,     // At limit (2/2 - Maria + spouse)
      exportPDF: true,       // Available
      exportExcel: true,     // Available
      useAPI: false,         // Pro only
      autoBackup: false,     // Pro only
    },
    
    uiBadges: [
      '✅ Contas: 7 (ilimitado)',
      '💳 Cartões: 4 (ilimitado)',
      '📊 Orçamentos: 8 (ilimitado)',
      '🎯 Metas: 5 (ilimitado)',
      '👥 Usuários: 2/2 - Limite atingido',
      '📄 Relatórios: Completos + PDF + Excel',
      '💡 Insights: Automáticos',
    ],
    
    upgradePrompts: [
      'Quer adicionar mais familiares? Pro permite usuários ilimitados',
      'Precisa de backup automático diário? Disponível no Pro',
      'Quer acesso via API? Disponível no Pro',
    ],
  },

  // ===== PRO PLAN USER =====
  proUser: {
    id: 'usr_pro_001',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    role: 'master',
    globalRole: 'admin',
    workspaceId: 'ws_pro_001',
    onboardingCompleted: true,
    isActive: true,
    createdAt: '2024-03-10T09:15:00Z',
    
    workspace: {
      id: 'ws_pro_001',
      name: 'Oliveira Family Office',
      plan: 'pro',
      createdAt: '2024-03-10T09:15:00Z',
    },
    
    usage: {
      accounts: 15,          // Unlimited
      transactionsThisMonth: 892,  // Unlimited
      cards: 8,              // Unlimited
      budgets: 12,           // Unlimited
      goals: 10,             // Unlimited
      users: 6,              // Unlimited (Carlos + wife + 3 kids + accountant)
    },
    
    can: {
      createAccount: true,
      createCard: true,
      createBudget: true,
      createGoal: true,
      createTransaction: true,
      inviteUser: true,      // Unlimited
      exportPDF: true,
      exportExcel: true,
      useAPI: true,          // Pro only
      autoBackup: true,      // Pro only (daily)
    },
    
    uiBadges: [
      '✅ Contas: 15 (ilimitado)',
      '💳 Cartões: 8 (ilimitado)',
      '📊 Orçamentos: 12 (ilimitado)',
      '🎯 Metas: 10 (ilimitado)',
      '👨‍👩‍👧‍👦 Usuários: 6 (família + contador)',
      '📄 Relatórios: Completos + PDF + Excel',
      '💡 Insights: Automáticos + IA',
      '🔧 API: Acesso disponível',
      '☁️ Backup: Automático diário',
      '🛡️ Suporte: Prioritário 24/7',
    ],
    
    upgradePrompts: [], // No upgrade needed
  },
};

// Example of what happens when each tries to exceed limits
export const LIMIT_SCENARIOS = {
  freeUserTriesToCreate4thAccount: {
    user: 'joao.silva@email.com',
    action: 'createAccount',
    currentCount: 3,
    limit: 3,
    result: 'BLOCKED',
    error: 'Plano gratuito permite até 3 contas. Faça upgrade para remover limites.',
    upgradeSuggestion: 'Premium - Contas ilimitadas por R$ 19,90/mês',
  },
  
  premiumUserTriesToInvite3rdUser: {
    user: 'maria.santos@email.com',
    action: 'inviteUser',
    currentCount: 2,
    limit: 2,
    result: 'BLOCKED',
    error: 'Plano Premium permite até 2 usuários. Faça upgrade para remover limites.',
    upgradeSuggestion: 'Pro - Usuários da família ilimitados por R$ 39,90/mês',
  },
  
  proUserInvitesAccountant: {
    user: 'carlos.oliveira@email.com',
    action: 'inviteUser',
    currentCount: 6,
    limit: Infinity,
    result: 'SUCCESS',
    invitedUser: {
      name: 'Roberto Contador',
      email: 'roberto@contabilidade.com',
      role: 'member',
      permissions: ['view_reports', 'export_data'],
    },
  },
};

// Plan comparison for UI display
export const PLAN_COMPARISON = {
  free: {
    name: 'Gratuito',
    price: 0,
    monthlyPrice: 'R$ 0,00',
    color: 'gray',
    limits: {
      accounts: 3,
      transactions: 20,
      cards: 1,
      budgets: 1,
      goals: 1,
      users: 1,
    },
    features: [
      'Dashboard básico',
      'Até 3 contas',
      '20 transações/mês',
      '1 cartão',
      '1 orçamento',
      '1 meta',
      'Relatórios básicos',
      '1 usuário',
      'Suporte normal',
    ],
    missing: [
      'Sem relatórios PDF/Excel',
      'Sem categorias personalizadas',
      'Sem insights automáticos',
      'Sem backup automático',
      'Sem API',
    ],
  },
  
  premium: {
    name: 'Premium',
    price: 19.90,
    monthlyPrice: 'R$ 19,90',
    color: 'yellow',
    badge: 'Mais popular',
    limits: {
      accounts: Infinity,
      transactions: Infinity,
      cards: Infinity,
      budgets: Infinity,
      goals: Infinity,
      users: 2,
    },
    features: [
      'Tudo do Gratuito',
      'Contas ilimitadas',
      'Transações ilimitadas',
      'Categorias personalizadas',
      'Cartões ilimitados',
      'Orçamentos ilimitados',
      'Metas ilimitadas',
      'Relatórios completos',
      'Exportação PDF + Excel',
      'Insights automáticos',
      '2 usuários (casal)',
      'Gestão compartilhada',
      'Configurações avançadas',
      'Suporte prioritário',
    ],
    missing: [
      'Máximo 2 usuários',
      'Sem backup automático',
      'Sem acesso API',
      'Sem gestão familiar avançada',
    ],
  },
  
  pro: {
    name: 'Pro',
    price: 39.90,
    monthlyPrice: 'R$ 39,90',
    color: 'purple',
    badge: 'Para famílias',
    limits: {
      accounts: Infinity,
      transactions: Infinity,
      cards: Infinity,
      budgets: Infinity,
      goals: Infinity,
      users: Infinity,
    },
    features: [
      'Tudo do Premium',
      'Usuários da família ilimitados',
      'Gestão familiar completa',
      'Backup automático diário',
      'Acesso à API',
      'Relatórios completos + PDF',
      'Insights automáticos com IA',
      'Contas ilimitadas',
      'Transações ilimitadas',
      'Cartões ilimitados',
      'Orçamentos ilimitados',
      'Metas ilimitadas',
      'Configurações avançadas',
      'Suporte prioritário 24/7',
    ],
    missing: [],
  },
};