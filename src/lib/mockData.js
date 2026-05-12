// src/lib/mockData.js
// Perfis de teste que funcionam sem nenhuma chave da AbacatePay.
// Agente 2 é o dono deste arquivo — não alterar aqui.

/** Wanderer — score esperado: 15
 *  Criou conta, tem produto, mas nada mais. Nunca gerou valor real.
 */
export const wanderer = {
  store: { name: 'Financa Soluções Ltda', createdAt: '2026-03-01' },
  products: [{ name: 'Plano Básico', price: 4900 }],
  customers: [],
  checkouts: [
    { status: 'PENDING', createdAt: '2026-04-10', amount: 4900 },
    { status: 'EXPIRED', createdAt: '2026-04-11', amount: 4900 },
  ],
  subscriptions: [],
  webhooks: [],
}

/** Almost There — score esperado: 45
 *  Tem produtos, clientes com taxId, checkouts pagos recentes.
 *  Falta webhook e assinatura ativa.
 */
export const almostThere = {
  store: { name: 'DevTools LTDA', createdAt: '2026-01-15' },
  products: [
    { name: 'Pro Monthly', price: 9900, cycle: 'MONTHLY' },
    { name: 'Pro Annual', price: 99000, cycle: 'ANNUALLY' },
  ],
  customers: [
    { email: 'joao@empresa.com', taxId: '123.456.789-00' },
    { email: 'maria@startup.com', taxId: null },
  ],
  checkouts: [
    { status: 'PAID', createdAt: '2026-04-20', amount: 9900 },
    { status: 'PAID', createdAt: '2026-05-01', amount: 99000 },
    { status: 'PENDING', createdAt: '2026-05-08', amount: 9900 },
  ],
  subscriptions: [],
  webhooks: [],
}

/** Power User — score esperado: ~90
 *  Usa tudo: webhooks configurados, múltiplas assinaturas ativas,
 *  clientes recorrentes e checkouts constantes.
 */
export const powerUser = {
  store: { name: 'SaaS Platform Pro', createdAt: '2025-11-10' },
  products: [
    { name: 'Enterprise Plan', price: 49900, cycle: 'MONTHLY' },
    { name: 'Starter Plan', price: 2900, cycle: 'MONTHLY' }
  ],
  customers: [
    { email: 'admin@corp.com', taxId: '11.222.333/0001-44' },
    { email: 'dev@tech.io', taxId: '55.666.777/0001-88' },
    { email: 'finance@shop.net', taxId: '99.888.777/0001-66' }
  ],
  checkouts: [
    { status: 'PAID', createdAt: '2026-05-09', amount: 49900 },
    { status: 'PAID', createdAt: '2026-05-10', amount: 2900 },
    { status: 'PAID', createdAt: '2026-05-11', amount: 2900 },
  ],
  subscriptions: [
    { status: 'ACTIVE', createdAt: '2026-02-15', nextBilling: '2026-06-15' },
    { status: 'ACTIVE', createdAt: '2026-03-20', nextBilling: '2026-06-20' }
  ],
  webhooks: [
    { url: 'https://api.saasplatform.com/webhooks/abacate', events: ['checkout.paid', 'subscription.active'] }
  ],
}

/** Churn Risk — score esperado: ~30
 *  Conta antiga, já teve assinantes e pagamentos,
 *  mas agora as assinaturas estão canceladas e checkouts pararam.
 */
export const churnRisk = {
  store: { name: 'Antiga Loja Virtual', createdAt: '2025-06-01' },
  products: [
    { name: 'Caixa Surpresa', price: 15000, cycle: 'MONTHLY' }
  ],
  customers: [
    { email: 'user1@email.com', taxId: '111.222.333-44' },
    { email: 'user2@email.com', taxId: '555.666.777-88' }
  ],
  checkouts: [
    { status: 'PAID', createdAt: '2025-10-01', amount: 15000 },
    { status: 'PAID', createdAt: '2025-11-01', amount: 15000 },
    { status: 'EXPIRED', createdAt: '2026-02-01', amount: 15000 },
  ],
  subscriptions: [
    { status: 'CANCELED', createdAt: '2025-09-01', canceledAt: '2025-12-01' }
  ],
  webhooks: [],
}

/** Exporta os perfis indexados por nome para uso conveniente */
export const mockProfiles = {
  wanderer,
  almostThere,
  powerUser,
  churnRisk
}
