// src/lib/scoreCalculator.js
// Função pura — sem efeitos colaterais, sem chamadas de rede.
// Recebe o objeto de dados do merchant e retorna um score 0–100.

import { SCORE_WEIGHTS, RECENT_VOLUME_DAYS } from '../constants/scoring.js'

/**
 * Retorna true se houver algum checkout com status PAID nos últimos N dias.
 * @param {Array} checkouts
 * @returns {boolean}
 */
function recentVolume(checkouts) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RECENT_VOLUME_DAYS)

  return checkouts.some((c) => {
    if (c.status !== 'PAID') return false
    const created = new Date(c.createdAt)
    return created >= cutoff
  })
}

/**
 * Calcula o Activation Score (0–100) de um merchant.
 *
 * Pesos definidos em constants/scoring.js:
 *  +15  — tem produto cadastrado
 *  +25  — tem webhook configurado
 *  +20  — tem ao menos 1 checkout PAID
 *  +10  — tem cliente com CPF/taxId
 *  +20  — tem assinatura com status PAID
 *  +10  — volume > R$0 nos últimos 30 dias
 *
 * @param {{ products: any[], webhooks: any[], checkouts: any[], customers: any[], subscriptions: any[] }} data
 * @returns {{ score: number, breakdown: Record<string, number|boolean> }}
 */
export function calculateScore(data) {
  const breakdown = {
    hasProduct: data.products.length > 0,
    hasWebhook: data.webhooks.length > 0,
    hasPaidCheckout: data.checkouts.some((c) => c.status === 'PAID'),
    hasCustomerWithTaxId: data.customers.some((c) => c.taxId),
    hasPaidSubscription: data.subscriptions.some((s) => s.status === 'PAID'),
    hasRecentVolume: recentVolume(data.checkouts),
  }

  let score = 0
  for (const [key, value] of Object.entries(breakdown)) {
    if (value) score += SCORE_WEIGHTS[key]
  }

  return { score, breakdown }
}
