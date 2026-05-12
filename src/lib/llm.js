// src/lib/llm.js
// Chamadas para a Groq API via serverless proxy: diagnóstico + outreach.
// Usa safeParseJSON para lidar com respostas com texto extra antes/depois do JSON.

import { fetchJSON } from './httpClient.js'
import { LLM_ENDPOINT, LLM_MODEL, LLM_MAX_TOKENS, LLM_TIMEOUT_MS } from '../constants/llm.js'

// ─── System Prompts ────────────────────────────────────────────────────────────

export const DIAGNOSIS_SYSTEM_PROMPT = `Você é um especialista em product-led growth focado em ativação de usuários para plataformas de pagamento B2B brasileiras.

Você recebe dados de um merchant cadastrado na AbacatePay e precisa diagnosticar o estágio de ativação dele.

Contexto AbacatePay:
- Problema principal: merchants criam conta mas não chegam à primeira transação real
- Jornada esperada: cadastro → produto criado → checkout criado → primeira transação paga → webhook configurado → assinatura recorrente
- Webhook configurado = sinal mais forte de integração séria
- Sem checkout pago = nunca gerou valor real na plataforma

IMPORTANTE: Responda SOMENTE com JSON válido. Zero texto fora do JSON.

Schema:
{
  "stage": "nome curto do estágio atual",
  "missing": ["2-3 gaps mais críticos em ordem de prioridade"],
  "narrative": "2-3 parágrafos em PT-BR explicando a situação",
  "risk_level": "low | medium | high",
  "risk_rationale": "uma frase explicando o risco"
}`

export const OUTREACH_SYSTEM_PROMPT = `Você é um especialista em customer success para fintechs B2B brasileiras.

Você recebe o diagnóstico de ativação de um merchant na AbacatePay e precisa gerar ações concretas de engajamento.

Sobre a AbacatePay:
- Tom: técnico mas acolhedor, direto, sem corporativês
- Recursos: Checkout hospedado, Checkout Transparente (PIX embutido), Links de Pagamento, Assinaturas, Cupons, Webhooks
- Doc: docs.abacatepay.com

Regras para a mensagem:
- Tom humano, como alguém do time escreveria
- 3-5 parágrafos, ideal para WhatsApp ou email curto
- Mencione o que o merchant JÁ fez (reconhecimento)
- Aponte o próximo passo mais simples
- Máximo 2 emojis
- PT-BR natural

IMPORTANTE: Responda SOMENTE com JSON válido. Zero texto fora do JSON.

Schema:
{
  "outreach_message": "mensagem completa pronta para copiar",
  "outreach_channel": "whatsapp | email",
  "suggested_feature": "nome do recurso mais relevante para o próximo passo",
  "suggested_feature_doc_path": "path na doc (ex: /pages/pix-qrcode/reference)",
  "coupon_suggestion": true,
  "coupon_rationale": "por que oferecer ou não cupom"
}`

// ─── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Tenta fazer JSON.parse; se falhar, tenta extrair o primeiro bloco JSON
 * do texto com regex antes de lançar erro.
 * @param {string} text
 * @returns {object}
 */
export function safeParseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Não foi possível extrair JSON da resposta do modelo')
  }
}

// ─── API call ──────────────────────────────────────────────────────────────────

/**
 * Faz uma chamada para a Groq API (via proxy serverless) e retorna o objeto JSON parseado.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<object>}
 */
export async function callGroq(systemPrompt, userMessage, { signal } = {}) {
  const result = await fetchJSON(
    LLM_ENDPOINT,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: LLM_MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    },
    { timeoutMs: LLM_TIMEOUT_MS, signal },
  )

  const rawContent = result.choices?.[0]?.message?.content

  if (!rawContent) {
    throw new Error('Groq retornou resposta vazia ou inesperada')
  }

  return safeParseJSON(rawContent)
}

// ─── Pipeline helpers ──────────────────────────────────────────────────────────

/**
 * 1ª chamada: gera o diagnóstico do merchant.
 * @param {{ score: number, breakdown: object }} scoreResult
 * @param {object} merchantData
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<object>} — schema: { stage, missing, narrative, risk_level, risk_rationale }
 */
export async function generateDiagnosis(scoreResult, merchantData, { signal } = {}) {
  const userMessage = JSON.stringify({
    activation_score: scoreResult.score,
    score_breakdown: scoreResult.breakdown,
    store_name: merchantData.store?.name ?? 'Desconhecido',
    num_products: merchantData.products.length,
    num_customers: merchantData.customers.length,
    num_checkouts: merchantData.checkouts.length,
    paid_checkouts: merchantData.checkouts.filter((c) => c.status === 'PAID').length,
    num_subscriptions: merchantData.subscriptions.length,
    paid_subscriptions: merchantData.subscriptions.filter((s) => s.status === 'PAID').length,
    num_webhooks: merchantData.webhooks.length,
  })

  return callGroq(DIAGNOSIS_SYSTEM_PROMPT, userMessage, { signal })
}

/**
 * 2ª chamada: gera a mensagem de outreach com base no diagnóstico.
 * @param {object} diagnosis — saída de generateDiagnosis
 * @param {string} storeName
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<object>} — schema: { outreach_message, outreach_channel, suggested_feature, ... }
 */
export async function generateOutreach(diagnosis, storeName, { signal } = {}) {
  const userMessage = JSON.stringify({
    store_name: storeName,
    diagnosis,
  })

  return callGroq(OUTREACH_SYSTEM_PROMPT, userMessage, { signal })
}
