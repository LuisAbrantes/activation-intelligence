// src/constants/pipeline.js
// Configurações e constantes do pipeline de análise.

/** Labels das etapas do pipeline exibidas na UI */
export const PIPELINE_STEPS = [
  'Buscando dados da AbacatePay',
  'Calculando score de ativação',
  'Analisando perfil via IA',
  'Gerando mensagem de outreach',
]

/** Estado inicial do pipeline */
export const INITIAL_PIPELINE_STATE = {
  step: -1, // -1 = idle
  data: null,
  scoreResult: null,
  diagnosis: null,
  outreach: null,
  error: null,
}

/** Delay simulado para etapas mock (ms) */
export const MOCK_DELAYS = {
  fetchData: 600,
  calculateScore: 400,
}
