// src/constants/llm.js
// Configurações da integração com LLM (Groq) — centralizadas.

/** Endpoint local (relay via serverless function) */
export const LLM_ENDPOINT = '/api/groq'

/** Modelo padrão utilizado nas chamadas */
export const LLM_MODEL = 'llama-3.3-70b-versatile'

/** Limite de tokens por resposta */
export const LLM_MAX_TOKENS = 1000

/** Timeout para chamadas ao LLM (ms) — LLMs podem ser lentos */
export const LLM_TIMEOUT_MS = 30000
