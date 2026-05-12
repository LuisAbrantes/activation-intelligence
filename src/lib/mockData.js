// src/lib/mockData.js
// Perfis de teste que funcionam sem nenhuma chave da AbacatePay.
// Agente 2 é o dono deste arquivo — não alterar aqui.

/** Wanderer — score esperado: 15
 *  Criou conta, tem produto, mas nada mais. Nunca gerou valor real.
 */
export const wanderer = {
  store: { name: 'Financa Soluções Ltda' },
  products: [{ name: 'Plano Básico', price: 4900 }],
  customers: [],
  checkouts: [
    { status: 'PENDING', createdAt: '2026-04-10' },
    { status: 'PENDING', createdAt: '2026-04-11' },
  ],
  subscriptions: [],
  webhooks: [],
}

/** Almost There — score esperado: 45
 *  Tem produtos, clientes com taxId, checkouts pagos recentes.
 *  Falta webhook e assinatura ativa.
 */
export const almostThere = {
  store: { name: 'DevTools LTDA' },
  products: [
    { name: 'Pro Monthly', price: 9900, cycle: 'MONTHLY' },
    { name: 'Pro Annual', price: 99000, cycle: 'ANNUALLY' },
  ],
  customers: [
    { email: 'joao@empresa.com', taxId: '123.456.789-00' },
    { email: 'maria@startup.com', taxId: null },
  ],
  checkouts: [
    { status: 'PAID', createdAt: '2026-04-20' },
    { status: 'PAID', createdAt: '2026-05-01' },
    { status: 'PENDING', createdAt: '2026-05-08' },
  ],
  subscriptions: [],
  webhooks: [],
}

/** Exporta os dois perfis indexados por nome para uso conveniente */
export const mockProfiles = {
  wanderer,
  almostThere,
}
