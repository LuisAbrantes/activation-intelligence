// src/constants/scoring.js
// Pesos e configurações do Activation Score — fonte única da verdade.

/** Pesos de cada critério do score (soma = 100) */
export const SCORE_WEIGHTS = {
  hasProduct: 15,
  hasWebhook: 25,
  hasPaidCheckout: 20,
  hasCustomerWithTaxId: 10,
  hasPaidSubscription: 20,
  hasRecentVolume: 10,
}

/** Janela de tempo para considerar "volume recente" (dias) */
export const RECENT_VOLUME_DAYS = 30

/**
 * Faixas de classificação do score.
 * Cada tier define o limite superior, label em PT-BR, chave de cor, e valor hex.
 */
export const SCORE_TIERS = [
  { maxScore: 30, label: 'Risco Crítico', colorKey: 'red', hex: '#ef4444' },
  { maxScore: 60, label: 'Atenção Necessária', colorKey: 'amber', hex: '#f59e0b' },
  { maxScore: 80, label: 'Bom Progresso', colorKey: 'blue', hex: '#3b82f6' },
  { maxScore: 100, label: 'Ativado com Sucesso', colorKey: 'green', hex: '#22c55e' },
]

/**
 * Retorna o tier correspondente a um score.
 * @param {number} score — valor entre 0 e 100
 * @returns {{ label: string, colorKey: string, hex: string }}
 */
export function getScoreTier(score) {
  return SCORE_TIERS.find((t) => score <= t.maxScore) ?? SCORE_TIERS[SCORE_TIERS.length - 1]
}
